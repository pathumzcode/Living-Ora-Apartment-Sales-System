package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentId(String paymentId);
    List<Payment> findByBookingId(Long bookingId);
    List<Payment> findByScheduleId(Long scheduleId);
    List<Payment> findByScheduleItemId(Long scheduleItemId);
    List<Payment> findByStatus(String status);
}
