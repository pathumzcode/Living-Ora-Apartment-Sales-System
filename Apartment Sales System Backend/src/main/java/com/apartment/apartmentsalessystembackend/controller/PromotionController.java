package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.PromotionRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PromotionResponse;
import com.apartment.apartmentsalessystembackend.entity.InternalUser;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.repository.InternalUserRepository;
import com.apartment.apartmentsalessystembackend.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// REST controller for Promotion & Special Offer Management.

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private InternalUserRepository internalUserRepository;


    // GET /api/promotions Retrive all promotions (excluding DELETED).
    // Public — customers and guests can view.

    @GetMapping
    public ResponseEntity<List<PromotionResponse>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    // eturns only currently active promotions (status=ACTIVE and today within date range).
    // Public — used by the customer-facing promotions page.

    @GetMapping("/active")
    public ResponseEntity<List<PromotionResponse>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }


     // Returns a single promotion by ID.
     // Accessible to any authenticated staff member.

    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponse> getPromotionById(@PathVariable String id) {
        return ResponseEntity.ok(promotionService.getPromotionById(id));
    }

    // Returns a promotion by its promo code.

    @GetMapping("/code/{code}")
    public ResponseEntity<PromotionResponse> getPromotionByCode(@PathVariable String code) {
        return ResponseEntity.ok(promotionService.getPromotionByCode(code));
    }

    //Search/filter promotions by title and optional status.
    // Accessible to management roles.

    @GetMapping("/search")
    public ResponseEntity<List<PromotionResponse>> searchPromotions(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String status) {
        return ResponseEntity.ok(promotionService.searchPromotions(q, status));
    }

    // Returns all currently active promotions applicable to a given apartment.
    // Public — used by the apartment detail page to show available offers.

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<PromotionResponse>> getActivePromotionsForApartment(
            @PathVariable String apartmentId) {
        return ResponseEntity.ok(promotionService.getActivePromotionsForApartment(apartmentId));
    }

    /**
     * POST /api/promotions/validate-code
     * Validates a promo code for a given apartment and returns discount details.
     * Used by the booking modal to preview discount before submitting.
     * Body: { "code": "ORA2026", "apartmentId": "APT-LO-001" }
     */

    @PostMapping("/validate-code")
    public ResponseEntity<PromotionResponse> validatePromoCode(
            @RequestBody Map<String, String> body) {
        String code = body.get("code");
        String apartmentId = body.get("apartmentId");
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Promotion code is required.");
        }
        return ResponseEntity.ok(promotionService.validatePromoCode(code, apartmentId));
    }

    // ── Management Endpoints (requires management role) ───────────────────────────

    // Creates a new promotion.
     // Requires: ADMIN or MARKETING_MANAGER role (X-Staff-Emp-Id header).

    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(
            @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
            @Valid @RequestBody PromotionRequest request) {
        requireManagementRole(staffEmpId);
        PromotionResponse created = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Updates an existing promotion.
    // Requires: ADMIN or MARKETING_MANAGER role.

    @PutMapping("/{id}")
    public ResponseEntity<PromotionResponse> updatePromotion(
            @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
            @PathVariable String id,
            @Valid @RequestBody PromotionRequest request) {
        requireManagementRole(staffEmpId);
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }

    // Toggles a promotion between ACTIVE and INACTIVE.
    // Requires: ADMIN or MARKETING_MANAGER role.

    @PatchMapping("/{id}/status")
    public ResponseEntity<PromotionResponse> toggleStatus(
            @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
            @PathVariable String id) {
        requireManagementRole(staffEmpId);
        return ResponseEntity.ok(promotionService.togglePromotionStatus(id));
    }

    // Soft-deletes a promotion (status = DELETED).
    // Requires: ADMIN role only.

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePromotion(
            @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
            @PathVariable String id) {
        requireAdminRole(staffEmpId);
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(Map.of("message", "Promotion deleted successfully."));
    }

    // ── Authorization Helpers ─────────────────────────────────────────────────────

    // Validates that the caller is ADMIN or MARKETING_MANAGER.

    private void requireManagementRole(String staffEmpId) {
        if (staffEmpId == null || staffEmpId.isBlank()) {
            throw new BadRequestException("Staff Employee ID header (X-Staff-Emp-Id) is required.");
        }
        InternalUser user = internalUserRepository.findById(staffEmpId)
                .orElseThrow(() -> new BadRequestException("Staff member not found: " + staffEmpId));
        String role = user.getRole();
        if (!"ADMIN".equals(role) && !"MARKETING_MANAGER".equals(role) &&
            !"SALES_MANAGER".equals(role) && !"OPERATIONS_DIRECTOR".equals(role)) {
            throw new BadRequestException(
                    "Access denied. Promotion management requires ADMIN, MARKETING_MANAGER, SALES_MANAGER, or OPERATIONS_DIRECTOR role.");
        }
    }

    // Validates that the caller is ADMIN (for delete operations).

    private void requireAdminRole(String staffEmpId) {
        if (staffEmpId == null || staffEmpId.isBlank()) {
            throw new BadRequestException("Staff Employee ID header (X-Staff-Emp-Id) is required.");
        }
        InternalUser user = internalUserRepository.findById(staffEmpId)
                .orElseThrow(() -> new BadRequestException("Staff member not found: " + staffEmpId));
        if (!"ADMIN".equals(user.getRole())) {
            throw new BadRequestException("Access denied. Only ADMIN can delete promotions.");
        }
    }
}
