import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';

// API Response types
interface APIResponse<T = any> {
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

// Campaign validation schemas
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
    id: z.string(),
    name: z.string(),
    description: z.string(),
    value: z.string(),
    probability: z.number().min(0).max(1),
    maxWinners: z.number().min(1),
    imageUrl: z.string().url().optional(),
  })),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    logo: z.string().url().optional(),
    backgroundImage: z.string().url().optional(),
  }).optional(),
});

const UpdateCampaignSchema = CreateCampaignSchema.partial();

const QuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).optional(),
  type: z.enum(['scratch', 'coupon', 'voucher']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'participants']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Mock database - In production, this would be replaced with actual database calls
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
      },
    ],
  },
  {
    id: '2',
    name: 'Holiday Promotion',
    description: 'Special holiday campaign',
    type: 'coupon',
    status: 'completed',
    template: 'festive-red',
    organizationId: 'org_1',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    settings: {
      scratchPercentage: 25,
      winProbability: 0.25,
      maxParticipants: 2000,
      enableSound: true,
      enableHaptics: false,
      enableParticles: true,
    },
    analytics: {
      participants: 2891,
      winners: 347,
      conversionRate: 12.0,
      revenue: 28910,
    },
    prizes: [],
  },
];

// Utility functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createAPIResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  pagination?: APIResponse['pagination']
): APIResponse<T> {
  return {
    success,
    data,
    error,
    message,
    pagination,
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
  
  // In production, validate against database
  if (apiKey === 'sk_test_12345' || authHeader === 'Bearer sk_test_12345') {
    return { valid: true, organizationId: 'org_1' };
  }
  
  return { valid: false };
}

function filterCampaignsByOrganization(campaigns: any[], organizationId: string) {
  return campaigns.filter(campaign => campaign.organizationId === organizationId);
}

function applyCampaignFilters(campaigns: any[], query: any) {
  let filtered = [...campaigns];
  
  if (query.status) {
    filtered = filtered.filter(campaign => campaign.status === query.status);
  }
  
  if (query.type) {
    filtered = filtered.filter(campaign => campaign.type === query.type);
  }
  
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = filtered.filter(campaign => 
      campaign.name.toLowerCase().includes(searchLower) ||
      campaign.description?.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort
  filtered.sort((a, b) => {
    const aValue = a[query.sortBy];
    const bValue = b[query.sortBy];
    
    if (query.sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
  
  return filtered;
}

function paginateResults(items: any[], page: number, limit: number) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

// GET /api/campaigns - List campaigns
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const auth = validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid API key', 'Authentication failed'),
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const query = QuerySchema.parse(queryParams);

    // Filter campaigns by organization
    let campaigns = filterCampaignsByOrganization(mockCampaigns, auth.organizationId!);
    
    // Apply filters
    campaigns = applyCampaignFilters(campaigns, query);
    
    // Paginate results
    const { items, pagination } = paginateResults(campaigns, query.page, query.limit);

    return NextResponse.json(
      createAPIResponse(true, items, undefined, 'Campaigns retrieved successfully', pagination)
    );
  } catch (error) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create campaign
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const auth = validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid API key', 'Authentication failed'),
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const campaignData = CreateCampaignSchema.parse(body);

    // Create new campaign
    const newCampaign = {
      id: `campaign_${Date.now()}`,
      ...campaignData,
      status: 'draft',
      organizationId: auth.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analytics: {
        participants: 0,
        winners: 0,
        conversionRate: 0,
        revenue: 0,
      },
    };

    // In production, save to database
    mockCampaigns.push(newCampaign);

    return NextResponse.json(
      createAPIResponse(true, newCampaign, undefined, 'Campaign created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Validation error', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('POST /api/campaigns error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// PUT /api/campaigns - Bulk update campaigns
export async function PUT(request: NextRequest) {
  try {
    // Validate API key
    const auth = validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid API key', 'Authentication failed'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campaignIds, updates } = body;

    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid campaign IDs'),
        { status: 400 }
      );
    }

    const validatedUpdates = UpdateCampaignSchema.parse(updates);

    // In production, perform bulk update in database
    const updatedCampaigns = mockCampaigns
      .filter(campaign => 
        campaignIds.includes(campaign.id) && 
        campaign.organizationId === auth.organizationId
      )
      .map(campaign => ({
        ...campaign,
        ...validatedUpdates,
        updatedAt: new Date().toISOString(),
      }));

    return NextResponse.json(
      createAPIResponse(true, updatedCampaigns, undefined, `${updatedCampaigns.length} campaigns updated successfully`)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Validation error', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('PUT /api/campaigns error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns - Bulk delete campaigns
export async function DELETE(request: NextRequest) {
  try {
    // Validate API key
    const auth = validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid API key', 'Authentication failed'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campaignIds } = body;

    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Invalid campaign IDs'),
        { status: 400 }
      );
    }

    // In production, perform soft delete in database
    const deletedCount = campaignIds.length;

    return NextResponse.json(
      createAPIResponse(true, { deletedCount }, undefined, `${deletedCount} campaigns deleted successfully`)
    );
  } catch (error) {
    console.error('DELETE /api/campaigns error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
