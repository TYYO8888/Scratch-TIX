/**
 * Scratch TIX JavaScript SDK
 * 
 * A comprehensive SDK for integrating Scratch TIX campaigns into any application.
 * Supports both browser and Node.js environments.
 * 
 * @version 1.0.0
 * @author Scratch TIX Team
 */

import { z } from 'zod';

// Types and Interfaces
export interface ScratchTIXConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'scratch' | 'coupon' | 'voucher';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  settings: {
    scratchPercentage: number;
    winProbability: number;
    maxParticipants?: number;
    startDate?: string;
    endDate?: string;
    enableSound: boolean;
    enableHaptics: boolean;
    enableParticles: boolean;
  };
  prizes: Prize[];
  analytics: CampaignAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  value: string;
  probability: number;
  maxWinners: number;
  currentWinners: number;
  imageUrl?: string;
}

export interface CampaignAnalytics {
  participants: number;
  winners: number;
  conversionRate: number;
  revenue: number;
  engagementRate?: number;
  averageSessionTime?: number;
  bounceRate?: number;
  shareRate?: number;
}

export interface ParticipationResult {
  hasWon: boolean;
  prize?: Prize;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Validation Schemas
const ConfigSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  retries: z.number().min(0).max(5).optional(),
  debug: z.boolean().optional(),
});

const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['scratch', 'coupon', 'voucher']),
  template: z.string(),
  settings: z.object({
    scratchPercentage: z.number().min(1).max(100).default(30),
    winProbability: z.number().min(0).max(1).default(0.3),
    maxParticipants: z.number().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    enableSound: z.boolean().default(true),
    enableHaptics: z.boolean().default(true),
    enableParticles: z.boolean().default(true),
  }),
  prizes: z.array(z.object({
    name: z.string(),
    description: z.string(),
    value: z.string(),
    probability: z.number().min(0).max(1),
    maxWinners: z.number().min(1),
    imageUrl: z.string().url().optional(),
  })),
});

// Main SDK Class
export class ScratchTIXSDK {
  private config: ScratchTIXConfig;
  private baseUrl: string;

  constructor(config: ScratchTIXConfig) {
    // Validate configuration
    const validatedConfig = ConfigSchema.parse(config);
    
    this.config = {
      timeout: 10000,
      retries: 3,
      debug: false,
      baseUrl: 'https://api.scratchtix.com/v1',
      ...validatedConfig,
    };
    
    this.baseUrl = this.config.baseUrl!;
    
    if (this.config.debug) {
      console.log('ScratchTIX SDK initialized with config:', this.config);
    }
  }

  // Campaign Management
  async createCampaign(campaignData: z.infer<typeof CreateCampaignSchema>): Promise<Campaign> {
    const validatedData = CreateCampaignSchema.parse(campaignData);
    const response = await this.makeRequest<Campaign>('POST', '/campaigns', validatedData);
    return response.data!;
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    const response = await this.makeRequest<Campaign>('GET', `/campaigns/${campaignId}`);
    return response.data!;
  }

