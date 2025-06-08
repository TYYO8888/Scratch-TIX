'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CanvasElement } from '@/lib/types/campaign';
import { Trash2, Copy, Eye, EyeOff } from 'lucide-react';

interface PropertiesPanelProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({ element, onUpdate, onDelete }: PropertiesPanelProps) {
  const updateProperty = (key: string, value: any) => {
    onUpdate({
      properties: {
        ...element.properties,
        [key]: value,
      },
    });
  };

  const updatePosition = (axis: 'x' | 'y', value: number) => {
    onUpdate({
      position: {
        ...element.position,
        [axis]: value,
      },
      properties: {
        ...element.properties,
        [axis]: value,
      },
    });
  };

  const updateSize = (dimension: 'width' | 'height', value: number) => {
    onUpdate({
      properties: {
        ...element.properties,
        [dimension]: value,
      },
    });
  };

  const duplicateElement = () => {
    const newElement = {
      ...element,
      id: Date.now().toString(),
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
      properties: {
        ...element.properties,
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    };
    onUpdate(newElement);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Element Actions */}
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={duplicateElement} className="flex-1">
          <Copy style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Duplicate
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 style={{ width: '1rem', height: '1rem' }} />
        </Button>
      </div>

      {/* Position & Size */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Position & Size</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">X Position</label>
            <Input
              type="number"
              value={element.position.x}
              onChange={(e) => updatePosition('x', parseInt(e.target.value) || 0)}
              style={{ fontSize: '0.875rem', padding: '0.5rem' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Y Position</label>
            <Input
              type="number"
              value={element.position.y}
              onChange={(e) => updatePosition('y', parseInt(e.target.value) || 0)}
              style={{ fontSize: '0.875rem', padding: '0.5rem' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
            <Input
              type="number"
              value={element.properties.width}
              onChange={(e) => updateSize('width', parseInt(e.target.value) || 0)}
              style={{ fontSize: '0.875rem', padding: '0.5rem' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
            <Input
              type="number"
              value={element.properties.height}
              onChange={(e) => updateSize('height', parseInt(e.target.value) || 0)}
              style={{ fontSize: '0.875rem', padding: '0.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Element-specific properties */}
      {element.type === 'text' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Text Properties</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Text Content</label>
            <textarea
              value={element.properties.text || ''}
              onChange={(e) => updateProperty('text', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
              <Input
                type="number"
                value={element.properties.fontSize || 16}
                onChange={(e) => updateProperty('fontSize', parseInt(e.target.value) || 16)}
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Font Weight</label>
              <select
                value={element.properties.fontWeight || 'normal'}
                onChange={(e) => updateProperty('fontWeight', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                }}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
            <select
              value={element.properties.fontFamily || 'Arial'}
              onChange={(e) => updateProperty('fontFamily', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
              }}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Text Align</label>
            <select
              value={element.properties.textAlign || 'left'}
              onChange={(e) => updateProperty('textAlign', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
              }}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={element.properties.color || '#000000'}
                onChange={(e) => updateProperty('color', e.target.value)}
                style={{ width: '3rem', height: '2.5rem', border: 'none', borderRadius: '0.375rem' }}
              />
              <Input
                type="text"
                value={element.properties.color || '#000000'}
                onChange={(e) => updateProperty('color', e.target.value)}
                placeholder="#000000"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              />
            </div>
          </div>
        </div>
      )}

      {element.type === 'image' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Image Properties</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
            <Input
              type="url"
              value={element.properties.src || ''}
              onChange={(e) => updateProperty('src', e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{ fontSize: '0.875rem', padding: '0.5rem' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
            <Input
              type="text"
              value={element.properties.alt || ''}
              onChange={(e) => updateProperty('alt', e.target.value)}
              placeholder="Image description"
              style={{ fontSize: '0.875rem', padding: '0.5rem' }}
            />
          </div>

          <Button variant="outline" size="sm" className="w-full">
            Upload Image
          </Button>
        </div>
      )}

      {element.type === 'shape' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Shape Properties</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Shape Type</label>
            <select
              value={element.properties.shapeType || 'rectangle'}
              onChange={(e) => updateProperty('shapeType', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
              }}
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="polygon">Polygon</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fill Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={element.properties.fill || '#3b82f6'}
                onChange={(e) => updateProperty('fill', e.target.value)}
                style={{ width: '3rem', height: '2.5rem', border: 'none', borderRadius: '0.375rem' }}
              />
              <Input
                type="text"
                value={element.properties.fill || '#3b82f6'}
                onChange={(e) => updateProperty('fill', e.target.value)}
                placeholder="#3b82f6"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={element.properties.stroke || '#1e40af'}
                onChange={(e) => updateProperty('stroke', e.target.value)}
                style={{ width: '3rem', height: '2.5rem', border: 'none', borderRadius: '0.375rem' }}
              />
              <Input
                type="text"
                value={element.properties.stroke || '#1e40af'}
                onChange={(e) => updateProperty('stroke', e.target.value)}
                placeholder="#1e40af"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Width</label>
            <Input
              type="number"
              value={element.properties.strokeWidth || 2}
              onChange={(e) => updateProperty('strokeWidth', parseInt(e.target.value) || 0)}
              min="0"
              style={{ fontSize: '0.875rem', padding: '0.5rem' }}
            />
          </div>
        </div>
      )}

      {/* Common Properties */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Transform</h3>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rotation (degrees)</label>
          <Input
            type="number"
            value={element.properties.rotation || 0}
            onChange={(e) => updateProperty('rotation', parseInt(e.target.value) || 0)}
            min="0"
            max="360"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Opacity</label>
          <div className="flex space-x-2 items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={element.properties.opacity || 1}
              onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span className="text-xs text-gray-600 w-8">
              {Math.round((element.properties.opacity || 1) * 100)}%
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Z-Index (Layer)</label>
          <Input
            type="number"
            value={element.zIndex}
            onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) || 1 })}
            min="1"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          />
        </div>
      </div>
    </div>
  );
}
