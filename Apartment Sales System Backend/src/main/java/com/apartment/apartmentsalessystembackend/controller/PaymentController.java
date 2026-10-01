package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.PaymentRequest;
import com.apartment.apartmentsalessystembackend.dto.request.PaymentUpdateRequest;
import com.apartment.apartmentsalessystembackend.dto.request.PaymentStatusRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentResponse;
import com.apartment.apartmentsalessystembackend.service.PaymentService;
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

    @GetMapping //Read ALL
    public ResponseEntity<List<PaymentResponse>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) Long scheduleId) {
        return ResponseEntity.ok(paymentService.getAllPayments(status, bookingId, scheduleId));
    }

    @GetMapping("/{id}") //Read ONE
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping //Create
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @PutMapping("/{id}") //Update
    public ResponseEntity<PaymentResponse> updatePayment(@PathVariable Long id, @RequestBody PaymentUpdateRequest request) {
        return ResponseEntity.ok(paymentService.updatePayment(id, request));
    }

    @DeleteMapping("/{id}")  //Delet
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> updateStatus(@PathVariable Long id,
                                                        @RequestHeader(value = "X-Staff-Emp-Id", required = false) String staffEmpId,
                                                        @Valid @RequestBody PaymentStatusRequest request) {
        return ResponseEntity.ok(paymentService.updateStatus(id, staffEmpId, request.getStatus()));
    }
}