  async listCampaigns(options?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<{ campaigns: Campaign[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.makeRequest<Campaign[]>('GET', url);
    
    return {
      campaigns: response.data!,
      pagination: response.pagination!,
    };
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    const response = await this.makeRequest<Campaign>('PUT', `/campaigns/${campaignId}`, updates);
    return response.data!;
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await this.makeRequest('DELETE', `/campaigns/${campaignId}`);
  }

  // Campaign Participation
  async participateInCampaign(
    campaignId: string,
    participantData?: {
      email?: string;
      name?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ParticipationResult> {
    const response = await this.makeRequest<ParticipationResult>(
      'POST',
      `/campaigns/${campaignId}/participate`,
      participantData
    );
    return response.data!;
  }

  // Analytics
  async getCampaignAnalytics(
    campaignId?: string,
    options?: {
      startDate?: string;
      endDate?: string;
      granularity?: 'hour' | 'day' | 'week' | 'month';
      metrics?: string[];
    }
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (campaignId) {
      queryParams.append('campaignId', campaignId);
    }
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const url = `/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.makeRequest('GET', url);
    return response.data!;
  }

  // Webhook Management
  async createWebhook(webhookData: {
    url: string;
    events: string[];
    secret?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const response = await this.makeRequest('POST', '/webhooks', webhookData);
    return response.data!;
  }

  async listWebhooks(): Promise<any[]> {
    const response = await this.makeRequest<any[]>('GET', '/webhooks');
    return response.data!;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.makeRequest('DELETE', `/webhooks/${webhookId}`);
  }

  // Utility Methods
  async validateApiKey(): Promise<boolean> {
    try {
      await this.makeRequest('GET', '/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getOrganizationInfo(): Promise<any> {
    const response = await this.makeRequest('GET', '/organization');
    return response.data!;
  }

  // Private Methods
  private async makeRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    let attempt = 0;
    
    while (attempt <= this.config.retries!) {
      try {
        if (this.config.debug) {
          console.log(`Making ${method} request to ${url}`, data);
        }

        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-API-Key': this.config.apiKey,
            'User-Agent': 'ScratchTIX-SDK/1.0.0',
          },
          signal: AbortSignal.timeout(this.config.timeout!),
        };

        if (data && (method === 'POST' || method === 'PUT')) {
          options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (this.config.debug) {
          console.log(`Response from ${url}:`, responseData);
        }

        return responseData;
      } catch (error) {
        attempt++;
        
        if (this.config.debug) {
          console.error(`Request attempt ${attempt} failed:`, error);
        }

        if (attempt > this.config.retries!) {
          throw new ScratchTIXError(
            `Request failed after ${this.config.retries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'NETWORK_ERROR'
          );
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new ScratchTIXError('Unexpected error in makeRequest', 'UNKNOWN_ERROR');
  }
}

// Custom Error Class
export class ScratchTIXError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ScratchTIXError';
    this.code = code;
    this.details = details;
  }
}

// Browser Integration Helper
export class ScratchTIXWidget {
  private sdk: ScratchTIXSDK;
  private container: HTMLElement;
  private campaignId: string;

  constructor(
    container: HTMLElement | string,
    campaignId: string,
    config: ScratchTIXConfig
  ) {
    this.sdk = new ScratchTIXSDK(config);
    this.campaignId = campaignId;
    
    if (typeof container === 'string') {
      const element = document.getElementById(container);
      if (!element) {
        throw new Error(`Element with ID '${container}' not found`);
      }
      this.container = element;
    } else {
      this.container = container;
    }
  }

  async render(options?: {
    width?: number;
    height?: number;
    theme?: 'light' | 'dark';
    customStyles?: Record<string, string>;
  }): Promise<void> {
    try {
      // Get campaign data
      const campaign = await this.sdk.getCampaign(this.campaignId);
      
      // Create iframe for secure rendering
      const iframe = document.createElement('iframe');
      iframe.src = `${this.sdk['baseUrl']}/widget/${this.campaignId}`;
      iframe.style.width = `${options?.width || 400}px`;
      iframe.style.height = `${options?.height || 300}px`;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      
      // Apply custom styles
      if (options?.customStyles) {
        Object.assign(iframe.style, options.customStyles);
      }
      
      // Clear container and add iframe
      this.container.innerHTML = '';
      this.container.appendChild(iframe);
      
      // Set up message handling for iframe communication
      window.addEventListener('message', this.handleIframeMessage.bind(this));
      
    } catch (error) {
      console.error('Failed to render ScratchTIX widget:', error);
      this.container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #ef4444;">
          Failed to load campaign. Please try again later.
        </div>
      `;
    }
  }

  private handleIframeMessage(event: MessageEvent): void {
    if (event.origin !== new URL(this.sdk['baseUrl']).origin) {
      return;
    }

    const { type, data } = event.data;
    
    switch (type) {
      case 'campaign_completed':
        this.onCampaignCompleted(data);
        break;
      case 'participant_won':
        this.onParticipantWon(data);
        break;
      case 'participant_lost':
        this.onParticipantLost(data);
        break;
    }
  }

  // Event handlers (can be overridden)
  protected onCampaignCompleted(data: any): void {
    console.log('Campaign completed:', data);
  }

  protected onParticipantWon(data: any): void {
    console.log('Participant won:', data);
  }

  protected onParticipantLost(data: any): void {
    console.log('Participant lost:', data);
  }
}

// Export default SDK instance factory
export function createScratchTIXSDK(config: ScratchTIXConfig): ScratchTIXSDK {
  return new ScratchTIXSDK(config);
}

// Export everything
export default ScratchTIXSDK;
