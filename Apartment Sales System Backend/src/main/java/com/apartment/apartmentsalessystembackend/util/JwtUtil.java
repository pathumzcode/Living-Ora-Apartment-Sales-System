package com.apartment.apartmentsalessystembackend.util;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class JwtUtil {

    public String generateToken(String username, String role) {
        return "JWT-" + UUID.randomUUID().toString() + "-" + username;
    }

    public boolean validateToken(String token) {
        return token != null && token.startsWith("JWT-");
    }
}
