package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.InternalUserRequest;
import com.apartment.apartmentsalessystembackend.dto.request.AccountAccessRequest;
import com.apartment.apartmentsalessystembackend.entity.InternalUser;
import com.apartment.apartmentsalessystembackend.entity.ExternalUser;
import com.apartment.apartmentsalessystembackend.entity.UserVerification;
import com.apartment.apartmentsalessystembackend.entity.AuditLog;
import com.apartment.apartmentsalessystembackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserService userService;
    public AdminController(UserService userService) { this.userService = userService; }

    @GetMapping("/internal-users")
    public ResponseEntity<List<InternalUser>> users(@RequestHeader("X-Admin-Emp-Id") String adminEmpId) {
        return ResponseEntity.ok(userService.getInternalUsersForAdmin(adminEmpId));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview(@RequestHeader("X-Admin-Emp-Id") String adminEmpId) {
        return ResponseEntity.ok(userService.getAdminOverview(adminEmpId));
    }

    @GetMapping("/external-users")
    public ResponseEntity<List<ExternalUser>> externalUsers(@RequestHeader("X-Admin-Emp-Id") String adminEmpId) {
        return ResponseEntity.ok(userService.getExternalUsersForAdmin(adminEmpId));
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<UserVerification>> verifications(@RequestHeader("X-Admin-Emp-Id") String adminEmpId) {
        return ResponseEntity.ok(userService.getVerificationsForAdmin(adminEmpId));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> auditLogs(@RequestHeader("X-Admin-Emp-Id") String adminEmpId) {
        return ResponseEntity.ok(userService.getAuditLogsForAdmin(adminEmpId));
    }

    @PostMapping("/internal-users")
    public ResponseEntity<InternalUser> create(@RequestHeader("X-Admin-Emp-Id") String adminEmpId, @Valid @RequestBody InternalUserRequest request) {
        return ResponseEntity.status(201).body(userService.createInternalUser(adminEmpId, request));
    }

    @PutMapping("/internal-users/{empId}")
    public ResponseEntity<InternalUser> update(@RequestHeader("X-Admin-Emp-Id") String adminEmpId, @PathVariable String empId, @Valid @RequestBody InternalUserRequest request) {
        return ResponseEntity.ok(userService.updateInternalUser(adminEmpId, empId, request));
    }

    @PatchMapping("/internal-users/{empId}/access")
    public ResponseEntity<UserVerification> updateInternalAccess(@RequestHeader("X-Admin-Emp-Id") String adminEmpId,
                                                                  @PathVariable String empId,
                                                                  @Valid @RequestBody AccountAccessRequest request) {
        return ResponseEntity.ok(userService.updateInternalAccess(adminEmpId, empId, request.getActive(), request.getVerified()));
    }

    @PatchMapping("/external-users/{uid}/access")
    public ResponseEntity<UserVerification> updateExternalAccess(@RequestHeader("X-Admin-Emp-Id") String adminEmpId,
                                                                  @PathVariable String uid,
                                                                  @Valid @RequestBody AccountAccessRequest request) {
        return ResponseEntity.ok(userService.updateExternalAccess(adminEmpId, uid, request.getActive(), request.getVerified()));
    }
}
