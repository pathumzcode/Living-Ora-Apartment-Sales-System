package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

//Mapping between Backend and Database

@Entity
@Table(name = "promotion")
public class Promotion {

    @Id
    @Column(name = "promotionId", length = 50)
    private String promotionId;

    @Column(name = "promotionType", nullable = false, length = 50)
    private String promotionType;

    @Column(name = "promotionTitle", nullable = false, length = 150)
    private String promotionTitle;

    @Lob
    @Column(name = "about", columnDefinition = "LONGTEXT")
    private String about;

    @Lob
    @Column(name = "eligibilityCriteria", columnDefinition = "LONGTEXT")
    private String eligibilityCriteria;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "endDate", nullable = false)
    private LocalDate endDate;

    @Column(name = "buttonText", length = 50)
    private String buttonText;

    @Column(name = "bannerImage", length = 500)
    private String bannerImage;

    @Column(name = "validityPeriod", length = 100)
    private String validityPeriod;

    @Column(name = "discountPrecentage", precision = 5, scale = 2)
    private BigDecimal discountPrecentage;

    /** Stores the apartmentId (e.g. "APT-LO-001") this promotion applies to, or null for all apartments. */
    @Column(name = "assinedApartment", length = 50)
    private String assinedApartment;

    @Lob
    @Column(name = "campaignPerformance", columnDefinition = "LONGTEXT")
    private String campaignPerformance;

    @Column(name = "promotionCode", unique = true, length = 50)
    private String promotionCode;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    public Promotion() {}


    // * Computes Actual display status based on status flag and date range. Returns: ACTIVE, SCHEDULED, EXPIRED, or INACTIVE.

    public String getComputedStatus() {
        if (status != null && (status.equals("INACTIVE") || status.equals("DELETED"))) {
            return status;
        }
        LocalDate today = LocalDate.now();
        if (startDate != null && today.isBefore(startDate)) {
            return "SCHEDULED";
        }
        if (endDate != null && today.isAfter(endDate)) {
            return "EXPIRED";
        }
        return "ACTIVE";
    }


    // Returns true only when status=ACTIVE and today is within the promotion date range.

    public boolean isCurrentlyActive() {
        if (!"ACTIVE".equals(status)) return false;
        LocalDate today = LocalDate.now();
        return startDate != null && endDate != null
                && !today.isBefore(startDate)
                && !today.isAfter(endDate);
    }


    public String getPromotionId() {
        return promotionId;
    }

    public void setPromotionId(String promotionId) {
        this.promotionId = promotionId;
    }

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

    public String getAssinedApartment() {
        return assinedApartment;
    }

    public void setAssinedApartment(String assinedApartment) {
        this.assinedApartment = assinedApartment;
    }

    public String getCampaignPerformance() {
        return campaignPerformance;
    }

    public void setCampaignPerformance(String campaignPerformance) {
        this.campaignPerformance = campaignPerformance;
    }

    public String getPromotionCode() {
        return promotionCode;
    }

    public void setPromotionCode(String promotionCode) {
        this.promotionCode = promotionCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
