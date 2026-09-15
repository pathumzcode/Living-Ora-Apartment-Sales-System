package com.apartment.apartmentsalessystembackend.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PromotionRequest {
    private String promotionType;
    @NotBlank(message = "Promotion title is required") @Size(max = 255) private String promotionTitle;
    private String about;
    private String eligibilityCriteria;
    @NotNull(message = "Promotion start date is required") private LocalDate startDate;
    @NotNull(message = "Promotion end date is required") private LocalDate endDate;
    private String buttonText;
    private String bannerImage;
    private String validityPeriod;
    @NotNull(message = "Discount percentage is required") @DecimalMin(value = "0.00") @DecimalMax(value = "100.00") private BigDecimal discountPrecentage;
    @NotBlank(message = "Promotion code is required") @Size(max = 50) private String promotionCode;
    /** ACTIVE | INACTIVE — defaults to ACTIVE if not provided */
    private String status;
    /** Optional: apartmentId this promotion applies to (e.g. "APT-LO-001"), null = all apartments */
    private String assinedApartment;
    /** Optional: free-text campaign performance notes */
    private String campaignPerformance;


    public PromotionRequest() {}

    public String getPromotionType() {
        return promotionType;
    }

    public void setPromotionType(String promotionType) {
        this.promotionType = promotionType;
    }

    public String getPromotionTitle() {
        return promotionTitle;
    }

    public void setPromotionTitle(String promotionTitle) {
        this.promotionTitle = promotionTitle;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getEligibilityCriteria() {
        return eligibilityCriteria;
    }

    public void setEligibilityCriteria(String eligibilityCriteria) {
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getButtonText() {
        return buttonText;
    }

    public void setButtonText(String buttonText) {
        this.buttonText = buttonText;
    }

    public String getBannerImage() {
        return bannerImage;
    }

    public void setBannerImage(String bannerImage) {
        this.bannerImage = bannerImage;
    }

    public String getValidityPeriod() {
        return validityPeriod;
    }

    public void setValidityPeriod(String validityPeriod) {
        this.validityPeriod = validityPeriod;
    }

    public BigDecimal getDiscountPrecentage() {
        return discountPrecentage;
    }

    public void setDiscountPrecentage(BigDecimal discountPrecentage) {
        this.discountPrecentage = discountPrecentage;
    }

    public String getPromotionCode() {
        return promotionCode;
    }

    public void setPromotionCode(String promotionCode) {
        this.promotionCode = promotionCode;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssinedApartment() { return assinedApartment; }
    public void setAssinedApartment(String assinedApartment) { this.assinedApartment = assinedApartment; }

    public String getCampaignPerformance() { return campaignPerformance; }
    public void setCampaignPerformance(String campaignPerformance) { this.campaignPerformance = campaignPerformance; }
}
