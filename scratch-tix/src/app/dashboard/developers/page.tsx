'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  Code, 
  Key, 
  Book, 
  Zap, 
  Copy, 
  Check,
  ExternalLink,
  Download,
  Play,
  Settings,
  Globe,
  Webhook,
  Database,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DevelopersPage() {
  const { userData, organization } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const apiKey = 'sk_test_12345...'; // In production, this would be generated
  const webhookSecret = 'whsec_1234567890abcdef...';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    javascript: `// Install the SDK
npm install @scratchtix/sdk

// Initialize the SDK
import ScratchTIXSDK from '@scratchtix/sdk';

const sdk = new ScratchTIXSDK({
  apiKey: '${apiKey}',
  baseUrl: 'https://api.scratchtix.com/v1'
});

// Create a campaign
const campaign = await sdk.createCampaign({
  name: 'Summer Sale Scratch Card',
  type: 'scratch',
  template: 'modern-blue',
  settings: {
    scratchPercentage: 30,
    winProbability: 0.3,
    enableSound: true,
    enableHaptics: true,
    enableParticles: true
  },
  prizes: [
    {
      name: '50% Off Coupon',
      description: 'Get 50% off your next purchase',
      value: '$25',
      probability: 0.2,
      maxWinners: 100
    }
  ]
});

// Embed widget in your page
const widget = new ScratchTIXWidget(
  'scratch-container',
  campaign.id,
  { apiKey: '${apiKey}' }
);

await widget.render({
  width: 400,
  height: 300,
  theme: 'light'
});`,

    curl: `# Create a campaign
curl -X POST https://api.scratchtix.com/v1/campaigns \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Sale Scratch Card",
    "type": "scratch",
    "template": "modern-blue",
    "settings": {
      "scratchPercentage": 30,
      "winProbability": 0.3,
      "enableSound": true,
      "enableHaptics": true,
      "enableParticles": true
    },
    "prizes": [
      {
        "name": "50% Off Coupon",
        "description": "Get 50% off your next purchase",
        "value": "$25",
        "probability": 0.2,
        "maxWinners": 100
      }
    ]
  }'

# Get campaign analytics
curl -X GET "https://api.scratchtix.com/v1/analytics?campaignId=campaign_123" \\
  -H "Authorization: Bearer ${apiKey}"`,

    python: `# Install the SDK
pip install scratchtix-python

# Initialize the SDK
from scratchtix import ScratchTIXSDK

sdk = ScratchTIXSDK(api_key='${apiKey}')

# Create a campaign
campaign = sdk.campaigns.create({
    'name': 'Summer Sale Scratch Card',
    'type': 'scratch',
    'template': 'modern-blue',
    'settings': {
        'scratch_percentage': 30,
        'win_probability': 0.3,
        'enable_sound': True,
        'enable_haptics': True,
        'enable_particles': True
    },
    'prizes': [
        {
            'name': '50% Off Coupon',
            'description': 'Get 50% off your next purchase',
            'value': '$25',
            'probability': 0.2,
            'max_winners': 100
        }
    ]
})

# Get analytics
analytics = sdk.analytics.get(campaign_id=campaign.id)
print(f"Participants: {analytics.participants}")
print(f"Winners: {analytics.winners}")`,

    webhook: `// Webhook endpoint example (Node.js/Express)
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Verify webhook signature
function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === \`sha256=\${expectedSignature}\`;
}

app.post('/webhooks/scratchtix', (req, res) => {
  const signature = req.headers['x-scratch-tix-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature, '${webhookSecret}')) {
    return res.status(401).send('Invalid signature');
  }
  
  const { type, data } = req.body;
  
  switch (type) {
    case 'participant.won':
      console.log('Winner!', data);
      // Send congratulations email
      // Update your database
      // Trigger other actions
      break;
      
    case 'participant.lost':
      console.log('Better luck next time', data);
      // Send encouragement email
      break;
      
    case 'campaign.completed':
      console.log('Campaign finished', data);
      // Generate final report
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000);`
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/campaigns',
      description: 'List all campaigns',
      params: 'page, limit, status, type, search',
    },
    {
      method: 'POST',
      path: '/campaigns',
      description: 'Create a new campaign',
      params: 'name, type, template, settings, prizes',
    },
    {
      method: 'GET',
      path: '/campaigns/{id}',
      description: 'Get campaign details',
      params: 'id (path parameter)',
    },
    {
      method: 'PUT',
      path: '/campaigns/{id}',
      description: 'Update campaign',
      params: 'id (path parameter), updates',
    },
    {
      method: 'DELETE',
      path: '/campaigns/{id}',
      description: 'Delete campaign',
      params: 'id (path parameter)',
    },
    {
      method: 'GET',
      path: '/analytics',
      description: 'Get analytics data',
      params: 'campaignId, startDate, endDate, granularity',
    },
    {
      method: 'POST',
      path: '/webhooks',
      description: 'Create webhook endpoint',
      params: 'url, events, secret',
    },
  ];

  const webhookEvents = [
    'campaign.created',
    'campaign.updated', 
    'campaign.started',
    'campaign.completed',
    'participant.joined',
    'participant.won',
    'participant.lost',
    'prize.awarded',
    'analytics.milestone',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Portal</h1>
          <p className="text-gray-600">
            Integrate Scratch TIX into your applications with our powerful APIs and SDKs
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Book className="w-4 h-4 mr-2" />
            Documentation
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download SDK
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Calls</p>
              <p className="text-2xl font-bold text-gray-900">12,847</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Webhooks</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Webhook className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rate Limit</p>
              <p className="text-2xl font-bold text-gray-900">1000/hr</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
            </div>
            <Database className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            API Keys
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production API Key
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  sk_live_••••••••••••••••••••••••••••••••
                </code>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test API Key
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {apiKey}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(apiKey, 'test-key')}
                >
                  {copiedCode === 'test-key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">🔒 Security Best Practices</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Never expose API keys in client-side code</li>
              <li>• Use environment variables to store keys</li>
              <li>• Rotate keys regularly</li>
              <li>• Use test keys for development</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Quick Start', icon: Play },
              { id: 'endpoints', name: 'API Reference', icon: Code },
              { id: 'webhooks', name: 'Webhooks', icon: Webhook },
              { id: 'examples', name: 'Code Examples', icon: Book },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Quick Start Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Started in 3 Steps</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Install the SDK</h4>
                      <p className="text-gray-600 mb-2">Choose your preferred language and install our SDK</p>
                      <div className="bg-gray-100 p-3 rounded">
                        <code className="text-sm">npm install @scratchtix/sdk</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Initialize with your API key</h4>
                      <p className="text-gray-600 mb-2">Set up the SDK with your API credentials</p>
                      <div className="bg-gray-100 p-3 rounded">
                        <code className="text-sm">const sdk = new ScratchTIXSDK({{ apiKey: '{apiKey}' }});</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Create your first campaign</h4>
                      <p className="text-gray-600 mb-2">Start building engaging scratch card experiences</p>
                      <div className="bg-gray-100 p-3 rounded">
                        <code className="text-sm">const campaign = await sdk.createCampaign({{ ... }});</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">📚 Documentation</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Comprehensive guides and API reference
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">🎮 Interactive Demo</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Try our API in the browser
                  </p>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* API Reference Tab */}
          {activeTab === 'endpoints' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
                <p className="text-gray-600 mb-6">
                  Base URL: <code className="bg-gray-100 px-2 py-1 rounded">https://api.scratchtix.com/v1</code>
                </p>
              </div>

              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm">{endpoint.path}</code>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{endpoint.description}</p>
                    <p className="text-xs text-gray-500">
                      <strong>Parameters:</strong> {endpoint.params}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Events</h3>
                <p className="text-gray-600 mb-6">
                  Receive real-time notifications when events occur in your campaigns.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Available Events</h4>
                  <div className="space-y-2">
                    {webhookEvents.map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <code className="text-sm">{event}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Webhook Security</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Secret:</strong>
                    </p>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {webhookSecret}
                    </code>
                    <p className="text-xs text-gray-500 mt-2">
                      Use this secret to verify webhook signatures
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Example Webhook Handler</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{codeExamples.webhook}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Code Examples Tab */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Examples</h3>
                <p className="text-gray-600 mb-6">
                  Ready-to-use code snippets in multiple programming languages.
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(codeExamples).filter(([key]) => key !== 'webhook').map(([language, code]) => (
                  <div key={language}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">{language}</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(code, language)}
                      >
                        {copiedCode === language ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
