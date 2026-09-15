package com.apartment.apartmentsalessystembackend.mapper;

import com.apartment.apartmentsalessystembackend.dto.request.BookingRequest;
import com.apartment.apartmentsalessystembackend.dto.response.BookingResponse;
import com.apartment.apartmentsalessystembackend.entity.Booking;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking entity) {
        if (entity == null) return null;
        BookingResponse dto = new BookingResponse();
        dto.setId(entity.getId());
        dto.setBookingId(entity.getBookingId());
        dto.setUnitId(entity.getUnitId());
        dto.setBookingDate(entity.getBookingDate());
        dto.setExpireDate(entity.getExpireDate());
        dto.setStatus(entity.getStatus());
        dto.setAdditions(entity.getAdditions());
        // Promotion discount fields
        dto.setPromotionCode(entity.getPromotionCode());
        dto.setDiscountAmount(entity.getDiscountAmount());
        dto.setDiscountedPrice(entity.getDiscountedPrice());
        if (entity.getPayment() != null) {
            dto.setPaymentAmount(entity.getPayment().getPaymentAmount());
            dto.setPaymentProof(entity.getPayment().getPaymentProof());
        }
        return dto;
    }

    public Booking toEntity(BookingRequest dto) {
        if (dto == null) return null;
        Booking entity = new Booking();
        entity.setUnitId(dto.getUnitId());
        entity.setBookingDate(LocalDate.now());
        entity.setExpireDate(LocalDate.now().plusDays(15));
        entity.setStatus("Pending Approval");
        entity.setAdditions(dto.getAdditions());
        entity.setPromotionCode(dto.getPromotionCode());
        return entity;
    }
}
