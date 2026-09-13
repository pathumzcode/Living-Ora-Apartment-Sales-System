package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.ExternalApartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExternalApartmentRepository extends JpaRepository<ExternalApartment, String> {
}
