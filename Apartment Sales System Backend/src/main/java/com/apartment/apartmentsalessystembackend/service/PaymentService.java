package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.response.PaymentResponse;
import com.apartment.apartmentsalessystembackend.entity.Payment;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.mapper.PaymentMapper;
import com.apartment.apartmentsalessystembackend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import com.apartment.apartmentsalessystembackend.repository.InternalUserRepository;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentMapper paymentMapper;

    @Autowired
    private InternalUserRepository internalUserRepository;

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    public PaymentResponse getPaymentById(Long id) {
        Payment entity = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + id));
        return paymentMapper.toResponse(entity);
    }

    public PaymentResponse createPayment(com.apartment.apartmentsalessystembackend.dto.request.PaymentRequest request) {
        Payment payment = new Payment();
        payment.setPaymentId("PAY-" + (int)(Math.random() * 90000 + 10000));
        payment.setBookingId(Long.parseLong(request.getBookingId().replace("BKG-", "")));
        payment.setPaymentAmount(request.getPaymentAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentProof(request.getPaymentProof());
        payment.setDateAndTime(java.time.LocalDateTime.now());
        payment.setNumOfMonthsForPay(36);
        payment.setPendingAmount(BigDecimal.ZERO);
        payment.setStatus("PENDING_VERIFICATION");
        Payment saved = paymentRepository.save(payment);
        return paymentMapper.toResponse(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    public PaymentResponse updateStatus(Long id, String staffEmpId, String status) {
        var staff = internalUserRepository.findById(staffEmpId == null ? "" : staffEmpId)
                .orElseThrow(() -> new BadRequestException("Finance staff access is required"));
        if (!"ADMIN".equalsIgnoreCase(staff.getRole()) && !"FINANCE_PAYMENTS_OFFICER".equalsIgnoreCase(staff.getRole())) {
            throw new BadRequestException("Only Finance & Payments Officer can verify payments");
        }
        if (!List.of("PENDING_VERIFICATION", "VERIFIED", "REJECTED", "FAILED").contains(status)) {
            throw new BadRequestException("Unsupported payment status");
        }
        Payment payment = paymentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + id));
        payment.setStatus(status);
        return paymentMapper.toResponse(paymentRepository.save(payment));
    }
}
