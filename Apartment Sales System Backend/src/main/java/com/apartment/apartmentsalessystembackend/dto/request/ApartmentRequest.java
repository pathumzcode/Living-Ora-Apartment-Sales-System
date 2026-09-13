package com.apartment.apartmentsalessystembackend.dto.request;

public class ApartmentRequest {
    private String name;
    private String location;
    private Integer numOfRoom;
    private Integer numOfFloors;
    private Integer numOfSwimmingPool;
    private Integer numOfGYM;
    private String images;
    private String about;
    private String floorPlan;
    private Integer numOfUnitsAvailable;
    private String priceRange;
    private String unitStatus;

    public ApartmentRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getNumOfRoom() {
        return numOfRoom;
    }

    public void setNumOfRoom(Integer numOfRoom) {
        this.numOfRoom = numOfRoom;
    }

    public Integer getNumOfFloors() {
        return numOfFloors;
    }

    public void setNumOfFloors(Integer numOfFloors) {
        this.numOfFloors = numOfFloors;
    }

    public Integer getNumOfSwimmingPool() {
        return numOfSwimmingPool;
    }

    public void setNumOfSwimmingPool(Integer numOfSwimmingPool) {
        this.numOfSwimmingPool = numOfSwimmingPool;
    }

    public Integer getNumOfGYM() {
        return numOfGYM;
    }

    public void setNumOfGYM(Integer numOfGYM) {
        this.numOfGYM = numOfGYM;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public String getFloorPlan() {
        return floorPlan;
    }

    public void setFloorPlan(String floorPlan) {
        this.floorPlan = floorPlan;
    }

    public Integer getNumOfUnitsAvailable() {
        return numOfUnitsAvailable;
    }

    public void setNumOfUnitsAvailable(Integer numOfUnitsAvailable) {
        this.numOfUnitsAvailable = numOfUnitsAvailable;
    }

    public String getPriceRange() {
        return priceRange;
    }

    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }

    public String getUnitStatus() {
        return unitStatus;
    }

    public void setUnitStatus(String unitStatus) {
        this.unitStatus = unitStatus;
    }
}
