'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CampaignBuilder } from '@/components/builder/campaign-builder';
import { 
  Save, 
  Eye, 
  Settings, 
  ArrowLeft,
  Play,
  Share,
  Download
} from 'lucide-react';

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [template, setTemplate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Get campaign data from URL params
    const name = searchParams.get('name') || 'Untitled Campaign';
    const type = searchParams.get('type') || 'scratch';
    const templateId = searchParams.get('template') || 'modern-blue';

    setCampaignName(decodeURIComponent(name));
    setCampaignType(type);
    setTemplate(templateId);
  }, [searchParams]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastSaved(new Date());
    setIsSaving(false);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = () => {
    // Navigate to publish settings
    router.push('/dashboard/campaigns');
  };

  const handleBack = () => {
    router.push('/dashboard/campaigns/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleBack} className="hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Setup
              </Button>

              <div className="hidden md:block border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">{campaignName}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="capitalize">{campaignType}</span>
                  <span>•</span>
                  <span className="capitalize">{template.replace('-', ' ')}</span>
                  {lastSaved && (
                    <>
                      <span>•</span>
                      <span className="hidden lg:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="hidden sm:flex">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>

              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>

              <Button size="sm" onClick={handlePublish} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                <Play className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Launch</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Builder Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">

          {/* Left Sidebar - Tools (Hidden on mobile, collapsible on tablet) */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Design Tools
              </h2>
              <p className="text-sm text-gray-600">Customize your campaign</p>
            </div>

            <div className="h-full overflow-y-auto pb-20">
              <CampaignBuilder
                campaignType={campaignType}
                template={template}
                onSave={handleSave}
              />
            </div>
          </div>

          {/* Center - Canvas Area */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-emerald-600" />
                    Live Preview
                  </h2>
                  <p className="text-sm text-gray-600">See your campaign in real-time</p>
                </div>

                <div className="flex items-center space-x-2">
                  <label htmlFor="device-select" className="text-sm font-medium text-gray-700">Device:</label>
                  <select
                    id="device-select"
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                    defaultValue="desktop"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="tablet">Tablet</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Campaign Preview</h3>
                <p className="text-gray-600 mb-4">Your scratch card will appear here</p>
                <Button onClick={handlePreview} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Play className="w-4 h-4 mr-2" />
                  Launch Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties (Hidden on mobile) */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-600" />
                Properties
              </h2>
              <p className="text-sm text-gray-600">Element settings</p>
            </div>

            <div className="p-4 h-full overflow-y-auto">
              <div className="text-center text-gray-500 mt-8">
                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select an element to edit its properties</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎮 Campaign Preview</h3>
              <p className="text-gray-600">Experience your scratch card campaign</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{campaignName}</h4>
                <p className="text-gray-600 mb-4">Scratch card preview will be rendered here</p>
                <div className="bg-white rounded-lg p-6 border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">Interactive scratch card component</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreview(false)}
              >
                Close Preview
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => window.open('/preview?campaign=temp', '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Full Screen Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
