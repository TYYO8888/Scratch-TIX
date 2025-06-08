'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Settings, 
  Check, 
  X,
  Mail,
  Share2,
  ShoppingCart,
  Users,
  BarChart3,
  Webhook,
  ExternalLink,
  AlertCircle,
  Zap
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ecommerce' | 'crm' | 'analytics' | 'webhook';
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  icon: string;
  features: string[];
  isPopular?: boolean;
  lastSync?: string;
  config?: Record<string, any>;
}

const availableIntegrations: Integration[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    type: 'email',
    provider: 'mailchimp',
    status: 'connected',
    description: 'Sync winners and participants to your Mailchimp lists automatically',
    icon: '🐵',
    features: ['Auto-sync contacts', 'Segmentation', 'Email automation'],
    isPopular: true,
    lastSync: '2024-01-08T15:30:00Z',
    config: { listId: 'abc123', apiKey: '••••••••' },
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    type: 'email',
    provider: 'klaviyo',
    status: 'disconnected',
    description: 'Advanced email marketing with behavioral triggers',
    icon: '📧',
    features: ['Behavioral triggers', 'Advanced segmentation', 'A/B testing'],
    isPopular: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    type: 'social',
    provider: 'facebook',
    status: 'connected',
    description: 'Share winners and promote campaigns on Facebook',
    icon: '📘',
    features: ['Auto-posting', 'Story sharing', 'Page management'],
    lastSync: '2024-01-08T14:20:00Z',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    type: 'social',
    provider: 'instagram',
    status: 'error',
    description: 'Share campaign content and winner announcements',
    icon: '📷',
    features: ['Story posting', 'Feed posts', 'Hashtag automation'],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    type: 'ecommerce',
    provider: 'shopify',
    status: 'disconnected',
    description: 'Integrate with your Shopify store for seamless promotions',
    icon: '🛍️',
    features: ['Product sync', 'Discount codes', 'Customer data'],
    isPopular: true,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    type: 'crm',
    provider: 'hubspot',
    status: 'disconnected',
    description: 'Sync campaign data with your CRM for better lead management',
    icon: '🎯',
    features: ['Contact sync', 'Deal tracking', 'Lead scoring'],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    type: 'analytics',
    provider: 'google',
    status: 'connected',
    description: 'Track campaign performance with detailed analytics',
    icon: '📊',
    features: ['Event tracking', 'Conversion goals', 'Custom reports'],
    lastSync: '2024-01-08T16:00:00Z',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    type: 'webhook',
    provider: 'zapier',
    status: 'disconnected',
    description: 'Connect to 5000+ apps with automated workflows',
    icon: '⚡',
    features: ['5000+ app connections', 'Custom workflows', 'Multi-step automation'],
    isPopular: true,
  },
];

const typeIcons = {
  email: Mail,
  social: Share2,
  ecommerce: ShoppingCart,
  crm: Users,
  analytics: BarChart3,
  webhook: Webhook,
};

const statusColors = {
  connected: 'bg-green-100 text-green-800',
  disconnected: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
};

export default function IntegrationsPage() {
  const { userData, organization } = useAuth();
  const [integrations, setIntegrations] = useState(availableIntegrations);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigModal, setShowConfigModal] = useState<string | null>(null);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesType = selectedType === 'all' || integration.type === selectedType;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'connected' as const, lastSync: new Date().toISOString() }
        : integration
    ));
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected' as const, lastSync: undefined }
        : integration
    ));
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => {
    const TypeIcon = typeIcons[integration.type];
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{integration.icon}</div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                {integration.isPopular && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <TypeIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 capitalize">{integration.type}</span>
              </div>
            </div>
          </div>
          
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[integration.status]}`}>
            {integration.status === 'connected' && <Check className="w-3 h-3 inline mr-1" />}
            {integration.status === 'error' && <AlertCircle className="w-3 h-3 inline mr-1" />}
            {integration.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
          <div className="flex flex-wrap gap-1">
            {integration.features.map((feature, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {integration.lastSync && (
          <p className="text-xs text-gray-500 mb-4">
            Last synced: {new Date(integration.lastSync).toLocaleString()}
          </p>
        )}

        <div className="flex items-center space-x-2">
          {integration.status === 'connected' ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowConfigModal(integration.id)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDisconnect(integration.id)}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={() => handleConnect(integration.id)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Connect
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">
            Connect Scratch TIX with your favorite tools and platforms
          </p>
        </div>
        
        <Button>
          <ExternalLink className="w-4 h-4 mr-2" />
          Browse All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">{errorCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '300px' }}
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="email">Email Marketing</option>
              <option value="social">Social Media</option>
              <option value="ecommerce">E-commerce</option>
              <option value="crm">CRM</option>
              <option value="analytics">Analytics</option>
              <option value="webhook">Webhooks</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Popular
            </Button>
            <Button variant="outline" size="sm">
              Recently Added
            </Button>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria.
          </p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedType('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configure {integrations.find(i => i.id === showConfigModal)?.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <Input type="password" placeholder="Enter API key" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List ID
                </label>
                <Input type="text" placeholder="Enter list ID" />
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-sync" className="rounded" />
                <label htmlFor="auto-sync" className="text-sm text-gray-700">
                  Enable automatic synchronization
                </label>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <Button onClick={() => setShowConfigModal(null)}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowConfigModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
