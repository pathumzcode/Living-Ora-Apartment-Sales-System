package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditLog")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 50)
    private String actorEmpId;
    @Column(nullable = false, length = 80)
    private String action;
    @Column(length = 100)
    private String target;
    @Column(length = 500)
    private String details;
    @Column(nullable = false)
    private LocalDateTime createdAt;

    public AuditLog() {}
    public AuditLog(String actorEmpId, String action, String target, String details) {
        this.actorEmpId = actorEmpId;
        this.action = action;
        this.target = target;
        this.details = details;
        this.createdAt = LocalDateTime.now();
    }
    public Long getId() { return id; }
    public String getActorEmpId() { return actorEmpId; }
    public String getAction() { return action; }
    public String getTarget() { return target; }
    public String getDetails() { return details; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
