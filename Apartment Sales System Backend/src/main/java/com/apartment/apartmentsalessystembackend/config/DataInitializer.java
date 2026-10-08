package com.apartment.apartmentsalessystembackend.config;

import com.apartment.apartmentsalessystembackend.entity.*;
import com.apartment.apartmentsalessystembackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.apartment.apartmentsalessystembackend.util.PasswordHasher;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private UserVerificationRepository userVerificationRepository;

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @Autowired
    private ExternalApartmentRepository externalApartmentRepository;

    @Autowired
    private PasswordHasher passwordHasher;

    @Autowired
    private InternalUserRepository internalUserRepository;

    @Override
    public void run(String... args) throws Exception {
        seedDemoPropertyCatalog();

        ensureDefaultAdmin();
        migrateLegacyInternalRoles();
        ensureSampleInternalStaff();
        ensureSampleExternalUsers();
        ensureSamplePromotions();
        ensureSampleExternalApartments();
    }

    private void seedDemoPropertyCatalog() {
        // Remove only the old application-owned demo IDs; unrelated/live records remain untouched.
        unitRepository.findAll().stream()
                .filter(unit -> unit.getUnitId().equals("UNT-101-A") || unit.getUnitId().equals("UNT-102-B"))
                .forEach(unitRepository::delete);
        apartmentRepository.findAll().stream()
                .filter(apartment -> apartment.getApartmentId().equals("APT-ORA-01") || apartment.getApartmentId().equals("APT-ORA-02"))
                .forEach(apartmentRepository::delete);

        if (apartmentRepository.findById("APT-LO-001").isEmpty()) {
            Apartment residences = new Apartment();
            residences.setApartmentId("APT-LO-001");
            residences.setLocation("Living Ora Residences — Colombo 03");
            residences.setNumOfRoom(120); residences.setNumOfFloors(30); residences.setNumOfSwimmingPool(2); residences.setNumOfGYM(1);
            residences.setPriceRange("Rs. 38,500,000 - Rs. 75,000,000"); residences.setUnitStatus("Available"); residences.setNumOfUnitsAvailable(3);
            residences.setAbout("A coastal residential development with concierge service, pool decks and smart-home ready units.");
            residences.setImages("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80");
            residences.setFloorPlan("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80");
            apartmentRepository.save(residences);
        }
        if (apartmentRepository.findById("APT-LO-002").isEmpty()) {
            Apartment marina = new Apartment();
            marina.setApartmentId("APT-LO-002"); marina.setLocation("Living Ora Marina — Colombo 06");
            marina.setNumOfRoom(80); marina.setNumOfFloors(22); marina.setNumOfSwimmingPool(1); marina.setNumOfGYM(1);
            marina.setPriceRange("Rs. 29,500,000 - Rs. 58,000,000"); marina.setUnitStatus("Available"); marina.setNumOfUnitsAvailable(3);
            marina.setAbout("A modern urban project designed around natural light, shared gardens and flexible payment options.");
            marina.setImages("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80");
            marina.setFloorPlan("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80");
            apartmentRepository.save(marina);
        }
        if (apartmentRepository.findById("APT-LO-003").isEmpty()) {
            Apartment garden = new Apartment();
            garden.setApartmentId("APT-LO-003");
            garden.setLocation("Living Ora Garden Villas — Colombo 08");
            garden.setNumOfRoom(64);
            garden.setNumOfFloors(16);
            garden.setNumOfSwimmingPool(1);
            garden.setNumOfGYM(1);
            garden.setPriceRange("Rs. 24,000,000 - Rs. 49,000,000");
            garden.setUnitStatus("Available");
            garden.setNumOfUnitsAvailable(3);
            garden.setAbout("A peaceful garden community with family-sized layouts, landscaped walkways and secure parking.");
            garden.setImages("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80");
            garden.setFloorPlan("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80");
            apartmentRepository.save(garden);
        }

        saveDemoUnit("LO1-0801", "APT-LO-001", 8, "East Wing", "38500000.00", "Available", 2, 2, "Family");
        saveDemoUnit("LO1-1502", "APT-LO-001", 15, "Ocean Wing", "52000000.00", "Available", 3, 2, "Family / Investor");
        saveDemoUnit("LO1-2501", "APT-LO-001", 25, "Sky Villa", "75000000.00", "Available", 4, 4, "Premium Buyer");
        saveDemoUnit("LO2-0603", "APT-LO-002", 6, "Garden Wing", "29500000.00", "Available", 2, 2, "Couple");
        saveDemoUnit("LO2-1204", "APT-LO-002", 12, "Marina View", "42000000.00", "Available", 3, 2, "Family");
        saveDemoUnit("LO2-1801", "APT-LO-002", 18, "Penthouse Wing", "58000000.00", "Available", 4, 3, "Premium Buyer");
        saveDemoUnit("LO3-0402", "APT-LO-003", 4, "Garden Wing", "24000000.00", "Available", 2, 2, "Couple");
        saveDemoUnit("LO3-1001", "APT-LO-003", 10, "Park View", "36000000.00", "Available", 3, 2, "Family");
        saveDemoUnit("LO3-1501", "APT-LO-003", 15, "Garden Penthouse", "49000000.00", "Available", 4, 3, "Premium Buyer");
    }

    private void saveDemoUnit(String unitId, String apartmentId, int floor, String wing, String price, String availability,
                              int rooms, int bathrooms, String recommendedPerson) {
        if (unitRepository.findById(unitId).isPresent()) return;
        Unit unit = new Unit(); unit.setUnitId(unitId); unit.setApartmentId(apartmentId); unit.setFloor(floor);
        unit.setLocation(apartmentId + " — " + wing); unit.setUnitPrice(new BigDecimal(price)); unit.setAvailability(availability);
        unit.setFurnitures("Fully Furnished"); unit.setNumOfRooms(rooms); unit.setNumOfBathRooms(bathrooms); unit.setNumOfBeds(rooms);
        unit.setAcOrNonAC("Air Conditioned"); unit.setRecommendedPerson(recommendedPerson);
        unit.setAbout("Test catalog unit for the buyer floor-plan and reservation workflow.");
        unit.setImages("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80");
        unitRepository.save(unit);
    }

    private void migrateLegacyInternalRoles() {
        internalUserRepository.findAll().forEach(user -> {
            String currentRole = user.getRole();
            String updatedRole = switch (currentRole == null ? "" : currentRole) {
                case "MANAGER" -> "OPERATIONS_DIRECTOR";
                case "FINANCE_OFFICER" -> "FINANCE_PAYMENTS_OFFICER";
                case "SUPPORT_STAFF" -> "CUSTOMER_RELATIONS_OFFICER";
                default -> currentRole;
            };
            if (!java.util.Objects.equals(currentRole, updatedRole)) {
                user.setRole(updatedRole);
                internalUserRepository.save(user);
            }
        });
    }

    private void ensureDefaultAdmin() {
        String adminPasswordHash = passwordHasher.hash("12345678");
        InternalUser existingAdmin = internalUserRepository.findByEmail("admin@livingora.lk").orElse(null);
        if (existingAdmin != null) {
            // Update the InternalUser directly — do NOT touch the lazy UserVerification proxy
            // on a detached entity (causes LazyInitializationException outside a session).
            existingAdmin.setRole("ADMIN");
            existingAdmin.setPassword(adminPasswordHash);
            internalUserRepository.save(existingAdmin);

            // Fetch and update the UserVerification record independently via the repository.
            userVerificationRepository.findByEmail("admin@livingora.lk").ifPresent(verification -> {
                verification.setPassword(adminPasswordHash);
                verification.setIsActive(1);
                verification.setIsVerified(1);
                userVerificationRepository.save(verification);
            });
            return;
        }
        UserVerification verification = userVerificationRepository.findByEmail("admin@livingora.lk").orElseGet(() -> {
            UserVerification created = new UserVerification();
            created.setUid("USR-INT-1001");
            created.setEmpId("EMP-INT-1001");
            created.setEmail("admin@livingora.lk");
            created.setPassword(adminPasswordHash);
            created.setIsActive(1);
            created.setIsVerified(1);
            return userVerificationRepository.save(created);
        });
        InternalUser admin = new InternalUser();
        admin.setEmpId("EMP-INT-1001");
        admin.setRole("ADMIN");
        admin.setEmail("admin@livingora.lk");
        admin.setPassword(adminPasswordHash);
        admin.setFirstName("Living-Ora");
        admin.setLastName("Administrator");
        admin.setNic("ADMIN-1001");
        admin.setPhoneNumber("0710000000");
        admin.setAddress("Living-Ora Head Office");
        admin.setAge(35);
        admin.setJoinedDate(LocalDate.now());
        admin.setUserVerification(verification);
        internalUserRepository.save(admin);
    }

    /**
     * Seed representative internal roles so the admin user-management screen
     * has realistic data to work with during development/demo runs.
     */
    private void ensureSampleInternalStaff() {
        ensureSampleStaff("EMP-SALES-1001", "sales.manager@livingora.lk", "Sales", "Manager",
                "SALES_MANAGER", "12345678", "STAFF-SALES-1001", "199012345678", "0711000001", 36);
        ensureSampleStaff("EMP-MKT-1001", "marketing.manager@livingora.lk", "Marketing", "Manager",
                "MARKETING_MANAGER", "12345678", "STAFF-MKT-1001", "199012345683", "0711000006", 36);
        ensureSampleStaff("EMP-CRM-1001", "customer.relations@livingora.lk", "Customer Relations", "Officer",
                "CUSTOMER_RELATIONS_OFFICER", "12345678", "STAFF-CRM-1001", "199112345679", "0711000002", 35);
        ensureSampleStaff("EMP-FIN-1001", "finance.payments@livingora.lk", "Finance & Payments", "Officer",
                "FINANCE_PAYMENTS_OFFICER", "12345678", "STAFF-FIN-1001", "199212345680", "0711000003", 34);
        ensureSampleStaff("EMP-PDM-1001", "property.development@livingora.lk", "Property Development", "Manager",
                "PROPERTY_DEVELOPMENT_MANAGER", "12345678", "STAFF-PDM-1001", "199012345681", "0711000004", 36);
        ensureSampleStaff("EMP-OPS-1001", "operations.director@livingora.lk", "Operations", "Director",
                "OPERATIONS_DIRECTOR", "12345678", "STAFF-OPS-1001", "199312345682", "0711000005", 39);
    }

    private void ensureSampleExternalUsers() {
        ensureExternalUser("USR-EXT-5001", "john@livingora.lk", "CUSTOMER", "John", "Living-Ora",
                "DEMO-5001", "0712345678", 30, "Colombo, Sri Lanka");
        ensureExternalUser("USR-EXT-5002", "sarah@livingora.lk", "CUSTOMER", "Sarah", "Perera",
                "DEMO-5002", "0712345679", 28, "Dehiwala, Sri Lanka");
        ensureExternalUser("USR-EXT-5003", "agent@livingora.lk", "SALES_AGENT", "Nimal", "Fernando",
                "DEMO-5003", "0712345680", 33, "Rajagiriya, Sri Lanka");
    }

    private void ensureExternalUser(String uid, String email, String role, String firstName, String lastName,
                                    String nic, String phoneNumber, int age, String address) {
        String passwordHash = passwordHasher.hash("12345678");
        UserVerification verification = userVerificationRepository.findByEmail(email).orElseGet(() -> {
            UserVerification created = new UserVerification();
            created.setUid(uid);
            created.setEmail(email);
            return created;
        });
        verification.setUid(uid);
        verification.setPassword(passwordHash);
        verification.setIsActive(1);
        verification.setIsVerified(1);
        UserVerification savedVerification = userVerificationRepository.save(verification);

        ExternalUser user = externalUserRepository.findByEmail(email).orElseGet(ExternalUser::new);
        user.setUid(uid);
        user.setRole(role);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setNic(nic);
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);
        user.setAge(age);
        user.setNumOfApartments(0);
        user.setEmail(email);
        user.setPassword(passwordHash);
        user.setRegisteredDate(LocalDate.now());
        user.setUserVerification(savedVerification);
        externalUserRepository.save(user);
    }

    private void ensureSamplePromotions() {
        savePromotion("PROMO-2026", "New Year Grand Discount", "ORA2026", "5.00",
                "Get 5% instant discount on down payment for all bookings this month.");
        savePromotion("PROMO-2026-FAMILY", "Family Home Offer", "ORAFAMILY", "7.50",
                "Save on selected family-sized units at Living Ora Garden Villas.");
        savePromotion("PROMO-2026-EARLY", "Early Reservation Bonus", "ORAEARLY", "10.00",
                "Reserve early and receive a limited-time launch discount.");
    }

    private void savePromotion(String id, String title, String code, String discount, String about) {
        if (promotionRepository.findById(id).isPresent()) return;
        Promotion promo = new Promotion();
        promo.setPromotionId(id);
        promo.setPromotionType("Discount Code");
        promo.setPromotionTitle(title);
        promo.setPromotionCode(code);
        promo.setDiscountPrecentage(new BigDecimal(discount));
        promo.setStartDate(LocalDate.now());
        promo.setEndDate(LocalDate.now().plusMonths(3));
        promo.setButtonText("Claim Offer");
        promo.setValidityPeriod("Limited Time");
        promo.setAbout(about);
        promotionRepository.save(promo);
    }

    private void ensureSampleExternalApartments() {
        saveExternalApartment("EXT-APT-301", "USR-EXT-5003", "Nawala, Rajagiriya", 3,
                "29500000.00", "5000000.00", "AC", "Clean title deed, immediate transfer available.");
        saveExternalApartment("EXT-APT-302", "USR-EXT-5002", "Mount Lavinia, Colombo", 2,
                "22000000.00", "4000000.00", "AC", "Sea-view apartment with parking and clear ownership.");
        saveExternalApartment("EXT-APT-303", "USR-EXT-5001", "Battaramulla, Sri Lanka", 4,
                "41000000.00", "7000000.00", "Non-AC", "Spacious resale apartment near schools and public transport.");
    }

    private void saveExternalApartment(String id, String registeredByUid, String location, int rooms,
                                       String price, String downPayment, String acOrNonAC, String additionalInfo) {
        if (externalApartmentRepository.findById(id).isPresent()) return;
        ExternalApartment apartment = new ExternalApartment();
        apartment.setExApartmentId(id);
        apartment.setRegisteredByUid(registeredByUid);
        apartment.setLocation(location);
        apartment.setAbout("Verified resale apartment available through the Living-Ora marketplace.");
        apartment.setNumOfRooms(rooms);
        apartment.setPrice(new BigDecimal(price));
        apartment.setDownPayment(new BigDecimal(downPayment));
        apartment.setAcOrNonAC(acOrNonAC);
        apartment.setAdditionalInfo(additionalInfo);
        apartment.setImages("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80");
        externalApartmentRepository.save(apartment);
    }

    private void ensureSampleStaff(String empId, String email, String firstName, String lastName,
                                   String role, String password, String uid, String nic,
                                   String phoneNumber, int age) {
        InternalUser staff = internalUserRepository.findByEmail(email).orElse(null);
        if (staff != null) {
            // Keep the sample role aligned with the role options shown in the admin UI.
            staff.setRole(role);
            staff.setFirstName(firstName);
            staff.setLastName(lastName);
            String passwordHash = passwordHasher.hash(password);
            staff.setPassword(passwordHash);
            staff.setNic(nic);
            staff.setPhoneNumber(phoneNumber);
            staff.setAddress("Living-Ora Head Office");
            staff.setAge(age);
            staff.setDateOfBirth(LocalDate.now().minusYears(age).minusMonths(3));
            staff.setProfilePicture("https://ui-avatars.com/api/?name=" + firstName.replace(" ", "+") + "+" + lastName.replace(" ", "+"));
            staff.setCompanyEmail(email);
            staff.setcEmailPassword(passwordHasher.hash(password));
            staff.setServiceYears(Math.max(1, age - 25));
            staff.setJoinedDate(LocalDate.now());
            internalUserRepository.save(staff);
            userVerificationRepository.findByEmail(email).ifPresent(verification -> {
                verification.setPassword(passwordHash);
                verification.setIsActive(1);
                verification.setIsVerified(1);
                userVerificationRepository.save(verification);
            });
            return;
        }

        String passwordHash = passwordHasher.hash(password);
        UserVerification verification = userVerificationRepository.findByEmail(email).orElseGet(() -> {
            UserVerification created = new UserVerification();
            created.setUid(uid);
            created.setEmpId(empId);
            created.setEmail(email);
            created.setPassword(passwordHash);
            created.setIsActive(1);
            created.setIsVerified(1);
            return userVerificationRepository.save(created);
        });

        staff = new InternalUser();
        staff.setEmpId(empId);
        staff.setRole(role);
        staff.setEmail(email);
        staff.setPassword(passwordHash);
        staff.setFirstName(firstName);
        staff.setLastName(lastName);
        staff.setNic(nic);
        staff.setPhoneNumber(phoneNumber);
        staff.setAddress("Living-Ora Head Office");
        staff.setAge(age);
        staff.setDateOfBirth(LocalDate.now().minusYears(age).minusMonths(3));
        staff.setProfilePicture("https://ui-avatars.com/api/?name=" + firstName.replace(" ", "+") + "+" + lastName.replace(" ", "+"));
        staff.setCompanyEmail(email);
        staff.setcEmailPassword(passwordHasher.hash(password));
        staff.setServiceYears(Math.max(1, age - 25));
        staff.setJoinedDate(LocalDate.now());
        staff.setUserVerification(verification);
        internalUserRepository.save(staff);
    }
}
