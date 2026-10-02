package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

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
    @Column(name = "about")
    private String about;

    @Lob
    @Column(name = "eligibilityCriteria")
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

    @Column(name = "assinedApartment")
    private Integer assinedApartment;

    @Lob
    @Column(name = "campaignPerformance")
    private String campaignPerformance;

    @Column(name = "promotionCode", unique = true, length = 50)
    private String promotionCode;

    public Promotion() {}

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

    public Integer getAssinedApartment() {
        return assinedApartment;
    }

    public void setAssinedApartment(Integer assinedApartment) {
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
}
