package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.ExternalApartmentRequest;
import com.apartment.apartmentsalessystembackend.entity.ExternalApartment;
import com.apartment.apartmentsalessystembackend.entity.ExternalUser;
import com.apartment.apartmentsalessystembackend.exception.AgentListingForbiddenException;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import com.apartment.apartmentsalessystembackend.repository.ExternalApartmentRepository;
import com.apartment.apartmentsalessystembackend.repository.ExternalUserRepository;
import com.apartment.apartmentsalessystembackend.util.AgentListingRules;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AgentListingService {
    private final ExternalApartmentRepository externalApartmentRepository;
    private final ExternalUserRepository externalUserRepository;

    public AgentListingService(ExternalApartmentRepository externalApartmentRepository,
                              ExternalUserRepository externalUserRepository) {
        this.externalApartmentRepository = externalApartmentRepository;
        this.externalUserRepository = externalUserRepository;
    }

    @Transactional(readOnly = true)
    public List<ExternalApartment> getAll() {
        return externalApartmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ExternalApartment> getByAgent(String uid, String authorization, String claimedUid) {
        ExternalUser agent = resolveAgent(authorization);
        AgentListingRules.assertAgentUid(agent.getUid(), uid);
        AgentListingRules.assertAgentUid(agent.getUid(), claimedUid);
        return externalApartmentRepository.findByRegisteredByUid(agent.getUid());
    }

    @Transactional
    public ExternalApartment create(ExternalApartmentRequest request, String authorization, String claimedUid) {
        ExternalUser agent = resolveAgent(authorization);
        AgentListingRules.assertAgentUid(agent.getUid(), claimedUid);
        AgentListingRules.assertAgentUid(agent.getUid(), request.getRegisteredByUid());

        ExternalApartment apartment = new ExternalApartment();
        apartment.setExApartmentId("EXT-APT-" + UUID.randomUUID());
        apartment.setRegisteredByUid(agent.getUid());
        applyRequest(apartment, request);
        return externalApartmentRepository.save(apartment);
    }

    @Transactional
    public ExternalApartment update(String id, ExternalApartmentRequest request,
                                    String authorization, String claimedUid) {
        ExternalUser agent = resolveAgent(authorization);
        AgentListingRules.assertAgentUid(agent.getUid(), claimedUid);
        ExternalApartment apartment = externalApartmentRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Resale apartment listing not found: " + id));
        AgentListingRules.assertListingOwner(agent.getUid(), apartment.getRegisteredByUid());
        applyRequest(apartment, request);
        return externalApartmentRepository.save(apartment);
    }

    @Transactional
    public void delete(String id, String authorization, String claimedUid) {
        ExternalUser agent = resolveAgent(authorization);
        AgentListingRules.assertAgentUid(agent.getUid(), claimedUid);
        ExternalApartment apartment = externalApartmentRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Resale apartment listing not found: " + id));
        AgentListingRules.assertListingOwner(agent.getUid(), apartment.getRegisteredByUid());
        externalApartmentRepository.delete(apartment);
    }

    private ExternalUser resolveAgent(String authorization) {
        String email = AgentListingRules.extractEmail(authorization);
        ExternalUser agent = externalUserRepository.findByEmail(email)
                .orElseThrow(() -> new AgentListingForbiddenException("A valid Sales Agent login is required"));
        if (!"SALES_AGENT".equalsIgnoreCase(agent.getRole())) {
            throw new AgentListingForbiddenException("Only Sales Agents can manage resale listings");
        }
        return agent;
    }

    private void applyRequest(ExternalApartment apartment, ExternalApartmentRequest request) {
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
    }
}