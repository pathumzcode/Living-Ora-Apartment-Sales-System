package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.InternalUserDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternalUserDeletionRequestRepository extends JpaRepository<InternalUserDeletionRequest, Long> {
    Optional<InternalUserDeletionRequest> findByRequestId(String requestId);
    List<InternalUserDeletionRequest> findByStatusOrderByRequestedAtDesc(String status);
    boolean existsByTargetEmpIdAndStatus(String targetEmpId, String status);
}
