package com.apartment.apartmentsalessystembackend.util;

import com.apartment.apartmentsalessystembackend.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class ValidationUtil {

    public void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new BadRequestException(fieldName + " cannot be null");
        }
    }

    public void validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException(fieldName + " cannot be empty");
        }
    }
}
