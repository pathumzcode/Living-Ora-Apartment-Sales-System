package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.UnitRequest;
import com.apartment.apartmentsalessystembackend.dto.response.UnitResponse;
import com.apartment.apartmentsalessystembackend.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @GetMapping
    public ResponseEntity<List<UnitResponse>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<UnitResponse>> getUnitsByApartmentId(@PathVariable String apartmentId) {
        return ResponseEntity.ok(unitService.getUnitsByApartmentId(apartmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitResponse> getUnitById(@PathVariable String id) {
        return ResponseEntity.ok(unitService.getUnitById(id));
    }

    @PostMapping
    public ResponseEntity<UnitResponse> createUnit(@RequestBody UnitRequest request) {
        return ResponseEntity.ok(unitService.createUnit(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UnitResponse> updateUnitStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(unitService.updateUnitStatus(id, status));
    }
}
