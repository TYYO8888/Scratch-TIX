'use client';

import React, { useState, useRef } from 'react';
import { CanvasWorkspace } from './canvas-workspace';
import { ElementPalette } from './element-palette';
import { PropertiesPanel } from './properties-panel';
import { PreviewPanel } from './preview-panel';
import { CanvasElement } from '@/lib/types/campaign';

interface CampaignBuilderProps {
  campaignType: string;
  template: string;
  onSave: () => void;
}

export function CampaignBuilder({ campaignType, template, onSave }: CampaignBuilderProps) {
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: '1',
      type: 'text',
      properties: {
        x: 200,
        y: 150,
        width: 200,
        height: 40,
        text: 'Scratch & Win!',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
      },
      position: { x: 200, y: 150 },
      zIndex: 1,
    },
    {
      id: '2',
      type: 'text',
      properties: {
        x: 150,
        y: 200,
        width: 300,
        height: 30,
        text: 'Reveal your prize below!',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#ffffff',
        textAlign: 'center',
      },
      position: { x: 150, y: 200 },
      zIndex: 2,
    },
  ]);
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });
  const [previewMode, setPreviewMode] = useState<'design' | 'preview'>('design');
  const [device, setDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');

  const handleElementAdd = (elementType: 'text' | 'image' | 'shape') => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: elementType,
      properties: {
        x: 100,
        y: 100,
        width: elementType === 'text' ? 200 : 100,
        height: elementType === 'text' ? 40 : 100,
        ...(elementType === 'text' && {
          text: 'New Text',
          fontSize: 16,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          color: '#000000',
          textAlign: 'left',
        }),
        ...(elementType === 'image' && {
          src: '/api/placeholder/100/100',
          alt: 'Image',
        }),
        ...(elementType === 'shape' && {
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
          shapeType: 'rectangle',
        }),
      },
      position: { x: 100, y: 100 },
      zIndex: elements.length + 1,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleElementUpdate = (elementId: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const handleElementDelete = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const handleElementSelect = (elementId: string | null) => {
    setSelectedElement(elementId);
  };

  const selectedElementData = selectedElement 
    ? elements.find(el => el.id === selectedElement) 
    : null;

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Element Palette */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Elements</h2>
          <p className="text-sm text-gray-600">Drag elements to canvas</p>
        </div>
        
        <ElementPalette onElementAdd={handleElementAdd} />
      </div>

      {/* Center - Canvas Workspace */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Canvas Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Mode:</label>
                <select 
                  value={previewMode}
                  onChange={(e) => setPreviewMode(e.target.value as 'design' | 'preview')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="design">Design</option>
                  <option value="preview">Preview</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Device:</label>
                <select 
                  value={device}
                  onChange={(e) => setDevice(e.target.value as 'desktop' | 'mobile' | 'tablet')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="desktop">Desktop</option>
                  <option value="tablet">Tablet</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Canvas Size:</label>
              <input
                type="number"
                value={canvasSize.width}
                onChange={(e) => setCanvasSize({ ...canvasSize, width: parseInt(e.target.value) })}
                className="w-16 text-sm border border-gray-300 rounded px-2 py-1"
              />
              <span className="text-sm text-gray-500">×</span>
              <input
                type="number"
                value={canvasSize.height}
                onChange={(e) => setCanvasSize({ ...canvasSize, height: parseInt(e.target.value) })}
                className="w-16 text-sm border border-gray-300 rounded px-2 py-1"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex justify-center">
            <div 
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                width: device === 'mobile' ? '320px' : device === 'tablet' ? '768px' : `${canvasSize.width}px`,
                maxWidth: '100%',
              }}
            >
              <CanvasWorkspace
                elements={elements}
                selectedElement={selectedElement}
                canvasSize={canvasSize}
                previewMode={previewMode}
                onElementSelect={handleElementSelect}
                onElementUpdate={handleElementUpdate}
                onElementDelete={handleElementDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <p className="text-sm text-gray-600">
            {selectedElementData ? `Edit ${selectedElementData.type}` : 'Select an element'}
          </p>
        </div>
        
        <div className="flex-1 overflow-auto">
          {selectedElementData ? (
            <PropertiesPanel
              element={selectedElementData}
              onUpdate={(updates) => handleElementUpdate(selectedElementData.id, updates)}
              onDelete={() => handleElementDelete(selectedElementData.id)}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Select an element to edit its properties</p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="border-t border-gray-200">
          <PreviewPanel
            elements={elements}
            canvasSize={canvasSize}
            campaignType={campaignType}
          />
        </div>
      </div>
    </div>
  );
}
