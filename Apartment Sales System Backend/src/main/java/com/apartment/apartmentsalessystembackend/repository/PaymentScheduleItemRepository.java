package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.PaymentScheduleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentScheduleItemRepository extends JpaRepository<PaymentScheduleItem, Long> {
    List<PaymentScheduleItem> findByScheduleIdOrderByInstallmentNumberAsc(Long scheduleId);
    List<PaymentScheduleItem> findByDueDateBeforeAndStatusNot(LocalDate date, String status);
}
