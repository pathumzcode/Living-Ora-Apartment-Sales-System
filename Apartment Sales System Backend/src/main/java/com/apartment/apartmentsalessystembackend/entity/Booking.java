package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "booking")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "bookingId", nullable = false, unique = true, length = 50)
    private String bookingId;

    @Column(name = "uid")
    private Long uid;

    @Column(name = "unitId", nullable = false)
    private String unitId;

    @Column(name = "bookingDate", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "expireDate", nullable = false)
    private LocalDate expireDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "additions", length = 45)
    private String additions;

    /** Promo code applied at booking time, if any. */
    @Column(name = "promotionCode", length = 50)
    private String promotionCode;

    /** Discount amount in dollars calculated from the promotion. */
    @Column(name = "discountAmount", precision = 12, scale = 2)
    private java.math.BigDecimal discountAmount;

    /** Final price after promotion discount (paymentAmount - discountAmount). */
    @Column(name = "discountedPrice", precision = 12, scale = 2)
    private java.math.BigDecimal discountedPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    public Booking() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUid() {
        return uid;
    }

    public void setUid(Long uid) {
        this.uid = uid;
    }

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalDate getExpireDate() {
        return expireDate;
    }

    public void setExpireDate(LocalDate expireDate) {
        this.expireDate = expireDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdditions() {
        return additions;
    }

    public void setAdditions(String additions) {
        this.additions = additions;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public String getPromotionCode() { return promotionCode; }
    public void setPromotionCode(String promotionCode) { this.promotionCode = promotionCode; }

    public java.math.BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(java.math.BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public java.math.BigDecimal getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(java.math.BigDecimal discountedPrice) { this.discountedPrice = discountedPrice; }
}


