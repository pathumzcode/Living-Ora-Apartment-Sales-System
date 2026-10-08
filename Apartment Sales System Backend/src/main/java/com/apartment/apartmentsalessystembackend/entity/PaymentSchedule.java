package com.apartment.apartmentsalessystembackend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment_schedule")
public class PaymentSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "schedule_id", nullable = false, unique = true, length = 50)
    private String scheduleId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_code", length = 50)
    private String bookingCode;

    @Column(name = "customer_uid")
    private Long customerUid;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "unit_id", length = 50)
    private String unitId;

    @Column(name = "unit_title", length = 200)
    private String unitTitle;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "total_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPaid = BigDecimal.ZERO;

    @Column(name = "remaining_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingBalance;

    @Column(name = "plan_type", nullable = false, length = 50)
    private String planType; // MILESTONE_CONSTRUCTION, EQUAL_MONTHLY_INSTALLMENT, CUSTOM_PLAN

    @Column(name = "num_of_installments", nullable = false)
    private Integer numOfInstallments;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, OVERDUE, ON_HOLD, CANCELLED

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @OrderBy("installmentNumber ASC")
    private List<PaymentScheduleItem> items = new ArrayList<>();

    public PaymentSchedule() {}

    public void addItem(PaymentScheduleItem item) {
        items.add(item);
        item.setSchedule(this);
    }

    public void removeItem(PaymentScheduleItem item) {
        items.remove(item);
        item.setSchedule(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(String scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public Long getCustomerUid() {
        return customerUid;
    }

    public void setCustomerUid(Long customerUid) {
        this.customerUid = customerUid;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public String getUnitTitle() {
        return unitTitle;
    }

    public void setUnitTitle(String unitTitle) {
        this.unitTitle = unitTitle;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public Integer getNumOfInstallments() {
        return numOfInstallments;
    }

    public void setNumOfInstallments(Integer numOfInstallments) {
        this.numOfInstallments = numOfInstallments;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<PaymentScheduleItem> getItems() {
        return items;
    }

    public void setItems(List<PaymentScheduleItem> items) {
        this.items = items;
    }
}
