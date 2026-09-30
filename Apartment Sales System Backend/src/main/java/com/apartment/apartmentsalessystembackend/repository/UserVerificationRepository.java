package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.UserVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserVerificationRepository extends JpaRepository<UserVerification, Long> {
    Optional<UserVerification> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<UserVerification> findByUid(String uid);
    Optional<UserVerification> findByEmpId(String empId);
}
