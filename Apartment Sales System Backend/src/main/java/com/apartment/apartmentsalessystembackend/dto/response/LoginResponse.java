package com.apartment.apartmentsalessystembackend.dto.response;

public class LoginResponse {
    private String token;
    private String uid;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private boolean externalUser;
    private boolean customer;
    private boolean salesAgent;

    public LoginResponse() {}

    public LoginResponse(String token, String uid, String email, String firstName, String lastName, String role) {
        this.token = token;
        this.uid = uid;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.externalUser = true;
        this.customer = "CUSTOMER".equals(role);
        this.salesAgent = "SALES_AGENT".equals(role);
    }

    public LoginResponse(String token, String uid, String email, String firstName, String lastName, String role, boolean externalUser) {
        this(token, uid, email, firstName, lastName, role);
        this.externalUser = externalUser;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
        this.customer = "CUSTOMER".equals(role);
        this.salesAgent = "SALES_AGENT".equals(role);
    }

    public boolean isExternalUser() { return externalUser; }
    public boolean isCustomer() { return customer; }
    public boolean isSalesAgent() { return salesAgent; }
}
