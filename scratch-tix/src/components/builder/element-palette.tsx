'use client';

import React from 'react';
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
  Crown
} from 'lucide-react';

interface ElementPaletteProps {
  onElementAdd: (elementType: 'text' | 'image' | 'shape') => void;
}

const textElements = [
  { id: 'heading', name: 'Heading', icon: Type, description: 'Large title text' },
  { id: 'paragraph', name: 'Paragraph', icon: Type, description: 'Body text content' },
  { id: 'button-text', name: 'Button Text', icon: Type, description: 'Call-to-action text' },
];

const shapeElements = [
  { id: 'rectangle', name: 'Rectangle', icon: Square, description: 'Basic rectangle shape' },
  { id: 'circle', name: 'Circle', icon: Circle, description: 'Perfect circle shape' },
  { id: 'star', name: 'Star', icon: Star, description: 'Star decoration' },
];

const iconElements = [
  { id: 'gift', name: 'Gift', icon: Gift, description: 'Gift box icon' },
  { id: 'lightning', name: 'Lightning', icon: Zap, description: 'Energy/excitement icon' },
  { id: 'heart', name: 'Heart', icon: Heart, description: 'Love/favorite icon' },
  { id: 'trophy', name: 'Trophy', icon: Trophy, description: 'Winner/achievement icon' },
  { id: 'crown', name: 'Crown', icon: Crown, description: 'Premium/VIP icon' },
];

export function ElementPalette({ onElementAdd }: ElementPaletteProps) {
  const handleDragStart = (e: React.DragEvent, elementType: 'text' | 'image' | 'shape') => {
    e.dataTransfer.setData('text/plain', elementType);
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Text Elements */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Text Elements</h3>
        <div className="space-y-2">
          {textElements.map((element) => {
            const Icon = element.icon;
            return (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, 'text')}
                onClick={() => onElementAdd('text')}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{element.name}</p>
                  <p className="text-xs text-gray-500 truncate">{element.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Elements */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Media</h3>
        <div className="space-y-2">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'image')}
            onClick={() => onElementAdd('image')}
            className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
              <Image className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Image</p>
              <p className="text-xs text-gray-500 truncate">Upload or select image</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shape Elements */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Shapes</h3>
        <div className="space-y-2">
          {shapeElements.map((element) => {
            const Icon = element.icon;
            return (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, 'shape')}
                onClick={() => onElementAdd('shape')}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                  <Icon className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{element.name}</p>
                  <p className="text-xs text-gray-500 truncate">{element.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Icon Elements */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Icons</h3>
        <div className="grid grid-cols-2 gap-2">
          {iconElements.map((element) => {
            const Icon = element.icon;
            return (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, 'shape')}
                onClick={() => onElementAdd('shape')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-xs font-medium text-gray-900 text-center">{element.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Templates Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Templates</h3>
        <div className="space-y-2">
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <p className="text-sm font-medium text-gray-900">Prize Reveal</p>
            <p className="text-xs text-gray-500">Pre-designed prize layout</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <p className="text-sm font-medium text-gray-900">Coupon Code</p>
            <p className="text-xs text-gray-500">Discount code display</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <p className="text-sm font-medium text-gray-900">Try Again</p>
            <p className="text-xs text-gray-500">No-win message layout</p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Design Tips</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Keep text large and readable</li>
          <li>• Use high contrast colors</li>
          <li>• Test on mobile devices</li>
          <li>• Make prizes clearly visible</li>
        </ul>
      </div>
    </div>
  );
}
