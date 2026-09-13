package com.apartment.apartmentsalessystembackend.dto.request;

import java.math.BigDecimal;

public class UnitRequest {
    private String apartmentId;
    private BigDecimal unitPrice;
    private Integer floor;
    private String location;
    private String availability;
    private String furnitures;
    private Integer numOfBathRooms;
    private Integer numOfRooms;
    private Integer numOfBeds;
    private String acOrNonAC;
    private String recommendedPerson;
    private String about;
    private String images;

    public UnitRequest() {}

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
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
}
