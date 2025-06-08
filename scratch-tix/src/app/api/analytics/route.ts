import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

const AnalyticsQuerySchema = z.object({
  campaignId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  metrics: z.array(z.enum([
    'participants',
    'winners',
    'conversionRate',
    'revenue',
    'engagementRate',
    'averageSessionTime',
    'bounceRate',
    'shareRate',
    'deviceBreakdown',
    'performanceMetrics',
    'userBehavior',
    'prizeDistribution'
  ])).optional(),
  groupBy: z.array(z.enum(['campaign', 'device', 'location', 'prize', 'date'])).optional(),
});

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalParticipants: 15847,
    totalWinners: 1902,
    totalRevenue: 158470,
    averageConversionRate: 12.0,
    averageEngagementTime: 45.3,
    averageBounceRate: 23.5,
    averageShareRate: 8.7,
  },
  timeSeries: {
    daily: [
      { date: '2024-01-01', participants: 234, winners: 28, revenue: 2340 },
      { date: '2024-01-02', participants: 189, winners: 23, revenue: 1890 },
      { date: '2024-01-03', participants: 267, winners: 32, revenue: 2670 },
      { date: '2024-01-04', participants: 198, winners: 24, revenue: 1980 },
      { date: '2024-01-05', participants: 312, winners: 37, revenue: 3120 },
    ],
    hourly: [
      { hour: '00:00', participants: 12, winners: 1, revenue: 120 },
      { hour: '01:00', participants: 8, winners: 1, revenue: 80 },
      { hour: '02:00', participants: 5, winners: 0, revenue: 50 },
      { hour: '03:00', participants: 3, winners: 0, revenue: 30 },
      { hour: '04:00', participants: 7, winners: 1, revenue: 70 },
    ],
  },
  devices: {
    mobile: { participants: 10776, winners: 1294, percentage: 68 },
    tablet: { participants: 2852, winners: 342, percentage: 18 },
    desktop: { participants: 2219, winners: 266, percentage: 14 },
  },
  locations: {
    countries: [
      { country: 'United States', participants: 7923, winners: 951, percentage: 50 },
      { country: 'Canada', participants: 1585, winners: 190, percentage: 10 },
      { country: 'United Kingdom', participants: 1427, winners: 171, percentage: 9 },
      { country: 'Australia', participants: 1109, winners: 133, percentage: 7 },
      { country: 'Germany', participants: 950, winners: 114, percentage: 6 },
    ],
    regions: [
      { region: 'North America', participants: 9508, winners: 1141, percentage: 60 },
      { region: 'Europe', participants: 3169, winners: 380, percentage: 20 },
      { region: 'Asia Pacific', participants: 2377, winners: 285, percentage: 15 },
      { region: 'Other', participants: 793, winners: 95, percentage: 5 },
    ],
  },
  performance: {
    averageLoadTime: 1.2,
    averageFrameRate: 58.4,
    mobilePerformanceScore: 94,
    accessibilityScore: 96,
    errorRate: 0.1,
    crashRate: 0.02,
  },
  userBehavior: {
    averageTimeToFirstScratch: 3.2,
    averageScratchStrokes: 28.5,
    averageCompletionRate: 87.3,
    averageReturnRate: 34.2,
    engagementPatterns: [
      { pattern: 'Quick Scratcher', percentage: 45, description: 'Completes in under 10 seconds' },
      { pattern: 'Methodical Scratcher', percentage: 35, description: 'Takes 30-60 seconds' },
      { pattern: 'Hesitant Scratcher', percentage: 20, description: 'Takes over 60 seconds' },
    ],
  },
  prizeDistribution: [
    { prizeId: 'prize_1', name: '50% Off Coupon', winners: 890, percentage: 46.8, value: '$25' },
    { prizeId: 'prize_2', name: 'Free Shipping', winners: 534, percentage: 28.1, value: '$10' },
    { prizeId: 'prize_3', name: '20% Off Coupon', winners: 356, percentage: 18.7, value: '$15' },
    { prizeId: 'prize_4', name: 'Free Product', winners: 122, percentage: 6.4, value: '$50' },
  ],
  realTime: {
    activeUsers: 127,
    currentSessions: 89,
    winningsInLastHour: 23,
    topPerformingCampaign: 'Summer Sale Scratch Card',
    recentWinners: [
      { userId: 'user_123', prize: '50% Off Coupon', timestamp: '2024-01-08T15:30:00Z' },
      { userId: 'user_456', prize: 'Free Shipping', timestamp: '2024-01-08T15:28:00Z' },
      { userId: 'user_789', prize: '20% Off Coupon', timestamp: '2024-01-08T15:25:00Z' },
    ],
  },
};

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

