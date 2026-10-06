package com.apartment.apartmentsalessystembackend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class BookingUpdateRequest {
    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;
    @NotNull(message = "Expiry date is required")
    private LocalDate expireDate;
    @Size(max = 45, message = "Additions cannot exceed 45 characters")
    private String additions;

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalDate getExpireDate() { return expireDate; }
    public void setExpireDate(LocalDate expireDate) { this.expireDate = expireDate; }
    public String getAdditions() { return additions; }
    public void setAdditions(String additions) { this.additions = additions; }
}
