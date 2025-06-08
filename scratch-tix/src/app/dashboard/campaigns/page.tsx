'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Play,
  Pause,
  Users,
  DollarSign,
  Target,
  Calendar,
  Sparkles,
  Crown,
  Zap,
  Award,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { AdvancedScratchCard } from '@/components/scratch-card/advanced-scratch-card';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  type: 'scratch' | 'coupon' | 'voucher';
  participants: number;
  conversion: number;
  revenue: number;
  createdAt: string;
  isPopular?: boolean;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale Scratch & Win',
    description: 'Win amazing prizes with our summer scratch cards!',
    status: 'active',
    type: 'scratch',
    participants: 2847,
    conversion: 24.8,
    revenue: 12450,
    createdAt: '2024-01-01',
    isPopular: true,
  },
  {
    id: '2',
    name: 'Holiday Mystery Box',
    description: 'Discover hidden treasures in our holiday mystery boxes.',
    status: 'active',
    type: 'scratch',
    participants: 1923,
    conversion: 31.2,
    revenue: 8920,
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'New Customer Welcome',
    description: 'Special welcome offer for new customers.',
    status: 'draft',
    type: 'coupon',
    participants: 0,
    conversion: 0,
    revenue: 0,
    createdAt: '2024-01-10',
  },
];

export default function CampaignsPage() {
  const { userData, organization } = useAuth();
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'draft': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scratch': return Zap;
      case 'coupon': return Award;
      default: return Sparkles;
    }
  };

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const TypeIcon = getTypeIcon(campaign.type);

    return (
      <div className="group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <TypeIcon className="w-12 h-12 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-lg">{campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign</p>
              </div>
            </div>

            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>

            {campaign.isPopular && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg">
                  🔥 Popular
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
                onClick={() => setShowPreview(campaign.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors mb-2">
              {campaign.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{campaign.participants.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Participants</p>
              </div>
              <div className="text-center">
                <Target className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-600">{campaign.conversion}%</p>
                <p className="text-xs text-gray-500">Conversion</p>
              </div>
              <div className="text-center">
                <DollarSign className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-600">${campaign.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {campaign.status === 'active' ? (
                <Button size="sm" variant="outline" className="flex-1">
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              ) : campaign.status === 'draft' ? (
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Play className="w-4 h-4 mr-1" />
                  Launch
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="flex-1">
                  <Activity className="w-4 h-4 mr-1" />
                  View
                </Button>
              )}

              <Button size="sm" variant="outline">
                <Activity className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Created {new Date(campaign.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center">
                <Crown className="w-8 h-8 mr-3 text-purple-600" />
                My Campaigns
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage and monitor all your promotional campaigns
              </p>
            </div>

            <Link href="/dashboard/campaigns/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No campaigns found</h3>
            <p className="text-gray-600 mb-8">Create your first campaign to start engaging with your audience.</p>
            <Link href="/dashboard/campaigns/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </Link>
          </div>
        )}

        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🎮 Campaign Preview</h3>
                <p className="text-gray-600">Experience your scratch card campaign</p>
              </div>

              <div className="flex justify-center mb-6">
                <AdvancedScratchCard
                  width={300}
                  height={200}
                  overlayImage="/api/placeholder/300/200"
                  revealContent={
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                      🎉 You Won $50! 🎉
                    </div>
                  }
                  scratchPercentage={30}
                  onComplete={() => console.log('Scratch completed!')}
                  enableParticles={true}
                  enableSound={true}
                  enableHaptics={true}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPreview(null)}
                >
                  Close
                </Button>
                <Button className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Campaign
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}