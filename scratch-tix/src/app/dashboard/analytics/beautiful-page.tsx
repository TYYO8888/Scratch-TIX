'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  MousePointer,
  Clock,
  Target,
  Sparkles,
  DollarSign,
  Activity,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  LineChart,
  BarChart,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Share,
  Heart,
  TrendingDown
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalParticipants: number;
    totalRevenue: number;
    conversionRate: number;
    averageEngagement: number;
    participantGrowth: number;
    revenueGrowth: number;
    conversionGrowth: number;
    engagementGrowth: number;
  };
  campaigns: Array<{
    id: string;
    name: string;
    participants: number;
    revenue: number;
    conversion: number;
    status: 'active' | 'completed' | 'draft';
  }>;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  timeData: Array<{
    date: string;
    participants: number;
    revenue: number;
  }>;
}

const mockAnalytics: AnalyticsData = {
  overview: {
    totalParticipants: 15847,
    totalRevenue: 89750,
    conversionRate: 23.4,
    averageEngagement: 4.2,
    participantGrowth: 18.2,
    revenueGrowth: 24.7,
    conversionGrowth: -2.1,
    engagementGrowth: 12.8,
  },
  campaigns: [
    { id: '1', name: 'Summer Sale Scratch & Win', participants: 2847, revenue: 12450, conversion: 24.8, status: 'active' },
    { id: '2', name: 'Holiday Mystery Box', participants: 1923, revenue: 8920, conversion: 31.2, status: 'active' },
    { id: '3', name: 'New Customer Welcome', participants: 1456, revenue: 6780, conversion: 19.4, status: 'completed' },
    { id: '4', name: 'Flash Friday Deals', participants: 3421, revenue: 15670, conversion: 28.9, status: 'completed' },
  ],
  devices: {
    mobile: 68,
    desktop: 24,
    tablet: 8,
  },
  timeData: [
    { date: '2024-01-01', participants: 1200, revenue: 5400 },
    { date: '2024-01-02', participants: 1450, revenue: 6200 },
    { date: '2024-01-03', participants: 1680, revenue: 7100 },
    { date: '2024-01-04', participants: 1320, revenue: 5800 },
    { date: '2024-01-05', participants: 1890, revenue: 8300 },
    { date: '2024-01-06', participants: 2100, revenue: 9200 },
    { date: '2024-01-07', participants: 1750, revenue: 7900 },
  ],
};

export default function AnalyticsPage() {
  const { userData, organization } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('participants');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          totalParticipants: prev.overview.totalParticipants + Math.floor(Math.random() * 5),
          totalRevenue: prev.overview.totalRevenue + Math.floor(Math.random() * 200),
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    prefix = '',
    suffix = '',
    description,
    trend
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: any;
    color?: string;
    prefix?: string;
    suffix?: string;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => {
    const getTrendIcon = () => {
      if (change === undefined) return null;
      if (change > 0) return <ArrowUp className="w-4 h-4" />;
      if (change < 0) return <ArrowDown className="w-4 h-4" />;
      return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
      if (change === undefined) return 'text-gray-500';
      if (change > 0) return 'text-emerald-600';
      if (change < 0) return 'text-red-500';
      return 'text-gray-500';
    };

    return (
      <div className="group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-12 w-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {change !== undefined && (
              <div className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="ml-1">{Math.abs(change)}%</span>
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
  };

  const CampaignRow = ({ campaign }: { campaign: any }) => (
    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100 hover:bg-white/80 transition-all">
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${
          campaign.status === 'active' ? 'bg-emerald-500' : 
          campaign.status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
        }`}></div>
        <div>
          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
          <p className="text-sm text-gray-500 capitalize">{campaign.status}</p>
        </div>
      </div>
      <div className="flex items-center space-x-8 text-sm">
        <div className="text-center">
          <p className="font-semibold text-gray-900">{campaign.participants.toLocaleString()}</p>
          <p className="text-gray-500">Participants</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-emerald-600">{campaign.conversion}%</p>
          <p className="text-gray-500">Conversion</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-blue-600">${campaign.revenue.toLocaleString()}</p>
          <p className="text-gray-500">Revenue</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Deep insights into your campaign performance
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Participants"
            value={analytics.overview.totalParticipants}
            change={analytics.overview.participantGrowth}
            icon={Users}
            color="blue"
            description="Unique participants"
          />
          <MetricCard
            title="Total Revenue"
            value={analytics.overview.totalRevenue}
            change={analytics.overview.revenueGrowth}
            icon={DollarSign}
            color="emerald"
            prefix="$"
            description="Revenue generated"
          />
          <MetricCard
            title="Conversion Rate"
            value={analytics.overview.conversionRate}
            change={analytics.overview.conversionGrowth}
            icon={Target}
            color="purple"
            suffix="%"
            description="Average conversion"
          />
          <MetricCard
            title="Engagement Score"
            value={analytics.overview.averageEngagement}
            change={analytics.overview.engagementGrowth}
            icon={Activity}
            color="amber"
            suffix="/5"
            description="User engagement"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                Performance Trends
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedMetric('participants')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    selectedMetric === 'participants' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Participants
                </button>
                <button 
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    selectedMetric === 'revenue' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Interactive Chart</p>
                <p className="text-sm text-gray-500">Performance data visualization</p>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-600" />
              Device Breakdown
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Mobile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analytics.devices.mobile}%` }}></div>
                  </div>
                  <span className="font-semibold text-gray-900 w-12">{analytics.devices.mobile}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-gray-900">Desktop</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${analytics.devices.desktop}%` }}></div>
                  </div>
                  <span className="font-semibold text-gray-900 w-12">{analytics.devices.desktop}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Tablet className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Tablet</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${analytics.devices.tablet}%` }}></div>
                  </div>
                  <span className="font-semibold text-gray-900 w-12">{analytics.devices.tablet}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Mobile-first design is driving {analytics.devices.mobile}% of your engagement!
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Campaign Performance
            </h3>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {analytics.campaigns.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
