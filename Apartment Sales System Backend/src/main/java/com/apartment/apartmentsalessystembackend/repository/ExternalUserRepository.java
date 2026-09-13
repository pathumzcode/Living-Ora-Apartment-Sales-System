package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.ExternalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ExternalUserRepository extends JpaRepository<ExternalUser, String> {
    Optional<ExternalUser> findByEmail(String email);
    Optional<ExternalUser> findByNic(String nic);
    Optional<ExternalUser> findByUid(String uid);
    boolean existsByEmail(String email);
}
