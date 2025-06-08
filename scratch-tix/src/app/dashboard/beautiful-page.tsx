'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Award, 
  Plus,
  Eye,
  Settings,
  Calendar,
  Target,
  Zap,
  Sparkles,
  Play,
  Palette,
  Rocket,
  Crown,
  Star,
  ArrowRight,
  Activity,
  DollarSign,
  MousePointer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AdvancedScratchCard } from '@/components/scratch-card/advanced-scratch-card';

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalParticipants: number;
  conversionRate: number;
  revenue: number;
  growth: number;
}

const mockStats: DashboardStats = {
  totalCampaigns: 24,
  activeCampaigns: 8,
  totalParticipants: 15847,
  conversionRate: 23.4,
  revenue: 89750,
  growth: 18.2,
};

const recentCampaigns = [
  {
    id: 1,
    name: 'Summer Sale Scratch & Win',
    status: 'active',
    participants: 2847,
    conversion: 24.8,
    revenue: 12450,
    image: '/api/placeholder/300/200',
  },
  {
    id: 2,
    name: 'Holiday Mystery Box',
    status: 'active',
    participants: 1923,
    conversion: 31.2,
    revenue: 8920,
    image: '/api/placeholder/300/200',
  },
  {
    id: 3,
    name: 'New Customer Welcome',
    status: 'draft',
    participants: 0,
    conversion: 0,
    revenue: 0,
    image: '/api/placeholder/300/200',
  },
];

export default function DashboardPage() {
  const { userData, organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [showPreview, setShowPreview] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalParticipants: prev.totalParticipants + Math.floor(Math.random() * 3),
        revenue: prev.revenue + Math.floor(Math.random() * 100),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    prefix = '',
    suffix = '',
    description
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: any;
    color?: string;
    prefix?: string;
    suffix?: string;
    description?: string;
  }) => (
    <div className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl"></div>
      <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-12 w-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change >= 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const CampaignCard = ({ campaign }: { campaign: any }) => (
    <div className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl"></div>
      <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">Scratch Card Preview</p>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              campaign.status === 'active' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {campaign.status}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {campaign.name}
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{campaign.participants.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{campaign.conversion}%</p>
              <p className="text-xs text-gray-500">Conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">${campaign.revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" className="flex-1">
              <Settings className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {userData?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Here's what's happening with your campaigns today
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hidden sm:flex">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 days
              </Button>
              <Link href="/dashboard/campaigns/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            change={12.5}
            icon={Target}
            color="blue"
            description="All time campaigns"
          />
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            change={8.3}
            icon={Zap}
            color="emerald"
            description="Currently running"
          />
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants}
            change={stats.growth}
            icon={Users}
            color="purple"
            description="Unique participants"
          />
          <StatCard
            title="Revenue Generated"
            value={stats.revenue}
            change={15.7}
            icon={DollarSign}
            color="amber"
            prefix="$"
            description="Total revenue"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Rocket className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/campaigns/new">
              <div className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                <Plus className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">New Campaign</p>
                <p className="text-sm text-gray-500">Create scratch card</p>
              </div>
            </Link>
            
            <div 
              className="group p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
              onClick={() => setShowPreview(true)}
            >
              <Play className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Preview Demo</p>
              <p className="text-sm text-gray-500">Try scratch card</p>
            </div>
            
            <Link href="/dashboard/analytics">
              <div className="group p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer">
                <BarChart3 className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-500">View insights</p>
              </div>
            </Link>
            
            <Link href="/dashboard/advanced">
              <div className="group p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer">
                <Crown className="w-8 h-8 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Advanced</p>
                <p className="text-sm text-gray-500">Pro features</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Recent Campaigns
            </h2>
            <Link href="/dashboard/campaigns">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MousePointer className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              <p className="text-sm text-gray-500">Avg. Conversion Rate</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.growth}%</p>
              <p className="text-sm text-gray-500">Growth Rate</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">A+</p>
              <p className="text-sm text-gray-500">Performance Grade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎮 Try Our Scratch Card!</h3>
              <p className="text-gray-600">Experience the magic of our gaming-quality scratch cards</p>
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
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Link href="/dashboard/campaigns/new" className="flex-1">
                <Button className="w-full">
                  Create Similar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
