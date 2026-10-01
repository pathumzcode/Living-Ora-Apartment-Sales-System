package com.apartment.apartmentsalessystembackend.dto.request;

import java.math.BigDecimal;

public class PaymentUpdateRequest {
    private BigDecimal paymentAmount;
    private String paymentMethod;
    private String paymentProof;
    private String remarks;
    private String status;

    public PaymentUpdateRequest() {}

    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentProof() { return paymentProof; }
    public void setPaymentProof(String paymentProof) { this.paymentProof = paymentProof; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
