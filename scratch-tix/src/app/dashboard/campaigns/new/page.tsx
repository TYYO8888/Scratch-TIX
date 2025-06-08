'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Gift, 
  Ticket,
  Palette,
  Settings,
  Eye
} from 'lucide-react';

interface CampaignData {
  name: string;
  description: string;
  type: 'scratch' | 'coupon' | 'voucher';
  template: string;
}

const campaignTypes = [
  {
    id: 'scratch',
    name: 'Scratch & Win',
    description: 'Interactive scratch cards with hidden prizes',
    icon: Zap,
    popular: true,
  },
  {
    id: 'coupon',
    name: 'Digital Coupon',
    description: 'Traditional discount coupons',
    icon: Ticket,
    popular: false,
  },
  {
    id: 'voucher',
    name: 'Gift Voucher',
    description: 'Redeemable gift vouchers',
    icon: Gift,
    popular: false,
  },
];

const templates = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    category: 'Business',
    thumbnail: '/api/placeholder/300/200',
    description: 'Clean, professional design perfect for corporate campaigns',
  },
  {
    id: 'festive-red',
    name: 'Festive Red',
    category: 'Holiday',
    thumbnail: '/api/placeholder/300/200',
    description: 'Warm, celebratory design for holiday promotions',
  },
  {
    id: 'summer-gradient',
    name: 'Summer Gradient',
    category: 'Seasonal',
    thumbnail: '/api/placeholder/300/200',
    description: 'Bright, energetic design for summer campaigns',
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    category: 'Elegant',
    thumbnail: '/api/placeholder/300/200',
    description: 'Simple, elegant design that works for any brand',
  },
  {
    id: 'gaming-neon',
    name: 'Gaming Neon',
    category: 'Entertainment',
    thumbnail: '/api/placeholder/300/200',
    description: 'Bold, exciting design for gaming and entertainment',
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    category: 'Premium',
    thumbnail: '/api/placeholder/300/200',
    description: 'Sophisticated design for premium brands',
  },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { userData, organization } = useAuth();
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    type: 'scratch',
    template: '',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Navigate to builder
      router.push(`/dashboard/campaigns/builder?type=${campaignData.type}&template=${campaignData.template}&name=${encodeURIComponent(campaignData.name)}`);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push('/dashboard/campaigns');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return campaignData.name.trim().length > 0;
      case 2:
        return campaignData.type !== '';
      case 3:
        return campaignData.template !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container" style={{ padding: '1rem' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
                <p className="text-gray-600">Step {step} of 3</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-8 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's start with the basics</h2>
                <p className="text-xl text-gray-600">Give your campaign a name and description</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Summer Sale Scratch Card"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe your campaign..."
                    value={campaignData.description}
                    onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                    rows={4}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      fontSize: '1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use clear, engaging names that describe the offer</li>
                    <li>• Include the benefit or prize in the name</li>
                    <li>• Keep it under 50 characters for best display</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Campaign Type */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose your campaign type</h2>
                <p className="text-xl text-gray-600">What kind of promotional campaign do you want to create?</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {campaignTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = campaignData.type === type.id;
                  
                  return (
                    <div
                      key={type.id}
                      onClick={() => setCampaignData({ ...campaignData, type: type.id as any })}
                      className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.popular && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-blue-600' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Don't worry, you can change this later in the builder
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Template Selection */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pick a template</h2>
                <p className="text-xl text-gray-600">Start with a professionally designed template</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {templates.map((template) => {
                  const isSelected = campaignData.template === template.id;
                  
                  return (
                    <div
                      key={template.id}
                      onClick={() => setCampaignData({ ...campaignData, template: template.id })}
                      className={`border-2 rounded-lg cursor-pointer transition-all overflow-hidden ${
                        isSelected 
                          ? 'border-blue-600 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-gray-400" />
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  You can customize everything in the next step
                </p>
                <Button variant="outline" size="sm">
                  <Eye style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Preview Template
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className={canProceed() ? 'btn-primary' : 'btn-secondary'}
            >
              {step === 3 ? 'Create Campaign' : 'Continue'}
              <ArrowRight style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
