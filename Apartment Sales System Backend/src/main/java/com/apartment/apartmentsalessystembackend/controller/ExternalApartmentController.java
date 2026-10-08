package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.ExternalApartmentRequest;
import com.apartment.apartmentsalessystembackend.entity.ExternalApartment;
import com.apartment.apartmentsalessystembackend.service.AgentListingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/external-apartments")
public class ExternalApartmentController {

    @Autowired
    private AgentListingService agentListingService;

    @GetMapping
    public ResponseEntity<List<ExternalApartment>> getAllExternalApartments() {
        return ResponseEntity.ok(agentListingService.getAll());
    }

    @PostMapping
    public ResponseEntity<ExternalApartment> createExternalApartment(
            @Valid @RequestBody ExternalApartmentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Agent-Uid", required = false) String claimedUid) {
        return ResponseEntity.status(201).body(agentListingService.create(request, authorization, claimedUid));
    }

    @GetMapping("/agent/{uid}")
    public ResponseEntity<List<ExternalApartment>> getExternalApartmentsByAgent(
            @PathVariable String uid,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Agent-Uid", required = false) String claimedUid) {
        return ResponseEntity.ok(agentListingService.getByAgent(uid.trim(), authorization, claimedUid));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExternalApartment> updateExternalApartment(
            @PathVariable String id,
            @Valid @RequestBody ExternalApartmentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Agent-Uid", required = false) String claimedUid) {
        return ResponseEntity.ok(agentListingService.update(id, request, authorization, claimedUid));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExternalApartment(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Agent-Uid", required = false) String claimedUid) {
        agentListingService.delete(id, authorization, claimedUid);
        return ResponseEntity.noContent().build();
    }
}
