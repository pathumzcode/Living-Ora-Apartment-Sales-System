package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.PaymentRequest;
import com.apartment.apartmentsalessystembackend.dto.request.PaymentUpdateRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentResponse;
import com.apartment.apartmentsalessystembackend.entity.Payment;
import com.apartment.apartmentsalessystembackend.entity.PaymentSchedule;
import com.apartment.apartmentsalessystembackend.entity.PaymentScheduleItem;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.mapper.PaymentMapper;
import com.apartment.apartmentsalessystembackend.repository.InternalUserRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentScheduleItemRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentScheduleRepository scheduleRepository;

    @Autowired
    private PaymentScheduleItemRepository itemRepository;

    @Autowired
    private PaymentScheduleService scheduleService;

    @Autowired
    private PaymentMapper paymentMapper;

    @Autowired
    private InternalUserRepository internalUserRepository;

    public List<PaymentResponse> getAllPayments() {
        return getAllPayments(null, null, null);
    }

    public List<PaymentResponse> getAllPayments(String status, Long bookingId, Long scheduleId) {
        List<Payment> list;
        if (bookingId != null) {
            list = paymentRepository.findByBookingId(bookingId);
        } else if (scheduleId != null) {
            list = paymentRepository.findByScheduleId(scheduleId);
        } else if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = paymentRepository.findByStatus(status.toUpperCase());
        } else {
            list = paymentRepository.findAll();
        }

        return list.stream()
                .map(this::enrichAndMapResponse)
                .toList();
    }

    public PaymentResponse getPaymentById(Long id) {
        Payment entity = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + id));
        return enrichAndMapResponse(entity);
    }

    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        if (request.getPaymentAmount() == null || request.getPaymentAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        Payment payment = new Payment();
        payment.setPaymentId("PAY-" + (int)(Math.random() * 90000 + 10000));

        Long bookingId = 1L;
        if (request.getBookingId() != null && !request.getBookingId().isBlank()) {
            try {
                payment.setBookingId(Long.parseLong(request.getBookingId().replace("BKG-", "")));
                bookingId = payment.getBookingId();
            } catch (NumberFormatException e) {
                payment.setBookingId(1L);
            }
        } else {
            payment.setBookingId(1L);
        }

        payment.setPaymentAmount(request.getPaymentAmount());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Bank Transfer");
        payment.setPaymentProof(request.getPaymentProof() != null ? request.getPaymentProof() : "receipt_payment.pdf");
        payment.setDateAndTime(LocalDateTime.now());
        payment.setNumOfMonthsForPay(36);
        payment.setPendingAmount(BigDecimal.ZERO);
        payment.setStatus("PENDING_VERIFICATION");
        payment.setRemarks(request.getRemarks());

        // Link with schedule and schedule item if provided
        if (request.getScheduleId() != null) {
            payment.setScheduleId(request.getScheduleId());
        } else if (bookingId != null) {
            scheduleRepository.findByBookingId(bookingId).ifPresent(s -> payment.setScheduleId(s.getId()));
        }

        if (request.getScheduleItemId() != null) {
            payment.setScheduleItemId(request.getScheduleItemId());
            itemRepository.findById(request.getScheduleItemId()).ifPresent(item -> {
                if (payment.getScheduleId() == null && item.getSchedule() != null) {
                    payment.setScheduleId(item.getSchedule().getId());
                }
            });
        }

        Payment saved = paymentRepository.save(payment);

        // Update schedule item and totals if schedule is linked
        reconcileScheduleForPayment(saved, true);

        return enrichAndMapResponse(saved);
    }

    @Transactional
    public PaymentResponse updatePayment(Long id, PaymentUpdateRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + id));

        // Revert old payment amount from schedule before updating
        reconcileScheduleForPayment(payment, false);

        if (request.getPaymentAmount() != null && request.getPaymentAmount().compareTo(BigDecimal.ZERO) > 0) {
            payment.setPaymentAmount(request.getPaymentAmount());
        }
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getPaymentProof() != null && !request.getPaymentProof().isBlank()) {
            payment.setPaymentProof(request.getPaymentProof());
        }
        if (request.getRemarks() != null) {
            payment.setRemarks(request.getRemarks());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            payment.setStatus(request.getStatus().toUpperCase());
        }

        Payment updated = paymentRepository.save(payment);

        // Apply updated payment amount to schedule
        reconcileScheduleForPayment(updated, true);

        return enrichAndMapResponse(updated);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + id));

        // Roll back payment effect on schedule and schedule item
        reconcileScheduleForPayment(payment, false);

        paymentRepository.delete(payment);
    }

    @Transactional
    public PaymentResponse updateStatus(Long id, String staffEmpId, String status) {
        var staff = internalUserRepository.findById(staffEmpId == null ? "" : staffEmpId)
                .orElseThrow(() -> new BadRequestException("Finance staff access is required"));
        if (!"ADMIN".equalsIgnoreCase(staff.getRole()) && !"FINANCE_PAYMENTS_OFFICER".equalsIgnoreCase(staff.getRole())) {
            throw new BadRequestException("Only Finance & Payments Officer can verify payments");
        }
        if (!List.of("PENDING_VERIFICATION", "VERIFIED", "REJECTED", "FAILED").contains(status.toUpperCase())) {
            throw new BadRequestException("Unsupported payment status: " + status);
        }

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + id));

        String oldStatus = payment.getStatus();
        payment.setStatus(status.toUpperCase());
        payment.setVerifiedBy(staff.getEmpId());
        payment.setVerifiedAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // If newly verified, apply to schedule; if rejected/failed, revert from schedule
        if ("VERIFIED".equalsIgnoreCase(saved.getStatus()) && !"VERIFIED".equalsIgnoreCase(oldStatus)) {
            reconcileScheduleForPayment(saved, true);
        } else if (("REJECTED".equalsIgnoreCase(saved.getStatus()) || "FAILED".equalsIgnoreCase(saved.getStatus()))
                && "VERIFIED".equalsIgnoreCase(oldStatus)) {
            reconcileScheduleForPayment(saved, false);
        }

        return enrichAndMapResponse(saved);
    }

    private void reconcileScheduleForPayment(Payment payment, boolean apply) {
        if (payment.getScheduleItemId() != null) {
            itemRepository.findById(payment.getScheduleItemId()).ifPresent(item -> {
                BigDecimal currentPaid = item.getAmountPaid() != null ? item.getAmountPaid() : BigDecimal.ZERO;
                BigDecimal delta = payment.getPaymentAmount() != null ? payment.getPaymentAmount() : BigDecimal.ZERO;

                if (apply) {
                    BigDecimal newPaid = currentPaid.add(delta);
                    item.setAmountPaid(newPaid);
                    if (newPaid.compareTo(item.getAmountDue()) >= 0) {
                        item.setStatus("PAID");
                    } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
                        item.setStatus("PARTIALLY_PAID");
                    }
                    item.setPaidDate(LocalDate.now());
                    item.setPaymentReference(payment.getPaymentId());
                } else {
                    BigDecimal newPaid = currentPaid.subtract(delta);
                    if (newPaid.compareTo(BigDecimal.ZERO) < 0) newPaid = BigDecimal.ZERO;
                    item.setAmountPaid(newPaid);
                    if (newPaid.compareTo(BigDecimal.ZERO) == 0) {
                        item.setStatus("PENDING");
                        item.setPaidDate(null);
                        item.setPaymentReference(null);
                    } else if (newPaid.compareTo(item.getAmountDue()) < 0) {
                        item.setStatus("PARTIALLY_PAID");
                    }
                }
                itemRepository.save(item);

                if (item.getSchedule() != null) {
                    scheduleService.recalculateScheduleTotals(item.getSchedule());
                    scheduleRepository.save(item.getSchedule());
                }
            });
        } else if (payment.getScheduleId() != null) {
            scheduleRepository.findById(payment.getScheduleId()).ifPresent(schedule -> {
                scheduleService.recalculateScheduleTotals(schedule);
                scheduleRepository.save(schedule);
            });
        }
    }

    private PaymentResponse enrichAndMapResponse(Payment entity) {
        PaymentResponse res = paymentMapper.toResponse(entity);
        if (entity.getScheduleId() != null) {
            scheduleRepository.findById(entity.getScheduleId()).ifPresent(s -> res.setScheduleCode(s.getScheduleId()));
        }
        if (entity.getScheduleItemId() != null) {
            itemRepository.findById(entity.getScheduleItemId()).ifPresent(i -> res.setMilestoneTitle(i.getTitle()));
        }
        return res;
    }
}
