package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.dto.request.LoginRequest;
import com.apartment.apartmentsalessystembackend.dto.request.ExternalSignupRequest;
import com.apartment.apartmentsalessystembackend.dto.response.LoginResponse;
import com.apartment.apartmentsalessystembackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/external/signup")
    public ResponseEntity<LoginResponse> signup(@Valid @RequestBody ExternalSignupRequest request) {
        return ResponseEntity.status(201).body(authService.signup(request));
    }
}