function filterAnalyticsByDateRange(data: any, startDate?: string, endDate?: string) {
  // In production, this would filter the actual data based on date range
  return data;
}

function aggregateAnalyticsByGranularity(data: any, granularity: string) {
  // In production, this would aggregate data based on the specified granularity
  switch (granularity) {
    case 'hour':
      return data.timeSeries.hourly;
    case 'day':
      return data.timeSeries.daily;
    case 'week':
    case 'month':
      // Would implement weekly/monthly aggregation
      return data.timeSeries.daily;
    default:
      return data.timeSeries.daily;
  }
}

function selectMetrics(data: any, metrics?: string[]) {
  if (!metrics || metrics.length === 0) {
    return data;
  }

  const selectedData: any = {};
  
  metrics.forEach(metric => {
    switch (metric) {
      case 'participants':
      case 'winners':
      case 'conversionRate':
      case 'revenue':
      case 'engagementRate':
      case 'averageSessionTime':
      case 'bounceRate':
      case 'shareRate':
        selectedData[metric] = data.overview[`total${metric.charAt(0).toUpperCase() + metric.slice(1)}`] || 
                                data.overview[`average${metric.charAt(0).toUpperCase() + metric.slice(1)}`];
        break;
      case 'deviceBreakdown':
        selectedData.devices = data.devices;
        break;
      case 'performanceMetrics':
        selectedData.performance = data.performance;
        break;
      case 'userBehavior':
        selectedData.userBehavior = data.userBehavior;
        break;
      case 'prizeDistribution':
        selectedData.prizeDistribution = data.prizeDistribution;
        break;
    }
  });

  return selectedData;
}

// GET /api/analytics - Get analytics data
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
    
    // Handle metrics array parameter
    if (queryParams.metrics) {
      queryParams.metrics = queryParams.metrics.split(',');
    }
    if (queryParams.groupBy) {
      queryParams.groupBy = queryParams.groupBy.split(',');
    }
    
    const query = AnalyticsQuerySchema.parse(queryParams);

    // Get analytics data
    let analyticsData = { ...mockAnalyticsData };

    // Apply date range filter
    if (query.startDate || query.endDate) {
      analyticsData = filterAnalyticsByDateRange(analyticsData, query.startDate, query.endDate);
    }

    // Apply granularity
    const timeSeriesData = aggregateAnalyticsByGranularity(analyticsData, query.granularity);

    // Select specific metrics if requested
    if (query.metrics) {
      analyticsData = selectMetrics(analyticsData, query.metrics);
    }

    // Add time series data
    analyticsData.timeSeries = timeSeriesData;

    // Add query metadata
    const responseData = {
      ...analyticsData,
      query: {
        campaignId: query.campaignId,
        dateRange: {
          start: query.startDate,
          end: query.endDate,
        },
        granularity: query.granularity,
        metrics: query.metrics,
        groupBy: query.groupBy,
      },
    };

    return NextResponse.json(
      createAPIResponse(true, responseData, undefined, 'Analytics data retrieved successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Validation error', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('GET /api/analytics error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// POST /api/analytics - Submit analytics event
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

    const body = await request.json();
    
    // Validate event data
    const eventSchema = z.object({
      type: z.enum(['scratch_start', 'scratch_stroke', 'scratch_complete', 'prize_reveal', 'share_action', 'exit_intent']),
      campaignId: z.string(),
      sessionId: z.string(),
      userId: z.string().optional(),
      data: z.record(z.any()),
      timestamp: z.string().datetime().optional(),
    });

    const event = eventSchema.parse(body);

    // Add server timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }

    // In production, store event in analytics database
    console.log('Analytics event received:', event);

    return NextResponse.json(
      createAPIResponse(true, { eventId: `event_${Date.now()}` }, undefined, 'Analytics event recorded successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Validation error', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('POST /api/analytics error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
