# Scratch TIX - Technical Specifications

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)  │  Mobile PWA  │  Embeddable Widgets   │
├─────────────────────────────────────────────────────────────┤
│                    API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Firebase Functions │  REST APIs   │  GraphQL (Optional)   │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Campaign Mgmt │ Prize Engine │ User Mgmt │ Analytics      │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  Firestore DB  │  Cloud Storage │  Firebase Auth │ Cache   │
├─────────────────────────────────────────────────────────────┤
│                    Integration Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Zapier │ Email APIs │ SMS APIs │ Social APIs │ Analytics   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Firebase Services Configuration

**Authentication:**
```javascript
// Firebase Auth Configuration
const authConfig = {
  providers: [
    'google.com',
    'facebook.com',
    'twitter.com',
    'email',
    'phone'
  ],
  settings: {
    enableMultiFactorAuth: true,
    sessionTimeout: 3600, // 1 hour
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true
    }
  }
};
```

**Firestore Database Structure:**
```javascript
// Database Schema
const firestoreSchema = {
  // Organizations (Multi-tenancy)
  organizations: {
    [orgId]: {
      name: 'string',
      plan: 'free|pro|enterprise',
      branding: {
        logo: 'string',
        primaryColor: 'string',
        secondaryColor: 'string',
        customDomain: 'string'
      },
      settings: {
        maxCampaigns: 'number',
        maxParticipants: 'number',
        features: ['array']
      },
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Users
  users: {
    [userId]: {
      email: 'string',
      displayName: 'string',
      photoURL: 'string',
      organizationId: 'string',
      role: 'admin|editor|viewer',
      permissions: ['array'],
      lastLogin: 'timestamp',
      createdAt: 'timestamp'
    }
  },

  // Campaigns
  campaigns: {
    [campaignId]: {
      organizationId: 'string',
      name: 'string',
      description: 'string',
      status: 'draft|active|paused|completed',
      type: 'scratch|coupon|voucher',
      
      // Design Configuration
      design: {
        template: 'string',
        backgroundImage: 'string',
        overlayImage: 'string',
        dimensions: { width: 'number', height: 'number' },
        elements: [{
          type: 'text|image|shape',
          properties: 'object',
          position: { x: 'number', y: 'number' }
        }]
      },

      // Prize Configuration
      prizes: [{
        id: 'string',
        name: 'string',
        description: 'string',
        image: 'string',
        value: 'string',
        probability: 'number', // 0-1
        maxWinners: 'number',
        currentWinners: 'number',
        isActive: 'boolean'
      }],

      // Game Settings
      gameSettings: {
        scratchPercentage: 'number', // 0-100
        enableSound: 'boolean',
        enableRetry: 'boolean',
        maxRetries: 'number',
        redirectUrl: 'string',
        showRules: 'boolean'
      },

      // Distribution Settings
      distribution: {
        channels: ['web', 'email', 'sms', 'social'],
        embedCode: 'string',
        shareUrls: 'object',
        restrictions: {
          uniqueEmail: 'boolean',
          uniquePhone: 'boolean',
          geoRestrictions: ['array'],
          ageRestrictions: 'object'
        }
      },

      // Analytics
      analytics: {
        totalViews: 'number',
        uniqueParticipants: 'number',
        totalWinners: 'number',
        conversionRate: 'number',
        lastUpdated: 'timestamp'
      },

      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      createdBy: 'string'
    }
  },

  // Participants
  participants: {
    [participantId]: {
      campaignId: 'string',
      email: 'string',
      phone: 'string',
      name: 'string',
      ipAddress: 'string',
      userAgent: 'string',
      deviceFingerprint: 'string',
      participatedAt: 'timestamp',
      hasWon: 'boolean',
      prizeWon: 'string',
      claimedAt: 'timestamp',
      validatedAt: 'timestamp'
    }
  },

  // Templates
  templates: {
    [templateId]: {
      name: 'string',
      category: 'string',
      thumbnail: 'string',
      design: 'object',
      isPublic: 'boolean',
      organizationId: 'string',
      usageCount: 'number',
      createdAt: 'timestamp'
    }
  }
};
```

## 2. Frontend Implementation Details

