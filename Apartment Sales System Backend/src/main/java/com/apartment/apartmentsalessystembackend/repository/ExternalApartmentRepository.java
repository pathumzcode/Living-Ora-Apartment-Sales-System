package com.apartment.apartmentsalessystembackend.repository;

import com.apartment.apartmentsalessystembackend.entity.ExternalApartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExternalApartmentRepository extends JpaRepository<ExternalApartment, String> {
    List<ExternalApartment> findByRegisteredByUid(String registeredByUid);
}
