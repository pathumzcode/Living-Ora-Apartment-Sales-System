package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.PaymentScheduleRequest;
import com.apartment.apartmentsalessystembackend.dto.request.ScheduleGenerateRequest;
import com.apartment.apartmentsalessystembackend.dto.request.ScheduleItemUpdateRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentScheduleItemResponse;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentScheduleResponse;
import com.apartment.apartmentsalessystembackend.dto.response.ScheduleAnalyticsResponse;
import com.apartment.apartmentsalessystembackend.service.PaymentScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class PaymentScheduleController {

    @Autowired
    private PaymentScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<PaymentScheduleResponse>> getAllSchedules(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(scheduleService.getAllSchedules(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentScheduleResponse> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getScheduleById(id));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentScheduleResponse> getScheduleByBooking(@PathVariable Long bookingId) {
        return scheduleService.getScheduleByBookingId(bookingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/customer/{uid}")
    public ResponseEntity<List<PaymentScheduleResponse>> getSchedulesByCustomer(@PathVariable Long uid) {
        return ResponseEntity.ok(scheduleService.getSchedulesByCustomer(uid));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<List<PaymentScheduleResponse>> getSchedulesByEmail(@PathVariable String email) {
        return ResponseEntity.ok(scheduleService.getSchedulesByEmail(email));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ScheduleAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(scheduleService.getAnalytics());
    }

    @PostMapping
    public ResponseEntity<PaymentScheduleResponse> createSchedule(
            @Valid @RequestBody PaymentScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.createSchedule(request));
    }

    @PostMapping("/generate/{bookingId}")
    public ResponseEntity<PaymentScheduleResponse> generateSchedule(
            @PathVariable Long bookingId,
            @RequestBody(required = false) ScheduleGenerateRequest request) {
        return ResponseEntity.ok(scheduleService.generateSchedule(bookingId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @RequestBody PaymentScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, request));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<PaymentScheduleResponse> confirmSchedule(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-Staff-Role", required = false) String staffRole) {
        String effectiveRole = (userRole != null && !userRole.isBlank()) ? userRole : staffRole;
        return ResponseEntity.ok(scheduleService.confirmSchedule(id, effectiveRole));
    }

    @PutMapping("/{scheduleId}/items/{itemId}")
    public ResponseEntity<PaymentScheduleItemResponse> updateScheduleItem(
            @PathVariable Long scheduleId,
            @PathVariable Long itemId,
            @Valid @RequestBody ScheduleItemUpdateRequest request) {
        return ResponseEntity.ok(scheduleService.updateScheduleItem(scheduleId, itemId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-Staff-Role", required = false) String staffRole) {
        String effectiveRole = (userRole != null && !userRole.isBlank()) ? userRole : staffRole;
        scheduleService.deleteSchedule(id, effectiveRole);
        return ResponseEntity.noContent().build();
    }
}
