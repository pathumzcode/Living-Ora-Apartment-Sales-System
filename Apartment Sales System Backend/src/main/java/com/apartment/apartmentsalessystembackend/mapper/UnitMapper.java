package com.apartment.apartmentsalessystembackend.mapper;

import com.apartment.apartmentsalessystembackend.dto.request.UnitRequest;
import com.apartment.apartmentsalessystembackend.dto.response.UnitResponse;
import com.apartment.apartmentsalessystembackend.entity.Unit;
import org.springframework.stereotype.Component;

@Component
public class UnitMapper {

    public UnitResponse toResponse(Unit entity) {
        if (entity == null) return null;
        UnitResponse dto = new UnitResponse();
        dto.setUnitId(entity.getUnitId());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setFloor(entity.getFloor());
        dto.setLocation(entity.getLocation());
        dto.setAvailability(entity.getAvailability());
        dto.setFurnitures(entity.getFurnitures());
        dto.setNumOfBathRooms(entity.getNumOfBathRooms());
        dto.setNumOfRooms(entity.getNumOfRooms());
        dto.setNumOfBeds(entity.getNumOfBeds());
        dto.setAcOrNonAC(entity.getAcOrNonAC());
        dto.setRecommendedPerson(entity.getRecommendedPerson());
        dto.setAbout(entity.getAbout());
        dto.setImages(entity.getImages());
        dto.setApartmentId(entity.getApartmentId());
        return dto;
    }

    public Unit toEntity(UnitRequest dto) {
        if (dto == null) return null;
        Unit entity = new Unit();
        entity.setUnitPrice(dto.getUnitPrice());
        entity.setFloor(dto.getFloor());
        entity.setLocation(dto.getLocation());
        entity.setAvailability(dto.getAvailability() != null ? dto.getAvailability() : "Available");
        entity.setFurnitures(dto.getFurnitures());
        entity.setNumOfBathRooms(dto.getNumOfBathRooms());
        entity.setNumOfRooms(dto.getNumOfRooms());
        entity.setNumOfBeds(dto.getNumOfBeds());
        entity.setAcOrNonAC(dto.getAcOrNonAC());
        entity.setRecommendedPerson(dto.getRecommendedPerson());
        entity.setAbout(dto.getAbout());
        entity.setImages(dto.getImages());
        entity.setApartmentId(dto.getApartmentId());
        return entity;
    }
}
