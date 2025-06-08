'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Prize } from '@/lib/types/campaign';

interface ScratchCardProps {
  width: number;
  height: number;
  backgroundImage: string;
  overlayImage: string;
  scratchPercentage: number;
  onComplete: (hasWon: boolean, prize?: Prize) => void;
  prizes: Prize[];
  winProbability: number;
  className?: string;
}

export function ScratchCard({
  width,
  height,
  backgroundImage,
  overlayImage,
  scratchPercentage,
  onComplete,
  prizes,
  winProbability,
  className
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedArea, setScratchedArea] = useState(0);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Determine win status on component mount
  useEffect(() => {
    const random = Math.random();
    const won = random < winProbability;
    setHasWon(won);
    
    if (won && prizes.length > 0) {
      // Select prize based on probability distribution
      const selectedPrize = selectPrizeByProbability(prizes);
      setSelectedPrize(selectedPrize);
    }
  }, [winProbability, prizes]);

  // Initialize the canvas
  useEffect(() => {
    if (hasWon !== null) {
      initializeCard();
    }
  }, [hasWon, backgroundImage, overlayImage]);

  const selectPrizeByProbability = (prizes: Prize[]): Prize => {
    const activePrizes = prizes.filter(p => p.isActive && p.currentWinners < p.maxWinners);
    if (activePrizes.length === 0) return prizes[0];

    const totalProbability = activePrizes.reduce((sum, prize) => sum + prize.probability, 0);
    let random = Math.random() * totalProbability;
    
    for (const prize of activePrizes) {
      random -= prize.probability;
      if (random <= 0) return prize;
    }
    
    return activePrizes[0];
  };

  const initializeCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    try {
      // Load and draw background image (prize or lose message)
      const bgImage = new Image();
      bgImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = reject;
        bgImage.src = backgroundImage;
      });

      ctx.drawImage(bgImage, 0, 0, width, height);

      // If won, draw the prize
      if (hasWon && selectedPrize) {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WON!', width / 2, height / 2 - 20);
        ctx.fillText(selectedPrize.name, width / 2, height / 2 + 20);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Better luck next time!', width / 2, height / 2);
      }
      
      // Load and draw overlay
      const overlayImg = new Image();
      overlayImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        overlayImg.onload = resolve;
        overlayImg.onerror = reject;
        overlayImg.src = overlayImage;
      });

      ctx.drawImage(overlayImg, 0, 0, width, height);
    } catch (error) {
      console.error('Error loading images:', error);
      // Fallback to solid colors
      ctx.fillStyle = hasWon ? '#4ade80' : '#ef4444';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        hasWon ? `YOU WON! ${selectedPrize?.name || ''}` : 'Better luck next time!',
        width / 2,
        height / 2
      );
      
      // Draw overlay
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(0, 0, width, height);
    }
  };

  const getEventPos = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleScratch = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || hasWon === null || isComplete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getEventPos(event);

    // Create scratch effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Calculate scratched area
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const scratchedPercentage = (transparentPixels / (width * height)) * 100;
    setScratchedArea(scratchedPercentage);

    // Check if scratch threshold is reached
    if (scratchedPercentage >= scratchPercentage && !isComplete) {
      setIsComplete(true);
      onComplete(hasWon, selectedPrize || undefined);
    }
  }, [hasWon, selectedPrize, scratchPercentage, onComplete, isComplete, width, height]);

  const handleMouseDown = () => setIsScratching(true);
  const handleMouseUp = () => setIsScratching(false);
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isScratching) handleScratch(event);
  };

  const handleTouchStart = () => setIsScratching(true);
  const handleTouchEnd = () => setIsScratching(false);
  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    if (isScratching) handleScratch(event);
  };

  return (
    <div className={`scratch-card-container ${className || ''}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className="cursor-pointer touch-none border rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-2 text-sm text-gray-600 text-center">
        Progress: {scratchedArea.toFixed(1)}% | Threshold: {scratchPercentage}%
      </div>
      {isComplete && (
        <div className="mt-4 text-center">
          <div className={`text-lg font-bold ${hasWon ? 'text-green-600' : 'text-red-600'}`}>
            {hasWon ? '🎉 Congratulations! 🎉' : '😔 Better luck next time!'}
          </div>
          {hasWon && selectedPrize && (
            <div className="mt-2">
              <div className="text-xl font-semibold">{selectedPrize.name}</div>
              <div className="text-gray-600">{selectedPrize.description}</div>
              <div className="text-lg font-bold text-green-600">Value: {selectedPrize.value}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
