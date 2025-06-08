import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

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

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  organizationId: string;
  campaignId?: string;
  timestamp: string;
  attempts: number;
  status: 'pending' | 'delivered' | 'failed';
  lastAttempt?: string;
  nextAttempt?: string;
}

const CreateWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum([
    'campaign.created',
    'campaign.updated',
    'campaign.deleted',
    'campaign.started',
    'campaign.paused',
    'campaign.completed',
    'participant.joined',
    'participant.won',
    'participant.lost',
    'prize.awarded',
    'analytics.milestone',
    'system.error'
  ])),
  secret: z.string().min(16).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateWebhookSchema = CreateWebhookSchema.partial();

// Mock webhook storage
const mockWebhooks: WebhookEndpoint[] = [
  {
    id: 'webhook_1',
    url: 'https://api.example.com/webhooks/scratch-tix',
    events: ['participant.won', 'participant.lost'],
    secret: 'whsec_1234567890abcdef',
    isActive: true,
    organizationId: 'org_1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    metadata: {
      description: 'Main webhook for prize notifications',
    },
  },
];

const mockWebhookEvents: WebhookEvent[] = [];

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
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

function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

async function deliverWebhook(webhook: WebhookEndpoint, event: WebhookEvent): Promise<boolean> {
  try {
    const payload = JSON.stringify({
      id: event.id,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
      organizationId: event.organizationId,
      campaignId: event.campaignId,
    });

    const signature = generateWebhookSignature(payload, webhook.secret);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Scratch-TIX-Signature': `sha256=${signature}`,
        'X-Scratch-TIX-Event-Type': event.type,
        'X-Scratch-TIX-Event-ID': event.id,
        'User-Agent': 'Scratch-TIX-Webhooks/1.0',
      },
      body: payload,
    });

    return response.ok;
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    return false;
  }
}

async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  // Find all webhooks that should receive this event
  const relevantWebhooks = mockWebhooks.filter(
    webhook => 
      webhook.isActive &&
      webhook.organizationId === event.organizationId &&
      webhook.events.includes(event.type)
  );

  // Deliver to each webhook
  for (const webhook of relevantWebhooks) {
    const delivered = await deliverWebhook(webhook, event);
    
    if (delivered) {
      event.status = 'delivered';
      event.lastAttempt = new Date().toISOString();
    } else {
      event.attempts++;
      event.status = 'failed';
      event.lastAttempt = new Date().toISOString();
      
      // Schedule retry (exponential backoff)
      const retryDelay = Math.min(300000, Math.pow(2, event.attempts) * 1000); // Max 5 minutes
      event.nextAttempt = new Date(Date.now() + retryDelay).toISOString();
    }
  }
}

// GET /api/webhooks - List webhooks
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

    // Filter webhooks by organization
    const webhooks = mockWebhooks.filter(
      webhook => webhook.organizationId === auth.organizationId
    );

    return NextResponse.json(
      createAPIResponse(true, webhooks, undefined, 'Webhooks retrieved successfully')
    );
  } catch (error) {
    console.error('GET /api/webhooks error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create webhook
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

    // Parse and validate request body
    const body = await request.json();
    const webhookData = CreateWebhookSchema.parse(body);

    // Generate secret if not provided
    const secret = webhookData.secret || generateWebhookSecret();

    // Create new webhook
    const newWebhook: WebhookEndpoint = {
      id: `webhook_${Date.now()}`,
      url: webhookData.url,
      events: webhookData.events,
      secret,
      isActive: true,
      organizationId: auth.organizationId!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: webhookData.metadata,
    };

    // In production, save to database
    mockWebhooks.push(newWebhook);

    // Test webhook endpoint
    try {
      const testEvent = {
        id: `test_${Date.now()}`,
        type: 'webhook.test',
        data: { message: 'Webhook endpoint test' },
        organizationId: auth.organizationId!,
        timestamp: new Date().toISOString(),
        attempts: 0,
        status: 'pending' as const,
      };

      await deliverWebhook(newWebhook, testEvent);
    } catch (testError) {
      console.warn('Webhook test delivery failed:', testError);
    }

    return NextResponse.json(
      createAPIResponse(true, newWebhook, undefined, 'Webhook created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Validation error', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('POST /api/webhooks error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// PUT /api/webhooks/[id] - Update webhook
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

    // Extract webhook ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const webhookId = pathParts[pathParts.length - 1];

    // Find webhook
    const webhookIndex = mockWebhooks.findIndex(
      w => w.id === webhookId && w.organizationId === auth.organizationId
    );

    if (webhookIndex === -1) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Webhook not found'),
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const updates = UpdateWebhookSchema.parse(body);

    // Update webhook
    const updatedWebhook = {
      ...mockWebhooks[webhookIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockWebhooks[webhookIndex] = updatedWebhook;

    return NextResponse.json(
      createAPIResponse(true, updatedWebhook, undefined, 'Webhook updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Validation error', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('PUT /api/webhooks error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks/[id] - Delete webhook
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

    // Extract webhook ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const webhookId = pathParts[pathParts.length - 1];

    // Find webhook
    const webhookIndex = mockWebhooks.findIndex(
      w => w.id === webhookId && w.organizationId === auth.organizationId
    );

    if (webhookIndex === -1) {
      return NextResponse.json(
        createAPIResponse(false, null, 'Webhook not found'),
        { status: 404 }
      );
    }

    // Remove webhook
    mockWebhooks.splice(webhookIndex, 1);

    return NextResponse.json(
      createAPIResponse(true, { id: webhookId }, undefined, 'Webhook deleted successfully')
    );
  } catch (error) {
    console.error('DELETE /api/webhooks error:', error);
    return NextResponse.json(
      createAPIResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

// Utility function to trigger webhook events (used by other parts of the application)
export async function triggerWebhookEvent(
  type: string,
  data: Record<string, any>,
  organizationId: string,
  campaignId?: string
): Promise<void> {
  const event: WebhookEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    organizationId,
    campaignId,
    timestamp: new Date().toISOString(),
    attempts: 0,
    status: 'pending',
  };

  mockWebhookEvents.push(event);
  await processWebhookEvent(event);
}
