package com.apartment.apartmentsalessystembackend.mapper;

import com.apartment.apartmentsalessystembackend.dto.request.PaymentScheduleRequest;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentScheduleItemResponse;
import com.apartment.apartmentsalessystembackend.dto.response.PaymentScheduleResponse;
import com.apartment.apartmentsalessystembackend.entity.PaymentSchedule;
import com.apartment.apartmentsalessystembackend.entity.PaymentScheduleItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class PaymentScheduleMapper {

    public PaymentSchedule toEntity(PaymentScheduleRequest request) {
        if (request == null) return null;

        PaymentSchedule schedule = new PaymentSchedule();
        schedule.setScheduleId("SCH-" + (int)(Math.random() * 90000 + 10000));
        schedule.setBookingId(request.getBookingId());
        schedule.setBookingCode(request.getBookingCode());
        schedule.setCustomerUid(request.getCustomerUid());
        schedule.setCustomerName(request.getCustomerName());
        schedule.setCustomerEmail(request.getCustomerEmail());
        schedule.setUnitId(request.getUnitId());
        schedule.setUnitTitle(request.getUnitTitle());
        schedule.setTotalAmount(request.getTotalAmount());
        BigDecimal totalPaid = request.getTotalPaid() != null ? request.getTotalPaid() : BigDecimal.ZERO;
        schedule.setTotalPaid(totalPaid);
        BigDecimal remBalance = request.getRemainingBalance() != null ? request.getRemainingBalance() : request.getTotalAmount().subtract(totalPaid);
        schedule.setRemainingBalance(remBalance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remBalance);
        schedule.setPlanType(request.getPlanType() != null ? request.getPlanType() : "MILESTONE_CONSTRUCTION");
        schedule.setNumOfInstallments(request.getNumOfInstallments() != null ? request.getNumOfInstallments() : 5);
        schedule.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "PENDING");
        schedule.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        schedule.setRemarks(request.getRemarks());
        schedule.setCreatedAt(LocalDateTime.now());

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (PaymentScheduleRequest.ScheduleItemRequest itemReq : request.getItems()) {
                PaymentScheduleItem item = new PaymentScheduleItem();
                item.setInstallmentNumber(itemReq.getInstallmentNumber());
                item.setTitle(itemReq.getTitle());
                item.setDueDate(itemReq.getDueDate());
                item.setAmountDue(itemReq.getAmountDue());
                item.setAmountPaid(BigDecimal.ZERO);
                item.setStatus("PENDING");
                item.setNotes(itemReq.getNotes());
                schedule.addItem(item);
            }
        }
        return schedule;
    }

    public PaymentScheduleResponse toResponse(PaymentSchedule entity) {
        if (entity == null) return null;

        PaymentScheduleResponse res = new PaymentScheduleResponse();
        res.setId(entity.getId());
        res.setScheduleId(entity.getScheduleId());
        res.setBookingId(entity.getBookingId());
        res.setBookingCode(entity.getBookingCode());
        res.setCustomerUid(entity.getCustomerUid());
        res.setCustomerName(entity.getCustomerName());
        res.setCustomerEmail(entity.getCustomerEmail());
        res.setUnitId(entity.getUnitId());
        res.setUnitTitle(entity.getUnitTitle());
        res.setTotalAmount(entity.getTotalAmount());
        res.setTotalPaid(entity.getTotalPaid() != null ? entity.getTotalPaid() : BigDecimal.ZERO);
        res.setRemainingBalance(entity.getRemainingBalance());
        res.setPlanType(entity.getPlanType());
        res.setNumOfInstallments(entity.getNumOfInstallments());
        res.setStatus(entity.getStatus());
        res.setStartDate(entity.getStartDate());
        res.setEndDate(entity.getEndDate());
        res.setRemarks(entity.getRemarks());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());

        // Calculate progress percentage
        if (entity.getTotalAmount() != null && entity.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal totalPaid = entity.getTotalPaid() != null ? entity.getTotalPaid() : BigDecimal.ZERO;
            double pct = totalPaid.divide(entity.getTotalAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            res.setProgressPercentage(Math.min(100.0, Math.round(pct * 100.0) / 100.0));
        } else {
            res.setProgressPercentage(0.0);
        }

        List<PaymentScheduleItemResponse> itemResponses = new ArrayList<>();
        if (entity.getItems() != null) {
            LocalDate today = LocalDate.now();
            for (PaymentScheduleItem item : entity.getItems()) {
                PaymentScheduleItemResponse itemRes = toItemResponse(item, today);
                itemResponses.add(itemRes);
            }
        }
        res.setItems(itemResponses);
        return res;
    }

    public PaymentScheduleItemResponse toItemResponse(PaymentScheduleItem item, LocalDate today) {
        if (item == null) return null;

        PaymentScheduleItemResponse itemRes = new PaymentScheduleItemResponse();
        itemRes.setId(item.getId());
        itemRes.setScheduleId(item.getSchedule() != null ? item.getSchedule().getId() : null);
        itemRes.setInstallmentNumber(item.getInstallmentNumber());
        itemRes.setTitle(item.getTitle());
        itemRes.setDueDate(item.getDueDate());
        itemRes.setAmountDue(item.getAmountDue());
        itemRes.setAmountPaid(item.getAmountPaid() != null ? item.getAmountPaid() : BigDecimal.ZERO);
        BigDecimal rem = item.getAmountDue().subtract(itemRes.getAmountPaid());
        itemRes.setRemainingAmount(rem.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : rem);
        itemRes.setStatus(item.getStatus());
        itemRes.setPaidDate(item.getPaidDate());
        itemRes.setPaymentReference(item.getPaymentReference());
        itemRes.setNotes(item.getNotes());

        boolean isOverdue = !"PAID".equalsIgnoreCase(item.getStatus()) && item.getDueDate() != null && item.getDueDate().isBefore(today);
        itemRes.setOverdue(isOverdue);
        return itemRes;
    }
}
