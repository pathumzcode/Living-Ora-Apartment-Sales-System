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

    @Autowired
    private com.apartment.apartmentsalessystembackend.repository.InternalUserDeletionRequestRepository internalUserDeletionRequestRepository;

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
        String personalEmail = (request.getPersonalEmail() != null && !request.getPersonalEmail().isBlank())
                ? request.getPersonalEmail().trim().toLowerCase(Locale.ROOT)
                : email;

        if (internalUserRepository.existsByEmail(email) || userVerificationRepository.existsByEmail(email)) {
            throw new BadRequestException("An account already exists for this email");
        }
        if (!email.equalsIgnoreCase(personalEmail)
                && (internalUserRepository.existsByEmail(personalEmail)
                || internalUserRepository.existsByPersonalEmail(personalEmail)
                || userVerificationRepository.existsByEmail(personalEmail))) {
            throw new BadRequestException("An account already exists for this personal email");
        }
        if (internalUserRepository.findByNic(request.getNic().trim()).isPresent()) {
            throw new BadRequestException("An account already exists for this NIC");
        }
        String phone = request.getPhoneNumber().trim();
        if (!phone.matches("^[0-9]{10}$")) {
            throw new BadRequestException("Phone number must contain exactly 10 digits");
        }
        if (internalUserRepository.existsByPhoneNumber(phone)) {
            throw new BadRequestException("An account already exists for this phone number");
        }

        // Validate age from Date of Birth
        if (request.getDateOfBirth() != null) {
            int calculatedAge = java.time.Period.between(request.getDateOfBirth(), java.time.LocalDate.now()).getYears();
            if (calculatedAge < 18) {
                throw new BadRequestException("Internal user must be at least 18 years old to register. Calculated age: " + calculatedAge);
            }
            request.setAge(calculatedAge);
        } else if (request.getAge() != null && request.getAge() < 18) {
            throw new BadRequestException("Internal user must be at least 18 years old to register");
        }

        String role = normalizeInternalRole(request.getRole());
        String empId = generateEmployeeId(role);
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
        internalUser.setPersonalEmail(personalEmail);
        internalUser.setPassword(passwordHash);
        internalUser.setRole(role);
        internalUser.setJoinedDate(java.time.LocalDate.now());
        internalUser.setUserVerification(savedVerification);
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
        String phone = request.getPhoneNumber().trim();
        if (!phone.matches("^[0-9]{10}$")) {
            throw new BadRequestException("Phone number must contain exactly 10 digits");
        }
        if (!phone.equals(internalUser.getPhoneNumber()) && internalUserRepository.existsByPhoneNumber(phone)) {
            throw new BadRequestException("An account already exists for this phone number");
        }

        // Validate age from Date of Birth
        if (request.getDateOfBirth() != null) {
            int calculatedAge = java.time.Period.between(request.getDateOfBirth(), java.time.LocalDate.now()).getYears();
            if (calculatedAge < 18) {
                throw new BadRequestException("Internal user must be at least 18 years old. Calculated age: " + calculatedAge);
            }
            request.setAge(calculatedAge);
        }

        copyFields(internalUser, request);
        internalUser.setEmail(email);
        if (request.getPersonalEmail() != null && !request.getPersonalEmail().isBlank()) {
            internalUser.setPersonalEmail(request.getPersonalEmail().trim().toLowerCase(Locale.ROOT));
        }
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

    @org.springframework.transaction.annotation.Transactional
    public InternalUser updateOwnProfile(String empId, com.apartment.apartmentsalessystembackend.dto.request.InternalUserProfileUpdateRequest request) {
        InternalUser internalUser = internalUserRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Internal user not found with Emp ID: " + empId));

        // Phone validation: exactly 10 digits
        String phone = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "";
        if (!phone.matches("^[0-9]{10}$")) {
            throw new BadRequestException("Phone number must contain exactly 10 digits");
        }

        // Personal email validation
        String personalEmail = request.getPersonalEmail() != null ? request.getPersonalEmail().trim().toLowerCase(Locale.ROOT) : "";
        if (!personalEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new BadRequestException("Please provide a valid personal email address");
        }

        // Check if personal email is taken by another account
        if (!personalEmail.equalsIgnoreCase(internalUser.getPersonalEmail()) && !personalEmail.equalsIgnoreCase(internalUser.getEmail())) {
            if (internalUserRepository.existsByEmail(personalEmail) || userVerificationRepository.existsByEmail(personalEmail)) {
                throw new BadRequestException("An account already exists with this personal email");
            }
        }

        // Check if phone number is taken by another account
        if (!phone.equals(internalUser.getPhoneNumber())) {
            if (internalUserRepository.existsByPhoneNumber(phone)) {
                throw new BadRequestException("An account already exists with this phone number");
            }
        }

        // Update ONLY mutable personal fields (CANNOT change companyEmail, firstName, lastName, dateOfBirth, age, nic, role)
        internalUser.setPersonalEmail(personalEmail);
        internalUser.setEmail(personalEmail); // Sync so staff can also authenticate with personal email
        internalUser.setPhoneNumber(phone);
        if (request.getProfilePicture() != null && !request.getProfilePicture().isBlank()) {
            internalUser.setProfilePicture(request.getProfilePicture().trim());
        }
        if (request.getAddress() != null) {
            internalUser.setAddress(request.getAddress().trim());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().trim().length() < 8) {
                throw new BadRequestException("Password must contain at least 8 characters");
            }
            String hashedPassword = passwordHasher.hash(request.getPassword().trim());
            internalUser.setPassword(hashedPassword);
            internalUser.setcEmailPassword(hashedPassword);
        }

        // Sync UserVerification email and password
        UserVerification verification = internalUser.getUserVerification();
        if (verification != null) {
            verification.setEmail(personalEmail);
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                String hashedPassword = passwordHasher.hash(request.getPassword().trim());
                verification.setPassword(hashedPassword);
            }
            userVerificationRepository.save(verification);
        }

        InternalUser saved = internalUserRepository.save(internalUser);
        recordAudit(empId, "STAFF_PROFILE_UPDATED", empId, "phone=" + phone + ", personalEmail=" + personalEmail);
        return saved;
    }

    private void copyFields(InternalUser target, InternalUserRequest request) {
        target.setFirstName(request.getFirstName().trim()); target.setLastName(request.getLastName().trim());
        target.setNic(request.getNic().trim()); target.setPhoneNumber(request.getPhoneNumber().trim());
        target.setAddress(request.getAddress() == null ? null : request.getAddress().trim()); 
        
        if (request.getDateOfBirth() != null) {
            target.setDateOfBirth(request.getDateOfBirth());
            int calculatedAge = java.time.Period.between(request.getDateOfBirth(), java.time.LocalDate.now()).getYears();
            target.setAge(calculatedAge);
        } else if (request.getAge() != null) {
            target.setAge(request.getAge());
        }

        if (request.getPersonalEmail() != null && !request.getPersonalEmail().isBlank()) {
            target.setPersonalEmail(request.getPersonalEmail().trim().toLowerCase(Locale.ROOT));
        }

        target.setProfilePicture(request.getProfilePicture());
        target.setCompanyEmail(request.getCompanyEmail() != null ? request.getCompanyEmail().trim().toLowerCase(Locale.ROOT) : null);
        if (request.getcEmailPassword() != null && !request.getcEmailPassword().isBlank()) {
            target.setcEmailPassword(passwordHasher.hash(request.getcEmailPassword()));
        }
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

    public String previewNextEmployeeId(String adminEmpId, String role) {
        assertAdmin(adminEmpId);
        return generateEmployeeId(normalizeInternalRole(role));
    }

    private synchronized String generateEmployeeId(String role) {
        String prefix = employeeIdPrefix(role);
        int highestIndex = 1000;
        for (InternalUser user : internalUserRepository.findAll()) {
            highestIndex = highestNumericSuffix(highestIndex, prefix, user.getEmpId());
        }
        for (UserVerification verification : userVerificationRepository.findAll()) {
            highestIndex = highestNumericSuffix(highestIndex, prefix, verification.getEmpId());
        }

        String candidate;
        do {
            candidate = prefix + String.format(Locale.ROOT, "%04d", ++highestIndex);
        } while (employeeIdInUse(candidate));
        return candidate;
    }

    private int highestNumericSuffix(int currentHighest, String prefix, String existingId) {
        if (existingId == null || !existingId.startsWith(prefix)) return currentHighest;
        String suffix = existingId.substring(prefix.length());
        try {
            return Math.max(currentHighest, Integer.parseInt(suffix));
        } catch (NumberFormatException ignored) {
            return currentHighest;
        }
    }

    private boolean employeeIdInUse(String empId) {
        return internalUserRepository.existsById(empId) || userVerificationRepository.existsByEmpId(empId);
    }

    private String employeeIdPrefix(String role) {
        return switch (role) {
            case "ADMIN" -> "EMP-ADM-";
            case "SALES_MANAGER" -> "EMP-SM-";
            case "MARKETING_MANAGER" -> "EMP-MKT-";
            case "CUSTOMER_RELATIONS_OFFICER" -> "EMP-CRO-";
            case "FINANCE_PAYMENTS_OFFICER" -> "EMP-FIN-";
            case "PROPERTY_DEVELOPMENT_MANAGER" -> "EMP-PDM-";
            case "OPERATIONS_DIRECTOR" -> "EMP-OPS-";
            default -> "EMP-STAFF-";
        };
    }

    private void assertAdmin(String adminEmpId) {
        InternalUser admin = internalUserRepository.findById(adminEmpId == null ? "" : adminEmpId)
                .orElseThrow(() -> new BadRequestException("Admin access is required"));
        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) throw new BadRequestException("Admin access is required");
    }

    private void assertOperationsDirectorOrAdmin(String reviewerEmpId) {
        InternalUser reviewer = internalUserRepository.findById(reviewerEmpId == null ? "" : reviewerEmpId)
                .orElseThrow(() -> new BadRequestException("Operations Director or Admin access is required"));
        String role = reviewer.getRole();
        if (!"OPERATIONS_DIRECTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new BadRequestException("Only Operations Director or Admin can review deletion requests");
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> deleteInternalUser(String adminEmpId, String targetEmpId) {
        assertAdmin(adminEmpId);
        InternalUser target = internalUserRepository.findById(targetEmpId)
                .orElseThrow(() -> new ResourceNotFoundException("Internal user not found with Emp ID: " + targetEmpId));

        String targetEmail = target.getCompanyEmail() != null ? target.getCompanyEmail() : target.getEmail();
        UserVerification verification = target.getUserVerification();

        // 1. Delete InternalUser record first (holds FK to userVerification)
        internalUserRepository.delete(target);
        internalUserRepository.flush();

        // 2. Delete associated UserVerification record
        if (verification != null) {
            userVerificationRepository.delete(verification);
            userVerificationRepository.flush();
        }

        // 3. Cleanup any orphan records by empId or email
        userVerificationRepository.findByEmpId(targetEmpId).ifPresent(v -> {
            userVerificationRepository.delete(v);
            userVerificationRepository.flush();
        });
        if (targetEmail != null && !targetEmail.isBlank()) {
            userVerificationRepository.findByEmail(targetEmail).ifPresent(v -> {
                userVerificationRepository.delete(v);
                userVerificationRepository.flush();
            });
        }

        recordAudit(adminEmpId, "INTERNAL_USER_DELETED_PERMANENTLY", targetEmpId, "deletedBy=" + adminEmpId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Internal user and associated verification record permanently deleted.");
        response.put("targetEmpId", targetEmpId);
        return response;
    }

    public List<com.apartment.apartmentsalessystembackend.entity.InternalUserDeletionRequest> getPendingDeletionRequests(String reviewerEmpId) {
        assertOperationsDirectorOrAdmin(reviewerEmpId);
        return internalUserDeletionRequestRepository.findByStatusOrderByRequestedAtDesc("PENDING");
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> approveInternalUserDeletion(String reviewerEmpId, String requestId) {
        assertOperationsDirectorOrAdmin(reviewerEmpId);
        com.apartment.apartmentsalessystembackend.entity.InternalUserDeletionRequest req =
                internalUserDeletionRequestRepository.findByRequestId(requestId)
                        .orElseThrow(() -> new ResourceNotFoundException("Deletion request not found with ID: " + requestId));

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new BadRequestException("Request is not in PENDING status: " + req.getStatus());
        }

        String targetEmpId = req.getTargetEmpId();
        InternalUser target = internalUserRepository.findById(targetEmpId).orElse(null);
        UserVerification verification = null;

        if (target != null) {
            verification = target.getUserVerification();
            // 1. Delete InternalUser record first (since it holds FK userVerification_verificationID)
            internalUserRepository.delete(target);
            internalUserRepository.flush();
        }

        // 2. Permanently delete from userVerification table (by referenced object, empId, and email)
        if (verification != null) {
            userVerificationRepository.delete(verification);
            userVerificationRepository.flush();
        }

        // Also clean up any matching entry in userVerification table by empId or email to ensure 100% removal
        userVerificationRepository.findByEmpId(targetEmpId).ifPresent(v -> {
            userVerificationRepository.delete(v);
            userVerificationRepository.flush();
        });

        if (req.getTargetEmail() != null && !req.getTargetEmail().isBlank()) {
            userVerificationRepository.findByEmail(req.getTargetEmail()).ifPresent(v -> {
                userVerificationRepository.delete(v);
                userVerificationRepository.flush();
            });
        }

        req.setStatus("APPROVED");
        req.setReviewedByEmpId(reviewerEmpId);
        req.setReviewedAt(java.time.LocalDateTime.now());
        internalUserDeletionRequestRepository.save(req);

        recordAudit(reviewerEmpId, "INTERNAL_USER_DELETED_PERMANENTLY", targetEmpId, "requestId=" + requestId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Internal user and associated userVerification record deleted permanently.");
        response.put("targetEmpId", targetEmpId);
        response.put("requestId", requestId);
        return response;
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> rejectInternalUserDeletion(String reviewerEmpId, String requestId, String reason) {
        assertOperationsDirectorOrAdmin(reviewerEmpId);
        com.apartment.apartmentsalessystembackend.entity.InternalUserDeletionRequest req =
                internalUserDeletionRequestRepository.findByRequestId(requestId)
                        .orElseThrow(() -> new ResourceNotFoundException("Deletion request not found with ID: " + requestId));

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new BadRequestException("Request is not in PENDING status: " + req.getStatus());
        }

        req.setStatus("REJECTED");
        req.setReviewedByEmpId(reviewerEmpId);
        req.setReviewedAt(java.time.LocalDateTime.now());
        req.setRejectionReason(reason);
        internalUserDeletionRequestRepository.save(req);

        recordAudit(reviewerEmpId, "INTERNAL_USER_DELETION_REJECTED", req.getTargetEmpId(), "requestId=" + requestId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Deletion request rejected. Account remains active.");
        response.put("targetEmpId", req.getTargetEmpId());
        response.put("requestId", requestId);
        return response;
    }

    private void recordAudit(String actorEmpId, String action, String target, String details) {
        auditLogRepository.save(new AuditLog(actorEmpId, action, target, details));
    }
}
