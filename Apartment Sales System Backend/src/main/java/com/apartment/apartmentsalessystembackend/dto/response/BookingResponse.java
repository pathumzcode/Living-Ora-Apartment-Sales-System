package com.apartment.apartmentsalessystembackend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BookingResponse {
    private Long id;
    private String bookingId;
    private String unitId;
    private LocalDate bookingDate;
    private LocalDate expireDate;
    private String status;
    private String additions;
    private BigDecimal paymentAmount;
    private String paymentProof;
    /** Promo code that was applied, if any. */
    private String promotionCode;
    /** Discount amount in dollars applied from the promotion. */
    private BigDecimal discountAmount;
    /** Final discounted price the customer actually pays. */
    private BigDecimal discountedPrice;

    public BookingResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public LocalDate getExpireDate() { return expireDate; }
    public void setExpireDate(LocalDate expireDate) { this.expireDate = expireDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdditions() { return additions; }
    public void setAdditions(String additions) { this.additions = additions; }

    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }

    public String getPaymentProof() { return paymentProof; }
    public void setPaymentProof(String paymentProof) { this.paymentProof = paymentProof; }

    public String getPromotionCode() { return promotionCode; }
    public void setPromotionCode(String promotionCode) { this.promotionCode = promotionCode; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(BigDecimal discountedPrice) { this.discountedPrice = discountedPrice; }
}
