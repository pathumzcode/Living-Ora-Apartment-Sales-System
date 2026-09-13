package com.apartment.apartmentsalessystembackend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class ExternalApartmentRequest {
    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;

    @Size(max = 5000, message = "Description is too long")
    private String about;

    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "Number of rooms must be at least 1")
    private Integer numOfRooms;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "Down payment cannot be negative")
    private BigDecimal downPayment;

    @Size(max = 500, message = "Image URL is too long")
    private String images;

    @Size(max = 20, message = "AC type is too long")
    private String acOrNonAC;

    @Size(max = 5000, message = "Additional information is too long")
    private String additionalInfo;

    @NotBlank(message = "Sales agent UID is required")
    private String registeredByUid;

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
    public Integer getNumOfRooms() { return numOfRooms; }
    public void setNumOfRooms(Integer numOfRooms) { this.numOfRooms = numOfRooms; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getDownPayment() { return downPayment; }
    public void setDownPayment(BigDecimal downPayment) { this.downPayment = downPayment; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public String getAcOrNonAC() { return acOrNonAC; }
    public void setAcOrNonAC(String acOrNonAC) { this.acOrNonAC = acOrNonAC; }
    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }
    public String getRegisteredByUid() { return registeredByUid; }
    public void setRegisteredByUid(String registeredByUid) { this.registeredByUid = registeredByUid; }
}
