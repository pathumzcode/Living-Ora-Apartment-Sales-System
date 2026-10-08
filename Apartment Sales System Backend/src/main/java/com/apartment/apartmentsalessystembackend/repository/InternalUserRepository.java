package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.InternalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InternalUserRepository extends JpaRepository<InternalUser, String> {
    Optional<InternalUser> findByEmail(String email);
    Optional<InternalUser> findByCompanyEmail(String companyEmail);
    Optional<InternalUser> findByNic(String nic);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
