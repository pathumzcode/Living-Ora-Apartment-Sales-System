package com.apartment.apartmentsalessystembackend.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PaymentScheduleRequest {
    private Long bookingId;
    private String bookingCode;
    private Long customerUid;
    private String customerName;
    private String customerEmail;
    private String unitId;
    private String unitTitle;
    private BigDecimal totalAmount;
    private BigDecimal totalPaid;
    private BigDecimal remainingBalance;
    private String planType; // MILESTONE_CONSTRUCTION, EQUAL_MONTHLY_INSTALLMENT, CUSTOM_PLAN
    private Integer numOfInstallments;
    private LocalDate startDate;
    private String status;
    private String remarks;
    private List<ScheduleItemRequest> items;

    public static class ScheduleItemRequest {
        private Integer installmentNumber;
        private String title;
        private LocalDate dueDate;
        private BigDecimal amountDue;
        private String notes;

        public ScheduleItemRequest() {}

        public Integer getInstallmentNumber() { return installmentNumber; }
        public void setInstallmentNumber(Integer installmentNumber) { this.installmentNumber = installmentNumber; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public BigDecimal getAmountDue() { return amountDue; }
        public void setAmountDue(BigDecimal amountDue) { this.amountDue = amountDue; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public PaymentScheduleRequest() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
    public Long getCustomerUid() { return customerUid; }
    public void setCustomerUid(Long customerUid) { this.customerUid = customerUid; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }
    public String getUnitTitle() { return unitTitle; }
    public void setUnitTitle(String unitTitle) { this.unitTitle = unitTitle; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; }
    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }
    public Integer getNumOfInstallments() { return numOfInstallments; }
    public void setNumOfInstallments(Integer numOfInstallments) { this.numOfInstallments = numOfInstallments; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public List<ScheduleItemRequest> getItems() { return items; }
    public void setItems(List<ScheduleItemRequest> items) { this.items = items; }
}
