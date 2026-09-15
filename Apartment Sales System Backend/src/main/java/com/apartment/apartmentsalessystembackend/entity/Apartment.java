package com.apartment.apartmentsalessystembackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "apartment")
public class Apartment {

    @Id
    @Column(name = "apartmentId", length = 50)
    private String apartmentId;

    @Column(name = "numOfRoom", nullable = false)
    private Integer numOfRoom;

    @Column(name = "numOfFloors")
    private Integer numOfFloors;

    @Column(name = "numOfSwimmingPool")
    private Integer numOfSwimmingPool;

    @Column(name = "numOfGYM")
    private Integer numOfGYM;

    @Column(name = "location", nullable = false, length = 255)
    private String location;

    @Lob
    @Column(name = "images", columnDefinition = "LONGTEXT")
    private String images;

    @Lob
    @Column(name = "about", columnDefinition = "LONGTEXT")
    private String about;

    @Column(name = "floorPlan", length = 500)
    private String floorPlan;

    @Column(name = "numOfUnitsAvilable")
    private Integer numOfUnitsAvailable;

    @Column(name = "priceRange", length = 100)
    private String priceRange;

    @Column(name = "unitStatus", nullable = false, length = 30)
    private String unitStatus;


    // =========================================================
    // INTERNAL USER
    // =========================================================

    /*
     * Every apartment is managed/registered by an
     * internal Living-Ora user.
     *
     * Database:
     * apartment.internalUser_empId
     *        ->
     * internalUser.empId
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "internalUser_empId",
            nullable = false
    )
    private InternalUser internalUser;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Apartment() {
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
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

    public void setNumOfSwimmingPool(
            Integer numOfSwimmingPool
    ) {
        this.numOfSwimmingPool = numOfSwimmingPool;
    }


    public Integer getNumOfGYM() {
        return numOfGYM;
    }

    public void setNumOfGYM(Integer numOfGYM) {
        this.numOfGYM = numOfGYM;
    }


    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public void setNumOfUnitsAvailable(
            Integer numOfUnitsAvailable
    ) {
        this.numOfUnitsAvailable =
                numOfUnitsAvailable;
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


    public InternalUser getInternalUser() {
        return internalUser;
    }

    public void setInternalUser(
            InternalUser internalUser
    ) {
        this.internalUser = internalUser;
    }
}