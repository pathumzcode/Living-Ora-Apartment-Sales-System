package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "externalUser")
public class ExternalUser {

    @Id
    @Column(name = "uid", length = 50)
    private String uid;

    @Column(name = "role", nullable = false, length = 50)
    private String role;

    @Column(name = "firstName", nullable = false, length = 100)
    private String firstName;

    @Column(name = "lastName", nullable = false, length = 100)
    private String lastName;

    @Column(name = "nic", nullable = false, unique = true, length = 20)
    private String nic;

    @Column(name = "phoneNumber", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "profilePicture", length = 500)
    private String profilePicture;

    @Column(name = "numOfApartments")
    private Integer numOfApartments;

    @Lob
    @Column(name = "about")
    private String about;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    @JsonIgnore
    private String password;

    @Column(name = "registeredDate", nullable = false)
    private LocalDate registeredDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userVerification_verificationID", nullable = false)
    @JsonIgnore
    private UserVerification userVerification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "externalApartment_exApartmentId", nullable = true)
    @JsonIgnore
    private ExternalApartment externalApartment;

    public ExternalUser() {}

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public Integer getNumOfApartments() {
        return numOfApartments;
    }

    public void setNumOfApartments(Integer numOfApartments) {
        this.numOfApartments = numOfApartments;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
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

    public LocalDate getRegisteredDate() {
        return registeredDate;
    }

    public void setRegisteredDate(LocalDate registeredDate) {
        this.registeredDate = registeredDate;
    }

    public UserVerification getUserVerification() {
        return userVerification;
    }

    public void setUserVerification(UserVerification userVerification) {
        this.userVerification = userVerification;
    }

    public ExternalApartment getExternalApartment() {
        return externalApartment;
    }

    public void setExternalApartment(ExternalApartment externalApartment) {
        this.externalApartment = externalApartment;
    }
}
