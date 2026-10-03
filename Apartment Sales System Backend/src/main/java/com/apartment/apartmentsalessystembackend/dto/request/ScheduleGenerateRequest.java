package com.apartment.apartmentsalessystembackend.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ScheduleGenerateRequest {
    private String planType; // MILESTONE_CONSTRUCTION, EQUAL_MONTHLY_INSTALLMENT
    private Integer numOfInstallments; // e.g., 5 for milestones, 12/24/36 for monthly
    private BigDecimal downPaymentAmount;
    private LocalDate startDate;
    private String remarks;

    public ScheduleGenerateRequest() {}

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }
    public Integer getNumOfInstallments() { return numOfInstallments; }
    public void setNumOfInstallments(Integer numOfInstallments) { this.numOfInstallments = numOfInstallments; }
    public BigDecimal getDownPaymentAmount() { return downPaymentAmount; }
    public void setDownPaymentAmount(BigDecimal downPaymentAmount) { this.downPaymentAmount = downPaymentAmount; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
