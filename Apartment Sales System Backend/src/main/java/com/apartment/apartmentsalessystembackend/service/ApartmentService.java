package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.ApartmentRequest;
import com.apartment.apartmentsalessystembackend.dto.response.ApartmentResponse;
import com.apartment.apartmentsalessystembackend.entity.Apartment;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.mapper.ApartmentMapper;
import com.apartment.apartmentsalessystembackend.repository.ApartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApartmentService {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ApartmentMapper apartmentMapper;

    public List<ApartmentResponse> getAllApartments() {
        return apartmentRepository.findAll().stream()
                .map(apartmentMapper::toResponse)
                .toList();
    }

    public ApartmentResponse getApartmentById(String apartmentId) {
        Apartment entity = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment complex not found: " + apartmentId));
        return apartmentMapper.toResponse(entity);
    }

    public ApartmentResponse createApartment(ApartmentRequest request) {
        Apartment entity = apartmentMapper.toEntity(request);
        entity.setApartmentId("APT-ORA-" + System.currentTimeMillis() % 1000);
        Apartment saved = apartmentRepository.save(entity);
        return apartmentMapper.toResponse(saved);
    }
}
