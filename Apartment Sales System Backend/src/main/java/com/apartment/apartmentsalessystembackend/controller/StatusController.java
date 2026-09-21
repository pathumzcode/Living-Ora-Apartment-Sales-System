package com.apartment.apartmentsalessystembackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "RUNNING");
        body.put("backendUrl", "http://localhost:8080");
        body.put("apiBaseUrl", "http://localhost:8080/api");
        return ResponseEntity.ok(body);
    }
}
