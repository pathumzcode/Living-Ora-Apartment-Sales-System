package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.LoginRequest;
import com.apartment.apartmentsalessystembackend.dto.request.ExternalSignupRequest;
import com.apartment.apartmentsalessystembackend.dto.response.LoginResponse;
import com.apartment.apartmentsalessystembackend.entity.UserVerification;
import com.apartment.apartmentsalessystembackend.entity.ExternalUser;
import com.apartment.apartmentsalessystembackend.entity.InternalUser;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.repository.UserVerificationRepository;
import com.apartment.apartmentsalessystembackend.repository.ExternalUserRepository;
import com.apartment.apartmentsalessystembackend.repository.InternalUserRepository;
import com.apartment.apartmentsalessystembackend.util.JwtUtil;
import com.apartment.apartmentsalessystembackend.util.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserVerificationRepository userVerificationRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @Autowired
    private InternalUserRepository internalUserRepository;

    @Autowired
    private PasswordHasher passwordHasher;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        // ── Try internal user first (ADMIN / staff roles) ──────────
        // Internal staff may use either the account email or their company
        // business email on the public login page.
        java.util.Optional<InternalUser> internalOpt = internalUserRepository.findByEmail(email);
        if (internalOpt.isEmpty()) {
            internalOpt = internalUserRepository.findByCompanyEmail(email);
        }
        if (internalOpt.isPresent()) {
            InternalUser internalUser = internalOpt.get();
            if (!passwordHasher.matches(request.getPassword(), internalUser.getPassword())) {
                throw new BadRequestException("Invalid email or password");
            }
            if (internalUser.getUserVerification().getIsActive() == null
                    || internalUser.getUserVerification().getIsActive() != 1
                    || internalUser.getUserVerification().getIsVerified() == null
                    || internalUser.getUserVerification().getIsVerified() != 1) {
                throw new BadRequestException("This account is inactive or not yet verified");
            }
            // Upgrade plain-text password if needed
            if (!passwordHasher.isHashed(internalUser.getPassword())) {
                String upgraded = passwordHasher.hash(request.getPassword());
                internalUser.setPassword(upgraded);
                internalUser.getUserVerification().setPassword(upgraded);
                userVerificationRepository.save(internalUser.getUserVerification());
                internalUserRepository.save(internalUser);
            }
            String actualRole = normalizeInternalRole(internalUser.getRole());
            internalUser.getUserVerification().setLastLoginAt(LocalDateTime.now());
            userVerificationRepository.save(internalUser.getUserVerification());
            return new LoginResponse(
                    jwtUtil.generateToken(email, actualRole),
                    internalUser.getEmpId(),
                    internalUser.getEmail(),
                    internalUser.getFirstName(),
                    internalUser.getLastName(),
                    actualRole,
                    false);
        }

        // ── Fall back to external user (CUSTOMER / SALES_AGENT) ────
        UserVerification verification = userVerificationRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordHasher.matches(request.getPassword(), verification.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        if (verification.getIsActive() == null || verification.getIsActive() != 1) {
            throw new BadRequestException("This account is inactive");
        }
        if (verification.getIsVerified() == null || verification.getIsVerified() != 1) {
            throw new BadRequestException("This account has not been verified yet");
        }
        // Upgrade plain-text password if needed
        if (!passwordHasher.isHashed(verification.getPassword())) {
            String upgraded = passwordHasher.hash(request.getPassword());
            verification.setPassword(upgraded);
            userVerificationRepository.save(verification);
        }
        ExternalUser externalUser = externalUserRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Account profile not found"));

        String actualRole = normalizeRole(externalUser.getRole());
        if (actualRole == null) actualRole = externalUser.getRole();

        verification.setLastLoginAt(LocalDateTime.now());
        userVerificationRepository.save(verification);

        return new LoginResponse(
                jwtUtil.generateToken(email, actualRole),
                externalUser.getUid(),
                externalUser.getEmail(),
                externalUser.getFirstName(),
                externalUser.getLastName(),
                actualRole
        );
    }

    @Transactional
    public LoginResponse signup(ExternalSignupRequest request) {
        String role = normalizeRole(request.getRole());
        if (role == null) {
            throw new BadRequestException("Only Customer and Sales Agent accounts can be created here");
        }
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String nic = request.getNic().trim().toUpperCase(Locale.ROOT);
        if (userVerificationRepository.existsByEmail(email) || externalUserRepository.existsByEmail(email)) {
            throw new BadRequestException("An account already exists for this email");
        }
        if (externalUserRepository.findByNic(nic).isPresent()) {
            throw new BadRequestException("An account already exists for this NIC");
        }

        String uid = "EXT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        UserVerification verification = new UserVerification();
        verification.setUid(uid);
        verification.setEmail(email);
        String passwordHash = passwordHasher.hash(request.getPassword());
        verification.setPassword(passwordHash);
        verification.setIsActive(1);
        verification.setIsVerified(1);
        UserVerification savedVerification = userVerificationRepository.save(verification);

        ExternalUser externalUser = new ExternalUser();
        externalUser.setUid(uid);
        externalUser.setRole(role);
        externalUser.setFirstName(request.getFirstName().trim());
        externalUser.setLastName(request.getLastName().trim());
        externalUser.setNic(nic);
        externalUser.setPhoneNumber(request.getPhoneNumber().trim());
        externalUser.setAddress(request.getAddress().trim());
        externalUser.setAge(request.getAge());
        externalUser.setNumOfApartments(0);
        externalUser.setEmail(email);
        externalUser.setPassword(passwordHash);
        externalUser.setRegisteredDate(LocalDate.now());
        externalUser.setUserVerification(savedVerification);
        externalUserRepository.save(externalUser);

        String token = jwtUtil.generateToken(email, role);
        return new LoginResponse(token, uid, email, externalUser.getFirstName(), externalUser.getLastName(), role);
    }

    private String normalizeRole(String role) {
        if (role == null) return null;
        String normalized = role.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        if (normalized.equals("CUSTOMER")) return "CUSTOMER";
        if (normalized.equals("SALES_AGENT") || normalized.equals("SALESAGENT")) return "SALES_AGENT";
        if (normalized.equals("ADMIN") || normalized.equals("INTERNAL_ADMIN")) return "ADMIN";
        if (normalized.equals("INTERNAL_USER") || normalized.equals("STAFF")) return "INTERNAL_USER";
        if (normalized.equals("SALES_MANAGER")
                || normalized.equals("MARKETING_MANAGER")
                || normalized.equals("CUSTOMER_RELATIONS_OFFICER")
                || normalized.equals("FINANCE_PAYMENTS_OFFICER")
                || normalized.equals("PROPERTY_DEVELOPMENT_MANAGER")
                || normalized.equals("OPERATIONS_DIRECTOR")) return normalized;
        return null;
    }

    private boolean isInternalRole(String role) {
        return "ADMIN".equals(role) || "INTERNAL_USER".equals(role)
                || "SALES_MANAGER".equals(role)
                || "MARKETING_MANAGER".equals(role)
                || "CUSTOMER_RELATIONS_OFFICER".equals(role)
                || "FINANCE_PAYMENTS_OFFICER".equals(role)
                || "PROPERTY_DEVELOPMENT_MANAGER".equals(role)
                || "OPERATIONS_DIRECTOR".equals(role);
    }

    private String normalizeInternalRole(String role) {
        if (role == null) return "INTERNAL_USER";
        String normalized = role.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        if (normalized.equals("ADMIN") || normalized.equals("INTERNAL_ADMIN")) return "ADMIN";
        if (normalized.equals("SALES_MANAGER")
                || normalized.equals("MARKETING_MANAGER")
                || normalized.equals("CUSTOMER_RELATIONS_OFFICER")
                || normalized.equals("FINANCE_PAYMENTS_OFFICER")
                || normalized.equals("PROPERTY_DEVELOPMENT_MANAGER")
                || normalized.equals("OPERATIONS_DIRECTOR")) return normalized;
        return "INTERNAL_USER";
    }
}
