package com.apartment.apartmentsalessystembackend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PaymentStatusRequest {
    @NotBlank private String status;
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
