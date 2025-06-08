'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CanvasElement } from '@/lib/types/campaign';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Play, 
  RotateCcw,
  Settings
} from 'lucide-react';

interface PreviewPanelProps {
  elements: CanvasElement[];
  canvasSize: { width: number; height: number };
  campaignType: string;
}

export function PreviewPanel({ elements, canvasSize, campaignType }: PreviewPanelProps) {
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [isPlaying, setIsPlaying] = useState(false);

  const deviceSizes = {
    mobile: { width: 320, height: 568 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 },
  };

  const getScaleFactor = () => {
    const containerWidth = 280; // Preview panel width minus padding
    const deviceWidth = deviceSizes[previewDevice].width;
    return Math.min(containerWidth / deviceWidth, 1);
  };

  const scaleFactor = getScaleFactor();

  const renderPreviewElement = (element: CanvasElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.position.x * scaleFactor,
      top: element.position.y * scaleFactor,
      width: element.properties.width * scaleFactor,
      height: element.properties.height * scaleFactor,
      zIndex: element.zIndex,
      transform: element.properties.rotation ? `rotate(${element.properties.rotation}deg)` : undefined,
      opacity: element.properties.opacity || 1,
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...style,
              fontSize: (element.properties.fontSize || 16) * scaleFactor,
              fontFamily: element.properties.fontFamily,
              fontWeight: element.properties.fontWeight,
              color: element.properties.color,
              textAlign: element.properties.textAlign as any,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.properties.textAlign === 'center' ? 'center' : 
                             element.properties.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: 2 * scaleFactor,
            }}
          >
            {element.properties.text || 'Text'}
          </div>
        );

      case 'image':
        return (
          <img
            key={element.id}
            src={element.properties.src || '/api/placeholder/100/100'}
            alt={element.properties.alt || 'Image'}
            style={{
              ...style,
              objectFit: 'cover',
              borderRadius: 2 * scaleFactor,
            }}
          />
        );

      case 'shape':
        return (
          <div
            key={element.id}
            style={{
              ...style,
              backgroundColor: element.properties.fill,
              border: `${(element.properties.strokeWidth || 0) * scaleFactor}px solid ${element.properties.stroke || 'transparent'}`,
              borderRadius: element.properties.shapeType === 'circle' ? '50%' : 2 * scaleFactor,
              boxSizing: 'border-box',
            }}
          />
        );

      default:
        return null;
    }
  };

  const handlePlayPreview = () => {
    setIsPlaying(true);
    // Simulate scratch card interaction
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
        <Button variant="ghost" size="sm">
          <Settings style={{ width: '1rem', height: '1rem' }} />
        </Button>
      </div>

      {/* Device Selection */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setPreviewDevice('mobile')}
          className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            previewDevice === 'mobile' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Smartphone style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
          Mobile
        </button>
        <button
          onClick={() => setPreviewDevice('tablet')}
          className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            previewDevice === 'tablet' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Tablet style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
          Tablet
        </button>
        <button
          onClick={() => setPreviewDevice('desktop')}
          className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            previewDevice === 'desktop' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Monitor style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
          Desktop
        </button>
      </div>

      {/* Preview Container */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-center">
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden relative"
            style={{
              width: deviceSizes[previewDevice].width * scaleFactor,
              height: Math.min(deviceSizes[previewDevice].height * scaleFactor, 400),
            }}
          >
            {/* Device Frame */}
            <div className="absolute inset-0 bg-gray-50">
              {/* Canvas Preview */}
              <div
                className="relative bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mt-4"
                style={{
                  width: canvasSize.width * scaleFactor,
                  height: canvasSize.height * scaleFactor,
                  maxWidth: '90%',
                }}
              >
                {elements
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map(renderPreviewElement)}

                {/* Scratch overlay simulation */}
                {isPlaying && (
                  <div
                    className="absolute inset-0 bg-gray-300 opacity-75 animate-pulse"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(156, 163, 175, 0.8) 31%)',
                    }}
                  />
                )}
              </div>

              {/* Mock UI Elements */}
              <div className="p-4 space-y-2">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handlePlayPreview}
          disabled={isPlaying}
        >
          <Play style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          {isPlaying ? 'Playing...' : 'Test Interaction'}
        </Button>
        
        <Button variant="ghost" size="sm" className="w-full">
          <RotateCcw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Reset Preview
        </Button>
      </div>

      {/* Preview Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Scale:</span>
          <span>{Math.round(scaleFactor * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Elements:</span>
          <span>{elements.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="capitalize">{campaignType}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h4>
        <div className="space-y-1">
          <button className="w-full text-left text-xs text-blue-600 hover:text-blue-800 py-1">
            → Open in new tab
          </button>
          <button className="w-full text-left text-xs text-blue-600 hover:text-blue-800 py-1">
            → Share preview link
          </button>
          <button className="w-full text-left text-xs text-blue-600 hover:text-blue-800 py-1">
            → Download as image
          </button>
        </div>
      </div>
    </div>
  );
}
