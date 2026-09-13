package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.dto.request.PromotionRequest;
import com.apartment.apartmentsalessystembackend.entity.Promotion;
import com.apartment.apartmentsalessystembackend.exception.ResourceNotFoundException;
import com.apartment.apartmentsalessystembackend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import com.apartment.apartmentsalessystembackend.exception.BadRequestException;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Promotion getPromotionByCode(String code) {
        return promotionRepository.findByPromotionCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with code: " + code));
    }

    public Promotion createPromotion(PromotionRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Promotion end date cannot be before start date");
        }
        Promotion entity = new Promotion();
        entity.setPromotionId("PROMO-" + System.currentTimeMillis() % 10000);
        entity.setPromotionType(request.getPromotionType());
        entity.setPromotionTitle(request.getPromotionTitle());
        entity.setAbout(request.getAbout());
        entity.setEligibilityCriteria(request.getEligibilityCriteria());
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());
        entity.setButtonText(request.getButtonText());
        entity.setBannerImage(request.getBannerImage());
        entity.setValidityPeriod(request.getValidityPeriod());
        entity.setDiscountPrecentage(request.getDiscountPrecentage());
        entity.setPromotionCode(request.getPromotionCode());
        return promotionRepository.save(entity);
    }
}
