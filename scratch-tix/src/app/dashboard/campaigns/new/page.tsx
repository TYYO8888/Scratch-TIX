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
  Eye,
  Sparkles,
  Crown,
  Star,
  Gamepad2,
  Heart,
  Diamond,
  Flame,
  Wand2,
  CheckCircle,
  Circle,
  Target,
  Smartphone
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
    description: 'Interactive scratch cards with hidden prizes and gaming effects',
    icon: Zap,
    popular: true,
    gradient: 'from-blue-500 to-purple-600',
    features: ['Particle Effects', 'Sound & Haptics', 'Real-time Animation']
  },
  {
    id: 'coupon',
    name: 'Digital Coupon',
    description: 'Traditional discount coupons with modern design',
    icon: Ticket,
    popular: false,
    gradient: 'from-emerald-500 to-teal-600',
    features: ['QR Codes', 'Auto-expiry', 'Usage Tracking']
  },
  {
    id: 'voucher',
    name: 'Gift Voucher',
    description: 'Redeemable gift vouchers with custom values',
    icon: Gift,
    popular: false,
    gradient: 'from-orange-500 to-red-600',
    features: ['Custom Values', 'Gift Wrapping', 'Personal Messages']
  },
];

const templates = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    category: 'Business',
    gradient: 'from-blue-400 to-blue-600',
    description: 'Clean, professional design perfect for corporate campaigns',
    popular: false,
  },
  {
    id: 'festive-red',
    name: 'Festive Red',
    category: 'Holiday',
    gradient: 'from-red-400 to-pink-600',
    description: 'Warm, celebratory design for holiday promotions',
    popular: true,
  },
  {
    id: 'summer-gradient',
    name: 'Summer Gradient',
    category: 'Seasonal',
    gradient: 'from-yellow-400 to-orange-600',
    description: 'Bright, energetic design for summer campaigns',
    popular: false,
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    category: 'Elegant',
    gradient: 'from-gray-100 to-gray-300',
    description: 'Simple, elegant design that works for any brand',
    popular: false,
  },
  {
    id: 'gaming-neon',
    name: 'Gaming Neon',
    category: 'Entertainment',
    gradient: 'from-purple-400 to-pink-600',
    description: 'Bold, exciting design for gaming and entertainment',
    popular: true,
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    category: 'Premium',
    gradient: 'from-yellow-400 to-amber-600',
    description: 'Sophisticated design for premium brands',
    popular: false,
  },
];

