'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Prize } from '@/lib/types/campaign';

interface AdvancedScratchCardProps {
  width: number;
  height: number;
  backgroundImage?: string;
  overlayImage?: string;
  scratchPercentage: number;
  onComplete: (hasWon: boolean, prize?: Prize) => void;
  prizes: Prize[];
  winProbability: number;
  className?: string;
  enableParticles?: boolean;
  enableSound?: boolean;
  enableHaptics?: boolean;
  scratchRadius?: number;
  animationSpeed?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function AdvancedScratchCard({
  width,
  height,
  backgroundImage,
  overlayImage,
  scratchPercentage,
  onComplete,
  prizes,
  winProbability,
  className,
  enableParticles = true,
  enableSound = true,
  enableHaptics = true,
  scratchRadius = 25,
  animationSpeed = 1,
}: AdvancedScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedArea, setScratchedArea] = useState(0);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastScratchPos, setLastScratchPos] = useState<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>();

  // Audio context for scratch sounds
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (enableSound && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, [enableSound]);

  // Determine win status on component mount
  useEffect(() => {
    const random = Math.random();
    const won = random < winProbability;
    setHasWon(won);
    
    if (won && prizes.length > 0) {
      const selectedPrize = selectPrizeByProbability(prizes);
      setSelectedPrize(selectedPrize);
    }
  }, [winProbability, prizes]);

  // Initialize the card
  useEffect(() => {
    if (hasWon !== null) {
      initializeCard();
    }
  }, [hasWon, backgroundImage, overlayImage]);

  // Particle animation loop
  useEffect(() => {
    if (enableParticles) {
      const animate = () => {
        updateParticles();
        renderParticles();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableParticles, particles]);

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
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (hasWon) {
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
      } else {
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#dc2626');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add prize content
      if (hasWon && selectedPrize) {
        // Winner background with sparkle effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 3 + 1;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Prize text with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 YOU WON! 🎉', width / 2, height / 2 - 30);
        
        ctx.font = 'bold 20px Arial';
        ctx.fillText(selectedPrize.name, width / 2, height / 2 + 10);
        
        ctx.font = '16px Arial';
        ctx.fillText(`Value: ${selectedPrize.value}`, width / 2, height / 2 + 40);
      } else {
        // Loser background
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('😔 Better luck next time!', width / 2, height / 2 - 10);
        
        ctx.font = '16px Arial';
        ctx.fillText('Try again soon!', width / 2, height / 2 + 20);
      }
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw overlay with texture
      const overlayGradient = ctx.createLinearGradient(0, 0, width, height);
      overlayGradient.addColorStop(0, '#9ca3af');
      overlayGradient.addColorStop(0.5, '#6b7280');
      overlayGradient.addColorStop(1, '#4b5563');
      
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);

      // Add scratch texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
      }

    } catch (error) {
      console.error('Error initializing card:', error);
    }
  };

  const playScatchSound = () => {
    if (!enableSound || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Create scratch sound (white noise burst)
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100 + Math.random() * 200, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.warn('Error playing scratch sound:', error);
    }
  };

  const triggerHapticFeedback = () => {
    if (!enableHaptics || typeof window === 'undefined') return;

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10); // Short vibration
      }
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  };

  const createParticles = (x: number, y: number) => {
    if (!enableParticles) return;

    const newParticles: Particle[] = [];
    const particleCount = 5 + Math.random() * 5;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
        color: `hsl(${Math.random() * 60 + 30}, 70%, 60%)`, // Yellow to orange particles
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  const updateParticles = () => {
    setParticles(prev => prev
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.1, // Gravity
        life: particle.life - (1 / 60) / particle.maxLife, // Assuming 60fps
      }))
      .filter(particle => particle.life > 0)
    );
  };

  const renderParticles = () => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
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

    // Create smooth scratch path
    if (lastScratchPos) {
      const dx = x - lastScratchPos.x;
      const dy = y - lastScratchPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(distance / 5));

      for (let i = 0; i <= steps; i++) {
        const interpolatedX = lastScratchPos.x + (dx * i) / steps;
        const interpolatedY = lastScratchPos.y + (dy * i) / steps;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(interpolatedX, interpolatedY, scratchRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, scratchRadius, 0, 2 * Math.PI);
      ctx.fill();
    }

    setLastScratchPos({ x, y });

    // Create particles at scratch position
    createParticles(x, y);

    // Play scratch sound
    playScatchSound();

    // Trigger haptic feedback
    triggerHapticFeedback();

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
      
      // Create celebration particles for winners
      if (hasWon) {
        for (let i = 0; i < 50; i++) {
          setTimeout(() => {
            createParticles(
              Math.random() * width,
              Math.random() * height
            );
          }, i * 20);
        }
      }
    }
  }, [hasWon, selectedPrize, scratchPercentage, onComplete, isComplete, width, height, lastScratchPos, scratchRadius]);

  const handleMouseDown = () => {
    setIsScratching(true);
    setLastScratchPos(null);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
    setLastScratchPos(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isScratching) handleScratch(event);
  };

  const handleTouchStart = () => {
    setIsScratching(true);
    setLastScratchPos(null);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
    setLastScratchPos(null);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    if (isScratching) handleScratch(event);
  };

  // Enhanced mobile gesture support
  const handleGestureStart = (event: any) => {
    if (event.scale !== 1) {
      event.preventDefault();
    }
  };

  const handleGestureChange = (event: any) => {
    if (event.scale !== 1) {
      event.preventDefault();
    }
  };

  const handleGestureEnd = (event: any) => {
    if (event.scale !== 1) {
      event.preventDefault();
    }
  };

  return (
    <div className={`scratch-card-container ${className || ''}`}>
      <div className="relative">
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
        
        {/* Particle canvas overlay */}
        {enableParticles && (
          <canvas
            ref={particleCanvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 pointer-events-none rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {scratchedArea.toFixed(1)}%</span>
          <span>Threshold: {scratchPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(scratchedArea, 100)}%` }}
          />
        </div>
      </div>

      {isComplete && (
        <div className="mt-6 text-center animate-bounce">
          <div className={`text-2xl font-bold mb-2 ${hasWon ? 'text-green-600' : 'text-red-600'}`}>
            {hasWon ? '🎉 Congratulations! 🎉' : '😔 Better luck next time!'}
          </div>
          {hasWon && selectedPrize && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xl font-semibold text-green-800">{selectedPrize.name}</div>
              <div className="text-green-700">{selectedPrize.description}</div>
              <div className="text-2xl font-bold text-green-600 mt-2">Value: {selectedPrize.value}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
