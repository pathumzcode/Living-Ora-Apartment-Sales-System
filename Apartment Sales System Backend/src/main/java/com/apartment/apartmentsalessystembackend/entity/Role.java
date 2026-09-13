package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(name = "roleid", length = 20)
    private String roleId;

    @Column(name = "roleName", nullable = false, length = 45)
    private String roleName;

    @Column(name = "rolescol", nullable = false, length = 45)
    private String rolesCol;

    public Role() {}

    public Role(String roleId, String roleName, String rolesCol) {
        this.roleId = roleId;
        this.roleName = roleName;
        this.rolesCol = rolesCol;
    }

    public String getRoleId() {
        return roleId;
    }

    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getRolesCol() {
        return rolesCol;
    }

    public void setRolesCol(String rolesCol) {
        this.rolesCol = rolesCol;
    }
}
