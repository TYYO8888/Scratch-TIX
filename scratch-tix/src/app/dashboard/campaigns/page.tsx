'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Users,
  Award,
  Calendar
} from 'lucide-react';

// Mock campaign data
const mockCampaigns = [
  {
    id: '1',
    name: 'Summer Sale Scratch Card',
    type: 'scratch',
    status: 'active',
    participants: 1247,
    winners: 156,
    conversionRate: 12.5,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    thumbnail: '/api/placeholder/300/200',
  },
  {
    id: '2',
    name: 'Holiday Promotion',
    type: 'coupon',
    status: 'completed',
    participants: 2891,
    winners: 347,
    conversionRate: 12.0,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    thumbnail: '/api/placeholder/300/200',
  },
  {
    id: '3',
    name: 'New Customer Welcome',
    type: 'voucher',
    status: 'draft',
    participants: 0,
    winners: 0,
    conversionRate: 0,
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22',
    thumbnail: '/api/placeholder/300/200',
  },
  {
    id: '4',
    name: 'Flash Weekend Deal',
    type: 'scratch',
    status: 'paused',
    participants: 567,
    winners: 68,
    conversionRate: 12.0,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-21',
    thumbnail: '/api/placeholder/300/200',
  },
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  paused: 'bg-red-100 text-red-800',
};

const typeIcons = {
  scratch: '🎯',
  coupon: '🎫',
  voucher: '🎁',
};

export default function CampaignsPage() {
  const { userData, organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: mockCampaigns.length,
    active: mockCampaigns.filter(c => c.status === 'active').length,
    totalParticipants: mockCampaigns.reduce((sum, c) => sum + c.participants, 0),
    totalWinners: mockCampaigns.reduce((sum, c) => sum + c.winners, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage your scratch card campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Winners</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWinners}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '300px' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="scratch">Scratch Cards</option>
              <option value="coupon">Coupons</option>
              <option value="voucher">Vouchers</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              More Filters
            </Button>
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl">
                {typeIcons[campaign.type as keyof typeof typeIcons]}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{campaign.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Participants:</span>
                    <span className="font-medium">{campaign.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Winners:</span>
                    <span className="font-medium">{campaign.winners}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conversion:</span>
                    <span className="font-medium">{campaign.conversionRate}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye style={{ width: '1rem', height: '1rem' }} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit style={{ width: '1rem', height: '1rem' }} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical style={{ width: '1rem', height: '1rem' }} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Winners</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-lg">{typeIcons[campaign.type as keyof typeof typeIcons]}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">ID: {campaign.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 capitalize">{campaign.type}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">{campaign.participants.toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{campaign.winners}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{campaign.conversionRate}%</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye style={{ width: '1rem', height: '1rem' }} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit style={{ width: '1rem', height: '1rem' }} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical style={{ width: '1rem', height: '1rem' }} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Try adjusting your filters to see more campaigns.'
              : 'Get started by creating your first campaign.'}
          </p>
          <Link href="/dashboard/campaigns/new">
            <Button>
              <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Create Your First Campaign
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
