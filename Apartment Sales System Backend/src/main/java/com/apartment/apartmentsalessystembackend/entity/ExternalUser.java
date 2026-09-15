package com.apartment.apartmentsalessystembackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

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

    /*
     * MySQL column must be LONGTEXT.
     *
     * Run:
     * ALTER TABLE `externalUser`
     * MODIFY COLUMN `about` LONGTEXT NULL;
     */
    @Lob
    @Column(name = "about", columnDefinition = "LONGTEXT")
    private String about;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @JsonIgnore
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "registeredDate", nullable = false)
    private LocalDate registeredDate;

    /*
     * Every ExternalUser must have a UserVerification record.
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
     * An ExternalUser does NOT need to own/register an apartment
     * when the account is initially created.
     *
     * Therefore this relationship is optional.
     *
     * MySQL column must also allow NULL.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(
            name = "externalApartment_exApartmentId",
            referencedColumnName = "exApartmentId",
            nullable = true
    )
    @JsonIgnore
    private ExternalApartment externalApartment;


    // =========================================================
    // Constructor
    // =========================================================

    public ExternalUser() {
    }


    // =========================================================
    // Getters and Setters
    // =========================================================

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