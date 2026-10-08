package com.apartment.apartmentsalessystembackend.dto.response;

import java.math.BigDecimal;

public class ScheduleAnalyticsResponse {
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalAmountCollected;
    private BigDecimal totalOutstandingBalance;
    private Long activeSchedulesCount;
    private Long completedSchedulesCount;
    private Long overdueMilestonesCount;
    private BigDecimal overdueAmount;
    private Long upcomingMilestonesIn30Days;
    private Double collectionRatePercentage;

    public ScheduleAnalyticsResponse() {}

    public BigDecimal getTotalPortfolioValue() { return totalPortfolioValue; }
    public void setTotalPortfolioValue(BigDecimal totalPortfolioValue) { this.totalPortfolioValue = totalPortfolioValue; }
    public BigDecimal getTotalAmountCollected() { return totalAmountCollected; }
    public void setTotalAmountCollected(BigDecimal totalAmountCollected) { this.totalAmountCollected = totalAmountCollected; }
    public BigDecimal getTotalOutstandingBalance() { return totalOutstandingBalance; }
    public void setTotalOutstandingBalance(BigDecimal totalOutstandingBalance) { this.totalOutstandingBalance = totalOutstandingBalance; }
    public Long getActiveSchedulesCount() { return activeSchedulesCount; }
    public void setActiveSchedulesCount(Long activeSchedulesCount) { this.activeSchedulesCount = activeSchedulesCount; }
    public Long getCompletedSchedulesCount() { return completedSchedulesCount; }
    public void setCompletedSchedulesCount(Long completedSchedulesCount) { this.completedSchedulesCount = completedSchedulesCount; }
    public Long getOverdueMilestonesCount() { return overdueMilestonesCount; }
    public void setOverdueMilestonesCount(Long overdueMilestonesCount) { this.overdueMilestonesCount = overdueMilestonesCount; }
    public BigDecimal getOverdueAmount() { return overdueAmount; }
    public void setOverdueAmount(BigDecimal overdueAmount) { this.overdueAmount = overdueAmount; }
    public Long getUpcomingMilestonesIn30Days() { return upcomingMilestonesIn30Days; }
    public void setUpcomingMilestonesIn30Days(Long upcomingMilestonesIn30Days) { this.upcomingMilestonesIn30Days = upcomingMilestonesIn30Days; }
    public Double getCollectionRatePercentage() { return collectionRatePercentage; }
    public void setCollectionRatePercentage(Double collectionRatePercentage) { this.collectionRatePercentage = collectionRatePercentage; }
}
