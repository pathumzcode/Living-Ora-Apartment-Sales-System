package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.entity.ExternalUser;
import com.apartment.apartmentsalessystembackend.entity.InternalUser;
import com.apartment.apartmentsalessystembackend.entity.UserVerification;
import com.apartment.apartmentsalessystembackend.dto.request.InternalUserRequest;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.repository.ExternalUserRepository;
import com.apartment.apartmentsalessystembackend.repository.InternalUserRepository;
import com.apartment.apartmentsalessystembackend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;
import com.apartment.apartmentsalessystembackend.entity.AuditLog;
import com.apartment.apartmentsalessystembackend.repository.AuditLogRepository;
import com.apartment.apartmentsalessystembackend.util.PasswordHasher;

@Service
public class UserService {

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @Autowired
    private InternalUserRepository internalUserRepository;

    @Autowired
    private com.apartment.apartmentsalessystembackend.repository.UserVerificationRepository userVerificationRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordHasher passwordHasher;

    public List<ExternalUser> getAllExternalUsers() {
        return externalUserRepository.findAll();
    }

    public ExternalUser getExternalUserById(String uid) {
        return externalUserRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("External user not found with UID: " + uid));
    }

    public List<InternalUser> getAllInternalUsers() {
        return internalUserRepository.findAll();
    }

    public InternalUser getInternalUserByEmpId(String empId) {
        return internalUserRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with Emp ID: " + empId));
    }

    public List<InternalUser> getInternalUsersForAdmin(String adminEmpId) {
        assertAdmin(adminEmpId);
        return internalUserRepository.findAll();
    }

    public List<ExternalUser> getExternalUsersForAdmin(String adminEmpId) {
        assertAdmin(adminEmpId);
        return externalUserRepository.findAll();
    }

    public List<UserVerification> getVerificationsForAdmin(String adminEmpId) {
        assertAdmin(adminEmpId);
        return userVerificationRepository.findAll();
    }

    public Map<String, Object> getAdminOverview(String adminEmpId) {
        assertAdmin(adminEmpId);
        List<UserVerification> verifications = userVerificationRepository.findAll();
        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalUsers", internalUserRepository.count() + externalUserRepository.count());
        overview.put("activeUsers", verifications.stream().filter(v -> Integer.valueOf(1).equals(v.getIsActive())).count());
        overview.put("pendingVerifications", verifications.stream().filter(v -> !Integer.valueOf(1).equals(v.getIsVerified())).count());
        overview.put("lockedAccounts", verifications.stream().filter(v -> !Integer.valueOf(1).equals(v.getIsActive())).count());
        overview.put("internalUsers", internalUserRepository.count());
        overview.put("externalUsers", externalUserRepository.count());
        return overview;
    }

    @org.springframework.transaction.annotation.Transactional
    public UserVerification updateInternalAccess(String adminEmpId, String empId, Integer active, Integer verified) {
        assertAdmin(adminEmpId);
        InternalUser user = internalUserRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Internal user not found with Emp ID: " + empId));
        UserVerification verification = user.getUserVerification();
        verification.setIsActive(active == 1 ? 1 : 0);
        verification.setIsVerified(verified == 1 ? 1 : 0);
        UserVerification saved = userVerificationRepository.save(verification);
        recordAudit(adminEmpId, "ACCOUNT_ACCESS_UPDATED", empId, "active=" + active + ", verified=" + verified);
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public UserVerification updateExternalAccess(String adminEmpId, String uid, Integer active, Integer verified) {
        assertAdmin(adminEmpId);
        ExternalUser user = externalUserRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("External user not found with UID: " + uid));
        UserVerification verification = user.getUserVerification();
        verification.setIsActive(active == 1 ? 1 : 0);
        verification.setIsVerified(verified == 1 ? 1 : 0);
        UserVerification saved = userVerificationRepository.save(verification);
        recordAudit(adminEmpId, "EXTERNAL_ACCESS_UPDATED", uid, "active=" + active + ", verified=" + verified);
        return saved;
    }

    public List<AuditLog> getAuditLogsForAdmin(String adminEmpId) {
        assertAdmin(adminEmpId);
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }

    @org.springframework.transaction.annotation.Transactional
    public InternalUser createInternalUser(String adminEmpId, InternalUserRequest request) {
        assertAdmin(adminEmpId);
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required for a new internal user");
        }
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (internalUserRepository.existsByEmail(email) || userVerificationRepository.existsByEmail(email)) {
            throw new BadRequestException("An account already exists for this email");
        }
        if (internalUserRepository.findByNic(request.getNic().trim()).isPresent()) {
            throw new BadRequestException("An account already exists for this NIC");
        }
        if (internalUserRepository.existsByPhoneNumber(request.getPhoneNumber().trim())) {
            throw new BadRequestException("An account already exists for this phone number");
        }

        String empId = "EMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        UserVerification verification = new UserVerification();
        verification.setUid("INT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        verification.setEmpId(empId);
        verification.setEmail(email);
        String passwordHash = passwordHasher.hash(request.getPassword());
        verification.setPassword(passwordHash);
        verification.setIsActive(1);
        verification.setIsVerified(1);
        UserVerification savedVerification = userVerificationRepository.save(verification);
        InternalUser internalUser = new InternalUser();
        copyFields(internalUser, request);
        internalUser.setEmpId(empId);
        internalUser.setEmail(email);
        internalUser.setPassword(passwordHash);
        internalUser.setRole(normalizeInternalRole(request.getRole()));
        internalUser.setJoinedDate(java.time.LocalDate.now());
        internalUser.setUserVerification(savedVerification);
        promotionRepository.findAll().stream().findFirst().ifPresent(internalUser::setPromotion);
        InternalUser saved = internalUserRepository.save(internalUser);
        recordAudit(adminEmpId, "INTERNAL_USER_CREATED", saved.getEmpId(), "role=" + saved.getRole());
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public InternalUser updateInternalUser(String adminEmpId, String empId, InternalUserRequest request) {
        assertAdmin(adminEmpId);
        InternalUser internalUser = internalUserRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Internal user not found with Emp ID: " + empId));
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (!internalUser.getEmail().equalsIgnoreCase(email) && (internalUserRepository.existsByEmail(email) || userVerificationRepository.existsByEmail(email))) {
            throw new BadRequestException("An account already exists for this email");
        }
        copyFields(internalUser, request);
        internalUser.setEmail(email);
        internalUser.setRole(normalizeInternalRole(request.getRole()));
        if (request.getPassword() != null && !request.getPassword().isBlank()) internalUser.setPassword(passwordHasher.hash(request.getPassword()));
        UserVerification verification = internalUser.getUserVerification();
        verification.setEmail(email);
        if (request.getPassword() != null && !request.getPassword().isBlank()) verification.setPassword(passwordHasher.hash(request.getPassword()));
        userVerificationRepository.save(verification);
        InternalUser saved = internalUserRepository.save(internalUser);
        recordAudit(adminEmpId, "INTERNAL_USER_UPDATED", saved.getEmpId(), "role=" + saved.getRole());
        return saved;
    }

    private void copyFields(InternalUser target, InternalUserRequest request) {
        target.setFirstName(request.getFirstName().trim()); target.setLastName(request.getLastName().trim());
        target.setNic(request.getNic().trim()); target.setPhoneNumber(request.getPhoneNumber().trim());
        target.setAddress(request.getAddress() == null ? null : request.getAddress().trim()); target.setAge(request.getAge());
        target.setProfilePicture(request.getProfilePicture());
        target.setDateOfBirth(request.getDateOfBirth()); target.setCompanyEmail(request.getCompanyEmail());
        if (request.getcEmailPassword() != null && !request.getcEmailPassword().isBlank()) target.setcEmailPassword(passwordHasher.hash(request.getcEmailPassword()));
        target.setServiceYears(request.getServiceYears());
    }

    private String normalizeInternalRole(String role) {
        if (role == null || role.isBlank()) throw new BadRequestException("Internal role is required");
        String normalized = role.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        if (!java.util.Set.of("ADMIN", "SALES_MANAGER", "MARKETING_MANAGER", "CUSTOMER_RELATIONS_OFFICER",
                "FINANCE_PAYMENTS_OFFICER", "PROPERTY_DEVELOPMENT_MANAGER", "OPERATIONS_DIRECTOR").contains(normalized)) {
            throw new BadRequestException("Unsupported internal role");
        }
        return normalized;
    }

    private void assertAdmin(String adminEmpId) {
        InternalUser admin = internalUserRepository.findById(adminEmpId == null ? "" : adminEmpId)
                .orElseThrow(() -> new BadRequestException("Admin access is required"));
        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) throw new BadRequestException("Admin access is required");
    }

    private void recordAudit(String actorEmpId, String action, String target, String details) {
        auditLogRepository.save(new AuditLog(actorEmpId, action, target, details));
    }
}
