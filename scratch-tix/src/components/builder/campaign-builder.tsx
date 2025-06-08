'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Type,
  Image,
  Square,
  Circle,
  Star,
  Gift,
  Zap,
  Heart,
  Trophy,
  Crown,
  Palette,
  Settings,
  Plus,
  Trash2,
  Copy,
  RotateCcw
} from 'lucide-react';
import { AdvancedScratchCard } from '@/components/scratch-card/advanced-scratch-card';

interface CampaignBuilderProps {
  campaignType: string;
  template: string;
  onSave: () => void;
}

interface CampaignSettings {
  name: string;
  prizeText: string;
  backgroundColor: string;
  textColor: string;
  enableParticles: boolean;
  enableSound: boolean;
  enableHaptics: boolean;
  scratchPercentage: number;
}

export function CampaignBuilder({ campaignType, template, onSave }: CampaignBuilderProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'content' | 'effects'>('design');
  const [showPreview, setShowPreview] = useState(false);

  const [settings, setSettings] = useState<CampaignSettings>({
    name: 'My Campaign',
    prizeText: '🎉 You Won $50! 🎉',
    backgroundColor: getTemplateColor(template),
    textColor: '#ffffff',
    enableParticles: true,
    enableSound: true,
    enableHaptics: true,
    scratchPercentage: 30,
  });

  function getTemplateColor(templateId: string): string {
    const colors: Record<string, string> = {
      'modern-blue': '#3b82f6',
      'festive-red': '#ef4444',
      'summer-gradient': '#f59e0b',
      'minimal-white': '#f3f4f6',
      'gaming-neon': '#8b5cf6',
      'luxury-gold': '#f59e0b',
    };
    return colors[templateId] || '#3b82f6';
  }

  const updateSetting = (key: keyof CampaignSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const designElements = [
    { id: 'text', name: 'Text', icon: Type, description: 'Add custom text' },
    { id: 'image', name: 'Image', icon: Image, description: 'Upload images' },
    { id: 'shape', name: 'Shape', icon: Square, description: 'Basic shapes' },
    { id: 'icon', name: 'Icons', icon: Star, description: 'Decorative icons' },
  ];

  const iconElements = [
    { id: 'gift', icon: Gift, name: 'Gift' },
    { id: 'lightning', icon: Zap, name: 'Lightning' },
    { id: 'heart', icon: Heart, name: 'Heart' },
    { id: 'trophy', icon: Trophy, name: 'Trophy' },
    { id: 'crown', icon: Crown, name: 'Crown' },
    { id: 'star', icon: Star, name: 'Star' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex space-x-1 p-1">
          {[
            { id: 'design', name: 'Design', icon: Palette },
            { id: 'content', name: 'Content', icon: Type },
            { id: 'effects', name: 'Effects', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Color Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="w-4 h-4 mr-2 text-purple-600" />
                Colors & Theme
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.backgroundColor}
                      onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                      className="flex-1"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.textColor}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      className="flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Design Elements */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-4 h-4 mr-2 text-blue-600" />
                Add Elements
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {designElements.map((element) => {
                  const Icon = element.icon;
                  return (
                    <button
                      key={element.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{element.name}</p>
                        <p className="text-xs text-gray-500 truncate">{element.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Icons */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Icons</h3>
              <div className="grid grid-cols-3 gap-2">
                {iconElements.map((icon) => {
                  const Icon = icon.icon;
                  return (
                    <button
                      key={icon.id}
                      className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-gray-600 mb-1" />
                      <span className="text-xs text-gray-600">{icon.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Type className="w-4 h-4 mr-2 text-emerald-600" />
                Campaign Content
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <Input
                    value={settings.name}
                    onChange={(e) => updateSetting('name', e.target.value)}
                    placeholder="Enter campaign name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prize Text</label>
                  <textarea
                    value={settings.prizeText}
                    onChange={(e) => updateSetting('prizeText', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter the text that appears when users win"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-600" />
                Interactive Effects
              </h3>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableParticles}
                    onChange={(e) => updateSetting('enableParticles', e.target.checked)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Particle Effects</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableSound}
                    onChange={(e) => updateSetting('enableSound', e.target.checked)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Sound Effects</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableHaptics}
                    onChange={(e) => updateSetting('enableHaptics', e.target.checked)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Haptic Feedback</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scratch Sensitivity: {settings.scratchPercentage}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={settings.scratchPercentage}
                    onChange={(e) => updateSetting('scratchPercentage', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>More Sensitive</span>
                    <span>Less Sensitive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowPreview(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Preview</h3>
              <p className="text-gray-600 text-sm">Test your scratch card</p>
            </div>

            <div className="flex justify-center mb-4">
              <AdvancedScratchCard
                width={300}
                height={200}
                overlayImage="/api/placeholder/300/200"
                revealContent={
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-center p-4"
                    style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}
                  >
                    <div>
                      <div className="text-2xl mb-2">🎉</div>
                      <div className="text-lg">{settings.prizeText}</div>
                    </div>
                  </div>
                }
                scratchPercentage={settings.scratchPercentage}
                onComplete={() => console.log('Scratch completed!')}
                enableParticles={settings.enableParticles}
                enableSound={settings.enableSound}
                enableHaptics={settings.enableHaptics}
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
              <Button
                className="flex-1"
                onClick={() => {
                  setShowPreview(false);
                  window.open('/preview?campaign=temp', '_blank');
                }}
              >
                Full Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
