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

  useEffect(() => {
    // Get campaign data from URL params
    const name = searchParams.get('name') || 'Untitled Campaign';
    const type = searchParams.get('type') || 'scratch';
    const templateId = searchParams.get('template') || 'modern-blue';
    
    setCampaignName(name);
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
    // Open preview in new tab
    window.open('/preview?campaign=temp', '_blank');
  };

  const handlePublish = () => {
    // Navigate to publish settings
    router.push('/dashboard/campaigns/publish');
  };

  const handleBack = () => {
    router.push('/dashboard/campaigns');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Back
          </Button>
          
          <div className="border-l border-gray-300 pl-4">
            <h1 className="text-lg font-semibold text-gray-900">{campaignName}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="capitalize">{campaignType}</span>
              <span>•</span>
              <span>{template}</span>
              {lastSaved && (
                <>
                  <span>•</span>
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Preview
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Settings
          </Button>
          
          <div className="border-l border-gray-300 pl-3">
            <Button size="sm" onClick={handlePublish}>
              <Play style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Builder Interface */}
      <div className="flex-1 flex overflow-hidden">
        <CampaignBuilder 
          campaignType={campaignType}
          template={template}
          onSave={handleSave}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Canvas: 400 × 300px</span>
            <span>•</span>
            <span>Zoom: 100%</span>
            <span>•</span>
            <span>Elements: 3</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Share style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
