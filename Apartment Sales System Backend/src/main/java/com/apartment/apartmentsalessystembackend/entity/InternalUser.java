package com.apartment.apartmentsalessystembackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "internalUser")
public class InternalUser {

    @Id
    @Column(name = "empId", length = 30)
    private String empId;

    @Column(name = "role", nullable = false, length = 50)
    private String role;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @JsonIgnore
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "firstName", nullable = false, length = 100)
    private String firstName;

    @Column(name = "lastName", nullable = false, length = 100)
    private String lastName;

    @Column(name = "nic", nullable = false, unique = true, length = 20)
    private String nic;

    @Column(name = "phoneNumber", nullable = false, unique = true, length = 20)
    private String phoneNumber;

    /*
     * Database currently uses the spelling "adddress".
     * Keep this name unless you intentionally migrate the database.
     */
    @Column(name = "adddress", length = 255)
    private String address;

    @Column(name = "age")
    private Integer age;

    @Column(name = "dateOfBirth")
    private LocalDate dateOfBirth;

    @Column(name = "profilePicture", length = 500)
    private String profilePicture;

    @Column(name = "companyEmail", length = 255)
    private String companyEmail;

    @JsonIgnore
    @Column(name = "cEmailPassword", length = 255)
    private String cEmailPassword;

    @Column(name = "serviceYears")
    private Integer serviceYears;

    @Column(name = "joinedDate")
    private LocalDate joinedDate;

    /*
     * Every internal staff account must have verification information.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "userVerification_verificationID",
            referencedColumnName = "verificationID",
            nullable = false
    )
    @JsonIgnore
    private UserVerification userVerification;

    /*
     * Your current DB requires promotion_promotionId.
     * DataInitializer creates PROMO-2026 before creating staff.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "promotion_promotionId",
            referencedColumnName = "promotionId",
            nullable = false
    )
    @JsonIgnore
    private Promotion promotion;

    public InternalUser() {
    }

    public String getEmpId() {
        return empId;
    }

    public void setEmpId(String empId) {
        this.empId = empId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getcEmailPassword() {
        return cEmailPassword;
    }

    public void setcEmailPassword(String cEmailPassword) {
        this.cEmailPassword = cEmailPassword;
    }

    public Integer getServiceYears() {
        return serviceYears;
    }

    public void setServiceYears(Integer serviceYears) {
        this.serviceYears = serviceYears;
    }

    public LocalDate getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(LocalDate joinedDate) {
        this.joinedDate = joinedDate;
    }

    public UserVerification getUserVerification() {
        return userVerification;
    }

    public void setUserVerification(UserVerification userVerification) {
        this.userVerification = userVerification;
    }

    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }
}