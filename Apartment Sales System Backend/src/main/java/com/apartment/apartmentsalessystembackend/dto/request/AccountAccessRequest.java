package com.apartment.apartmentsalessystembackend.dto.request;

import jakarta.validation.constraints.NotNull;

public class AccountAccessRequest {
    @NotNull private Integer active;
    @NotNull private Integer verified;
    public Integer getActive() { return active; }
    public void setActive(Integer active) { this.active = active; }
    public Integer getVerified() { return verified; }
    public void setVerified(Integer verified) { this.verified = verified; }
}
