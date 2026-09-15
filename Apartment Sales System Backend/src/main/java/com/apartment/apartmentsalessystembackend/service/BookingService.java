package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.BookingRequest;
import com.apartment.apartmentsalessystembackend.dto.response.BookingResponse;
import com.apartment.apartmentsalessystembackend.entity.Booking;
import com.apartment.apartmentsalessystembackend.entity.Payment;
import com.apartment.apartmentsalessystembackend.entity.Promotion;
import com.apartment.apartmentsalessystembackend.entity.Unit;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.mapper.BookingMapper;
import com.apartment.apartmentsalessystembackend.repository.BookingRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentRepository;
import com.apartment.apartmentsalessystembackend.repository.PromotionRepository;
import com.apartment.apartmentsalessystembackend.repository.UnitRepository;
import com.apartment.apartmentsalessystembackend.repository.ExternalUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private UnitRepository unitRepository;
    @Autowired private ExternalUserRepository externalUserRepository;
    @Autowired private PromotionRepository promotionRepository;
    @Autowired private BookingMapper bookingMapper;

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public BookingResponse createBooking(BookingRequest request) {
        // 1. Validate unit
        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + request.getUnitId()));
        String availability = unit.getAvailability() == null ? "Available" : unit.getAvailability();
        if (!"Available".equalsIgnoreCase(availability)) {
            throw new BadRequestException("This unit is no longer available for reservation");
        }
        if (bookingRepository.existsByUnitIdAndStatusIn(request.getUnitId(),
                Arrays.asList("Pending Approval", "Approved", "Reserved"))) {
            throw new BadRequestException("This unit already has an active reservation");
        }
        if (request.getDownPayment().compareTo(request.getPaymentAmount()) > 0) {
            throw new BadRequestException("Down payment cannot exceed the apartment price");
        }

        // 2. Validate customer
        com.apartment.apartmentsalessystembackend.entity.ExternalUser customer =
                externalUserRepository.findByEmail(request.getUserEmail().trim().toLowerCase())
                        .orElseThrow(() -> new BadRequestException("Customer account was not found"));
        if (!"CUSTOMER".equalsIgnoreCase(customer.getRole())) {
            throw new BadRequestException("Only a Customer can create an apartment reservation");
        }

        // 3. Resolve and apply promotion code (if provided)
        BigDecimal originalPrice = request.getPaymentAmount();
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal discountedPrice = originalPrice;
        String appliedCode = null;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            String code = request.getPromotionCode().trim().toUpperCase();
            Promotion promo = promotionRepository.findByPromotionCode(code)
                    .orElseThrow(() -> new BadRequestException(
                            "Promotion code '" + code + "' is not valid."));

            // Validate promotion is currently active
            if (!promo.isCurrentlyActive()) {
                throw new BadRequestException(
                        "Promotion code '" + code + "' is not currently active or has expired.");
            }

            // Validate promotion applies to this unit's apartment (if restricted)
            if (promo.getAssinedApartment() != null && !promo.getAssinedApartment().isBlank()) {
                String unitApartmentId = unit.getApartmentId();
                if (!promo.getAssinedApartment().equalsIgnoreCase(unitApartmentId)) {
                    throw new BadRequestException(
                            "Promotion code '" + code + "' is not applicable to this apartment.");
                }
            }

            // Calculate discount
            if (promo.getDiscountPrecentage() != null
                    && promo.getDiscountPrecentage().compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = originalPrice
                        .multiply(promo.getDiscountPrecentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                discountedPrice = originalPrice.subtract(discountAmount);
                if (discountedPrice.compareTo(BigDecimal.ZERO) < 0) {
                    discountedPrice = BigDecimal.ZERO;
                }
            }
            appliedCode = code;
        }

        // 4. Create booking
        Booking booking = bookingMapper.toEntity(request);
        booking.setBookingId("BKG-" + System.currentTimeMillis() % 10000);
        if (customer.getUserVerification() != null) {
            booking.setUid(customer.getUserVerification().getVerificationId());
        }
        // Persist promotion discount
        booking.setPromotionCode(appliedCode);
        booking.setDiscountAmount(discountAmount.compareTo(BigDecimal.ZERO) > 0 ? discountAmount : null);
        booking.setDiscountedPrice(appliedCode != null ? discountedPrice : null);

        Booking savedBooking = bookingRepository.save(booking);

        // 5. Create initial down-payment record (uses discounted price if promotion applied)
        BigDecimal effectivePrice = appliedCode != null ? discountedPrice : originalPrice;

        Payment payment = new Payment();
        payment.setPaymentId("PAY-" + (int)(Math.random() * 90000 + 10000));
        payment.setBookingId(savedBooking.getId());
        payment.setPaymentAmount(effectivePrice);
        payment.setPendingAmount(effectivePrice.subtract(request.getDownPayment()));
        payment.setDownPayment(request.getDownPayment());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentProof(request.getPaymentProof());
        payment.setDateAndTime(LocalDateTime.now());
        payment.setNumOfMonthsForPay(request.getMonths() != null ? request.getMonths() : 36);
        payment.setStatus("PENDING_VERIFICATION");

        Payment savedPayment = paymentRepository.save(payment);
        savedBooking.setPayment(savedPayment);
        bookingRepository.save(savedBooking);

        // 6. Mark unit reserved
        unit.setAvailability("Reserved");
        unitRepository.save(unit);

        return bookingMapper.toResponse(savedBooking);
    }

    @org.springframework.transaction.annotation.Transactional
    public BookingResponse updateBookingStatus(Long id, String status) {
        if (status == null || !Arrays.asList("Pending Approval", "Approved", "Rejected", "Cancelled", "Expired").contains(status)) {
            throw new BadRequestException("Unsupported booking status");
        }
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if ("Approved".equalsIgnoreCase(booking.getStatus()) && !"Approved".equalsIgnoreCase(status)) {
            throw new BadRequestException("An approved booking cannot be changed from this workflow");
        }
        booking.setStatus(status);

        if ("Approved".equalsIgnoreCase(status)) {
            Unit unit = unitRepository.findById(booking.getUnitId()).orElse(null);
            if (unit != null) { unit.setAvailability("Sold"); unitRepository.save(unit); }
        } else if ("Rejected".equalsIgnoreCase(status) || "Cancelled".equalsIgnoreCase(status) || "Expired".equalsIgnoreCase(status)) {
            Unit unit = unitRepository.findById(booking.getUnitId()).orElse(null);
            if (unit != null) { unit.setAvailability("Available"); unitRepository.save(unit); }
        }

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }
}
