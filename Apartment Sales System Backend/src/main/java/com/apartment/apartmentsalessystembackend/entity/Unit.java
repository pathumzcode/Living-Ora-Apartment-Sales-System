package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "units")
public class Unit {

    @Id
    @Column(name = "unitId", length = 50)
    private String unitId;

    @Column(name = "unitPrice", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "floor", nullable = false)
    private Integer floor;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "avilability", length = 30)
    private String availability;

    @Column(name = "fernitures", length = 30)
    private String furnitures;

    @Column(name = "numOfBathRooms")
    private Integer numOfBathRooms;

    @Column(name = "numOfRooms")
    private Integer numOfRooms;

    @Column(name = "numOfBeds")
    private Integer numOfBeds;

    @Column(name = "acOrNonAC")
    private String acOrNonAC;

    @Column(name = "reccomendedPerson", length = 50)
    private String recommendedPerson;

    @Lob
    @Column(name = "about")
    private String about;

    @Lob
    @Column(name = "images")
    private String images;

    @Column(name = "apartment_id", length = 50)
    private String apartmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    public Unit() {}

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getFurnitures() {
        return furnitures;
    }

    public void setFurnitures(String furnitures) {
        this.furnitures = furnitures;
    }

    public Integer getNumOfBathRooms() {
        return numOfBathRooms;
    }

    public void setNumOfBathRooms(Integer numOfBathRooms) {
        this.numOfBathRooms = numOfBathRooms;
    }

    public Integer getNumOfRooms() {
        return numOfRooms;
    }

    public void setNumOfRooms(Integer numOfRooms) {
        this.numOfRooms = numOfRooms;
    }

    public Integer getNumOfBeds() {
        return numOfBeds;
    }

    public void setNumOfBeds(Integer numOfBeds) {
        this.numOfBeds = numOfBeds;
    }

    public String getAcOrNonAC() {
        return acOrNonAC;
    }

    public void setAcOrNonAC(String acOrNonAC) {
        this.acOrNonAC = acOrNonAC;
    }

    public String getRecommendedPerson() {
        return recommendedPerson;
    }

    public void setRecommendedPerson(String recommendedPerson) {
        this.recommendedPerson = recommendedPerson;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }
}
