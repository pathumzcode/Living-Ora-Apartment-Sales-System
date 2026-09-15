package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {

    Optional<Promotion> findByPromotionCode(String promotionCode);

    List<Promotion> findByStatus(String status);

    List<Promotion> findAllByOrderByStartDateDesc();

    /**
     * Returns promotions whose status=ACTIVE and today falls within [startDate, endDate].
     * Used by the public /active endpoint and the customer-facing promotions page.
     */
    @Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' " +
           "AND :today >= p.startDate AND :today <= p.endDate " +
           "ORDER BY p.startDate DESC")
    List<Promotion> findCurrentlyActive(@Param("today") LocalDate today);

    /**
     * Case-insensitive title search, optionally filtered by status.
     * Pass null for status to search across all statuses.
     */
    @Query("SELECT p FROM Promotion p WHERE " +
           "LOWER(p.promotionTitle) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "ORDER BY p.startDate DESC")
    List<Promotion> searchByTitleAndStatus(@Param("q") String q, @Param("status") String status);

    /**
     * Check if a promotion code already exists for a different promotionId (used in duplicate validation).
     */
    @Query("SELECT COUNT(p) > 0 FROM Promotion p WHERE p.promotionCode = :code AND p.promotionId <> :id")
    boolean existsByPromotionCodeAndPromotionIdNot(@Param("code") String code, @Param("id") String id);

    /**
     * Returns all currently active promotions that apply to a specific apartment,
     * including global promotions (assinedApartment IS NULL = applies to all).
     */
    @Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' " +
           "AND :today >= p.startDate AND :today <= p.endDate " +
           "AND (p.assinedApartment IS NULL OR p.assinedApartment = :apartmentId) " +
           "ORDER BY p.startDate DESC")
    List<Promotion> findActiveForApartment(@Param("apartmentId") String apartmentId,
                                           @Param("today") LocalDate today);
}
