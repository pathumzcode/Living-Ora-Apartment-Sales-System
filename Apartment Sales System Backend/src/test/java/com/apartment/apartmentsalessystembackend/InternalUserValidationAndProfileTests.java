package com.apartment.apartmentsalessystembackend;

import com.apartment.apartmentsalessystembackend.dto.request.InternalUserProfileUpdateRequest;
import com.apartment.apartmentsalessystembackend.dto.request.InternalUserRequest;
import com.apartment.apartmentsalessystembackend.entity.InternalUser;
import com.apartment.apartmentsalessystembackend.entity.UserVerification;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.service.UserService;
import com.apartment.apartmentsalessystembackend.repository.InternalUserRepository;
import com.apartment.apartmentsalessystembackend.repository.UserVerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class InternalUserValidationAndProfileTests {

    @Autowired
    private UserService userService;

    @Autowired
    private InternalUserRepository internalUserRepository;

    @Autowired
    private UserVerificationRepository userVerificationRepository;

    private static final String ADMIN_EMP_ID = "EMP-INT-1001";

    @Test
    void testUnder18RegistrationIsRejected() {
        InternalUserRequest req = new InternalUserRequest();
        req.setEmpId("EMP-TEST-U18");
        req.setFirstName("Young");
        req.setLastName("Candidate");
        req.setRole("SALES_MANAGER");
        req.setEmail("young.candidate@livingora.lk");
        req.setPersonalEmail("young.personal@gmail.com");
        req.setNic("201012345678");
        req.setPhoneNumber("0771234567");
        req.setDateOfBirth(LocalDate.now().minusYears(16)); // 16 years old
        req.setPassword("ValidPassword123!");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.createInternalUser(ADMIN_EMP_ID, req);
        });
        assertTrue(ex.getMessage().contains("at least 18 years old"));
    }

    @Test
    void testInvalidPhoneNumberIsRejected() {
        InternalUserRequest req = new InternalUserRequest();
        req.setEmpId("EMP-TEST-PHONE");
        req.setFirstName("Invalid");
        req.setLastName("Phone");
        req.setRole("SALES_MANAGER");
        req.setEmail("invalid.phone@livingora.lk");
        req.setPersonalEmail("invalid.phone@gmail.com");
        req.setNic("199512345678");
        req.setPhoneNumber("07712345"); // only 8 digits
        req.setDateOfBirth(LocalDate.now().minusYears(25));
        req.setPassword("ValidPassword123!");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.createInternalUser(ADMIN_EMP_ID, req);
        });
        assertTrue(ex.getMessage().contains("exactly 10 digits"));
    }

    @Test
    void testValidRegistrationAndProfileUpdateAccessControl() {
        // 1. Register valid internal user
        InternalUserRequest req = new InternalUserRequest();
        req.setFirstName("Chamara");
        req.setLastName("Silva");
        req.setRole("SALES_MANAGER");
        req.setEmail("chamara.silva@livingora.lk");
        req.setPersonalEmail("chamara.personal@gmail.com");
        req.setNic("199212345999");
        req.setPhoneNumber("0779998877");
        req.setDateOfBirth(LocalDate.of(1992, 5, 15)); // > 18 years old
        req.setAddress("Colombo 05");
        req.setPassword("ValidPassword123!");

        InternalUser created = userService.createInternalUser(ADMIN_EMP_ID, req);
        assertNotNull(created);
        assertTrue(created.getEmpId().matches("EMP-SM-\\d{4,}"));
        assertEquals("chamara.personal@gmail.com", created.getPersonalEmail());
        assertEquals("0779998877", created.getPhoneNumber());
        assertTrue(created.getAge() >= 18);

        // 2. Staff user updates their own profile
        InternalUserProfileUpdateRequest profileReq = new InternalUserProfileUpdateRequest();
        profileReq.setPersonalEmail("chamara.newemail@gmail.com");
        profileReq.setPhoneNumber("0712223344"); // 10 digits
        profileReq.setAddress("Kandy Road, Kiribathgoda");
        profileReq.setProfilePicture("https://example.com/avatar.jpg");

        InternalUser updated = userService.updateOwnProfile(created.getEmpId(), profileReq);

        // Editable fields must be updated
        assertEquals("chamara.newemail@gmail.com", updated.getPersonalEmail());
        assertEquals("0712223344", updated.getPhoneNumber());
        assertEquals("Kandy Road, Kiribathgoda", updated.getAddress());
        assertEquals("https://example.com/avatar.jpg", updated.getProfilePicture());

        // Locked fields must NOT have changed
        assertEquals("Chamara", updated.getFirstName());
        assertEquals("Silva", updated.getLastName());
        assertEquals("199212345999", updated.getNic());
        assertEquals("SALES_MANAGER", updated.getRole());
        assertEquals(LocalDate.of(1992, 5, 15), updated.getDateOfBirth());
    }

    @Test
    void testProfileUpdateInvalidPhoneIsRejected() {
        InternalUserProfileUpdateRequest profileReq = new InternalUserProfileUpdateRequest();
        profileReq.setPersonalEmail("admin.test@gmail.com");
        profileReq.setPhoneNumber("123"); // invalid phone

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.updateOwnProfile(ADMIN_EMP_ID, profileReq);
        });
        assertTrue(ex.getMessage().contains("exactly 10 digits"));
    }

    @Test
    void adminCreateUpdateAndDeletePersistToTheDatabase() {
        String email = "crud.user@livingora.lk";
        String nic = String.format("%012d", Math.abs(System.nanoTime() % 1000000000000L));
        InternalUserRequest createRequest = internalUserRequest(email, "0775551234");
        createRequest.setNic(nic);

        InternalUser created = userService.createInternalUser(ADMIN_EMP_ID, createRequest);
        String empId = created.getEmpId();
        assertTrue(empId.matches("EMP-SM-\\d{4,}"));
        assertTrue(internalUserRepository.existsById(empId));
        assertTrue(userVerificationRepository.findByEmpId(empId).isPresent());
        assertEquals(email, created.getEmail());

        InternalUserRequest updateRequest = internalUserRequest(email, "0715551234");
        updateRequest.setNic(nic);
        updateRequest.setFirstName("Updated");
        updateRequest.setAddress("Updated database address");
        updateRequest.setPassword(null);

        userService.updateInternalUser(ADMIN_EMP_ID, empId, updateRequest);
        InternalUser persistedUpdate = internalUserRepository.findById(empId).orElseThrow();
        assertEquals("Updated", persistedUpdate.getFirstName());
        assertEquals("0715551234", persistedUpdate.getPhoneNumber());
        assertEquals("Updated database address", persistedUpdate.getAddress());

        userService.deleteInternalUser(ADMIN_EMP_ID, empId);
        assertFalse(internalUserRepository.existsById(empId));
        assertTrue(userVerificationRepository.findByEmpId(empId).isEmpty());
    }

    @Test
    void createSkipsEmployeeIdsAlreadyHeldInUserVerification() {
        UserVerification orphan = new UserVerification();
        orphan.setUid("INT-ORPHAN1");
        orphan.setEmpId("EMP-SM-1001");
        orphan.setEmail("orphan.sm1001@livingora.lk");
        orphan.setPassword("hashed-password-value");
        orphan.setIsActive(1);
        orphan.setIsVerified(1);
        userVerificationRepository.save(orphan);

        InternalUserRequest request = internalUserRequest("next.sales@livingora.lk", "0775559999");
        request.setNic(String.format("%012d", Math.abs(System.nanoTime() % 1000000000000L)));
        request.setPersonalEmail("next.sales.personal@example.com");
        request.setEmpId("EMP-SM-1001");

        InternalUser created = userService.createInternalUser(ADMIN_EMP_ID, request);
        assertNotEquals("EMP-SM-1001", created.getEmpId());
        assertTrue(created.getEmpId().matches("EMP-SM-\\d{4,}"));
        assertTrue(userVerificationRepository.existsByEmpId(created.getEmpId()));
    }

    private InternalUserRequest internalUserRequest(String email, String phoneNumber) {
        InternalUserRequest request = new InternalUserRequest();
        request.setFirstName("Database");
        request.setLastName("User");
        request.setRole("SALES_MANAGER");
        request.setEmail(email);
        request.setPersonalEmail("crud.personal@example.com");
        request.setNic("199012345678");
        request.setPhoneNumber(phoneNumber);
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        request.setAddress("Colombo");
        request.setPassword("ValidPassword123!");
        return request;
    }
}
