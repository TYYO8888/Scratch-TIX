'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Zap, 
  BarChart3,
  Calendar,
  Award,
  Eye
} from 'lucide-react';

// Mock data - will be replaced with real data from Firebase
const mockStats = {
  totalCampaigns: 12,
  activeCampaigns: 8,
  totalParticipants: 2847,
  totalWinners: 342,
  conversionRate: 12.0,
  thisMonthParticipants: 1205,
  growth: 23.5
};

const mockRecentCampaigns = [
  {
    id: '1',
    name: 'Summer Sale Scratch Card',
    status: 'active',
    participants: 245,
    winners: 28,
    conversionRate: 11.4,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Holiday Promotion',
    status: 'completed',
    participants: 892,
    winners: 107,
    conversionRate: 12.0,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'New Customer Welcome',
    status: 'active',
    participants: 156,
    winners: 19,
    conversionRate: 12.2,
    createdAt: '2024-01-08',
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'participant_joined',
    message: 'New participant joined "Summer Sale Scratch Card"',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    type: 'prize_won',
    message: 'Prize won in "Holiday Promotion" - $50 Gift Card',
    timestamp: '5 minutes ago',
  },
  {
    id: '3',
    type: 'campaign_created',
    message: 'New campaign "Flash Sale" created',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'participant_joined',
    message: 'New participant joined "New Customer Welcome"',
    timestamp: '2 hours ago',
  },
];

export default function DashboardPage() {
  const { userData, organization } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {userData?.displayName}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Here's what's happening with your campaigns at {organization?.name}
            </p>
          </div>
          <Link href="/dashboard/campaigns/new">
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalCampaigns}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{mockStats.activeCampaigns} active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalParticipants.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+{mockStats.growth}%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Winners</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalWinners}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Win rate: {((mockStats.totalWinners / mockStats.totalParticipants) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.conversionRate}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Above average</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
              <Link href="/dashboard/campaigns">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockRecentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {campaign.participants} participants
                        </span>
                        <span className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          {campaign.winners} winners
                        </span>
                        <span>{campaign.conversionRate}% conversion</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                    <Link href={`/dashboard/campaigns/${campaign.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.type === 'participant_joined' && <Users className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'prize_won' && <Award className="h-4 w-4 text-yellow-600" />}
                    {activity.type === 'campaign_created' && <Plus className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/campaigns/new">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create Campaign</h3>
                  <p className="text-sm text-gray-500">Start a new scratch card campaign</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/templates">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Browse Templates</h3>
                  <p className="text-sm text-gray-500">Choose from pre-made designs</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/analytics">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-500">Track campaign performance</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
