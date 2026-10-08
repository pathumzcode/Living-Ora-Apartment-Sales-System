package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, String> {
    List<Unit> findByApartmentId(String apartmentId);
    List<Unit> findByAvailability(String availability);
    List<Unit> findByApartmentIdAndAvailability(String apartmentId, String availability);
}
