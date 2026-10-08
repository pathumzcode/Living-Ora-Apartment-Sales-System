package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.PromotionRequest;
import com.apartment.apartmentsalessystembackend.entity.Promotion;
import com.apartment.apartmentsalessystembackend.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Promotion> getPromotionByCode(@PathVariable String code) {
        return ResponseEntity.ok(promotionService.getPromotionByCode(code));
    }

    @PostMapping
    public ResponseEntity<Promotion> createPromotion(
            @RequestHeader(value = "X-Staff-Role", required = false) String role,
            @Valid @RequestBody PromotionRequest request) {
        if (!isAuthorizedManager(role)) {
            throw new com.apartment.apartmentsalessystembackend.exception.ForbiddenException("Only Sales or Operational Managers can create promotions.");
        }
        return ResponseEntity.ok(promotionService.createPromotion(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Promotion> updatePromotion(
            @RequestHeader(value = "X-Staff-Role", required = false) String role,
            @PathVariable String id,
            @Valid @RequestBody PromotionRequest request) {
        if (!isAuthorizedManager(role)) {
            throw new com.apartment.apartmentsalessystembackend.exception.ForbiddenException("Only Sales or Operational Managers can update promotions.");
        }
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(
            @RequestHeader(value = "X-Staff-Role", required = false) String role,
            @PathVariable String id) {
        if (!isAuthorizedManager(role)) {
            throw new com.apartment.apartmentsalessystembackend.exception.ForbiddenException("Only Sales or Operational Managers can delete promotions.");
        }
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Promotion> toggleStatus(
            @RequestHeader(value = "X-Staff-Role", required = false) String role,
            @PathVariable String id) {
        if (!isAuthorizedManager(role)) {
            throw new com.apartment.apartmentsalessystembackend.exception.ForbiddenException("Only Sales or Operational Managers can change promotion status.");
        }
        return ResponseEntity.ok(promotionService.toggleStatus(id));
    }

    private boolean isAuthorizedManager(String role) {
        // role header இல்லாதவர்களுக்கு (main branch போல்) access கொடுக்கிறோம்
        if (role == null || role.isEmpty()) {
            return true;
        }
        return "SALES_MANAGER".equals(role) || "OPERATIONAL_MANAGER".equals(role) || "OPERATIONS_DIRECTOR".equals(role);
    }
}
