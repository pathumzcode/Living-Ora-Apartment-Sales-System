package com.apartment.apartmentsalessystembackend.service;

import com.apartment.apartmentsalessystembackend.entity.Role;
import com.apartment.apartmentsalessystembackend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
