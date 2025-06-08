'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Smartphone, 
  Monitor, 
  Tablet,
  Clock,
  Target,
  Zap,
  Eye,
  Share,
  Download,
  Filter,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalParticipants: number;
    totalWinners: number;
    conversionRate: number;
    averageEngagementTime: number;
    bounceRate: number;
    shareRate: number;
  };
  performance: {
    averageLoadTime: number;
    averageFrameRate: number;
    mobilePerformanceScore: number;
    accessibilityScore: number;
  };
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  engagement: {
    timeToFirstScratch: number;
    averageScratchStrokes: number;
    completionRate: number;
    returnVisitors: number;
  };
  realTime: {
    activeUsers: number;
    currentSessions: number;
    winningsInLastHour: number;
    topPerformingCampaign: string;
  };
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalParticipants: 15847,
    totalWinners: 1902,
    conversionRate: 12.0,
    averageEngagementTime: 45.3,
    bounceRate: 23.5,
    shareRate: 8.7,
  },
  performance: {
    averageLoadTime: 1.2,
    averageFrameRate: 58.4,
    mobilePerformanceScore: 94,
    accessibilityScore: 96,
  },
  devices: {
    mobile: 68,
    tablet: 18,
    desktop: 14,
  },
  engagement: {
    timeToFirstScratch: 3.2,
    averageScratchStrokes: 28.5,
    completionRate: 87.3,
    returnVisitors: 34.2,
  },
  realTime: {
    activeUsers: 127,
    currentSessions: 89,
    winningsInLastHour: 23,
    topPerformingCampaign: 'Summer Sale Scratch Card',
  },
};

export default function AnalyticsPage() {
  const { userData, organization } = useAuth();
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        realTime: {
          ...prev.realTime,
          activeUsers: prev.realTime.activeUsers + Math.floor(Math.random() * 10 - 5),
          currentSessions: prev.realTime.currentSessions + Math.floor(Math.random() * 6 - 3),
          winningsInLastHour: prev.realTime.winningsInLastHour + Math.floor(Math.random() * 3),
        },
      }));
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    suffix = '',
    prefix = ''
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: any;
    color?: string;
    suffix?: string;
    prefix?: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change >= 0 ? '+' : ''}{change}% vs last period
            </p>
          )}
        </div>
        <div className={`h-12 w-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Real-time insights and performance metrics for your campaigns
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">🔴 Live Activity</h2>
            <p className="opacity-90">
              {data.realTime.activeUsers} active users • {data.realTime.currentSessions} current sessions
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{data.realTime.winningsInLastHour}</p>
            <p className="opacity-90">Winners in last hour</p>
          </div>
        </div>
        <div className="mt-4 text-sm opacity-75">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Participants"
          value={data.overview.totalParticipants}
          change={12.5}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Winners"
          value={data.overview.totalWinners}
          change={8.3}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Conversion Rate"
          value={data.overview.conversionRate}
          change={-2.1}
          icon={Target}
          color="purple"
          suffix="%"
        />
        <StatCard
          title="Avg. Engagement"
          value={data.overview.averageEngagementTime}
          change={15.7}
          icon={Clock}
          color="orange"
          suffix="s"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Mobile</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${data.devices.mobile}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12">{data.devices.mobile}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Tablet className="w-5 h-5 text-green-600" />
                <span className="font-medium">Tablet</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${data.devices.tablet}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12">{data.devices.tablet}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Desktop</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${data.devices.desktop}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12">{data.devices.desktop}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Scores */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Scores</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Load Time</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{data.performance.averageLoadTime}s</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Frame Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{data.performance.averageFrameRate} fps</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Mobile Score</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{data.performance.mobilePerformanceScore}/100</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Accessibility</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{data.performance.accessibilityScore}/100</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Time to First Scratch"
          value={data.engagement.timeToFirstScratch}
          change={-8.2}
          icon={Zap}
          color="yellow"
          suffix="s"
        />
        <StatCard
          title="Avg. Scratch Strokes"
          value={data.engagement.averageScratchStrokes}
          change={5.1}
          icon={Eye}
          color="indigo"
        />
        <StatCard
          title="Completion Rate"
          value={data.engagement.completionRate}
          change={3.7}
          icon={Target}
          color="green"
          suffix="%"
        />
        <StatCard
          title="Return Visitors"
          value={data.engagement.returnVisitors}
          change={12.4}
          icon={RefreshCw}
          color="blue"
          suffix="%"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Bounce Rate"
          value={data.overview.bounceRate}
          change={-4.2}
          icon={TrendingUp}
          color="red"
          suffix="%"
        />
        <StatCard
          title="Share Rate"
          value={data.overview.shareRate}
          change={18.9}
          icon={Share}
          color="purple"
          suffix="%"
        />
        <StatCard
          title="Top Campaign"
          value={data.realTime.topPerformingCampaign}
          icon={Award}
          color="gold"
        />
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Reports</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <BarChart3 className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            <span>Schedule Report</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Share className="w-4 h-4" />
            <span>Share Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
