import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Import shared utilities (in production, these would be in a shared module)
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

const UpdateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).optional(),
  settings: z.object({
    scratchPercentage: z.number().min(1).max(100).optional(),
    winProbability: z.number().min(0).max(1).optional(),
    maxParticipants: z.number().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    enableSound: z.boolean().optional(),
    enableHaptics: z.boolean().optional(),
    enableParticles: z.boolean().optional(),
  }).optional(),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    logo: z.string().url().optional(),
    backgroundImage: z.string().url().optional(),
  }).optional(),
});

// Mock database
const mockCampaigns = [
  {
    id: '1',
    name: 'Summer Sale Scratch Card',
    description: 'Exciting summer promotion with amazing prizes',
    type: 'scratch',
    status: 'active',
    template: 'modern-blue',
    organizationId: 'org_1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    settings: {
      scratchPercentage: 30,
      winProbability: 0.3,
      maxParticipants: 1000,
      enableSound: true,
      enableHaptics: true,
      enableParticles: true,
    },
    analytics: {
      participants: 1247,
      winners: 156,
      conversionRate: 12.5,
      revenue: 15600,
      engagementRate: 87.3,
      averageSessionTime: 45.2,
      bounceRate: 23.5,
      shareRate: 8.7,
      deviceBreakdown: {
        mobile: 68,
        tablet: 18,
        desktop: 14,
      },
      performanceMetrics: {
        averageLoadTime: 1.2,
        averageFrameRate: 58.4,
        errorRate: 0.1,
      },
    },
    prizes: [
      {
        id: 'prize_1',
        name: '50% Off Coupon',
        description: 'Get 50% off your next purchase',
        value: '$25',
        probability: 0.2,
        maxWinners: 200,
        currentWinners: 45,
        imageUrl: '/api/placeholder/200/200',
      },
      {
        id: 'prize_2',
        name: 'Free Shipping',
        description: 'Free shipping on your next order',
        value: '$10',
        probability: 0.1,
        maxWinners: 100,
        currentWinners: 23,
        imageUrl: '/api/placeholder/200/200',
      },
    ],
    branding: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      logo: '/api/placeholder/100/50',
    },
  },
];

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createAPIResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): APIResponse<T> {
  return {
    success,
    data,
    error,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId: generateRequestId(),
    },
  };
}

function validateAPIKey(request: NextRequest): { valid: boolean; organizationId?: string } {
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  
  if (apiKey === 'sk_test_12345' || authHeader === 'Bearer sk_test_12345') {
    return { valid: true, organizationId: 'org_1' };
  }
  
  return { valid: false };
}

// GET /api/campaigns/[id] - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate API key
    const auth = validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid API key', 'Authentication failed'),
        { status: 401 }
      );
    }

    const campaignId = params.id;
    
    // Find campaign
    const campaign = mockCampaigns.find(
      c => c.id === campaignId && c.organizationId === auth.organizationId
    );

    if (!campaign) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Campaign not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createAPIResponse(true, campaign, undefined, 'Campaign retrieved successfully')
    );
  } catch (error) {
    console.error('GET /api/campaigns/[id] error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate API key
    const auth = validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid API key', 'Authentication failed'),
        { status: 401 }
      );
    }

    const campaignId = params.id;
    
    // Find campaign
    const campaignIndex = mockCampaigns.findIndex(
      c => c.id === campaignId && c.organizationId === auth.organizationId
    );

    if (campaignIndex === -1) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Campaign not found'),
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const updates = UpdateCampaignSchema.parse(body);

    // Update campaign
    const updatedCampaign = {
      ...mockCampaigns[campaignIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockCampaigns[campaignIndex] = updatedCampaign;

    return NextResponse.json(
      createAPIResponse(true, updatedCampaign, undefined, 'Campaign updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Validation error', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('PUT /api/campaigns/[id] error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate API key
    const auth = validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid API key', 'Authentication failed'),
        { status: 401 }
      );
    }

    const campaignId = params.id;
    
    // Find campaign
    const campaignIndex = mockCampaigns.findIndex(
      c => c.id === campaignId && c.organizationId === auth.organizationId
    );

    if (campaignIndex === -1) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Campaign not found'),
        { status: 404 }
      );
    }

    // Check if campaign can be deleted
    const campaign = mockCampaigns[campaignIndex];
    if (campaign.status === 'active') {
      return NextResponse.json(
        createAPIResponse(false, null, 'Cannot delete active campaign', 'Please pause the campaign before deleting'),
        { status: 400 }
      );
    }

    // Soft delete (in production, mark as deleted instead of removing)
    mockCampaigns.splice(campaignIndex, 1);

    return NextResponse.json(
      createAPIResponse(true, { id: campaignId }, undefined, 'Campaign deleted successfully')
    );
  } catch (error) {
    console.error('DELETE /api/campaigns/[id] error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