### 2.1 Next.js Project Structure

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (auth)/            # Auth group routes
│   ├── dashboard/         # Dashboard routes
│   ├── builder/           # Campaign builder
│   ├── embed/             # Embeddable widgets
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── builder/           # Builder-specific components
│   ├── scratch-card/      # Scratch card components
│   └── analytics/         # Analytics components
├── lib/
│   ├── firebase/          # Firebase configuration
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript definitions
├── styles/                # Global styles
└── public/                # Static assets
```

### 2.2 Scratch Card Implementation

**Core Scratch Card Component:**
```typescript
// components/scratch-card/ScratchCard.tsx
import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  width: number;
  height: number;
  backgroundImage: string;
  overlayImage: string;
  scratchPercentage: number;
  onComplete: (hasWon: boolean, prize?: Prize) => void;
  prizes: Prize[];
  winProbability: number;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  width,
  height,
  backgroundImage,
  overlayImage,
  scratchPercentage,
  onComplete,
  prizes,
  winProbability
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedArea, setScratchedArea] = useState(0);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  useEffect(() => {
    initializeCard();
    determineWinStatus();
  }, []);

  const initializeCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and draw background image
    const bgImage = new Image();
    bgImage.onload = () => {
      ctx.drawImage(bgImage, 0, 0, width, height);
      
      // Load and draw overlay
      const overlayImg = new Image();
      overlayImg.onload = () => {
        ctx.drawImage(overlayImg, 0, 0, width, height);
      };
      overlayImg.src = overlayImage;
    };
    bgImage.src = backgroundImage;
  };

  const determineWinStatus = () => {
    const random = Math.random();
    const won = random < winProbability;
    setHasWon(won);
    
    if (won && prizes.length > 0) {
      // Select prize based on probability distribution
      const selectedPrize = selectPrizeByProbability(prizes);
      setSelectedPrize(selectedPrize);
    }
  };

  const handleScratch = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || hasWon === null) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Create scratch effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Calculate scratched area
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const scratchedPercentage = (transparentPixels / (width * height)) * 100;
    setScratchedArea(scratchedPercentage);

    // Check if scratch threshold is reached
    if (scratchedPercentage >= scratchPercentage) {
      onComplete(hasWon, selectedPrize);
    }
  };

  return (
    <div className="scratch-card-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={() => setIsScratching(true)}
        onMouseUp={() => setIsScratching(false)}
        onMouseMove={isScratching ? handleScratch : undefined}
        onTouchStart={() => setIsScratching(true)}
        onTouchEnd={() => setIsScratching(false)}
        onTouchMove={isScratching ? handleScratch : undefined}
        className="cursor-pointer touch-none"
      />
      <div className="scratch-progress">
        Progress: {scratchedArea.toFixed(1)}%
      </div>
    </div>
  );
};
```

### 2.3 WYSIWYG Builder Implementation

**Builder Architecture:**
```typescript
// components/builder/CampaignBuilder.tsx
interface BuilderState {
  canvas: {
    width: number;
    height: number;
    elements: CanvasElement[];
    selectedElement: string | null;
  };
  properties: {
    prizes: Prize[];
    gameSettings: GameSettings;
    distribution: DistributionSettings;
  };
  preview: {
    mode: 'design' | 'preview';
    device: 'desktop' | 'mobile' | 'tablet';
  };
}

const CampaignBuilder: React.FC = () => {
  const [builderState, setBuilderState] = useState<BuilderState>(initialState);
  
  return (
    <div className="builder-layout">
      <ToolPalette onElementAdd={handleElementAdd} />
      <CanvasWorkspace 
        elements={builderState.canvas.elements}
        onElementSelect={handleElementSelect}
        onElementUpdate={handleElementUpdate}
      />
      <PropertiesPanel 
        selectedElement={builderState.canvas.selectedElement}
        onPropertyChange={handlePropertyChange}
      />
      <PreviewPanel 
        campaign={builderState}
        mode={builderState.preview.mode}
      />
    </div>
  );
};
```

## 3. Backend Implementation

### 3.1 Firebase Cloud Functions

**Campaign Management Functions:**
```typescript
// functions/src/campaigns.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

export const createCampaign = onCall(async (request) => {
  const { auth, data } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const db = getFirestore();
  
  try {
    const campaignData = {
      ...data,
      organizationId: auth.uid,
      status: 'draft',
      analytics: {
        totalViews: 0,
        uniqueParticipants: 0,
        totalWinners: 0,
        conversionRate: 0
      },
      createdAt: new Date(),
      createdBy: auth.uid
    };

    const docRef = await db.collection('campaigns').add(campaignData);
    
    return { 
      success: true, 
      campaignId: docRef.id 
    };
  } catch (error) {
    throw new HttpsError('internal', 'Failed to create campaign');
  }
});