function NewCampaignPage() {
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

  const StepIndicator = ({ stepNumber, isActive, isCompleted }: { stepNumber: number; isActive: boolean; isCompleted: boolean }) => (
    <div className="flex items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
        isCompleted
          ? 'bg-emerald-500 text-white shadow-lg'
          : isActive
            ? 'bg-blue-600 text-white shadow-lg scale-110'
            : 'bg-gray-200 text-gray-500'
      }`}>
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
      </div>
      {stepNumber < 3 && (
        <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
          stepNumber < step ? 'bg-emerald-500' : 'bg-gray-200'
        }`}></div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="hover:bg-gray-50 border-gray-300 shadow-sm"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="hidden md:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Create New Campaign
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Step {step} of 3 - {
                    step === 1 ? 'Basic Information' :
                    step === 2 ? 'Campaign Type' :
                    'Template Selection'
                  }
                </p>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex items-center space-x-2">
              <StepIndicator stepNumber={1} isActive={step === 1} isCompleted={step > 1} />
              <StepIndicator stepNumber={2} isActive={step === 2} isCompleted={step > 2} />
              <StepIndicator stepNumber={3} isActive={step === 3} isCompleted={false} />
            </div>
          </div>

          {/* Mobile Title */}
          <div className="md:hidden pb-4">
            <h1 className="text-xl font-bold text-gray-900">Create Campaign</h1>
            <p className="text-gray-600 text-sm">
              Step {step} of 3 - {
                step === 1 ? 'Basic Info' :
                step === 2 ? 'Type' :
                'Template'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="animate-fade-in">
            {/* Clean Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Campaign Details</h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Let's start by giving your campaign a name and description
              </p>
            </div>

            {/* Centered Form Container */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

                {/* Form Content */}
                <div className="p-8 space-y-8">

                  {/* Campaign Name */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Summer Sale Scratch & Win"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Keep it clear and engaging</span>
                      <span className={`${campaignData.name.length > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                        {campaignData.name.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Description <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      placeholder="Tell your audience what makes this campaign special..."
                      value={campaignData.description}
                      onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors resize-none"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Describe the prizes and experience</span>
                      <span className="text-gray-400">{campaignData.description.length} characters</span>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <Eye className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">Preview</h4>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-bold text-lg text-gray-900 mb-2">
                        {campaignData.name || 'Your Campaign Name'}
                      </h5>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {campaignData.description || 'Your campaign description will appear here...'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Tips Section */}
                <div className="bg-blue-50 border-t border-blue-100 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-2">Pro Tips</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Use action words like "Win", "Unlock", "Discover"</li>
                        <li>• Include the benefit or prize in your name</li>
                        <li>• Keep it under 50 characters for best display</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Step 2: Campaign Type */}
        {step === 2 && (
          <div className="animate-fade-in">
            {/* Clean Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-lg">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Campaign Type</h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Choose the type of promotional experience you want to create
              </p>
            </div>

            {/* Campaign Type Cards - Clean Grid */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {campaignTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = campaignData.type === type.id;

                  return (
                    <div
                      key={type.id}
                      onClick={() => setCampaignData({ ...campaignData, type: type.id as any })}
                      className={`relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected
                          ? 'border-blue-500 shadow-lg ring-4 ring-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Popular Badge */}
                      {type.popular && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Popular
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="text-center">
                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br ${type.gradient}`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {type.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {type.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-2">
                          {type.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-500">
                              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <CheckCircle className="w-2.5 h-2.5 text-green-600" />
                              </div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200 max-w-2xl mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Customization Available</h4>
                    <p className="text-blue-800 text-sm">
                      Don't worry about getting it perfect - you can customize colors, effects, and everything else in the builder!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {step === 3 && (
          <div className="animate-fade-in">
            {/* Clean Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl mb-6 shadow-lg">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Template</h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Start with a professionally designed template
              </p>
            </div>

            {/* Template Grid - Clean Layout */}
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => {
                  const isSelected = campaignData.template === template.id;
                
                  return (
                    <div
                      key={template.id}
                      onClick={() => setCampaignData({ ...campaignData, template: template.id })}
                      className={`relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected
                          ? 'border-blue-500 shadow-lg ring-4 ring-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Popular Badge */}
                      {template.popular && (
                        <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Popular
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Template Preview */}
                      <div className={`aspect-video bg-gradient-to-br ${template.gradient} relative`}>
                        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                          {/* Header */}
                          <div className="text-center">
                            <h4 className="font-bold text-lg mb-1">🎉 Scratch & Win! 🎉</h4>
                            <p className="text-xs opacity-90">Scratch below to reveal your prize</p>
                          </div>

                          {/* Scratch Area */}
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mx-2 border border-white/30">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-white/30 rounded-full mx-auto mb-2 flex items-center justify-center">
                                <Sparkles className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-medium">Scratch Here</p>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="text-center">
                            <p className="text-xs opacity-75">Powered by Scratch TIX</p>
                          </div>
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {template.name}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                          <div className="ml-3">
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                              {template.category}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-xs text-blue-800 font-medium flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Selected - Ready to customize!
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="mt-12 bg-emerald-50 rounded-xl p-6 border border-emerald-200 max-w-2xl mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Palette className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900 text-sm mb-1">Full Customization Available</h4>
                    <p className="text-emerald-800 text-sm mb-3">
                      These templates are starting points. In the builder, you can customize:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-emerald-700 text-sm">
                      <div className="flex items-center">
                        <Palette className="w-3 h-3 mr-1" />
                        Colors & Themes
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        Layout & Design
                      </div>
                      <div className="flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Effects & Animation
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-3 h-3 mr-1" />
                        Content & Text
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clean Navigation */}
        <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6 py-3 text-base border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-8 py-3 text-base font-semibold ${
              canProceed()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            {step === 3 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Campaign
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NewCampaignPage;
