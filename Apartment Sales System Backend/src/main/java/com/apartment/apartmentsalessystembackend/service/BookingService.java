package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.BookingRequest;
import com.apartment.apartmentsalessystembackend.dto.request.BookingUpdateRequest;
import com.apartment.apartmentsalessystembackend.dto.response.BookingResponse;
import com.apartment.apartmentsalessystembackend.entity.Booking;
import com.apartment.apartmentsalessystembackend.entity.Payment;
import com.apartment.apartmentsalessystembackend.entity.Unit;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.mapper.BookingMapper;
import com.apartment.apartmentsalessystembackend.repository.BookingRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentRepository;
import com.apartment.apartmentsalessystembackend.repository.UnitRepository;
import com.apartment.apartmentsalessystembackend.repository.ExternalUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apartment.apartmentsalessystembackend.strategy.booking.BookingStatusStrategy;
import com.apartment.apartmentsalessystembackend.strategy.booking.BookingStatusStrategyRegistry;

import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingStatusStrategyRegistry bookingStatusStrategyRegistry;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @Autowired
    private BookingMapper bookingMapper;

    @Autowired
    private com.apartment.apartmentsalessystembackend.repository.UserVerificationRepository userVerificationRepository;

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = bookingMapper.toResponse(booking);
        if (booking.getUid() != null) {
            userVerificationRepository.findById(booking.getUid()).ifPresent(customer -> {
                response.setUid(customer.getUid());
                response.setUserEmail(customer.getEmail());
            });
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        return toResponse(findBooking(id));
    }

    @Transactional
    public BookingResponse updateBooking(Long id, BookingUpdateRequest request) {
        Booking booking = findBooking(id);
        requireEditable(booking);
        if (request.getBookingDate() == null || request.getExpireDate() == null
                || request.getExpireDate().isBefore(request.getBookingDate())) {
            throw new BadRequestException("Expiry date must be on or after the booking date");
        }
        booking.setBookingDate(request.getBookingDate());
        booking.setExpireDate(request.getExpireDate());
        booking.setAdditions(request.getAdditions());
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = findBooking(id);
        requireEditable(booking);
        List<Payment> payments = paymentRepository.findByBookingId(id);
        if (payments.stream().anyMatch(payment -> "VERIFIED".equalsIgnoreCase(payment.getStatus()))
                || (booking.getPayment() != null
                && "VERIFIED".equalsIgnoreCase(booking.getPayment().getStatus()))) {
            throw new BadRequestException("A booking with verified payments cannot be deleted");
        }
        Unit unit = unitRepository.findById(booking.getUnitId()).orElse(null);
        if (unit != null && "Reserved".equalsIgnoreCase(unit.getAvailability())
                && !bookingRepository.existsByUnitIdAndStatusInAndIdNot(booking.getUnitId(),
                Arrays.asList("Pending Approval", "Approved", "Reserved"), id)) {
            unit.setAvailability("Available");
            unitRepository.save(unit);
        }
        // Remove the booking's payment foreign key before deleting its payment records.
        bookingRepository.delete(booking);
        bookingRepository.flush();
        paymentRepository.deleteAll(payments);
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private void requireEditable(Booking booking) {
        if ("Approved".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("An approved booking cannot be changed from this workflow");
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public BookingResponse createBooking(BookingRequest request) {
        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + request.getUnitId()));
        String availability = unit.getAvailability() == null ? "Available" : unit.getAvailability();
        if (!"Available".equalsIgnoreCase(availability)) {
            throw new BadRequestException("This unit is no longer available for reservation");
        }
        if (bookingRepository.existsByUnitIdAndStatusIn(request.getUnitId(), Arrays.asList("Pending Approval", "Approved", "Reserved"))) {
            throw new BadRequestException("This unit already has an active reservation");
        }
        if (request.getDownPayment().compareTo(request.getPaymentAmount()) > 0) {
            throw new BadRequestException("Down payment cannot exceed the apartment price");
        }
        com.apartment.apartmentsalessystembackend.entity.ExternalUser customer = externalUserRepository.findByEmail(request.getUserEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Customer account was not found"));
        if (!"CUSTOMER".equalsIgnoreCase(customer.getRole())) {
            throw new BadRequestException("Only a Customer can create an apartment reservation");
        }
        Booking booking = bookingMapper.toEntity(request);
        booking.setBookingId("BKG-" + System.currentTimeMillis() % 10000);
        if (customer.getUserVerification() != null) {
            booking.setUid(customer.getUserVerification().getVerificationId());
        }

        Booking savedBooking = bookingRepository.save(booking);

        // Create initial down payment record
        Payment payment = new Payment();
        payment.setPaymentId("PAY-" + (int)(Math.random() * 90000 + 10000));
        payment.setBookingId(savedBooking.getId());
        payment.setPaymentAmount(request.getPaymentAmount());
        payment.setPendingAmount(request.getPaymentAmount().subtract(request.getDownPayment()));
        payment.setDownPayment(request.getDownPayment());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentProof(request.getPaymentProof());
        payment.setDateAndTime(LocalDateTime.now());
        payment.setNumOfMonthsForPay(request.getMonths() != null ? request.getMonths() : 36);
        payment.setStatus("PENDING_VERIFICATION");

        Payment savedPayment = paymentRepository.save(payment);
        savedBooking.setPayment(savedPayment);
        bookingRepository.save(savedBooking);

        // Update unit availability status
        unit.setAvailability("Reserved");
        unitRepository.save(unit);

        return toResponse(savedBooking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, String status) {
        BookingStatusStrategy strategy = bookingStatusStrategyRegistry.resolve(status);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if ("Approved".equalsIgnoreCase(booking.getStatus()) && !"Approved".equalsIgnoreCase(status)) {
            throw new BadRequestException("An approved booking cannot be changed from this workflow");
        }

        booking.setStatus(status);
        strategy.apply(booking);

        Booking updated = bookingRepository.save(booking);
        return toResponse(updated);
    }
}
