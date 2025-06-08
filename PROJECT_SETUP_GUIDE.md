# Scratch TIX - Project Setup Guide

## 1. Prerequisites and Environment Setup

### 1.1 Required Software
- **Node.js**: Version 18.0 or higher
- **npm/yarn**: Latest version
- **Git**: For version control
- **Firebase CLI**: `npm install -g firebase-tools`
- **VS Code**: Recommended IDE with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Firebase Explorer
  - TypeScript Importer

### 1.2 Development Environment
```bash
# Check Node.js version
node --version  # Should be 18.0+

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

## 2. Project Initialization

### 2.1 Create Next.js Project
```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest scratch-tix --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project directory
cd scratch-tix

# Install additional dependencies
npm install firebase firebase-admin
npm install @types/node @types/react @types/react-dom
npm install framer-motion react-hook-form @hookform/resolvers
npm install zod dompurify @types/dompurify
npm install fabric konva react-konva
npm install recharts date-fns
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react class-variance-authority clsx tailwind-merge

# Development dependencies
npm install -D @types/fabric jest @testing-library/react @testing-library/jest-dom
npm install -D cypress eslint-config-prettier prettier
```

### 2.2 Firebase Project Setup
```bash
# Initialize Firebase in project
firebase init

# Select the following options:
# - Firestore: Configure security rules and indexes
# - Functions: Configure Cloud Functions
# - Hosting: Configure hosting
# - Storage: Configure Cloud Storage security rules
# - Emulators: Set up local emulators

# Project structure after initialization:
# ├── firebase.json
# ├── firestore.rules
# ├── firestore.indexes.json
# ├── storage.rules
# └── functions/
```

### 2.3 Environment Configuration
Create `.env.local` file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# External APIs
ZAPIER_WEBHOOK_URL=your_zapier_webhook
MAILCHIMP_API_KEY=your_mailchimp_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Security
WEBHOOK_SECRET=your_webhook_secret
ENCRYPTION_KEY=your_encryption_key
```

## 3. Project Structure Setup

### 3.1 Directory Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── analytics/
│   │   └── settings/
│   ├── builder/
│   │   └── [campaignId]/
│   ├── embed/
│   │   └── [campaignId]/
│   ├── api/
│   │   ├── campaigns/
│   │   ├── participants/
│   │   └── webhooks/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── index.ts
│   ├── builder/
│   │   ├── canvas-workspace.tsx
│   │   ├── element-palette.tsx
│   │   ├── properties-panel.tsx
│   │   └── preview-panel.tsx
│   ├── scratch-card/
│   │   ├── scratch-card.tsx
│   │   ├── prize-reveal.tsx
│   │   └── game-controls.tsx
│   ├── analytics/
│   │   ├── dashboard.tsx
│   │   ├── charts.tsx
│   │   └── export-tools.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── storage.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-campaigns.ts
│   │   └── use-analytics.ts
│   └── types/
│       ├── campaign.ts
│       ├── user.ts
│       └── analytics.ts
├── styles/
│   └── globals.css
└── public/
    ├── templates/
    ├── icons/
    └── widget.js
```

### 3.2 Core Configuration Files

**Firebase Configuration (`lib/firebase/config.ts`):**
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
```

**Tailwind Configuration (`tailwind.config.js`):**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "scratch-reveal": {
          "0%": { opacity: 0, transform: "scale(0.8)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scratch-reveal": "scratch-reveal 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## 4. Firebase Configuration

### 4.1 Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users for their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Organizations - only owners can modify
    match /organizations/{orgId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Campaigns - organization members can read, creators can write
    match /campaigns/{campaignId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.createdBy;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
    
    // Participants - allow creation for participation, read for campaign owners
    match /participants/{participantId} {
      allow create: if true; // Allow anonymous participation
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/campaigns/$(resource.data.campaignId)) &&
        get(/databases/$(database)/documents/campaigns/$(resource.data.campaignId)).data.createdBy == request.auth.uid;
    }
    
    // Templates - public templates readable by all, private by creators only
    match /templates/{templateId} {
      allow read: if resource.data.isPublic == true || 
        (request.auth != null && request.auth.uid == resource.data.createdBy);
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
  }
}
```

### 4.2 Storage Security Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Campaign assets - only campaign creators can upload
    match /campaigns/{campaignId}/{allPaths=**} {
      allow read: if true; // Public read for campaign assets
      allow write: if request.auth != null && 
        firestore.exists(/databases/(default)/documents/campaigns/$(campaignId)) &&
        firestore.get(/databases/(default)/documents/campaigns/$(campaignId)).data.createdBy == request.auth.uid;
    }
    
    // User uploads - only authenticated users for their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Templates - public read, authenticated write
    match /templates/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Development Workflow

### 5.1 Local Development Setup
```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start Next.js development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### 5.2 Git Workflow
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create development branch
git checkout -b develop

# Feature branch workflow
git checkout -b feature/campaign-builder
# Make changes
git add .
git commit -m "Add campaign builder interface"
git push origin feature/campaign-builder

# Create pull request for review
```

### 5.3 Testing Setup
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

## 6. Deployment Configuration

### 6.1 Firebase Hosting Configuration
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 6.2 GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 7. Monitoring and Analytics Setup

### 7.1 Firebase Analytics Configuration
```typescript
// lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';
import app from './firebase/config';

const analytics = getAnalytics(app);

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined') {
    logEvent(analytics, eventName, parameters);
  }
};

export const trackCampaignCreated = (campaignId: string) => {
  trackEvent('campaign_created', { campaign_id: campaignId });
};

export const trackScratchCardPlayed = (campaignId: string, hasWon: boolean) => {
  trackEvent('scratch_card_played', { 
    campaign_id: campaignId, 
    has_won: hasWon 
  });
};
```

### 7.2 Error Monitoring Setup
```bash
# Install Sentry for error tracking
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

This setup guide provides a comprehensive foundation for starting the Scratch TIX project with all necessary configurations, dependencies, and development workflows in place.
