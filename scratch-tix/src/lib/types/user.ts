export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  ownerId: string;
  members: string[];
  
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain?: string;
    emailTemplates?: Record<string, string>;
  };
  
  settings: {
    maxCampaigns: number;
    maxParticipants: number;
    features: Feature[];
    apiAccess: boolean;
    whiteLabeling: boolean;
  };
  
  billing: {
    customerId?: string;
    subscriptionId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  campaignId: string;
  email: string;
  phone?: string;
  name: string;
  age?: number;
  country?: string;
  
  // Technical data
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  
  // Participation data
  participatedAt: Date;
  hasWon: boolean;
  prizeWon?: string;
  claimedAt?: Date;
  validatedAt?: Date;
  
  // Consent and compliance
  consentGiven: boolean;
  consentTimestamp: Date;
  gdprConsent?: {
    marketing: boolean;
    analytics: boolean;
    functional: boolean;
  };
}

export interface UserSession {
  userId: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  expiresAt: Date;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    campaignUpdates: boolean;
    systemAlerts: boolean;
  };
  dashboard: {
    defaultView: 'campaigns' | 'analytics' | 'templates';
    chartsType: 'line' | 'bar' | 'pie';
  };
}

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  permissions: ApiPermission[];
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Enums and Types
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type Permission = 
  | 'campaigns.create'
  | 'campaigns.read'
  | 'campaigns.update'
  | 'campaigns.delete'
  | 'campaigns.publish'
  | 'templates.create'
  | 'templates.read'
  | 'templates.update'
  | 'templates.delete'
  | 'analytics.read'
  | 'analytics.export'
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'organization.read'
  | 'organization.update'
  | 'billing.read'
  | 'billing.update'
  | 'api.read'
  | 'api.write';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type Feature = 
  | 'unlimited_campaigns'
  | 'advanced_analytics'
  | 'white_labeling'
  | 'api_access'
  | 'custom_domains'
  | 'priority_support'
  | 'team_collaboration'
  | 'advanced_integrations'
  | 'custom_templates'
  | 'bulk_operations';

export type ApiPermission = 
  | 'campaigns.read'
  | 'campaigns.write'
  | 'participants.read'
  | 'participants.write'
  | 'analytics.read'
  | 'webhooks.write';

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete', 'campaigns.publish',
    'templates.create', 'templates.read', 'templates.update', 'templates.delete',
    'analytics.read', 'analytics.export',
    'users.create', 'users.read', 'users.update', 'users.delete',
    'organization.read', 'organization.update',
    'billing.read', 'billing.update',
    'api.read', 'api.write'
  ],
  admin: [
    'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete', 'campaigns.publish',
    'templates.create', 'templates.read', 'templates.update', 'templates.delete',
    'analytics.read', 'analytics.export',
    'users.create', 'users.read', 'users.update',
    'organization.read',
    'api.read', 'api.write'
  ],
  editor: [
    'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.publish',
    'templates.create', 'templates.read', 'templates.update',
    'analytics.read'
  ],
  viewer: [
    'campaigns.read',
    'templates.read',
    'analytics.read'
  ]
};

// Plan-based features mapping
export const PLAN_FEATURES: Record<SubscriptionPlan, Feature[]> = {
  free: [],
  pro: [
    'unlimited_campaigns',
    'advanced_analytics',
    'api_access',
    'team_collaboration',
    'custom_templates'
  ],
  enterprise: [
    'unlimited_campaigns',
    'advanced_analytics',
    'white_labeling',
    'api_access',
    'custom_domains',
    'priority_support',
    'team_collaboration',
    'advanced_integrations',
    'custom_templates',
    'bulk_operations'
  ]
};
