package com.apartment.apartmentsalessystembackend.mapper;

import com.apartment.apartmentsalessystembackend.dto.request.PromotionRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PromotionResponse;
import com.apartment.apartmentsalessystembackend.entity.Promotion;
import org.springframework.stereotype.Component;

/**
 * Mapper for the Promotion module.
 * Follows the same pattern as ApartmentMapper.
 */
@Component
public class PromotionMapper {

    public PromotionResponse toResponse(Promotion entity) {
        if (entity == null) return null;
        PromotionResponse dto = new PromotionResponse();
        dto.setPromotionId(entity.getPromotionId());
        dto.setPromotionType(entity.getPromotionType());
        dto.setPromotionTitle(entity.getPromotionTitle());
        dto.setAbout(entity.getAbout());
        dto.setEligibilityCriteria(entity.getEligibilityCriteria());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setButtonText(entity.getButtonText());
        dto.setBannerImage(entity.getBannerImage());
        dto.setValidityPeriod(entity.getValidityPeriod());
        dto.setDiscountPrecentage(entity.getDiscountPrecentage());
        dto.setAssinedApartment(entity.getAssinedApartment());
        dto.setCampaignPerformance(entity.getCampaignPerformance());
        dto.setPromotionCode(entity.getPromotionCode());
        dto.setStatus(entity.getStatus());
        // Compute derived status fields from entity helper methods
        dto.setComputedStatus(entity.getComputedStatus());
        dto.setCurrentlyActive(entity.isCurrentlyActive());
        return dto;
    }

    /**
     * Maps a PromotionRequest onto a new Promotion entity.
     * The promotionId is NOT set here — it must be set by the service layer.
     */
    public Promotion toEntity(PromotionRequest dto) {
        if (dto == null) return null;
        Promotion entity = new Promotion();
        entity.setPromotionType(dto.getPromotionType());
        entity.setPromotionTitle(dto.getPromotionTitle());
        entity.setAbout(dto.getAbout());
        entity.setEligibilityCriteria(dto.getEligibilityCriteria());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setButtonText(dto.getButtonText());
        entity.setBannerImage(dto.getBannerImage());
        entity.setValidityPeriod(dto.getValidityPeriod());
        entity.setDiscountPrecentage(dto.getDiscountPrecentage());
        entity.setAssinedApartment(dto.getAssinedApartment());
        entity.setCampaignPerformance(dto.getCampaignPerformance());
        entity.setPromotionCode(dto.getPromotionCode());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        return entity;
    }

    /**
     * Applies updates from a PromotionRequest onto an EXISTING Promotion entity,
     * preserving the promotionId and any fields not in the request.
     */
    public void updateEntity(Promotion entity, PromotionRequest dto) {
        if (dto.getPromotionType() != null) entity.setPromotionType(dto.getPromotionType());
        if (dto.getPromotionTitle() != null) entity.setPromotionTitle(dto.getPromotionTitle());
        if (dto.getAbout() != null) entity.setAbout(dto.getAbout());
        if (dto.getEligibilityCriteria() != null) entity.setEligibilityCriteria(dto.getEligibilityCriteria());
        if (dto.getStartDate() != null) entity.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
        if (dto.getButtonText() != null) entity.setButtonText(dto.getButtonText());
        if (dto.getBannerImage() != null) entity.setBannerImage(dto.getBannerImage());
        if (dto.getValidityPeriod() != null) entity.setValidityPeriod(dto.getValidityPeriod());
        if (dto.getDiscountPrecentage() != null) entity.setDiscountPrecentage(dto.getDiscountPrecentage());
        if (dto.getAssinedApartment() != null) entity.setAssinedApartment(dto.getAssinedApartment());
        if (dto.getCampaignPerformance() != null) entity.setCampaignPerformance(dto.getCampaignPerformance());
        if (dto.getPromotionCode() != null) entity.setPromotionCode(dto.getPromotionCode());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
    }
}
