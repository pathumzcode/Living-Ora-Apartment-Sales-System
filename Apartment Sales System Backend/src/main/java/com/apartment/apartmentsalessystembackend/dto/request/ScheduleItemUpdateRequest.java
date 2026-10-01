package com.apartment.apartmentsalessystembackend.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ScheduleItemUpdateRequest {
    private String title;
    private LocalDate dueDate;
    private BigDecimal amountDue;
    private String status;
    private String notes;

    public ScheduleItemUpdateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public BigDecimal getAmountDue() { return amountDue; }
    public void setAmountDue(BigDecimal amountDue) { this.amountDue = amountDue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
