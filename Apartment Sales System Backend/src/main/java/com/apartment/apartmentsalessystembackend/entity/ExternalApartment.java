package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "externalApartment")
public class ExternalApartment {

    @Id
    @Column(name = "exApartmentId", length = 50)
    private String exApartmentId;

    @Column(name = "registeredByUid", length = 50)
    private String registeredByUid;

    @Column(name = "location", nullable = false, length = 255)
    private String location;

    @Lob
    @Column(name = "about")
    private String about;

    @Column(name = "numOfRooms", nullable = false)
    private Integer numOfRooms;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "downPayment", precision = 12, scale = 2)
    private BigDecimal downPayment;

    @Lob
    @Column(name = "images")
    private String images;

    @Column(name = "acOrNonAC")
    private String acOrNonAC;

    @Lob
    @Column(name = "additionalInfo")
    private String additionalInfo;

    public ExternalApartment() {}

    public String getExApartmentId() {
        return exApartmentId;
    }

    public void setExApartmentId(String exApartmentId) {
        this.exApartmentId = exApartmentId;
    }

    public String getRegisteredByUid() {
        return registeredByUid;
    }

    public void setRegisteredByUid(String registeredByUid) {
        this.registeredByUid = registeredByUid;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public Integer getNumOfRooms() {
        return numOfRooms;
    }

    public void setNumOfRooms(Integer numOfRooms) {
        this.numOfRooms = numOfRooms;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getDownPayment() {
        return downPayment;
    }

    public void setDownPayment(BigDecimal downPayment) {
        this.downPayment = downPayment;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public String getAcOrNonAC() {
        return acOrNonAC;
    }

    public void setAcOrNonAC(String acOrNonAC) {
        this.acOrNonAC = acOrNonAC;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }
}
