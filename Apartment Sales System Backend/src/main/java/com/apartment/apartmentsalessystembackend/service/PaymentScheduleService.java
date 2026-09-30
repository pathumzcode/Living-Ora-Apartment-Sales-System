package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.PaymentScheduleRequest;
import com.apartment.apartmentsalessystembackend.dto.request.ScheduleGenerateRequest;
import com.apartment.apartmentsalessystembackend.dto.request.ScheduleItemUpdateRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentScheduleItemResponse;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentScheduleResponse;
import com.apartment.apartmentsalessystembackend.dto.response.ScheduleAnalyticsResponse;
import com.apartment.apartmentsalessystembackend.entity.Booking;
import com.apartment.apartmentsalessystembackend.entity.Payment;
import com.apartment.apartmentsalessystembackend.entity.PaymentSchedule;
import com.apartment.apartmentsalessystembackend.entity.PaymentScheduleItem;
import com.apartment.apartmentsalessystembackend.entity.Unit;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.exception.ForbiddenException;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.mapper.PaymentScheduleMapper;
import com.apartment.apartmentsalessystembackend.repository.BookingRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentScheduleItemRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentScheduleRepository;
import com.apartment.apartmentsalessystembackend.repository.UnitRepository;
import com.apartment.apartmentsalessystembackend.repository.ExternalUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class PaymentScheduleService {

    @Autowired
    private PaymentScheduleRepository scheduleRepository;

    @Autowired
    private PaymentScheduleItemRepository itemRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentScheduleMapper scheduleMapper;

    public List<PaymentScheduleResponse> getAllSchedules(String status) {
        List<PaymentSchedule> schedules;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            schedules = scheduleRepository.findByStatus(status.toUpperCase());
        } else {
            schedules = scheduleRepository.findAll();
        }

        // Auto-refresh overdue status for items
        LocalDate today = LocalDate.now();
        for (PaymentSchedule s : schedules) {
            updateScheduleStatusIfOverdue(s, today);
        }

        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .toList();
    }

    public PaymentScheduleResponse getScheduleById(Long id) {
        PaymentSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment schedule not found with ID: " + id));
        updateScheduleStatusIfOverdue(schedule, LocalDate.now());
        return scheduleMapper.toResponse(schedule);
    }

    public Optional<PaymentScheduleResponse> getScheduleByBookingId(Long bookingId) {
        return scheduleRepository.findByBookingId(bookingId)
                .map(s -> {
                    updateScheduleStatusIfOverdue(s, LocalDate.now());
                    return scheduleMapper.toResponse(s);
                });
    }

    public List<PaymentScheduleResponse> getSchedulesByCustomer(Long customerUid) {
        return scheduleRepository.findByCustomerUid(customerUid).stream()
                .map(scheduleMapper::toResponse)
                .toList();
    }

    public List<PaymentScheduleResponse> getSchedulesByEmail(String email) {
        return scheduleRepository.findByCustomerEmailIgnoreCase(email).stream()
                .map(scheduleMapper::toResponse)
                .toList();
    }

    public void verifyFinancialOfficerRole(String userRole) {
        if (userRole == null || userRole.isBlank()) {
            throw new ForbiddenException("Authorization role is required for Financial Officer operations");
        }
        String normalized = userRole.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        if (!"FINANCE_PAYMENTS_OFFICER".equals(normalized) 
                && !"FINANCIAL_OFFICER".equals(normalized) 
                && !"FINANCE_OFFICER".equals(normalized) 
                && !"ADMIN".equals(normalized)) {
            throw new ForbiddenException("Access denied: Only a Financial Officer can confirm or delete payment schedules");
        }
    }

    @Transactional
    public PaymentScheduleResponse createSchedule(PaymentScheduleRequest request) {
        if (request.getTotalAmount() == null || request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Total schedule amount must be greater than zero");
        }
        if (request.getTotalPaid() != null && request.getTotalPaid().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Paid amount cannot be negative");
        }
        if (request.getTotalPaid() != null && request.getTotalPaid().compareTo(request.getTotalAmount()) > 0) {
            throw new BadRequestException("Paid amount cannot exceed total amount");
        }

        // Validate apartment/unit if provided
        if (request.getUnitId() != null && !request.getUnitId().isBlank()) {
            Unit unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new BadRequestException("Apartment unit not found: " + request.getUnitId()));
            if (request.getUnitTitle() == null || request.getUnitTitle().isBlank()) {
                request.setUnitTitle(unit.getLocation() != null ? unit.getLocation() : "Unit " + unit.getUnitId());
            }
        }

        PaymentSchedule schedule = scheduleMapper.toEntity(request);
        if (schedule.getStatus() == null || schedule.getStatus().isBlank()) {
            schedule.setStatus("PENDING");
        }
        recalculateScheduleTotals(schedule);
        PaymentSchedule saved = scheduleRepository.save(schedule);
        return scheduleMapper.toResponse(saved);
    }

    @Transactional
    public PaymentScheduleResponse generateSchedule(Long bookingId, ScheduleGenerateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Check if schedule already exists for this booking
        Optional<PaymentSchedule> existing = scheduleRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            return scheduleMapper.toResponse(existing.get());
        }

        Unit unit = unitRepository.findById(booking.getUnitId()).orElse(null);
        String unitTitle = unit != null ? unit.getLocation() : "Unit " + booking.getUnitId();
        BigDecimal totalAmount = (unit != null && unit.getUnitPrice() != null) ? unit.getUnitPrice() : BigDecimal.valueOf(350000);

        String customerName = "Client User";
        String customerEmail = "customer@livingora.lk";
        if (booking.getUid() != null) {
            String uidStr = String.valueOf(booking.getUid());
            var extUser = externalUserRepository.findById(uidStr)
                    .or(() -> externalUserRepository.findByUid(uidStr))
                    .orElse(null);
            if (extUser != null) {
                customerName = extUser.getFirstName() + " " + extUser.getLastName();
                customerEmail = extUser.getEmail();
            }
        }

        String planType = (request != null && request.getPlanType() != null) ? request.getPlanType() : "MILESTONE_CONSTRUCTION";
        LocalDate startDate = (request != null && request.getStartDate() != null) ? request.getStartDate() : booking.getBookingDate();
        if (startDate == null) startDate = LocalDate.now();

        PaymentSchedule schedule = new PaymentSchedule();
        schedule.setScheduleId("SCH-" + (int)(Math.random() * 90000 + 10000));
        schedule.setBookingId(booking.getId());
        schedule.setBookingCode(booking.getBookingId());
        schedule.setCustomerUid(booking.getUid());
        schedule.setCustomerName(customerName);
        schedule.setCustomerEmail(customerEmail);
        schedule.setUnitId(booking.getUnitId());
        schedule.setUnitTitle(unitTitle);
        schedule.setTotalAmount(totalAmount);
        schedule.setPlanType(planType);
        schedule.setStatus("PENDING");
        schedule.setStartDate(startDate);
        schedule.setRemarks(request != null ? request.getRemarks() : "Standard sales payment schedule");
        schedule.setCreatedAt(LocalDateTime.now());

        BigDecimal downPayment = BigDecimal.ZERO;
        Payment existingBookingPayment = booking.getPayment();
        if (existingBookingPayment != null && existingBookingPayment.getDownPayment() != null) {
            downPayment = existingBookingPayment.getDownPayment();
        } else if (request != null && request.getDownPaymentAmount() != null) {
            downPayment = request.getDownPaymentAmount();
        } else {
            downPayment = totalAmount.multiply(BigDecimal.valueOf(0.20)).setScale(2, RoundingMode.HALF_UP);
        }

        if ("EQUAL_MONTHLY_INSTALLMENT".equalsIgnoreCase(planType)) {
            int months = (request != null && request.getNumOfInstallments() != null) ? request.getNumOfInstallments() : 24;
            schedule.setNumOfInstallments(months + 1);

            // Item 1: Down Payment
            PaymentScheduleItem item1 = new PaymentScheduleItem();
            item1.setInstallmentNumber(1);
            item1.setTitle("Initial Down Payment");
            item1.setDueDate(startDate);
            item1.setAmountDue(downPayment);
            if (existingBookingPayment != null && "VERIFIED".equalsIgnoreCase(existingBookingPayment.getStatus())) {
                item1.setAmountPaid(downPayment);
                item1.setStatus("PAID");
                item1.setPaidDate(startDate);
                item1.setPaymentReference(existingBookingPayment.getPaymentId());
            } else {
                item1.setAmountPaid(BigDecimal.ZERO);
                item1.setStatus("PENDING");
            }
            schedule.addItem(item1);

            // Remaining installments
            BigDecimal rem = totalAmount.subtract(downPayment);
            BigDecimal monthlyAmt = rem.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
            BigDecimal runningSum = downPayment;

            for (int i = 1; i <= months; i++) {
                PaymentScheduleItem item = new PaymentScheduleItem();
                item.setInstallmentNumber(i + 1);
                item.setTitle("Monthly Installment " + i + " of " + months);
                item.setDueDate(startDate.plusMonths(i));
                BigDecimal due = (i == months) ? totalAmount.subtract(runningSum) : monthlyAmt;
                item.setAmountDue(due);
                item.setAmountPaid(BigDecimal.ZERO);
                item.setStatus("PENDING");
                runningSum = runningSum.add(due);
                schedule.addItem(item);
            }
            schedule.setEndDate(startDate.plusMonths(months));
        } else {
            // Milestone Construction Plan (5 key stages)
            schedule.setNumOfInstallments(5);
            String[] titles = {
                    "Milestone 1: Reservation & Down Payment (20%)",
                    "Milestone 2: Foundation & Substructure Slab (20%)",
                    "Milestone 3: Structural Framing & Roof Slab (20%)",
                    "Milestone 4: Architectural Finishes & MEP Services (20%)",
                    "Milestone 5: Final Inspection & Key Handover (20%)"
            };
            int[] monthOffsets = {0, 3, 6, 9, 12};
            BigDecimal milestoneAmt = totalAmount.divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
            BigDecimal runningTotal = BigDecimal.ZERO;

            for (int i = 0; i < 5; i++) {
                PaymentScheduleItem item = new PaymentScheduleItem();
                item.setInstallmentNumber(i + 1);
                item.setTitle(titles[i]);
                item.setDueDate(startDate.plusMonths(monthOffsets[i]));
                BigDecimal due = (i == 4) ? totalAmount.subtract(runningTotal) : milestoneAmt;
                item.setAmountDue(due);

                if (i == 0 && existingBookingPayment != null && "VERIFIED".equalsIgnoreCase(existingBookingPayment.getStatus())) {
                    item.setAmountPaid(due);
                    item.setStatus("PAID");
                    item.setPaidDate(startDate);
                    item.setPaymentReference(existingBookingPayment.getPaymentId());
                } else {
                    item.setAmountPaid(BigDecimal.ZERO);
                    item.setStatus("PENDING");
                }

                runningTotal = runningTotal.add(due);
                schedule.addItem(item);
            }
            schedule.setEndDate(startDate.plusMonths(12));
        }

        recalculateScheduleTotals(schedule);
        PaymentSchedule saved = scheduleRepository.save(schedule);

        // Link existing payment to schedule if exists
        if (existingBookingPayment != null) {
            existingBookingPayment.setScheduleId(saved.getId());
            if (!saved.getItems().isEmpty()) {
                existingBookingPayment.setScheduleItemId(saved.getItems().get(0).getId());
            }
            paymentRepository.save(existingBookingPayment);
        }

        return scheduleMapper.toResponse(saved);
    }

    @Transactional
    public PaymentScheduleResponse updateSchedule(Long id, PaymentScheduleRequest request) {
        PaymentSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment schedule not found: " + id));

        // Update Customer details if specified
        if (request.getCustomerUid() != null) {
            String uidStr = String.valueOf(request.getCustomerUid());
            var extUser = externalUserRepository.findById(uidStr)
                    .or(() -> externalUserRepository.findByUid(uidStr))
                    .orElse(null);
            schedule.setCustomerUid(request.getCustomerUid());
            if (extUser != null) {
                schedule.setCustomerName(extUser.getFirstName() + " " + extUser.getLastName());
                schedule.setCustomerEmail(extUser.getEmail());
            } else {
                if (request.getCustomerName() != null && !request.getCustomerName().isBlank()) {
                    schedule.setCustomerName(request.getCustomerName());
                }
                if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
                    schedule.setCustomerEmail(request.getCustomerEmail());
                }
            }
        } else {
            if (request.getCustomerName() != null && !request.getCustomerName().isBlank()) {
                schedule.setCustomerName(request.getCustomerName());
            }
            if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
                schedule.setCustomerEmail(request.getCustomerEmail());
            }
        }

        // Update Apartment / Unit details if specified
        if (request.getUnitId() != null && !request.getUnitId().isBlank()) {
            Unit unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new BadRequestException("Apartment unit not found: " + request.getUnitId()));
            schedule.setUnitId(unit.getUnitId());
            schedule.setUnitTitle(request.getUnitTitle() != null && !request.getUnitTitle().isBlank() ? request.getUnitTitle() : unit.getLocation());
        } else if (request.getUnitTitle() != null && !request.getUnitTitle().isBlank()) {
            schedule.setUnitTitle(request.getUnitTitle());
        }

        // Update Amounts with validation
        if (request.getTotalAmount() != null) {
            if (request.getTotalAmount().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Total schedule amount cannot be negative");
            }
            schedule.setTotalAmount(request.getTotalAmount());
        }

        if (request.getTotalPaid() != null) {
            if (request.getTotalPaid().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Total paid amount cannot be negative");
            }
            if (schedule.getTotalAmount() != null && request.getTotalPaid().compareTo(schedule.getTotalAmount()) > 0) {
                throw new BadRequestException("Total paid amount cannot exceed total schedule amount");
            }
            schedule.setTotalPaid(request.getTotalPaid());
        }

        if (schedule.getTotalAmount() != null && schedule.getTotalPaid() != null) {
            BigDecimal rem = schedule.getTotalAmount().subtract(schedule.getTotalPaid());
            schedule.setRemainingBalance(rem.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : rem);
        }

        if (request.getPlanType() != null && !request.getPlanType().isBlank()) {
            schedule.setPlanType(request.getPlanType());
        }
        if (request.getNumOfInstallments() != null && request.getNumOfInstallments() > 0) {
            schedule.setNumOfInstallments(request.getNumOfInstallments());
        }
        if (request.getStartDate() != null) {
            schedule.setStartDate(request.getStartDate());
        }
        if (request.getRemarks() != null) {
            schedule.setRemarks(request.getRemarks());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            schedule.setStatus(request.getStatus().toUpperCase(Locale.ROOT));
        }

        // Update Items if provided in request
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            schedule.getItems().clear();
            for (PaymentScheduleRequest.ScheduleItemRequest itemReq : request.getItems()) {
                if (itemReq.getAmountDue() != null && itemReq.getAmountDue().compareTo(BigDecimal.ZERO) < 0) {
                    throw new BadRequestException("Installment amount due cannot be negative");
                }
                PaymentScheduleItem item = new PaymentScheduleItem();
                item.setInstallmentNumber(itemReq.getInstallmentNumber());
                item.setTitle(itemReq.getTitle());
                item.setDueDate(itemReq.getDueDate());
                item.setAmountDue(itemReq.getAmountDue() != null ? itemReq.getAmountDue() : BigDecimal.ZERO);
                item.setAmountPaid(BigDecimal.ZERO);
                item.setStatus("PENDING");
                item.setNotes(itemReq.getNotes());
                schedule.addItem(item);
            }
        }

        schedule.setUpdatedAt(LocalDateTime.now());
        recalculateScheduleTotals(schedule);
        PaymentSchedule updated = scheduleRepository.save(schedule);
        return scheduleMapper.toResponse(updated);
    }

    @Transactional
    public PaymentScheduleResponse confirmSchedule(Long id, String userRole) {
        verifyFinancialOfficerRole(userRole);
        PaymentSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment schedule not found: " + id));

        schedule.setStatus("CONFIRMED");
        schedule.setUpdatedAt(LocalDateTime.now());
        PaymentSchedule confirmed = scheduleRepository.save(schedule);
        return scheduleMapper.toResponse(confirmed);
    }

    @Transactional
    public PaymentScheduleItemResponse updateScheduleItem(Long scheduleId, Long itemId, ScheduleItemUpdateRequest request) {
        PaymentSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment schedule not found: " + scheduleId));

        PaymentScheduleItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + itemId));

        if (!item.getSchedule().getId().equals(schedule.getId())) {
            throw new BadRequestException("Milestone item does not belong to the given schedule");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            item.setTitle(request.getTitle());
        }
        if (request.getDueDate() != null) {
            item.setDueDate(request.getDueDate());
        }
        if (request.getAmountDue() != null && request.getAmountDue().compareTo(BigDecimal.ZERO) > 0) {
            item.setAmountDue(request.getAmountDue());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            item.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            item.setNotes(request.getNotes());
        }

        PaymentScheduleItem savedItem = itemRepository.save(item);
        recalculateScheduleTotals(schedule);
        scheduleRepository.save(schedule);

        return scheduleMapper.toItemResponse(savedItem, LocalDate.now());
    }

    @Transactional
    public void deleteSchedule(Long id, String userRole) {
        verifyFinancialOfficerRole(userRole);
        PaymentSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment schedule not found: " + id));

        // Unlink payments referencing this schedule
        List<Payment> linkedPayments = paymentRepository.findByScheduleId(id);
        for (Payment p : linkedPayments) {
            p.setScheduleId(null);
            p.setScheduleItemId(null);
            paymentRepository.save(p);
        }

        scheduleRepository.delete(schedule);
    }

    public ScheduleAnalyticsResponse getAnalytics() {
        List<PaymentSchedule> all = scheduleRepository.findAll();
        LocalDate today = LocalDate.now();

        BigDecimal totalPortfolio = BigDecimal.ZERO;
        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal totalOutstanding = BigDecimal.ZERO;
        long activeCount = 0;
        long completedCount = 0;
        long overdueCount = 0;
        BigDecimal overdueAmt = BigDecimal.ZERO;
        long upcoming30Days = 0;

        for (PaymentSchedule s : all) {
            if (s.getTotalAmount() != null) totalPortfolio = totalPortfolio.add(s.getTotalAmount());
            if (s.getTotalPaid() != null) totalCollected = totalCollected.add(s.getTotalPaid());
            if (s.getRemainingBalance() != null) totalOutstanding = totalOutstanding.add(s.getRemainingBalance());

            if ("COMPLETED".equalsIgnoreCase(s.getStatus())) {
                completedCount++;
            } else if (!"CANCELLED".equalsIgnoreCase(s.getStatus())) {
                activeCount++;
            }

            if (s.getItems() != null) {
                for (PaymentScheduleItem item : s.getItems()) {
                    if (!"PAID".equalsIgnoreCase(item.getStatus())) {
                        if (item.getDueDate() != null && item.getDueDate().isBefore(today)) {
                            overdueCount++;
                            BigDecimal itemRem = item.getAmountDue().subtract(item.getAmountPaid() != null ? item.getAmountPaid() : BigDecimal.ZERO);
                            if (itemRem.compareTo(BigDecimal.ZERO) > 0) {
                                overdueAmt = overdueAmt.add(itemRem);
                            }
                        } else if (item.getDueDate() != null && !item.getDueDate().isAfter(today.plusDays(30))) {
                            upcoming30Days++;
                        }
                    }
                }
            }
        }

        Double collectionRate = 0.0;
        if (totalPortfolio.compareTo(BigDecimal.ZERO) > 0) {
            collectionRate = totalCollected.divide(totalPortfolio, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            collectionRate = Math.round(collectionRate * 100.0) / 100.0;
        }

        ScheduleAnalyticsResponse res = new ScheduleAnalyticsResponse();
        res.setTotalPortfolioValue(totalPortfolio);
        res.setTotalAmountCollected(totalCollected);
        res.setTotalOutstandingBalance(totalOutstanding);
        res.setActiveSchedulesCount(activeCount);
        res.setCompletedSchedulesCount(completedCount);
        res.setOverdueMilestonesCount(overdueCount);
        res.setOverdueAmount(overdueAmt);
        res.setUpcomingMilestonesIn30Days(upcoming30Days);
        res.setCollectionRatePercentage(collectionRate);
        return res;
    }

    public void recalculateScheduleTotals(PaymentSchedule schedule) {
        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean hasOverdue = false;
        boolean allPaid = true;
        LocalDate today = LocalDate.now();

        if (schedule.getItems() != null && !schedule.getItems().isEmpty()) {
            for (PaymentScheduleItem item : schedule.getItems()) {
                totalAmount = totalAmount.add(item.getAmountDue() != null ? item.getAmountDue() : BigDecimal.ZERO);
                BigDecimal paid = item.getAmountPaid() != null ? item.getAmountPaid() : BigDecimal.ZERO;
                totalPaid = totalPaid.add(paid);

                if (!"PAID".equalsIgnoreCase(item.getStatus())) {
                    allPaid = false;
                    if (item.getDueDate() != null && item.getDueDate().isBefore(today)) {
                        hasOverdue = true;
                    }
                }
            }
            schedule.setTotalAmount(totalAmount);
        } else {
            totalAmount = schedule.getTotalAmount() != null ? schedule.getTotalAmount() : BigDecimal.ZERO;
        }

        schedule.setTotalPaid(totalPaid);
        BigDecimal rem = totalAmount.subtract(totalPaid);
        schedule.setRemainingBalance(rem.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : rem);

        if (allPaid && totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            schedule.setStatus("COMPLETED");
        } else if (hasOverdue) {
            schedule.setStatus("OVERDUE");
        } else if (!"CANCELLED".equalsIgnoreCase(schedule.getStatus()) && !"ON_HOLD".equalsIgnoreCase(schedule.getStatus())) {
            schedule.setStatus("ACTIVE");
        }
    }

    private void updateScheduleStatusIfOverdue(PaymentSchedule schedule, LocalDate today) {
        boolean hasOverdue = false;
        if (schedule.getItems() != null) {
            for (PaymentScheduleItem item : schedule.getItems()) {
                if (!"PAID".equalsIgnoreCase(item.getStatus()) && item.getDueDate() != null && item.getDueDate().isBefore(today)) {
                    hasOverdue = true;
                    if (!"OVERDUE".equalsIgnoreCase(item.getStatus()) && !"PARTIALLY_PAID".equalsIgnoreCase(item.getStatus())) {
                        item.setStatus("OVERDUE");
                    }
                }
            }
        }
        if (hasOverdue && "ACTIVE".equalsIgnoreCase(schedule.getStatus())) {
            schedule.setStatus("OVERDUE");
        }
    }
}
