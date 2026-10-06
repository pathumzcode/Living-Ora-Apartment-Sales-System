package com.apartment.apartmentsalessystembackend;

import com.apartment.apartmentsalessystembackend.controller.BookingController;
import com.apartment.apartmentsalessystembackend.entity.Booking;
import com.apartment.apartmentsalessystembackend.entity.Payment;
import com.apartment.apartmentsalessystembackend.entity.Unit;
import com.apartment.apartmentsalessystembackend.exception.GlobalExceptionHandler;
import com.apartment.apartmentsalessystembackend.mapper.BookingMapper;
import com.apartment.apartmentsalessystembackend.repository.BookingRepository;
import com.apartment.apartmentsalessystembackend.repository.PaymentRepository;
import com.apartment.apartmentsalessystembackend.repository.UnitRepository;
import com.apartment.apartmentsalessystembackend.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BookingCrudTests {
    private com.apartment.apartmentsalessystembackend.repository.UserVerificationRepository customers;
    private BookingRepository bookings;
    private PaymentRepository payments;
    private UnitRepository units;
    private MockMvc mvc;
    private Booking booking;
    private Unit unit;

    @BeforeEach
    void setup() {
        bookings = mock(BookingRepository.class);
        payments = mock(PaymentRepository.class);
        units = mock(UnitRepository.class);
        BookingService service = new BookingService();
        customers = mock(com.apartment.apartmentsalessystembackend.repository.UserVerificationRepository.class);
        ReflectionTestUtils.setField(service, "userVerificationRepository", customers);
        ReflectionTestUtils.setField(service, "bookingRepository", bookings);
        ReflectionTestUtils.setField(service, "paymentRepository", payments);
        ReflectionTestUtils.setField(service, "unitRepository", units);
        ReflectionTestUtils.setField(service, "bookingMapper", new BookingMapper());
        BookingController controller = new BookingController();
        ReflectionTestUtils.setField(controller, "bookingService", service);
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        booking = new Booking();
        booking.setId(1L);
        booking.setBookingId("BKG-1");
        booking.setUnitId("UNIT-1");
        booking.setStatus("Pending Approval");
        booking.setBookingDate(LocalDate.of(2026, 9, 1));
        booking.setExpireDate(LocalDate.of(2026, 9, 16));
        unit = new Unit();
        unit.setAvailability("Reserved");
        when(bookings.findById(1L)).thenReturn(Optional.of(booking));
        when(bookings.save(any(Booking.class))).thenAnswer(call -> call.getArgument(0));
        when(units.findById("UNIT-1")).thenReturn(Optional.of(unit));
    }

    @Test
    void readsBookingDetails() throws Exception {
        mvc.perform(get("/api/bookings/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value("BKG-1"));
    }

    @Test
    void missingBookingsReturn404ForEveryOperation() throws Exception {
        mvc.perform(get("/api/bookings/99")).andExpect(status().isNotFound());
        mvc.perform(put("/api/bookings/99").contentType(MediaType.APPLICATION_JSON)
                .content(validUpdate())).andExpect(status().isNotFound());
        mvc.perform(delete("/api/bookings/99")).andExpect(status().isNotFound());
    }

    @Test
    void updatesDatesAndAdditionsWithoutChangingIdentityOrPayment() throws Exception {
        Payment payment = new Payment();
        booking.setPayment(payment);
        mvc.perform(put("/api/bookings/1").contentType(MediaType.APPLICATION_JSON)
                .content(validUpdate())).andExpect(status().isOk())
                .andExpect(jsonPath("$.additions").value("Parking"))
                .andExpect(jsonPath("$.expireDate").value("2026-10-01"));
        assertEquals("UNIT-1", booking.getUnitId());
        assertEquals("Pending Approval", booking.getStatus());
        assertSame(payment, booking.getPayment());
        verify(bookings).save(booking);
    }

    @Test
    void rejectsMissingDatesInvalidDateOrderAndOversizedAdditions() throws Exception {
        for (String body : List.of("{}",
                "{\"bookingDate\":\"2026-10-01\",\"expireDate\":\"2026-09-01\"}",
                validUpdate().replace("Parking", "x".repeat(46)))) {
            mvc.perform(put("/api/bookings/1").contentType(MediaType.APPLICATION_JSON)
                    .content(body)).andExpect(status().isBadRequest());
        }
        verify(bookings, never()).save(any());
    }

    @Test
    void deletesBookingAndPaymentsAndReleasesUnit() throws Exception {
        Payment payment = new Payment();
        payment.setStatus("PENDING_VERIFICATION");
        when(payments.findByBookingId(1L)).thenReturn(List.of(payment));
        mvc.perform(delete("/api/bookings/1")).andExpect(status().isNoContent())
                .andExpect(content().string(""));
        assertEquals("Available", unit.getAvailability());
        var order = inOrder(bookings, payments);
        order.verify(bookings).delete(booking);
        order.verify(bookings).flush();
        order.verify(payments).deleteAll(List.of(payment));
    }

    @Test
    void deletionKeepsUnitReservedForAnotherBooking() throws Exception {
        when(bookings.existsByUnitIdAndStatusInAndIdNot(eq("UNIT-1"), anyList(), eq(1L)))
                .thenReturn(true);
        mvc.perform(delete("/api/bookings/1")).andExpect(status().isNoContent());
        assertEquals("Reserved", unit.getAvailability());
        verify(units, never()).save(any());
    }

    @Test
    void deletionNeverReleasesSoldUnit() throws Exception {
        unit.setAvailability("Sold");
        mvc.perform(delete("/api/bookings/1")).andExpect(status().isNoContent());
        assertEquals("Sold", unit.getAvailability());
    }

    @Test
    void approvedBookingsCannotBeEditedOrDeleted() throws Exception {
        booking.setStatus("Approved");
        mvc.perform(put("/api/bookings/1").contentType(MediaType.APPLICATION_JSON)
                .content(validUpdate())).andExpect(status().isBadRequest());
        mvc.perform(delete("/api/bookings/1")).andExpect(status().isBadRequest());
        verify(bookings, never()).delete(any());
        verify(bookings, never()).save(any());
    }

    @Test
    void verifiedPaymentsPreventDeletion() throws Exception {
        Payment payment = new Payment();
        payment.setStatus("VERIFIED");
        when(payments.findByBookingId(1L)).thenReturn(List.of(payment));
        mvc.perform(delete("/api/bookings/1")).andExpect(status().isBadRequest());
        verify(bookings, never()).delete(any());
        verify(payments, never()).deleteAll(anyList());
        assertEquals("Reserved", unit.getAvailability());
    }

    @Test
    void returnsCustomerIdentityAndPaymentDetailsForPortalFiltering() throws Exception {
        booking.setUid(7L);
        var customer = new com.apartment.apartmentsalessystembackend.entity.UserVerification();
        customer.setUid("USR-EXT-7");
        customer.setEmail("client@example.com");
        when(customers.findById(7L)).thenReturn(Optional.of(customer));
        Payment payment = new Payment();
        payment.setDownPayment(new java.math.BigDecimal("25000"));
        payment.setPaymentMethod("Bank Transfer");
        payment.setStatus("PENDING_VERIFICATION");
        booking.setPayment(payment);
        mvc.perform(get("/api/bookings/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.uid").value("USR-EXT-7"))
                .andExpect(jsonPath("$.userEmail").value("client@example.com"))
                .andExpect(jsonPath("$.downPayment").value(25000))
                .andExpect(jsonPath("$.paymentMethod").value("Bank Transfer"))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING_VERIFICATION"));
    }

    private String validUpdate() {
        return "{\"bookingDate\":\"2026-09-01\",\"expireDate\":\"2026-10-01\",\"additions\":\"Parking\"}";
    }
}
