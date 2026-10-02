package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.response.PaymentResponse;
import com.apartment.apartmentsalessystembackend.service.PaymentService;
import com.apartment.apartmentsalessystembackend.dto.request.PaymentStatusRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody com.apartment.apartmentsalessystembackend.dto.request.PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> updateStatus(@PathVariable Long id,
                                                        @RequestHeader("X-Staff-Emp-Id") String staffEmpId,
                                                        @Valid @RequestBody PaymentStatusRequest request) {
        return ResponseEntity.ok(paymentService.updateStatus(id, staffEmpId, request.getStatus()));
    }
}
