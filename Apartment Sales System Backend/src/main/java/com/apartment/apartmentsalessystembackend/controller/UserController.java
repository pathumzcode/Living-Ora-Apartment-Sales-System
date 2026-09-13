package com.apartment.apartmentsalessystembackend.controller;

import com.apartment.apartmentsalessystembackend.entity.ExternalUser;
import com.apartment.apartmentsalessystembackend.entity.InternalUser;
import com.apartment.apartmentsalessystembackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/external")
    public ResponseEntity<List<ExternalUser>> getAllExternalUsers() {
        return ResponseEntity.ok(userService.getAllExternalUsers());
    }

    @GetMapping("/external/{uid}")
    public ResponseEntity<ExternalUser> getExternalUserById(@PathVariable String uid) {
        return ResponseEntity.ok(userService.getExternalUserById(uid));
    }

    @GetMapping("/internal")
    public ResponseEntity<List<InternalUser>> getAllInternalUsers() {
        return ResponseEntity.ok(userService.getAllInternalUsers());
    }

    @GetMapping("/internal/{empId}")
    public ResponseEntity<InternalUser> getInternalUserByEmpId(@PathVariable String empId) {
        return ResponseEntity.ok(userService.getInternalUserByEmpId(empId));
    }
}
