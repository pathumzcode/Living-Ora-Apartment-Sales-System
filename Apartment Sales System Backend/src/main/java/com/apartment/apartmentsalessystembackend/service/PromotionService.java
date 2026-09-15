package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.PromotionRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PromotionResponse;
import com.apartment.apartmentsalessystembackend.entity.Promotion;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.mapper.PromotionMapper;
import com.apartment.apartmentsalessystembackend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Full CRUD service for Promotion & Special Offer Management.
 *
 * Business rules enforced:
 * - Promotion title must not be blank.
 * - Discount must be between 0.00 and 100.00 (percentage).
 * - Start date must not be after end date.
 * - Promotion code must be unique across the system.
 * - Soft-delete is used (status = 'DELETED') to preserve FK references
 *   from InternalUser.promotion_promotionId.
 */
@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PromotionMapper promotionMapper;

    // ── Read Operations ──────────────────────────────────────────────────────────

    /** Returns all promotions ordered by startDate DESC, as response DTOs. */
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAllByOrderByStartDateDesc()
                .stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns only promotions that are status=ACTIVE and whose date range
     * contains today. Used by the public customer-facing page.
     */
    public List<PromotionResponse> getActivePromotions() {
        return promotionRepository.findCurrentlyActive(LocalDate.now())
                .stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /** Returns a single promotion by ID or throws ResourceNotFoundException. */
    public PromotionResponse getPromotionById(String promotionId) {
        Promotion entity = findOrThrow(promotionId);
        return promotionMapper.toResponse(entity);
    }

    /** Returns a promotion by its unique promotion code. */
    public PromotionResponse getPromotionByCode(String code) {
        Promotion entity = promotionRepository.findByPromotionCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with code: " + code));
        return promotionMapper.toResponse(entity);
    }

    /**
     * Searches promotions by title (case-insensitive) and optional status filter.
     * @param q      Partial title to search (empty string returns all matching status)
     * @param status Optional status filter: ACTIVE, INACTIVE, SCHEDULED, EXPIRED, or null/empty for all
     */
    public List<PromotionResponse> searchPromotions(String q, String status) {
        String queryStr = (q == null) ? "" : q.trim();
        String statusFilter = (status == null || status.isBlank()) ? null : status.trim();
        // When status is SCHEDULED or EXPIRED, filter by computed status client-side
        // because those states are date-derived and not stored as a status value.
        List<Promotion> results = promotionRepository.searchByTitleAndStatus(queryStr, statusFilter);
        return results.stream()
                .map(promotionMapper::toResponse)
                .filter(r -> statusFilter == null || filterByComputedStatus(r, statusFilter))
                .collect(Collectors.toList());
    }

    // ── Write Operations ─────────────────────────────────────────────────────────

    /** Creates a new promotion with full validation. */
    public PromotionResponse createPromotion(PromotionRequest request) {
        validateRequest(request, null);

        Promotion entity = promotionMapper.toEntity(request);
        // Generate unique ID: PROMO- + truncated millis for readability
        entity.setPromotionId("PROMO-" + System.currentTimeMillis() % 100000);
        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    /** Updates an existing promotion. Only changed fields need be supplied. */
    public PromotionResponse updatePromotion(String promotionId, PromotionRequest request) {
        Promotion entity = findOrThrow(promotionId);
        validateRequest(request, promotionId);

        promotionMapper.updateEntity(entity, request);
        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    /**
     * Soft-deletes a promotion by setting its status to 'DELETED'.
     * This preserves the FK reference from InternalUser safely.
     * The promotion is excluded from all public and management listings.
     */
    public void deletePromotion(String promotionId) {
        Promotion entity = findOrThrow(promotionId);
        entity.setStatus("DELETED");
        promotionRepository.save(entity);
    }

    /**
     * Toggles a promotion between ACTIVE and INACTIVE.
     * Promotions in DELETED or EXPIRED state cannot be toggled.
     */
    public PromotionResponse togglePromotionStatus(String promotionId) {
        Promotion entity = findOrThrow(promotionId);
        if ("DELETED".equals(entity.getStatus())) {
            throw new BadRequestException("Cannot activate a deleted promotion.");
        }
        String newStatus = "ACTIVE".equals(entity.getStatus()) ? "INACTIVE" : "ACTIVE";
        entity.setStatus(newStatus);
        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    /**
     * Returns currently active promotions applicable to a specific apartment.
     * Includes global promotions (assinedApartment = null) AND apartment-specific ones.
     */
    public List<PromotionResponse> getActivePromotionsForApartment(String apartmentId) {
        return promotionRepository.findActiveForApartment(apartmentId, LocalDate.now())
                .stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Validates a promo code against a specific apartment and returns the promotion details.
     * Used by the frontend before submitting a booking to show the discount preview.
     *
     * @param code        The promotion code to validate (case-insensitive).
     * @param apartmentId The apartment the booking is for (pass null/empty to skip apartment check).
     * @return The promotion response with discount details.
     * @throws BadRequestException if code is invalid, expired, or not applicable.
     */
    public PromotionResponse validatePromoCode(String code, String apartmentId) {
        Promotion promo = promotionRepository.findByPromotionCode(code.trim().toUpperCase())
                .orElseThrow(() -> new BadRequestException("Promotion code '" + code + "' is not valid."));

        if (!promo.isCurrentlyActive()) {
            throw new BadRequestException("Promotion code '" + code + "' is not currently active or has expired.");
        }

        // Check apartment restriction
        if (promo.getAssinedApartment() != null && !promo.getAssinedApartment().isBlank()
                && apartmentId != null && !apartmentId.isBlank()) {
            if (!promo.getAssinedApartment().equalsIgnoreCase(apartmentId)) {
                throw new BadRequestException(
                        "Promotion code '" + code + "' is not applicable to this apartment.");
            }
        }

        return promotionMapper.toResponse(promo);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private Promotion findOrThrow(String promotionId) {
        return promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + promotionId));
    }

    /**
     * Central validation for create and update operations.
     * @param request      The incoming request.
     * @param promotionId  The ID of the promotion being updated (null for create).
     */
    private void validateRequest(PromotionRequest request, String promotionId) {
        // Date validation
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Promotion end date cannot be before start date.");
        }

        // Discount validation
        if (request.getDiscountPrecentage() != null) {
            BigDecimal d = request.getDiscountPrecentage();
            if (d.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Discount percentage cannot be negative.");
            }
            if (d.compareTo(new BigDecimal("100.00")) > 0) {
                throw new BadRequestException("Discount percentage cannot exceed 100.");
            }
        }

        // Unique promotion code check
        if (request.getPromotionCode() != null) {
            String id = (promotionId != null) ? promotionId : "";
            boolean duplicate = promotionRepository
                    .existsByPromotionCodeAndPromotionIdNot(request.getPromotionCode(), id);
            if (duplicate) {
                throw new BadRequestException(
                        "Promotion code '" + request.getPromotionCode() + "' already exists.");
            }
        }
    }

    /**
     * Filters a PromotionResponse by its computed status.
     * Allows filtering by SCHEDULED or EXPIRED even though they are not persisted status values.
     */
    private boolean filterByComputedStatus(PromotionResponse r, String statusFilter) {
        return statusFilter.equalsIgnoreCase(r.getComputedStatus());
    }
}
