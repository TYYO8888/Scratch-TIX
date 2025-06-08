'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdvancedScratchCard } from '@/components/scratch-card/advanced-scratch-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Share, Download } from 'lucide-react';

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const [campaignId, setCampaignId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const id = searchParams.get('campaign');
    if (id) setCampaignId(id);
  }, [searchParams]);

  const handleReset = () => {
    setIsCompleted(false);
    setKey(prev => prev + 1);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    console.log('Scratch card completed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎮 Campaign Preview
          </h1>
          <p className="text-xl text-gray-300">
            Experience your scratch card campaign
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Campaign ID: {campaignId || 'demo'}
          </p>
        </div>

        {/* Scratch Card Container */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 Scratch & Win Extravaganza! 🎉
            </h2>
            <p className="text-gray-300">
              Scratch the card below to reveal your amazing prize!
            </p>
          </div>

          {/* Scratch Card */}
          <div className="flex justify-center mb-6">
            <AdvancedScratchCard
              key={key}
              width={400}
              height={250}
              overlayImage="/api/placeholder/400/250"
              revealContent={
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-white relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  
                  {/* Prize content */}
                  <div className="text-center z-10">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">
                      CONGRATULATIONS!
                    </h3>
                    <p className="text-xl font-semibold mb-2">
                      You Won a $50 Discount!
                    </p>
                    <p className="text-sm opacity-90">
                      Use code: SCRATCH50
                    </p>
                    <div className="mt-4 text-4xl">💰</div>
                  </div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute top-4 left-4 text-2xl animate-spin">✨</div>
                  <div className="absolute top-8 right-6 text-xl animate-pulse">⭐</div>
                  <div className="absolute bottom-6 left-8 text-lg animate-bounce">🌟</div>
                  <div className="absolute bottom-4 right-4 text-2xl animate-spin">✨</div>
                </div>
              }
              scratchPercentage={30}
              onComplete={handleComplete}
              enableParticles={true}
              enableSound={true}
              enableHaptics={true}
            />
          </div>

          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm">
              {isCompleted 
                ? "🎊 Congratulations! You've revealed your prize!" 
                : "👆 Use your mouse or finger to scratch the silver area above"
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            {isCompleted && (
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                <Download className="w-4 h-4 mr-2" />
                Claim Prize
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => window.close()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Close Preview
          </Button>
        </div>

        {/* Campaign Stats */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            📊 Campaign Performance
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-400">2,847</div>
              <div className="text-sm text-gray-400">Total Plays</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">24.8%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">$12,450</div>
              <div className="text-sm text-gray-400">Total Value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
