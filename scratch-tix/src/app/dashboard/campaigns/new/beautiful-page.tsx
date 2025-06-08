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
  Circle
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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleBack} className="hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Create New Campaign
                </h1>
                <p className="text-gray-600">Step {step} of 3 - {
                  step === 1 ? 'Basic Information' : 
                  step === 2 ? 'Campaign Type' : 
                  'Template Selection'
                }</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <StepIndicator stepNumber={1} isActive={step === 1} isCompleted={step > 1} />
              <StepIndicator stepNumber={2} isActive={step === 2} isCompleted={step > 2} />
              <StepIndicator stepNumber={3} isActive={step === 3} isCompleted={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's start with the basics</h2>
                <p className="text-xl text-gray-600">Give your campaign a memorable name and description</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Campaign Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Summer Sale Scratch & Win Extravaganza"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe what makes your campaign special..."
                    value={campaignData.description}
                    onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                    rows={4}
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Pro Tips for Success:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <Star className="w-4 h-4 mr-2 mt-0.5 text-yellow-500" />
                      Use action words like "Win", "Unlock", "Discover" to create excitement
                    </li>
                    <li className="flex items-start">
                      <Star className="w-4 h-4 mr-2 mt-0.5 text-yellow-500" />
                      Include the prize or benefit in the campaign name
                    </li>
                    <li className="flex items-start">
                      <Star className="w-4 h-4 mr-2 mt-0.5 text-yellow-500" />
                      Keep it under 50 characters for optimal display across devices
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Campaign Type */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose your campaign type</h2>
              <p className="text-xl text-gray-600">What kind of promotional experience do you want to create?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {campaignTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = campaignData.type === type.id;
                
                return (
                  <div
                    key={type.id}
                    onClick={() => setCampaignData({ ...campaignData, type: type.id as any })}
                    className={`group relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-white shadow-2xl scale-105' 
                        : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 hover:shadow-xl'
                    }`}
                  >
                    {type.popular && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        🔥 Popular
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${type.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                      
                      <div className="space-y-2">
                        {type.features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-center text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500/10 rounded-2xl border-2 border-blue-500 animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                💡 Don't worry, you can customize everything in the builder
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pick your perfect template</h2>
              <p className="text-xl text-gray-600">Start with a professionally designed template and make it yours</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {templates.map((template) => {
                const isSelected = campaignData.template === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => setCampaignData({ ...campaignData, template: template.id })}
                    className={`group border-2 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden transform hover:-translate-y-1 ${
                      isSelected 
                        ? 'border-blue-500 shadow-2xl scale-105' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                    }`}
                  >
                    {template.popular && (
                      <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                    
                    <div className={`aspect-video bg-gradient-to-br ${template.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Sparkles className="w-12 h-12 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <p className="font-semibold">Preview Template</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 border-4 border-blue-500 animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="p-6 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{template.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
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
                🎨 You can customize colors, fonts, and everything else in the builder
              </p>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                <Eye className="w-4 h-4 mr-2" />
                Preview All Templates
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="px-6 py-3 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-8 py-3 font-semibold ${
              canProceed() 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-all duration-200`}
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
