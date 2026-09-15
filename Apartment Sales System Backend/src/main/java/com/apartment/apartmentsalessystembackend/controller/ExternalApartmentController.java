package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.ExternalApartmentRequest;
import com.apartment.apartmentsalessystembackend.entity.ExternalApartment;
import com.apartment.apartmentsalessystembackend.entity.ExternalUser;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.repository.ExternalApartmentRepository;
import com.apartment.apartmentsalessystembackend.repository.ExternalUserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/external-apartments")
public class ExternalApartmentController {

    @Autowired
    private ExternalApartmentRepository externalApartmentRepository;

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @GetMapping
    public ResponseEntity<List<ExternalApartment>> getAllExternalApartments() {
        return ResponseEntity.ok(externalApartmentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ExternalApartment> createExternalApartment(@Valid @RequestBody ExternalApartmentRequest request) {
        ExternalUser seller = externalUserRepository.findByUid(request.getRegisteredByUid().trim())
                .orElseThrow(() -> new BadRequestException("Sales agent account was not found"));
        if (!"SALES_AGENT".equalsIgnoreCase(seller.getRole())) {
            throw new BadRequestException("Only a Sales Agent can register an external apartment");
        }

        ExternalApartment apartment = new ExternalApartment();
        apartment.setExApartmentId("EXT-APT-" + System.currentTimeMillis());
        apartment.setRegisteredByUid(seller.getUid());
        apartment.setLocation(request.getLocation().trim());
        apartment.setAbout(request.getAbout());
        apartment.setNumOfRooms(request.getNumOfRooms());
        apartment.setPrice(request.getPrice());
        apartment.setDownPayment(request.getDownPayment());
        apartment.setImages(request.getImages());
        apartment.setAcOrNonAC(request.getAcOrNonAC());
        apartment.setAdditionalInfo(request.getAdditionalInfo());
        return ResponseEntity.status(201).body(externalApartmentRepository.save(apartment));
    }

    @GetMapping("/agent/{uid}")
    public ResponseEntity<List<ExternalApartment>> getExternalApartmentsByAgent(@PathVariable String uid) {
        return ResponseEntity.ok(externalApartmentRepository.findByRegisteredByUid(uid.trim()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExternalApartment> updateExternalApartment(@PathVariable String id, @Valid @RequestBody ExternalApartmentRequest request) {
        ExternalApartment apartment = externalApartmentRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Resale apartment listing not found: " + id));

        apartment.setLocation(request.getLocation().trim());
        apartment.setAbout(request.getAbout());
        apartment.setNumOfRooms(request.getNumOfRooms());
        apartment.setPrice(request.getPrice());
        apartment.setDownPayment(request.getDownPayment());
        if (request.getImages() != null && !request.getImages().isBlank()) {
            apartment.setImages(request.getImages());
        }
        apartment.setAcOrNonAC(request.getAcOrNonAC());
        apartment.setAdditionalInfo(request.getAdditionalInfo());
        return ResponseEntity.ok(externalApartmentRepository.save(apartment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExternalApartment(@PathVariable String id) {
        if (!externalApartmentRepository.existsById(id)) {
            throw new BadRequestException("Resale apartment listing not found: " + id);
        }
        externalApartmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
