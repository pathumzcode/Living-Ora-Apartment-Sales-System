package com.apartment.apartmentsalessystembackend.mapper;

import com.apartment.apartmentsalessystembackend.dto.request.ApartmentRequest;
import com.apartment.apartmentsalessystembackend.dto.response.ApartmentResponse;
import com.apartment.apartmentsalessystembackend.entity.Apartment;
import org.springframework.stereotype.Component;

@Component
public class ApartmentMapper {

    public ApartmentResponse toResponse(Apartment entity) {
        if (entity == null) return null;
        ApartmentResponse dto = new ApartmentResponse();
        dto.setApartmentId(entity.getApartmentId());
        dto.setNumOfRoom(entity.getNumOfRoom());
        dto.setNumOfFloors(entity.getNumOfFloors());
        dto.setNumOfSwimmingPool(entity.getNumOfSwimmingPool());
        dto.setNumOfGYM(entity.getNumOfGYM());
        dto.setLocation(entity.getLocation());
        dto.setImages(entity.getImages());
        dto.setAbout(entity.getAbout());
        dto.setFloorPlan(entity.getFloorPlan());
        dto.setNumOfUnitsAvailable(entity.getNumOfUnitsAvailable());
        dto.setPriceRange(entity.getPriceRange());
        dto.setUnitStatus(entity.getUnitStatus());
        return dto;
    }

    public Apartment toEntity(ApartmentRequest dto) {
        if (dto == null) return null;
        Apartment entity = new Apartment();
        entity.setNumOfRoom(dto.getNumOfRoom());
        entity.setNumOfFloors(dto.getNumOfFloors());
        entity.setNumOfSwimmingPool(dto.getNumOfSwimmingPool());
        entity.setNumOfGYM(dto.getNumOfGYM());
        entity.setLocation(dto.getLocation());
        entity.setImages(dto.getImages());
        entity.setAbout(dto.getAbout());
        entity.setFloorPlan(dto.getFloorPlan());
        entity.setNumOfUnitsAvailable(dto.getNumOfUnitsAvailable());
        entity.setPriceRange(dto.getPriceRange());
        entity.setUnitStatus(dto.getUnitStatus() != null ? dto.getUnitStatus() : "Available");
        return entity;
    }
}
