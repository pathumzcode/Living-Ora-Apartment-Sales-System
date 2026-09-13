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
        // Initialize User Verification Accounts
        if (userVerificationRepository.count() == 0) {
            UserVerification customer = new UserVerification();
            customer.setUid("USR-EXT-5001");
            customer.setEmail("john@livingora.lk");
            customer.setPassword(passwordHasher.hash("123456"));
            customer.setIsActive(1);
            customer.setIsVerified(1);
            customer.setLastLoginAt(LocalDateTime.now());
            UserVerification savedCustomer = userVerificationRepository.save(customer);

            ExternalUser customerProfile = new ExternalUser();
            customerProfile.setUid("USR-EXT-5001");
            customerProfile.setRole("CUSTOMER");
            customerProfile.setFirstName("John");
            customerProfile.setLastName("Living-Ora");
            customerProfile.setNic("DEMO-5001");
            customerProfile.setPhoneNumber("0712345678");
            customerProfile.setAddress("Colombo, Sri Lanka");
            customerProfile.setAge(30);
            customerProfile.setNumOfApartments(0);
            customerProfile.setEmail(customer.getEmail());
            customerProfile.setPassword(customer.getPassword());
            customerProfile.setRegisteredDate(LocalDate.now());
            customerProfile.setUserVerification(savedCustomer);
            externalUserRepository.save(customerProfile);

            UserVerification staff = new UserVerification();
            staff.setUid("USR-INT-1001");
            staff.setEmpId("EMP-INT-1001");
            staff.setEmail("admin@livingora.lk");
            staff.setPassword(passwordHasher.hash("admin123"));
            staff.setIsActive(1);
            staff.setIsVerified(1);
            staff.setLastLoginAt(LocalDateTime.now());
            userVerificationRepository.save(staff);
        }

        seedDemoPropertyCatalog();

        // Initialize Promotions if empty
        if (promotionRepository.count() == 0) {
            Promotion promo = new Promotion();
            promo.setPromotionId("PROMO-2026");
            promo.setPromotionType("Discount Code");
            promo.setPromotionTitle("New Year Grand Discount");
            promo.setPromotionCode("ORA2026");
            promo.setDiscountPrecentage(new BigDecimal("5.00"));
            promo.setStartDate(LocalDate.now());
            promo.setEndDate(LocalDate.now().plusMonths(3));
            promo.setButtonText("Claim 5% Off");
            promo.setValidityPeriod("Limited Time");
            promo.setAbout("Get 5% instant discount on down payment for all bookings this month.");
            promotionRepository.save(promo);
        }

        // Initialize External Resale Apartments if empty
        if (externalApartmentRepository.count() == 0) {
            ExternalApartment ex1 = new ExternalApartment();
            ex1.setExApartmentId("EXT-APT-301");
            ex1.setLocation("Nawala, Rajagiriya");
            ex1.setAbout("Private seller offering a premium 3-bedroom luxury apartment with pool access.");
            ex1.setNumOfRooms(3);
            ex1.setPrice(new BigDecimal("29500000.00"));
            ex1.setDownPayment(new BigDecimal("5000000.00"));
            ex1.setAcOrNonAC("AC");
            ex1.setAdditionalInfo("Clean title deed, immediate transfer available.");
            ex1.setImages("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80");
            externalApartmentRepository.save(ex1);
        }

        ensureDefaultAdmin();
        migrateLegacyInternalRoles();
        ensureSampleInternalStaff();
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

        saveDemoUnit("LO1-0801", "APT-LO-001", 8, "East Wing", "38500000.00", "Available", 2, 2, "Family");
        saveDemoUnit("LO1-1502", "APT-LO-001", 15, "Ocean Wing", "52000000.00", "Available", 3, 2, "Family / Investor");
        saveDemoUnit("LO1-2501", "APT-LO-001", 25, "Sky Villa", "75000000.00", "Available", 4, 4, "Premium Buyer");
        saveDemoUnit("LO2-0603", "APT-LO-002", 6, "Garden Wing", "29500000.00", "Available", 2, 2, "Couple");
        saveDemoUnit("LO2-1204", "APT-LO-002", 12, "Marina View", "42000000.00", "Available", 3, 2, "Family");
        saveDemoUnit("LO2-1801", "APT-LO-002", 18, "Penthouse Wing", "58000000.00", "Available", 4, 3, "Premium Buyer");
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
        if (internalUserRepository.findByEmail("admin@livingora.lk").isPresent()) return;
        UserVerification verification = userVerificationRepository.findByEmail("admin@livingora.lk").orElseGet(() -> {
            UserVerification created = new UserVerification();
            created.setUid("USR-INT-1001");
            created.setEmpId("EMP-INT-1001");
            created.setEmail("admin@livingora.lk");
            created.setPassword(passwordHasher.hash("admin123"));
            created.setIsActive(1);
            created.setIsVerified(1);
            return userVerificationRepository.save(created);
        });
        InternalUser admin = new InternalUser();
        admin.setEmpId("EMP-INT-1001");
        admin.setRole("ADMIN");
        admin.setEmail("admin@livingora.lk");
        String adminPasswordHash = passwordHasher.hash("admin123");
        admin.setPassword(adminPasswordHash);
        admin.setFirstName("Living-Ora");
        admin.setLastName("Administrator");
        admin.setNic("ADMIN-1001");
        admin.setPhoneNumber("0710000000");
        admin.setAddress("Living-Ora Head Office");
        admin.setAge(35);
        admin.setJoinedDate(LocalDate.now());
        admin.setUserVerification(verification);
        promotionRepository.findAll().stream().findFirst().ifPresent(admin::setPromotion);
        internalUserRepository.save(admin);
    }

    /**
     * Seed representative internal roles so the admin user-management screen
     * has realistic data to work with during development/demo runs.
     */
    private void ensureSampleInternalStaff() {
        ensureSampleStaff("EMP-SALES-1001", "sales.manager@livingora.lk", "Sales", "Manager",
                "SALES_MANAGER", "salesmanager123", "STAFF-SALES-1001", "199012345678", "0711000001", 36);
        ensureSampleStaff("EMP-MKT-1001", "marketing.manager@livingora.lk", "Marketing", "Manager",
                "MARKETING_MANAGER", "marketing123", "STAFF-MKT-1001", "199012345683", "0711000006", 36);
        ensureSampleStaff("EMP-CRM-1001", "customer.relations@livingora.lk", "Customer Relations", "Officer",
                "CUSTOMER_RELATIONS_OFFICER", "customer123", "STAFF-CRM-1001", "199112345679", "0711000002", 35);
        ensureSampleStaff("EMP-FIN-1001", "finance.payments@livingora.lk", "Finance & Payments", "Officer",
                "FINANCE_PAYMENTS_OFFICER", "finance123", "STAFF-FIN-1001", "199212345680", "0711000003", 34);
        ensureSampleStaff("EMP-PDM-1001", "property.development@livingora.lk", "Property Development", "Manager",
                "PROPERTY_DEVELOPMENT_MANAGER", "property123", "STAFF-PDM-1001", "199012345681", "0711000004", 36);
        ensureSampleStaff("EMP-OPS-1001", "operations.director@livingora.lk", "Operations", "Director",
                "OPERATIONS_DIRECTOR", "operations123", "STAFF-OPS-1001", "199312345682", "0711000005", 39);
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
        promotionRepository.findAll().stream().findFirst().ifPresent(staff::setPromotion);
        internalUserRepository.save(staff);
    }
}
