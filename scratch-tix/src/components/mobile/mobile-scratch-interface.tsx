'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdvancedScratchCard } from '@/components/scratch-card/advanced-scratch-card';
import { Prize } from '@/lib/types/campaign';
import { 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Vibrate,
  RotateCcw,
  Share,
  Download,
  Info
} from 'lucide-react';

interface MobileScratchInterfaceProps {
  prizes: Prize[];
  winProbability: number;
  onComplete: (hasWon: boolean, prize?: Prize) => void;
  campaignId: string;
  organizationId: string;
}

export function MobileScratchInterface({
  prizes,
  winProbability,
  onComplete,
  campaignId,
  organizationId,
}: MobileScratchInterfaceProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string;
    platform: string;
    touchSupport: boolean;
    screenSize: { width: number; height: number };
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const instructionTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect mobile device and capabilities
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileDevice || hasTouch);
      setDeviceInfo({
        userAgent,
        platform: navigator.platform,
        touchSupport: hasTouch,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
      
      // Force layout recalculation after orientation change
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.height = `${window.innerHeight}px`;
        }
      }, 100);
    };

    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Auto-hide instructions after delay
  useEffect(() => {
    if (showInstructions) {
      instructionTimeoutRef.current = setTimeout(() => {
        setShowInstructions(false);
      }, 5000);
    }

    return () => {
      if (instructionTimeoutRef.current) {
        clearTimeout(instructionTimeoutRef.current);
      }
    };
  }, [showInstructions]);

  // Prevent zoom and scroll on mobile
  useEffect(() => {
    if (isMobile) {
      const preventDefault = (e: Event) => {
        if (e.target instanceof HTMLCanvasElement) {
          e.preventDefault();
        }
      };

      const preventZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchstart', preventDefault, { passive: false });
      document.addEventListener('touchmove', preventDefault, { passive: false });
      document.addEventListener('touchend', preventDefault, { passive: false });
      document.addEventListener('gesturestart', preventZoom, { passive: false });
      document.addEventListener('gesturechange', preventZoom, { passive: false });
      document.addEventListener('gestureend', preventZoom, { passive: false });

      // Prevent double-tap zoom
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (e) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      return () => {
        document.removeEventListener('touchstart', preventDefault);
        document.removeEventListener('touchmove', preventDefault);
        document.removeEventListener('touchend', preventDefault);
        document.removeEventListener('gesturestart', preventZoom);
        document.removeEventListener('gesturechange', preventZoom);
        document.removeEventListener('gestureend', preventZoom);
      };
    }
  }, [isMobile]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.warn('Fullscreen not supported:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.warn('Exit fullscreen failed:', error);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scratch & Win!',
          text: 'Try your luck with this scratch card!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.warn('Share not supported:', error);
      }
    }
  };

  const getOptimalCardSize = () => {
    if (!deviceInfo) return { width: 300, height: 200 };

    const { width: screenWidth, height: screenHeight } = deviceInfo.screenSize;
    const padding = 40;
    const availableWidth = screenWidth - padding;
    const availableHeight = screenHeight - 200; // Reserve space for UI

    // Maintain 3:2 aspect ratio
    const aspectRatio = 3 / 2;
    let cardWidth = Math.min(availableWidth, 400);
    let cardHeight = cardWidth / aspectRatio;

    if (cardHeight > availableHeight) {
      cardHeight = availableHeight;
      cardWidth = cardHeight * aspectRatio;
    }

    return {
      width: Math.floor(cardWidth),
      height: Math.floor(cardHeight),
    };
  };

  const cardSize = getOptimalCardSize();

  return (
    <div 
      ref={containerRef}
      className={`mobile-scratch-interface ${isMobile ? 'mobile' : 'desktop'} ${orientation}`}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mobile-specific header */}
      {isMobile && (
        <div className="mobile-header" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 1000,
          color: 'white',
        }}>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span className="font-semibold">Scratch & Win</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <Vibrate className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      {showInstructions && (
        <div 
          className="instructions-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            color: 'white',
            padding: '2rem',
          }}
          onClick={() => setShowInstructions(false)}
        >
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">👆</div>
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <div className="space-y-3 text-lg">
              <p>🎯 Scratch the card with your finger</p>
              <p>🎁 Reveal what's underneath</p>
              <p>🏆 Win amazing prizes!</p>
            </div>
            <button 
              className="mt-6 px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => setShowInstructions(false)}
            >
              Got it! Let's play
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div 
        className="main-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: isMobile ? '80px 1rem 1rem' : '2rem',
        }}
      >
        <div className="scratch-card-wrapper" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <AdvancedScratchCard
            width={cardSize.width}
            height={cardSize.height}
            scratchPercentage={30}
            onComplete={onComplete}
            prizes={prizes}
            winProbability={winProbability}
            enableParticles={true}
            enableSound={soundEnabled}
            enableHaptics={hapticsEnabled}
            scratchRadius={isMobile ? 30 : 25}
            animationSpeed={1.2}
            className="mobile-optimized"
          />
        </div>

        {/* Mobile-specific controls */}
        {isMobile && (
          <div className="mobile-controls" style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <button
              onClick={() => setShowInstructions(true)}
              className="control-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Info className="w-4 h-4" />
              Help
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="control-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              New Card
            </button>
          </div>
        )}
      </div>

      {/* Device info (development only) */}
      {process.env.NODE_ENV === 'development' && deviceInfo && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '5px',
          fontSize: '0.75rem',
          zIndex: 1000,
        }}>
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Touch: {deviceInfo.touchSupport ? 'Yes' : 'No'}</div>
          <div>Orientation: {orientation}</div>
          <div>Size: {deviceInfo.screenSize.width}×{deviceInfo.screenSize.height}</div>
        </div>
      )}
    </div>
  );
}
