package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "paymentId", nullable = false, unique = true, length = 50)
    private String paymentId;

    @Column(name = "bookingId", nullable = false)
    private Long bookingId;

    @Column(name = "paymentAmount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paymentAmount;

    @Column(name = "pendingAmount", precision = 12, scale = 2)
    private BigDecimal pendingAmount;

    @Column(name = "paymentMethod", length = 30)
    private String paymentMethod;

    @Column(name = "paymentProof", length = 500)
    private String paymentProof;

    @Column(name = "dateAndTime", nullable = false)
    private LocalDateTime dateAndTime;

    @Column(name = "downPayment", precision = 12, scale = 2)
    private BigDecimal downPayment;

    @Column(name = "numOfMonthsForPay")
    private Integer numOfMonthsForPay;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    public Payment() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public BigDecimal getPendingAmount() {
        return pendingAmount;
    }

    public void setPendingAmount(BigDecimal pendingAmount) {
        this.pendingAmount = pendingAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentProof() {
        return paymentProof;
    }

    public void setPaymentProof(String paymentProof) {
        this.paymentProof = paymentProof;
    }

    public LocalDateTime getDateAndTime() {
        return dateAndTime;
    }

    public void setDateAndTime(LocalDateTime dateAndTime) {
        this.dateAndTime = dateAndTime;
    }

    public BigDecimal getDownPayment() {
        return downPayment;
    }

    public void setDownPayment(BigDecimal downPayment) {
        this.downPayment = downPayment;
    }

    public Integer getNumOfMonthsForPay() {
        return numOfMonthsForPay;
    }

    public void setNumOfMonthsForPay(Integer numOfMonthsForPay) {
        this.numOfMonthsForPay = numOfMonthsForPay;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
