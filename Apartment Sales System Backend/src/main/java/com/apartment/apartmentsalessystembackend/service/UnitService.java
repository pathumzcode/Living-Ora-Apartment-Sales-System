package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.UnitRequest;
import com.apartment.apartmentsalessystembackend.dto.response.UnitResponse;
import com.apartment.apartmentsalessystembackend.entity.Unit;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.mapper.UnitMapper;
import com.apartment.apartmentsalessystembackend.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Arrays;

@Service
public class UnitService {

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UnitMapper unitMapper;

    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(unitMapper::toResponse)
                .toList();
    }

    public List<UnitResponse> getUnitsByApartmentId(String apartmentId) {
        return unitRepository.findByApartmentId(apartmentId).stream()
                .map(unitMapper::toResponse)
                .toList();
    }

    public UnitResponse getUnitById(String unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + unitId));
        return unitMapper.toResponse(unit);
    }

    public UnitResponse createUnit(UnitRequest request) {
        Unit entity = unitMapper.toEntity(request);
        entity.setUnitId("UNT-" + (int)(Math.random() * 900 + 100) + "-X");
        Unit saved = unitRepository.save(entity);
        return unitMapper.toResponse(saved);
    }

    public UnitResponse updateUnitStatus(String unitId, String status) {
        if (status == null || !Arrays.asList("Available", "Reserved", "Sold").contains(status)) {
            throw new BadRequestException("Unit status must be Available, Reserved, or Sold");
        }
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + unitId));
        unit.setAvailability(status);
        Unit updated = unitRepository.save(unit);
        return unitMapper.toResponse(updated);
    }
}
