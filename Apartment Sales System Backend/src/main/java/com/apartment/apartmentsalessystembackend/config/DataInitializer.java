package com.apartment.apartmentsalessystembackend.config;

import com.apartment.apartmentsalessystembackend.entity.*;
import com.apartment.apartmentsalessystembackend.repository.*;
import com.apartment.apartmentsalessystembackend.util.PasswordHasher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

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


    // =========================================================
    // MAIN INITIALIZER
    // =========================================================

    @Override
    public void run(String... args) {

        /*
         * ORDER IS IMPORTANT
         *
         * 1. Promotion
         * 2. Customer
         * 3. Admin
         * 4. Apartment + Unit catalog
         * 5. External apartment
         * 6. Role migration
         * 7. Sample staff
         */

        initializePromotion();
        initializeCustomer();
        ensureDefaultAdmin();

        // Admin MUST exist before apartments are created.
        seedDemoPropertyCatalog();

        initializeExternalApartment();
        migrateLegacyInternalRoles();
        ensureSampleInternalStaff();
    }


    // =========================================================
    // PROMOTION
    // =========================================================

    private void initializePromotion() {

        if (promotionRepository.findById("PROMO-2026").isPresent()) {
            return;
        }

        Promotion promo = new Promotion();

        promo.setPromotionId("PROMO-2026");
        promo.setPromotionType("Discount Code");
        promo.setPromotionTitle("New Year Grand Discount");
        promo.setPromotionCode("ORA2026");

        promo.setDiscountPrecentage(
                new BigDecimal("5.00")
        );

        promo.setStartDate(LocalDate.now());
        promo.setEndDate(LocalDate.now().plusMonths(3));

        promo.setButtonText("Claim 5% Off");
        promo.setValidityPeriod("Limited Time");

        promo.setAbout(
                "Get 5% instant discount on down payment " +
                        "for all bookings this month."
        );
        promo.setStatus("ACTIVE");

        promotionRepository.save(promo);

        System.out.println(
                "Default promotion created: PROMO-2026"
        );
    }


    // =========================================================
    // CUSTOMER / EXTERNAL USER
    // =========================================================

    private void initializeCustomer() {

        String email = "john@livingora.lk";

        if (externalUserRepository
                .findById("USR-EXT-5001")
                .isPresent()) {

            return;
        }

        UserVerification verification =
                userVerificationRepository
                        .findByEmail(email)
                        .orElseGet(() -> {

                            UserVerification customer =
                                    new UserVerification();

                            customer.setUid("USR-EXT-5001");
                            customer.setEmail(email);

                            customer.setPassword(
                                    passwordHasher.hash("123456")
                            );

                            customer.setIsActive(1);
                            customer.setIsVerified(1);

                            customer.setLastLoginAt(
                                    LocalDateTime.now()
                            );

                            return userVerificationRepository.save(customer);
                        });


        ExternalUser customerProfile =
                new ExternalUser();

        customerProfile.setUid(
                "USR-EXT-5001"
        );

        customerProfile.setRole(
                "CUSTOMER"
        );

        customerProfile.setFirstName(
                "John"
        );

        customerProfile.setLastName(
                "Living-Ora"
        );

        customerProfile.setNic(
                "DEMO-5001"
        );

        customerProfile.setPhoneNumber(
                "0712345678"
        );

        customerProfile.setAddress(
                "Colombo, Sri Lanka"
        );

        customerProfile.setAge(30);

        customerProfile.setNumOfApartments(0);

        customerProfile.setEmail(
                email
        );

        customerProfile.setPassword(
                verification.getPassword()
        );

        customerProfile.setRegisteredDate(
                LocalDate.now()
        );

        customerProfile.setUserVerification(
                verification
        );

        externalUserRepository.save(
                customerProfile
        );

        System.out.println(
                "Default customer created: " + email
        );
    }


    // =========================================================
    // DEFAULT ADMIN
    // =========================================================

    private void ensureDefaultAdmin() {

        String adminEmail =
                "admin@livingora.lk";

        if (internalUserRepository
                .findByEmail(adminEmail)
                .isPresent()) {

            System.out.println(
                    "Default admin already exists: " + adminEmail
            );

            return;
        }


        // -----------------------------------------------------
        // USER VERIFICATION
        // -----------------------------------------------------

        UserVerification verification =
                userVerificationRepository
                        .findByEmail(adminEmail)
                        .orElseGet(() -> {

                            UserVerification created =
                                    new UserVerification();

                            created.setUid(
                                    "USR-INT-1001"
                            );

                            created.setEmpId(
                                    "EMP-INT-1001"
                            );

                            created.setEmail(
                                    adminEmail
                            );

                            created.setPassword(
                                    passwordHasher.hash(
                                            "admin123"
                                    )
                            );

                            created.setIsActive(1);
                            created.setIsVerified(1);

                            created.setLastLoginAt(
                                    LocalDateTime.now()
                            );

                            return userVerificationRepository
                                    .save(created);
                        });


        // -----------------------------------------------------
        // REQUIRED PROMOTION
        // -----------------------------------------------------

        Promotion promotion =
                promotionRepository
                        .findById("PROMO-2026")
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "PROMO-2026 does not exist. " +
                                                "Promotion must be created " +
                                                "before the admin."
                                )
                        );


        // -----------------------------------------------------
        // CREATE ADMIN
        // -----------------------------------------------------

        InternalUser admin =
                new InternalUser();

        admin.setEmpId(
                "EMP-INT-1001"
        );

        admin.setRole(
                "ADMIN"
        );

        admin.setEmail(
                adminEmail
        );

        admin.setPassword(
                verification.getPassword()
        );

        admin.setFirstName(
                "Living-Ora"
        );

        admin.setLastName(
                "Administrator"
        );

        admin.setNic(
                "ADMIN-1001"
        );

        admin.setPhoneNumber(
                "0710000000"
        );

        admin.setAddress(
                "Living-Ora Head Office"
        );

        admin.setAge(35);

        admin.setDateOfBirth(
                LocalDate.now()
                        .minusYears(35)
                        .minusMonths(3)
        );

        admin.setJoinedDate(
                LocalDate.now()
        );

        admin.setCompanyEmail(
                adminEmail
        );

        admin.setcEmailPassword(
                verification.getPassword()
        );

        admin.setServiceYears(
                10
        );

        admin.setProfilePicture(
                "https://ui-avatars.com/api/?name=Living-Ora+Administrator"
        );


        // REQUIRED FOREIGN KEYS
        admin.setUserVerification(
                verification
        );

        admin.setPromotion(
                promotion
        );


        internalUserRepository.save(
                admin
        );

        System.out.println(
                "Default admin created: " + adminEmail
        );
    }


    // =========================================================
    // APARTMENT + UNIT DEMO DATA
    // =========================================================

    private void seedDemoPropertyCatalog() {

        /*
         * IMPORTANT FIX
         *
         * apartment.internalUser_empId is NOT NULL.
         *
         * Therefore every Apartment MUST have an InternalUser.
         *
         * ensureDefaultAdmin() executes before this method,
         * so admin@livingora.lk must exist here.
         */

        InternalUser apartmentOwner =
                internalUserRepository
                        .findByEmail(
                                "admin@livingora.lk"
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Cannot create demo apartments because " +
                                                "admin@livingora.lk does not exist."
                                )
                        );


        System.out.println(
                "Apartment owner found: "
                        + apartmentOwner.getEmpId()
        );


        // =====================================================
        // REMOVE OLD DEMO UNITS
        // =====================================================

        unitRepository.findAll()
                .stream()
                .filter(unit ->
                        "UNT-101-A".equals(
                                unit.getUnitId()
                        )
                                ||
                                "UNT-102-B".equals(
                                        unit.getUnitId()
                                )
                )
                .forEach(
                        unitRepository::delete
                );


        // =====================================================
        // REMOVE OLD DEMO APARTMENTS
        // =====================================================

        apartmentRepository.findAll()
                .stream()
                .filter(apartment ->
                        "APT-ORA-01".equals(
                                apartment.getApartmentId()
                        )
                                ||
                                "APT-ORA-02".equals(
                                        apartment.getApartmentId()
                                )
                )
                .forEach(
                        apartmentRepository::delete
                );


        // =====================================================
        // APARTMENT 1
        // =====================================================

        if (apartmentRepository
                .findById("APT-LO-001")
                .isEmpty()) {

            Apartment residences =
                    new Apartment();

            residences.setApartmentId(
                    "APT-LO-001"
            );

            residences.setLocation(
                    "Living Ora Residences — Colombo 03"
            );

            residences.setNumOfRoom(
                    120
            );

            residences.setNumOfFloors(
                    30
            );

            residences.setNumOfSwimmingPool(
                    2
            );

            residences.setNumOfGYM(
                    1
            );

            residences.setPriceRange(
                    "Rs. 38,500,000 - Rs. 75,000,000"
            );

            residences.setUnitStatus(
                    "Available"
            );

            residences.setNumOfUnitsAvailable(
                    3
            );

            residences.setAbout(
                    "A coastal residential development with " +
                            "concierge service, pool decks and " +
                            "smart-home ready units."
            );

            residences.setImages(
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00" +
                            "?auto=format&fit=crop&w=1200&q=80"
            );

            residences.setFloorPlan(
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" +
                            "?auto=format&fit=crop&w=1200&q=80"
            );


            /*
             * CRITICAL FIX
             *
             * Without this Hibernate inserts:
             *
             * internalUser_empId = NULL
             *
             * which causes:
             *
             * Column 'internalUser_empId' cannot be null
             */
            residences.setInternalUser(
                    apartmentOwner
            );


            apartmentRepository.save(
                    residences
            );

            System.out.println(
                    "Demo apartment created: APT-LO-001"
            );
        }


        // =====================================================
        // APARTMENT 2
        // =====================================================

        if (apartmentRepository
                .findById("APT-LO-002")
                .isEmpty()) {

            Apartment marina =
                    new Apartment();

            marina.setApartmentId(
                    "APT-LO-002"
            );

            marina.setLocation(
                    "Living Ora Marina — Colombo 06"
            );

            marina.setNumOfRoom(
                    80
            );

            marina.setNumOfFloors(
                    22
            );

            marina.setNumOfSwimmingPool(
                    1
            );

            marina.setNumOfGYM(
                    1
            );

            marina.setPriceRange(
                    "Rs. 29,500,000 - Rs. 58,000,000"
            );

            marina.setUnitStatus(
                    "Available"
            );

            marina.setNumOfUnitsAvailable(
                    3
            );

            marina.setAbout(
                    "A modern urban project designed around " +
                            "natural light, shared gardens and " +
                            "flexible payment options."
            );

            marina.setImages(
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" +
                            "?auto=format&fit=crop&w=1200&q=80"
            );

            marina.setFloorPlan(
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9" +
                            "?auto=format&fit=crop&w=1200&q=80"
            );


            // CRITICAL FIX
            marina.setInternalUser(
                    apartmentOwner
            );


            apartmentRepository.save(
                    marina
            );

            System.out.println(
                    "Demo apartment created: APT-LO-002"
            );
        }


        // =====================================================
        // APARTMENT 1 UNITS
        // =====================================================

        saveDemoUnit(
                "LO1-0801",
                "APT-LO-001",
                8,
                "East Wing",
                "38500000.00",
                "Available",
                2,
                2,
                "Family"
        );

        saveDemoUnit(
                "LO1-1502",
                "APT-LO-001",
                15,
                "Ocean Wing",
                "52000000.00",
                "Available",
                3,
                2,
                "Family / Investor"
        );

        saveDemoUnit(
                "LO1-2501",
                "APT-LO-001",
                25,
                "Sky Villa",
                "75000000.00",
                "Available",
                4,
                4,
                "Premium Buyer"
        );


        // =====================================================
        // APARTMENT 2 UNITS
        // =====================================================

        saveDemoUnit(
                "LO2-0603",
                "APT-LO-002",
                6,
                "Garden Wing",
                "29500000.00",
                "Available",
                2,
                2,
                "Couple"
        );

        saveDemoUnit(
                "LO2-1204",
                "APT-LO-002",
                12,
                "Marina View",
                "42000000.00",
                "Available",
                3,
                2,
                "Family"
        );

        saveDemoUnit(
                "LO2-1801",
                "APT-LO-002",
                18,
                "Penthouse Wing",
                "58000000.00",
                "Available",
                4,
                3,
                "Premium Buyer"
        );


        System.out.println(
                "Demo apartment and unit catalog initialized successfully."
        );
    }


    // =========================================================
    // CREATE UNIT
    // =========================================================

    private void saveDemoUnit(
            String unitId,
            String apartmentId,
            int floor,
            String wing,
            String price,
            String availability,
            int rooms,
            int bathrooms,
            String recommendedPerson
    ) {

        if (unitRepository
                .findById(unitId)
                .isPresent()) {

            return;
        }


        Unit unit =
                new Unit();

        unit.setUnitId(
                unitId
        );

        unit.setApartmentId(
                apartmentId
        );

        unit.setFloor(
                floor
        );

        unit.setLocation(
                apartmentId + " — " + wing
        );

        unit.setUnitPrice(
                new BigDecimal(price)
        );

        unit.setAvailability(
                availability
        );

        unit.setFurnitures(
                "Fully Furnished"
        );

        unit.setNumOfRooms(
                rooms
        );

        unit.setNumOfBathRooms(
                bathrooms
        );

        unit.setNumOfBeds(
                rooms
        );

        unit.setAcOrNonAC(
                "Air Conditioned"
        );

        unit.setRecommendedPerson(
                recommendedPerson
        );

        unit.setAbout(
                "Test catalog unit for the buyer " +
                        "floor-plan and reservation workflow."
        );

        unit.setImages(
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688" +
                        "?auto=format&fit=crop&w=1000&q=80"
        );


        unitRepository.save(
                unit
        );

        System.out.println(
                "Demo unit created: " + unitId
        );
    }


    // =========================================================
    // EXTERNAL APARTMENT
    // =========================================================

    private void initializeExternalApartment() {

        if (externalApartmentRepository
                .findById("EXT-APT-301")
                .isPresent()) {

            return;
        }


        ExternalApartment ex1 =
                new ExternalApartment();

        ex1.setExApartmentId(
                "EXT-APT-301"
        );

        ex1.setLocation(
                "Nawala, Rajagiriya"
        );

        ex1.setAbout(
                "Private seller offering a premium " +
                        "3-bedroom luxury apartment with pool access."
        );

        ex1.setNumOfRooms(
                3
        );

        ex1.setPrice(
                new BigDecimal(
                        "29500000.00"
                )
        );

        ex1.setDownPayment(
                new BigDecimal(
                        "5000000.00"
                )
        );

        ex1.setAcOrNonAC(
                "AC"
        );

        ex1.setAdditionalInfo(
                "Clean title deed, immediate transfer available."
        );

        ex1.setImages(
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" +
                        "?auto=format&fit=crop&w=1000&q=80"
        );


        externalApartmentRepository.save(
                ex1
        );

        System.out.println(
                "Default external apartment created: EXT-APT-301"
        );
    }


    // =========================================================
    // LEGACY ROLE MIGRATION
    // =========================================================

    private void migrateLegacyInternalRoles() {

        internalUserRepository
                .findAll()
                .forEach(user -> {

                    String currentRole =
                            user.getRole();

                    String updatedRole =
                            switch (
                                    currentRole == null
                                            ? ""
                                            : currentRole
                                    ) {

                                case "MANAGER" ->
                                        "OPERATIONS_DIRECTOR";

                                case "FINANCE_OFFICER" ->
                                        "FINANCE_PAYMENTS_OFFICER";

                                case "SUPPORT_STAFF" ->
                                        "CUSTOMER_RELATIONS_OFFICER";

                                default ->
                                        currentRole;
                            };


                    if (!Objects.equals(
                            currentRole,
                            updatedRole
                    )) {

                        user.setRole(
                                updatedRole
                        );

                        internalUserRepository.save(
                                user
                        );
                    }
                });
    }


    // =========================================================
    // SAMPLE INTERNAL STAFF
    // =========================================================

    private void ensureSampleInternalStaff() {

        ensureSampleStaff(
                "EMP-SALES-1001",
                "sales.manager@livingora.lk",
                "Sales",
                "Manager",
                "SALES_MANAGER",
                "salesmanager123",
                "STAFF-SALES-1001",
                "199012345678",
                "0711000001",
                36
        );


        ensureSampleStaff(
                "EMP-MKT-1001",
                "marketing.manager@livingora.lk",
                "Marketing",
                "Manager",
                "MARKETING_MANAGER",
                "marketing123",
                "STAFF-MKT-1001",
                "199012345683",
                "0711000006",
                36
        );


        ensureSampleStaff(
                "EMP-CRM-1001",
                "customer.relations@livingora.lk",
                "Customer Relations",
                "Officer",
                "CUSTOMER_RELATIONS_OFFICER",
                "customer123",
                "STAFF-CRM-1001",
                "199112345679",
                "0711000002",
                35
        );


        ensureSampleStaff(
                "EMP-FIN-1001",
                "finance.payments@livingora.lk",
                "Finance & Payments",
                "Officer",
                "FINANCE_PAYMENTS_OFFICER",
                "finance123",
                "STAFF-FIN-1001",
                "199212345680",
                "0711000003",
                34
        );


        ensureSampleStaff(
                "EMP-PDM-1001",
                "property.development@livingora.lk",
                "Property Development",
                "Manager",
                "PROPERTY_DEVELOPMENT_MANAGER",
                "property123",
                "STAFF-PDM-1001",
                "199012345681",
                "0711000004",
                36
        );


        ensureSampleStaff(
                "EMP-OPS-1001",
                "operations.director@livingora.lk",
                "Operations",
                "Director",
                "OPERATIONS_DIRECTOR",
                "operations123",
                "STAFF-OPS-1001",
                "199312345682",
                "0711000005",
                39
        );
    }


    // =========================================================
    // CREATE / UPDATE SAMPLE STAFF
    // =========================================================

    private void ensureSampleStaff(
            String empId,
            String email,
            String firstName,
            String lastName,
            String role,
            String password,
            String uid,
            String nic,
            String phoneNumber,
            int age
    ) {

        Promotion promotion =
                promotionRepository
                        .findById("PROMO-2026")
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Cannot create internal staff because " +
                                                "PROMO-2026 does not exist."
                                )
                        );


        InternalUser staff =
                internalUserRepository
                        .findByEmail(email)
                        .orElse(null);


        // =====================================================
        // UPDATE EXISTING STAFF
        // =====================================================

        if (staff != null) {

            String passwordHash =
                    passwordHasher.hash(
                            password
                    );


            staff.setRole(
                    role
            );

            staff.setFirstName(
                    firstName
            );

            staff.setLastName(
                    lastName
            );

            staff.setPassword(
                    passwordHash
            );

            staff.setNic(
                    nic
            );

            staff.setPhoneNumber(
                    phoneNumber
            );

            staff.setAddress(
                    "Living-Ora Head Office"
            );

            staff.setAge(
                    age
            );

            staff.setDateOfBirth(
                    LocalDate.now()
                            .minusYears(age)
                            .minusMonths(3)
            );

            staff.setProfilePicture(
                    "https://ui-avatars.com/api/?name="
                            + firstName.replace(" ", "+")
                            + "+"
                            + lastName.replace(" ", "+")
            );

            staff.setCompanyEmail(
                    email
            );

            staff.setcEmailPassword(
                    passwordHash
            );

            staff.setServiceYears(
                    Math.max(
                            1,
                            age - 25
                    )
            );


            if (staff.getJoinedDate() == null) {

                staff.setJoinedDate(
                        LocalDate.now()
                );
            }


            // REQUIRED RELATION
            staff.setPromotion(
                    promotion
            );


            internalUserRepository.save(
                    staff
            );


            userVerificationRepository
                    .findByEmail(email)
                    .ifPresent(verification -> {

                        verification.setPassword(
                                passwordHash
                        );

                        verification.setIsActive(
                                1
                        );

                        verification.setIsVerified(
                                1
                        );

                        userVerificationRepository.save(
                                verification
                        );
                    });


            System.out.println(
                    "Sample staff updated: " + email
            );

            return;
        }


        // =====================================================
        // CREATE NEW STAFF
        // =====================================================

        String passwordHash =
                passwordHasher.hash(
                        password
                );


        UserVerification verification =
                userVerificationRepository
                        .findByEmail(email)
                        .orElseGet(() -> {

                            UserVerification created =
                                    new UserVerification();

                            created.setUid(
                                    uid
                            );

                            created.setEmpId(
                                    empId
                            );

                            created.setEmail(
                                    email
                            );

                            created.setPassword(
                                    passwordHash
                            );

                            created.setIsActive(
                                    1
                            );

                            created.setIsVerified(
                                    1
                            );

                            created.setLastLoginAt(
                                    LocalDateTime.now()
                            );

                            return userVerificationRepository
                                    .save(created);
                        });


        staff =
                new InternalUser();


        staff.setEmpId(
                empId
        );

        staff.setRole(
                role
        );

        staff.setEmail(
                email
        );

        staff.setPassword(
                passwordHash
        );

        staff.setFirstName(
                firstName
        );

        staff.setLastName(
                lastName
        );

        staff.setNic(
                nic
        );

        staff.setPhoneNumber(
                phoneNumber
        );

        staff.setAddress(
                "Living-Ora Head Office"
        );

        staff.setAge(
                age
        );

        staff.setDateOfBirth(
                LocalDate.now()
                        .minusYears(age)
                        .minusMonths(3)
        );

        staff.setProfilePicture(
                "https://ui-avatars.com/api/?name="
                        + firstName.replace(" ", "+")
                        + "+"
                        + lastName.replace(" ", "+")
        );

        staff.setCompanyEmail(
                email
        );

        staff.setcEmailPassword(
                passwordHash
        );

        staff.setServiceYears(
                Math.max(
                        1,
                        age - 25
                )
        );

        staff.setJoinedDate(
                LocalDate.now()
        );


        // REQUIRED FOREIGN KEYS
        staff.setUserVerification(
                verification
        );

        staff.setPromotion(
                promotion
        );


        internalUserRepository.save(
                staff
        );

        System.out.println(
                "Sample staff created: " + email
        );
    }
}