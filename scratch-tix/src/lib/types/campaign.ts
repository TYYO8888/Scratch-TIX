export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'scratch' | 'coupon' | 'voucher';
  
  // Design Configuration
  design: {
    template?: string;
    backgroundImage?: string;
    overlayImage?: string;
    dimensions: {
      width: number;
      height: number;
    };
    elements: CanvasElement[];
  };

  // Prize Configuration
  prizes: Prize[];

  // Game Settings
  gameSettings: {
    scratchPercentage: number; // 0-100
    enableSound: boolean;
    enableRetry: boolean;
    maxRetries: number;
    redirectUrl?: string;
    showRules: boolean;
  };

  // Distribution Settings
  distribution: {
    channels: ('web' | 'email' | 'sms' | 'social')[];
    embedCode?: string;
    shareUrls?: Record<string, string>;
    restrictions: {
      uniqueEmail: boolean;
      uniquePhone: boolean;
      geoRestrictions?: string[];
      ageRestrictions?: {
        minAge?: number;
        maxAge?: number;
      };
    };
  };

  // Analytics
  analytics: {
    totalViews: number;
    uniqueParticipants: number;
    totalWinners: number;
    conversionRate: number;
    lastUpdated: Date;
  };

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Prize {
  id: string;
  name: string;
  description?: string;
  image?: string;
  value: string;
  probability: number; // 0-1
  maxWinners: number;
  currentWinners: number;
  isActive: boolean;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  properties: {
    // Common properties
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    
    // Text-specific properties
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    
    // Image-specific properties
    src?: string;
    alt?: string;
    
    // Shape-specific properties
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    shapeType?: 'rectangle' | 'circle' | 'polygon';
  };
  position: {
    x: number;
    y: number;
  };
  zIndex: number;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  design: {
    elements: CanvasElement[];
    dimensions: {
      width: number;
      height: number;
    };
  };
  isPublic: boolean;
  organizationId?: string;
  usageCount: number;
  createdAt: Date;
}

export interface CampaignAnalytics {
  campaignId: string;
  date: Date;
  metrics: {
    views: number;
    participants: number;
    winners: number;
    conversionRate: number;
    bounceRate: number;
    avgTimeSpent: number;
  };
  demographics: {
    ageGroups: Record<string, number>;
    countries: Record<string, number>;
    devices: Record<string, number>;
  };
  sources: {
    direct: number;
    email: number;
    social: number;
    referral: number;
  };
}

export interface CampaignSettings {
  general: {
    showLogo: boolean;
    enableSound: boolean;
    customPrizeText: {
      font: string;
      color: string;
      size: number;
      position: {
        x: number;
        y: number;
      };
    };
  };
  win: {
    scratchPercentage: number;
    claimPageBehavior: 'auto-redirect' | 'proceed-button';
    redirectUrl?: string;
  };
  lose: {
    allowRetries: boolean;
    retryAvailability: number;
    redirectUrl?: string;
    customMessage?: string;
  };
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type CampaignType = 'scratch' | 'coupon' | 'voucher';
export type DistributionChannel = 'web' | 'email' | 'sms' | 'social';
