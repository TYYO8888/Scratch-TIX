export interface AnalyticsData {
  campaignId: string;
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  // Core metrics
  metrics: {
    totalViews: number;
    uniqueParticipants: number;
    totalWinners: number;
    conversionRate: number;
    winRate: number;
    bounceRate: number;
    avgTimeSpent: number; // in seconds
    completionRate: number;
  };
  
  // Time series data
  timeSeries: TimeSeriesData[];
  
  // Demographics
  demographics: {
    ageGroups: Record<string, number>;
    countries: Record<string, number>;
    cities: Record<string, number>;
    devices: DeviceAnalytics;
    browsers: Record<string, number>;
  };
  
  // Traffic sources
  sources: {
    direct: number;
    email: number;
    social: SocialSourceData;
    referral: Record<string, number>;
    search: number;
    paid: number;
  };
  
  // Prize analytics
  prizeAnalytics: PrizeAnalytics[];
  
  // User behavior
  behavior: {
    scratchPatterns: ScratchPattern[];
    dropOffPoints: DropOffPoint[];
    retryAnalytics: RetryAnalytics;
  };
  
  lastUpdated: Date;
}

export interface TimeSeriesData {
  timestamp: Date;
  views: number;
  participants: number;
  winners: number;
  conversionRate: number;
}

export interface DeviceAnalytics {
  desktop: number;
  mobile: number;
  tablet: number;
  operatingSystems: Record<string, number>;
  screenResolutions: Record<string, number>;
}

export interface SocialSourceData {
  facebook: number;
  twitter: number;
  instagram: number;
  linkedin: number;
  tiktok: number;
  other: Record<string, number>;
}

export interface PrizeAnalytics {
  prizeId: string;
  prizeName: string;
  totalWinners: number;
  winRate: number;
  claimRate: number;
  avgClaimTime: number; // in minutes
  redemptionRate: number;
  value: string;
}

export interface ScratchPattern {
  pattern: 'linear' | 'circular' | 'random' | 'corners' | 'center';
  frequency: number;
  avgScratchTime: number;
  completionRate: number;
}

export interface DropOffPoint {
  stage: 'landing' | 'form' | 'scratching' | 'result' | 'claim';
  dropOffRate: number;
  avgTimeAtStage: number;
}

export interface RetryAnalytics {
  totalRetries: number;
  avgRetriesPerUser: number;
  retrySuccessRate: number;
  retryPatterns: Record<number, number>; // retry attempt -> count
}

export interface DashboardMetrics {
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalParticipants: number;
    totalWinners: number;
    avgConversionRate: number;
    totalRevenue?: number;
  };
  
  topCampaigns: CampaignMetrics[];
  recentActivity: ActivityItem[];
  performanceTrends: PerformanceTrend[];
  
  // Comparative analytics
  comparison: {
    previousPeriod: {
      participants: number;
      winners: number;
      conversionRate: number;
      growth: {
        participants: number; // percentage
        winners: number;
        conversionRate: number;
      };
    };
  };
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  status: string;
  participants: number;
  winners: number;
  conversionRate: number;
  winRate: number;
  createdAt: Date;
  lastActivity: Date;
}

export interface ActivityItem {
  id: string;
  type: 'campaign_created' | 'participant_joined' | 'prize_won' | 'campaign_completed';
  campaignId: string;
  campaignName: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceTrend {
  date: Date;
  participants: number;
  winners: number;
  conversionRate: number;
  revenue?: number;
}

export interface ExportData {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  data: {
    campaigns?: Campaign[];
    participants?: Participant[];
    analytics?: AnalyticsData[];
    winners?: Winner[];
  };
  filters: ExportFilters;
  generatedAt: Date;
  generatedBy: string;
}

export interface ExportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  campaignIds?: string[];
  status?: string[];
  includePersonalData: boolean;
  includeAnalytics: boolean;
  groupBy?: 'campaign' | 'date' | 'prize';
}

export interface Winner {
  id: string;
  campaignId: string;
  campaignName: string;
  participantId: string;
  participantEmail: string;
  participantName: string;
  prizeId: string;
  prizeName: string;
  prizeValue: string;
  wonAt: Date;
  claimedAt?: Date;
  validatedAt?: Date;
  status: 'pending' | 'claimed' | 'validated' | 'expired';
  claimCode?: string;
  redemptionCode?: string;
}

export interface RealtimeMetrics {
  campaignId: string;
  currentViewers: number;
  recentParticipants: number; // last 5 minutes
  recentWinners: number; // last 5 minutes
  liveConversionRate: number;
  peakConcurrentUsers: number;
  lastUpdated: Date;
}

export interface GeographicData {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  participants: number;
  winners: number;
  conversionRate: number;
}

export interface FunnelAnalytics {
  campaignId: string;
  stages: FunnelStage[];
  overallConversionRate: number;
  dropOffAnalysis: {
    highestDropOff: string;
    improvementSuggestions: string[];
  };
}

export interface FunnelStage {
  name: string;
  order: number;
  participants: number;
  conversionRate: number;
  avgTimeSpent: number;
  dropOffRate: number;
}

// Utility types
export type MetricType = 'views' | 'participants' | 'winners' | 'conversion_rate' | 'win_rate';
export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';
