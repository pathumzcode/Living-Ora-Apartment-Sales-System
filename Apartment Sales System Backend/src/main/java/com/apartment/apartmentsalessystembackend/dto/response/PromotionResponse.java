package com.apartment.apartmentsalessystembackend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

// Response DTO for Promotion. Includes all entity fields plus the
//computed status string (ACTIVE / SCHEDULED / EXPIRED / INACTIVE).

public class PromotionResponse {

    private String promotionId;
    private String promotionType;
    private String promotionTitle;
    private String about;
    private String eligibilityCriteria;
    private LocalDate startDate;
    private LocalDate endDate;
    private String buttonText;
    private String bannerImage;
    private String validityPeriod;
    private BigDecimal discountPrecentage;
    /** The apartmentId (e.g. "APT-LO-001") this promotion is assigned to, or null for all apartments. */
    private String assinedApartment;
    private String campaignPerformance;
    private String promotionCode;
    private String status;
    /** Computed status: ACTIVE / SCHEDULED / EXPIRED / INACTIVE */
    private String computedStatus;
    private boolean currentlyActive;

    public PromotionResponse() {}

    public String getPromotionId() { return promotionId; }
    public void setPromotionId(String promotionId) { this.promotionId = promotionId; }

    public String getPromotionType() { return promotionType; }
    public void setPromotionType(String promotionType) { this.promotionType = promotionType; }

    public String getPromotionTitle() { return promotionTitle; }
    public void setPromotionTitle(String promotionTitle) { this.promotionTitle = promotionTitle; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getButtonText() { return buttonText; }
    public void setButtonText(String buttonText) { this.buttonText = buttonText; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getValidityPeriod() { return validityPeriod; }
    public void setValidityPeriod(String validityPeriod) { this.validityPeriod = validityPeriod; }

    public BigDecimal getDiscountPrecentage() { return discountPrecentage; }
    public void setDiscountPrecentage(BigDecimal discountPrecentage) { this.discountPrecentage = discountPrecentage; }

    public String getAssinedApartment() { return assinedApartment; }
    public void setAssinedApartment(String assinedApartment) { this.assinedApartment = assinedApartment; }

    public String getCampaignPerformance() { return campaignPerformance; }
    public void setCampaignPerformance(String campaignPerformance) { this.campaignPerformance = campaignPerformance; }

    public String getPromotionCode() { return promotionCode; }
    public void setPromotionCode(String promotionCode) { this.promotionCode = promotionCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getComputedStatus() { return computedStatus; }
    public void setComputedStatus(String computedStatus) { this.computedStatus = computedStatus; }

    public boolean isCurrentlyActive() { return currentlyActive; }
    public void setCurrentlyActive(boolean currentlyActive) { this.currentlyActive = currentlyActive; }
}
