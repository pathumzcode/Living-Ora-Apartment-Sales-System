package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.PaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentScheduleRepository extends JpaRepository<PaymentSchedule, Long> {
    Optional<PaymentSchedule> findByScheduleId(String scheduleId);
    Optional<PaymentSchedule> findByBookingId(Long bookingId);
    List<PaymentSchedule> findByCustomerUid(Long customerUid);
    List<PaymentSchedule> findByCustomerEmailIgnoreCase(String email);
    List<PaymentSchedule> findByStatus(String status);
}
