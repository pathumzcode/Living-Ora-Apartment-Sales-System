package com.apartment.apartmentsalessystembackend.mapper;

import com.apartment.apartmentsalessystembackend.dto.response.PaymentResponse;
import com.apartment.apartmentsalessystembackend.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment entity) {
        if (entity == null) return null;
        PaymentResponse dto = new PaymentResponse();
        dto.setId(entity.getId());
        dto.setPaymentId(entity.getPaymentId());
        dto.setBookingId(entity.getBookingId());
        dto.setPaymentAmount(entity.getPaymentAmount());
        dto.setPendingAmount(entity.getPendingAmount());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setPaymentProof(entity.getPaymentProof());
        dto.setDateAndTime(entity.getDateAndTime());
        dto.setDownPayment(entity.getDownPayment());
        dto.setNumOfMonthsForPay(entity.getNumOfMonthsForPay());
        dto.setStatus(entity.getStatus());
        return dto;
    }
}
