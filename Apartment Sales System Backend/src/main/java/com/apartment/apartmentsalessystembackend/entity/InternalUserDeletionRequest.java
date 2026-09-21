package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internal_user_deletion_requests")
public class InternalUserDeletionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "requestId", nullable = false, unique = true, length = 64)
    private String requestId;

    @Column(name = "targetEmpId", nullable = false, length = 50)
    private String targetEmpId;

    @Column(name = "targetName", nullable = false, length = 150)
    private String targetName;

    @Column(name = "targetEmail", nullable = false, length = 255)
    private String targetEmail;

    @Column(name = "targetRole", nullable = false, length = 50)
    private String targetRole;

    @Column(name = "requestedByEmpId", nullable = false, length = 50)
    private String requestedByEmpId;

    @Column(name = "reviewedByEmpId", length = 50)
    private String reviewedByEmpId;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "requestedAt", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "reviewedAt")
    private LocalDateTime reviewedAt;

    @Column(name = "rejectionReason", length = 500)
    private String rejectionReason;

    public InternalUserDeletionRequest() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getTargetEmpId() {
        return targetEmpId;
    }

    public void setTargetEmpId(String targetEmpId) {
        this.targetEmpId = targetEmpId;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public String getTargetEmail() {
        return targetEmail;
    }

    public void setTargetEmail(String targetEmail) {
        this.targetEmail = targetEmail;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getRequestedByEmpId() {
        return requestedByEmpId;
    }

    public void setRequestedByEmpId(String requestedByEmpId) {
        this.requestedByEmpId = requestedByEmpId;
    }

    public String getReviewedByEmpId() {
        return reviewedByEmpId;
    }

    public void setReviewedByEmpId(String reviewedByEmpId) {
        this.reviewedByEmpId = reviewedByEmpId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
