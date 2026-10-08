package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.UnitRequest;
import com.apartment.apartmentsalessystembackend.dto.response.UnitResponse;
import com.apartment.apartmentsalessystembackend.entity.Unit;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.mapper.UnitMapper;
import com.apartment.apartmentsalessystembackend.repository.BookingRepository;
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
    private BookingRepository bookingRepository;

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
        entity.setUnitId(generateUnitId());
        Unit saved = unitRepository.save(entity);
        return unitMapper.toResponse(saved);
    }

    /**
     * Full (partial-safe) update: only non-null fields in the request are applied.
     */
    public UnitResponse updateUnit(String unitId, UnitRequest request) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + unitId));

        if (request.getUnitPrice() != null)      unit.setUnitPrice(request.getUnitPrice());
        if (request.getFloor() != null)           unit.setFloor(request.getFloor());
        if (request.getLocation() != null)        unit.setLocation(request.getLocation());
        if (request.getAvailability() != null) {
            if (!Arrays.asList("Available", "Reserved", "Sold").contains(request.getAvailability())) {
                throw new BadRequestException("Unit status must be Available, Reserved, or Sold");
            }
            unit.setAvailability(request.getAvailability());
        }
        if (request.getFurnitures() != null)        unit.setFurnitures(request.getFurnitures());
        if (request.getNumOfBathRooms() != null)    unit.setNumOfBathRooms(request.getNumOfBathRooms());
        if (request.getNumOfRooms() != null)        unit.setNumOfRooms(request.getNumOfRooms());
        if (request.getNumOfBeds() != null)         unit.setNumOfBeds(request.getNumOfBeds());
        if (request.getAcOrNonAC() != null)         unit.setAcOrNonAC(request.getAcOrNonAC());
        if (request.getRecommendedPerson() != null) unit.setRecommendedPerson(request.getRecommendedPerson());
        if (request.getAbout() != null)             unit.setAbout(request.getAbout());
        if (request.getImages() != null)            unit.setImages(request.getImages());
        if (request.getApartmentId() != null)       unit.setApartmentId(request.getApartmentId());

        Unit updated = unitRepository.save(unit);
        return unitMapper.toResponse(updated);
    }

    /**
     * Safe delete: blocks if the unit has Pending Approval or Approved bookings.
     */
    public void deleteUnit(String unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + unitId));

        boolean hasActiveBookings = bookingRepository.existsByUnitIdAndStatusIn(
                unitId,
                Arrays.asList("Pending Approval", "Approved")
        );
        if (hasActiveBookings) {
            throw new BadRequestException(
                    "Cannot delete unit " + unitId + ": it has active or pending bookings. " +
                    "Reject or cancel all bookings for this unit before deleting it."
            );
        }

        unitRepository.delete(unit);
    }

    /**
     * Search / filter: both parameters are optional.
     */
    public List<UnitResponse> searchUnits(String availability, String apartmentId) {
        List<Unit> results;
        boolean hasApt  = apartmentId  != null && !apartmentId.isBlank();
        boolean hasAvail = availability != null && !availability.isBlank();

        if (hasApt && hasAvail) {
            results = unitRepository.findByApartmentIdAndAvailability(apartmentId, availability);
        } else if (hasApt) {
            results = unitRepository.findByApartmentId(apartmentId);
        } else if (hasAvail) {
            results = unitRepository.findByAvailability(availability);
        } else {
            results = unitRepository.findAll();
        }
        return results.stream().map(unitMapper::toResponse).toList();
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

    private String generateUnitId() {
        return "UNT-" + (int)(Math.random() * 9000 + 1000) + "-" + (char)('A' + (int)(Math.random() * 26));
    }
}
