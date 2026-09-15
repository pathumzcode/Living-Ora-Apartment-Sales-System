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

    /**
     * GET /api/units
     * Optional query params: availability, apartmentId
     * Examples:
     *   /api/units                           → all units
     *   /api/units?availability=Available    → filter by status
     *   /api/units?apartmentId=APT-LO-001   → filter by apartment
     *   /api/units?availability=Available&apartmentId=APT-LO-001
     */
    @GetMapping
    public ResponseEntity<List<UnitResponse>> getUnits(
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) String apartmentId) {

        if (availability != null || apartmentId != null) {
            return ResponseEntity.ok(unitService.searchUnits(availability, apartmentId));
        }
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

    /**
     * PUT /api/units/{id}
     * Full/partial update of an existing inventory unit.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UnitResponse> updateUnit(
            @PathVariable String id,
            @RequestBody UnitRequest request) {
        return ResponseEntity.ok(unitService.updateUnit(id, request));
    }

    /**
     * DELETE /api/units/{id}
     * Blocked if unit has active (Pending Approval or Approved) bookings.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable String id) {
        unitService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UnitResponse> updateUnitStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(unitService.updateUnitStatus(id, status));
    }
}
