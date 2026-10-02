package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.entity.InternalUserDeletionRequest;
import com.apartment.apartmentsalessystembackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operations/deletion-requests")
public class OperationsDeletionController {

    private final UserService userService;

    public OperationsDeletionController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<InternalUserDeletionRequest>> getPendingRequests(
            @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
            @RequestHeader(value = "X-Admin-Emp-Id", required = false) String adminEmpId) {
        String reviewer = staffEmpId != null && !staffEmpId.isBlank() ? staffEmpId : adminEmpId;
        return ResponseEntity.ok(userService.getPendingDeletionRequests(reviewer));
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<Map<String, Object>> approveDeletion(
            @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
            @RequestHeader(value = "X-Admin-Emp-Id", required = false) String adminEmpId,
            @PathVariable String requestId) {
        String reviewer = staffEmpId != null && !staffEmpId.isBlank() ? staffEmpId : adminEmpId;
        return ResponseEntity.ok(userService.approveInternalUserDeletion(reviewer, requestId));
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectDeletion(
            @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
            @RequestHeader(value = "X-Admin-Emp-Id", required = false) String adminEmpId,
            @PathVariable String requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String reviewer = staffEmpId != null && !staffEmpId.isBlank() ? staffEmpId : adminEmpId;
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(userService.rejectInternalUserDeletion(reviewer, requestId, reason));
    }
}
