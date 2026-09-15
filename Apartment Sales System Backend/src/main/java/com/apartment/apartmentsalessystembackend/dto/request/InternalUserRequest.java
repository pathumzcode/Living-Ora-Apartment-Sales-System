package com.apartment.apartmentsalessystembackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class InternalUserRequest {
    @NotBlank(message = "First name is required") @Size(max = 100) private String firstName;
    @NotBlank(message = "Last name is required") @Size(max = 100) private String lastName;
    @NotBlank(message = "Role is required") @Size(max = 50) private String role;
    @NotBlank(message = "Email is required") @Email(message = "Email should be valid") private String email;
    @NotBlank(message = "NIC is required") @Size(max = 20) private String nic;
    @NotBlank(message = "Phone number is required") @Pattern(regexp = "^[0-9+()\\s-]{7,20}$", message = "Invalid phone number") private String phoneNumber;
    @Size(max = 255) private String address;
    @Min(value = 18, message = "Internal user must be at least 18 years old") private Integer age;
    @Size(max = 500) private String profilePicture;
    private LocalDate dateOfBirth;
    @Email(message = "Company email should be valid") private String companyEmail;
    @Size(max = 255) private String cEmailPassword;
    @Min(value = 0, message = "Service years cannot be negative") private Integer serviceYears;
    @Size(max = 30) private String empId;
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters") private String password;

    public String getEmpId() { return empId; } public void setEmpId(String value) { empId = value; }
    public String getFirstName() { return firstName; } public void setFirstName(String value) { firstName = value; }
    public String getLastName() { return lastName; } public void setLastName(String value) { lastName = value; }
    public String getRole() { return role; } public void setRole(String value) { role = value; }
    public String getEmail() { return email; } public void setEmail(String value) { email = value; }
    public String getNic() { return nic; } public void setNic(String value) { nic = value; }
    public String getPhoneNumber() { return phoneNumber; } public void setPhoneNumber(String value) { phoneNumber = value; }
    public String getAddress() { return address; } public void setAddress(String value) { address = value; }
    public Integer getAge() { return age; } public void setAge(Integer value) { age = value; }
    public String getProfilePicture() { return profilePicture; } public void setProfilePicture(String value) { profilePicture = value; }
    public LocalDate getDateOfBirth() { return dateOfBirth; } public void setDateOfBirth(LocalDate value) { dateOfBirth = value; }
    public String getCompanyEmail() { return companyEmail; } public void setCompanyEmail(String value) { companyEmail = value; }
    public String getcEmailPassword() { return cEmailPassword; } public void setcEmailPassword(String value) { cEmailPassword = value; }
    public Integer getServiceYears() { return serviceYears; } public void setServiceYears(Integer value) { serviceYears = value; }
    public String getPassword() { return password; } public void setPassword(String value) { password = value; }
}