export const participateInCampaign = onCall(async (request) => {
  const { data } = request;
  const { campaignId, participantData } = data;
  
  const db = getFirestore();
  
  try {
    // Validate participant uniqueness
    const existingParticipant = await db
      .collection('participants')
      .where('campaignId', '==', campaignId)
      .where('email', '==', participantData.email)
      .get();
    
    if (!existingParticipant.empty) {
      throw new HttpsError('already-exists', 'User already participated');
    }

    // Get campaign details
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    const campaign = campaignDoc.data();
    
    if (!campaign || campaign.status !== 'active') {
      throw new HttpsError('not-found', 'Campaign not found or inactive');
    }

    // Determine win status
    const winResult = await determineWinStatus(campaign);
    
    // Create participant record
    const participantRecord = {
      ...participantData,
      campaignId,
      participatedAt: new Date(),
      hasWon: winResult.hasWon,
      prizeWon: winResult.prize?.id || null,
      ipAddress: request.rawRequest.ip,
      userAgent: request.rawRequest.headers['user-agent']
    };

    await db.collection('participants').add(participantRecord);
    
    // Update campaign analytics
    await updateCampaignAnalytics(campaignId, winResult.hasWon);
    
    return {
      success: true,
      hasWon: winResult.hasWon,
      prize: winResult.prize
    };
  } catch (error) {
    throw new HttpsError('internal', 'Failed to process participation');
  }
});

async function determineWinStatus(campaign: any) {
  // Implement prize selection logic
  const totalProbability = campaign.prizes.reduce(
    (sum: number, prize: any) => sum + prize.probability, 0
  );
  
  const random = Math.random() * totalProbability;
  let cumulativeProbability = 0;
  
  for (const prize of campaign.prizes) {
    cumulativeProbability += prize.probability;
    if (random <= cumulativeProbability && prize.currentWinners < prize.maxWinners) {
      return { hasWon: true, prize };
    }
  }
  
  return { hasWon: false, prize: null };
}
```

### 3.2 API Endpoints

**REST API Structure:**
```typescript
// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const campaigns = await getCampaignsByOrganization(session.user.organizationId);
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const campaignData = await request.json();
    const campaign = await createCampaign({
      ...campaignData,
      organizationId: session.user.organizationId,
      createdBy: session.user.id
    });
    
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
```

## 4. Security Implementation

### 4.1 Firebase Security Rules

**Firestore Security Rules:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Organizations
    match /organizations/{orgId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Campaigns
    match /campaigns/{campaignId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.collaborators;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
    
    // Participants (read-only for campaign owners)
    match /participants/{participantId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/campaigns/$(resource.data.campaignId)) &&
        get(/databases/$(database)/documents/campaigns/$(resource.data.campaignId)).data.createdBy == request.auth.uid;
      allow create: if true; // Allow anonymous participation
    }
    
    // Templates
    match /templates/{templateId} {
      allow read: if resource.data.isPublic == true || 
        (request.auth != null && request.auth.uid == resource.data.createdBy);
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
  }
}
```

### 4.2 Input Validation and Sanitization

```typescript
// lib/validation.ts
import { z } from 'zod';
import DOMPurify from 'dompurify';

export const CampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  prizes: z.array(z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(200).optional(),
    probability: z.number().min(0).max(1),
    maxWinners: z.number().min(1).max(10000)
  })),
  gameSettings: z.object({
    scratchPercentage: z.number().min(10).max(100),
    enableSound: z.boolean(),
    enableRetry: z.boolean()
  })
});

export function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
}

export function validateCampaignData(data: unknown) {
  try {
    return CampaignSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid campaign data');
  }
}
```

## 5. Integration Framework

### 5.1 Webhook System

```typescript
// functions/src/webhooks.ts
export const sendWebhook = onCall(async (request) => {
  const { webhookUrl, event, data } = request.data;
  
  const payload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    signature: generateSignature(data)
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ScratchTix-Signature': payload.signature
      },
      body: JSON.stringify(payload)
    });
    
    return { success: response.ok, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function generateSignature(data: any): string {
  const crypto = require('crypto');
  const secret = process.env.WEBHOOK_SECRET;
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('hex');
}
```

### 5.2 Embeddable Widget

```typescript
// public/widget.js
(function() {
  'use strict';
  
  window.ScratchTix = {
    embed: function(containerId, options) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('Container not found:', containerId);
        return;
      }
      
      const iframe = document.createElement('iframe');
      iframe.src = `${options.baseUrl || 'https://scratchtix.com'}/embed/${options.campaignId}`;
      iframe.width = options.width || '400';
      iframe.height = options.height || '600';
      iframe.frameBorder = '0';
      iframe.style.border = 'none';
      
      container.appendChild(iframe);
      
      // Handle iframe messages
      window.addEventListener('message', function(event) {
        if (event.origin !== (options.baseUrl || 'https://scratchtix.com')) return;
        
        if (event.data.type === 'scratch-complete') {
          if (options.onComplete) {
            options.onComplete(event.data.result);
          }
        }
      });
    }
  };
})();
```

This technical specification provides the detailed implementation framework for the Scratch TIX platform, covering all major technical aspects from database design to security implementation and integration capabilities.
