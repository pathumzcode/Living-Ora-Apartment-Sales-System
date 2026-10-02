package com.apartment.apartmentsalessystembackend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BookingRequest {
    @NotBlank(message = "Unit is required") private String unitId;
    @NotBlank(message = "Customer name is required") private String userName;
    @NotBlank(message = "Customer email is required") @Email(message = "Customer email should be valid") private String userEmail;
    @NotNull(message = "Payment amount is required") @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
    private BigDecimal paymentAmount;
    @NotNull(message = "Down payment is required") @DecimalMin(value = "0.01", message = "Down payment must be greater than zero")
    private BigDecimal downPayment;
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    private String paymentProof;
    private String additions;
    @NotNull(message = "Installment months is required") @Min(value = 1, message = "Installment months must be at least 1") @Max(value = 120, message = "Installment months cannot exceed 120") private Integer months;

    public BookingRequest() {}

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public BigDecimal getDownPayment() {
        return downPayment;
    }

    public void setDownPayment(BigDecimal downPayment) {
        this.downPayment = downPayment;
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

    public String getAdditions() {
        return additions;
    }

    public void setAdditions(String additions) {
        this.additions = additions;
    }

    public Integer getMonths() {
        return months;
    }

    public void setMonths(Integer months) {
        this.months = months;
    }
}
