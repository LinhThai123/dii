export interface CoupleAnalyticsOverviewDto {
  metrics: {
    totalCouples: number;
    retentionRate: number;
    averageRelationshipDays: number;
    averagePlansPerMonth: number;
    averageBookings: number;
    premiumConversion: number;
  };
  relationshipDuration: Array<{ range: string; count: number }>;
  popularCategories: Array<{ category: string; count: number }>;
  activeCities: Array<{ city: string; count: number }>;
  budgetDistribution: Array<{ range: string; count: number }>;
}
