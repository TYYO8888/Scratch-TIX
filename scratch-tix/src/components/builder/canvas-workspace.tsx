'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CanvasElement } from '@/lib/types/campaign';
import { Trash2, Move, RotateCw } from 'lucide-react';

interface CanvasWorkspaceProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  canvasSize: { width: number; height: number };
  previewMode: 'design' | 'preview';
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onElementDelete: (elementId: string) => void;
}

export function CanvasWorkspace({
  elements,
  selectedElement,
  canvasSize,
  previewMode,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
}: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    elementId: string | null;
    startPos: { x: number; y: number };
    elementStartPos: { x: number; y: number };
  }>({
    isDragging: false,
    elementId: null,
    startPos: { x: 0, y: 0 },
    elementStartPos: { x: 0, y: 0 },
  });

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewMode === 'design') {
      onElementSelect(elementId);
    }
  };

  const handleCanvasClick = () => {
    if (previewMode === 'design') {
      onElementSelect(null);
    }
  };

  const handleMouseDown = (elementId: string, e: React.MouseEvent) => {
    if (previewMode !== 'design') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setDragState({
      isDragging: true,
      elementId,
      startPos: { x: e.clientX, y: e.clientY },
      elementStartPos: { x: element.position.x, y: element.position.y },
    });

    onElementSelect(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.elementId) return;

    const deltaX = e.clientX - dragState.startPos.x;
    const deltaY = e.clientY - dragState.startPos.y;

    const newX = Math.max(0, Math.min(canvasSize.width - 50, dragState.elementStartPos.x + deltaX));
    const newY = Math.max(0, Math.min(canvasSize.height - 20, dragState.elementStartPos.y + deltaY));

    onElementUpdate(dragState.elementId, {
      position: { x: newX, y: newY },
      properties: {
        ...elements.find(el => el.id === dragState.elementId)?.properties,
        x: newX,
        y: newY,
      },
    });
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      elementId: null,
      startPos: { x: 0, y: 0 },
      elementStartPos: { x: 0, y: 0 },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('text/plain') as 'text' | 'image' | 'shape';
    
    if (!elementType) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // This would trigger adding a new element at the drop position
    // For now, we'll just log it since the actual implementation would need
    // to be coordinated with the parent component
    console.log(`Drop ${elementType} at ${x}, ${y}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id && previewMode === 'design';
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      width: element.properties.width,
      height: element.properties.height,
      zIndex: element.zIndex,
      cursor: previewMode === 'design' ? 'move' : 'default',
      transform: element.properties.rotation ? `rotate(${element.properties.rotation}deg)` : undefined,
      opacity: element.properties.opacity || 1,
    };

    let content;

    switch (element.type) {
      case 'text':
        content = (
          <div
            style={{
              ...style,
              fontSize: element.properties.fontSize,
              fontFamily: element.properties.fontFamily,
              fontWeight: element.properties.fontWeight,
              color: element.properties.color,
              textAlign: element.properties.textAlign as any,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.properties.textAlign === 'center' ? 'center' : 
                             element.properties.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: '4px',
              border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              borderRadius: '4px',
              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            }}
            onClick={(e) => handleElementClick(element.id, e)}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            {element.properties.text || 'Text'}
          </div>
        );
        break;

      case 'image':
        content = (
          <div
            style={{
              ...style,
              border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              borderRadius: '4px',
              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            }}
            onClick={(e) => handleElementClick(element.id, e)}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            <img
              src={element.properties.src || '/api/placeholder/100/100'}
              alt={element.properties.alt || 'Image'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '2px',
              }}
            />
          </div>
        );
        break;

      case 'shape':
        const shapeStyle: React.CSSProperties = {
          ...style,
          backgroundColor: element.properties.fill,
          border: `${element.properties.strokeWidth || 0}px solid ${element.properties.stroke || 'transparent'}`,
          borderRadius: element.properties.shapeType === 'circle' ? '50%' : '4px',
          boxSizing: 'border-box',
        };

        if (isSelected) {
          shapeStyle.boxShadow = '0 0 0 2px #3b82f6';
        }

        content = (
          <div
            style={shapeStyle}
            onClick={(e) => handleElementClick(element.id, e)}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          />
        );
        break;

      default:
        content = null;
    }

    return (
      <div key={element.id}>
        {content}
        {isSelected && previewMode === 'design' && (
          <div
            style={{
              position: 'absolute',
              left: element.position.x + element.properties.width + 8,
              top: element.position.y,
              zIndex: 1000,
            }}
          >
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => onElementDelete(element.id)}
                className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Delete element"
              >
                <Trash2 style={{ width: '1rem', height: '1rem' }} />
              </button>
              <button
                className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
                title="Move element"
              >
                <Move style={{ width: '1rem', height: '1rem' }} />
              </button>
              <button
                onClick={() => {
                  const currentRotation = element.properties.rotation || 0;
                  onElementUpdate(element.id, {
                    properties: {
                      ...element.properties,
                      rotation: (currentRotation + 90) % 360,
                    },
                  });
                }}
                className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 transition-colors"
                title="Rotate element"
              >
                <RotateCw style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden"
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        cursor: dragState.isDragging ? 'grabbing' : 'default',
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Grid overlay for design mode */}
      {previewMode === 'design' && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      {/* Canvas elements */}
      {elements
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(renderElement)}

      {/* Canvas info overlay */}
      {previewMode === 'design' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {canvasSize.width} × {canvasSize.height}px
        </div>
      )}
    </div>
  );
}
