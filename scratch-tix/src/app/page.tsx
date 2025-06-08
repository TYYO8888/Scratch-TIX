'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { AdvancedScratchCard } from '@/components/scratch-card/advanced-scratch-card';
import { MobileScratchInterface } from '@/components/mobile/mobile-scratch-interface';
import { Button } from '@/components/ui/button';
import { Prize } from '@/lib/types/campaign';
import { AuthProvider } from '@/lib/hooks/use-auth';

// Sample data for demonstration
const samplePrizes: Prize[] = [
  {
    id: '1',
    name: '$100 Gift Card',
    description: 'Amazon Gift Card',
    value: '$100',
    probability: 0.1,
    maxWinners: 10,
    currentWinners: 0,
    isActive: true,
  },
  {
    id: '2',
    name: 'Free Coffee',
    description: 'Starbucks Coffee',
    value: '$5',
    probability: 0.3,
    maxWinners: 100,
    currentWinners: 0,
    isActive: true,
  },
];

export default function Home() {
  const [gameResult, setGameResult] = useState<{ hasWon: boolean; prize?: Prize } | null>(null);
  const [showCard, setShowCard] = useState(false);

  const handleGameComplete = (hasWon: boolean, prize?: Prize) => {
    setGameResult({ hasWon, prize });
  };

  const resetGame = () => {
    setGameResult(null);
    setShowCard(false);
    setTimeout(() => setShowCard(true), 100);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br">
        <Header />

        <main className="container" style={{ padding: '2rem 1rem' }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Scratch TIX
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The ultimate platform for creating digital scratch cards and promotional campaigns
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">🎯 Phase 2 Progress: Core Infrastructure</h2>
              <div className="flex space-x-3">
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started Free</Button>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">✅ Completed</h3>
                <ul className="text-left space-y-2">
                  <li>• Next.js project setup with TypeScript</li>
                  <li>• Firebase authentication system</li>
                  <li>• User registration and login pages</li>
                  <li>• Dashboard layout with sidebar navigation</li>
                  <li>• Core type definitions (Campaign, User, Analytics)</li>
                  <li>• Validation schemas with Zod</li>
                  <li>• Scratch card component with Canvas API</li>
                  <li>• Security rules and database structure</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">🚧 Next Steps</h3>
                <ul className="text-left space-y-2">
                  <li>• Campaign creation and management</li>
                  <li>• WYSIWYG builder interface</li>
                  <li>• Template system implementation</li>
                  <li>• Advanced scratch card features</li>
                  <li>• Analytics dashboard</li>
                  <li>• API endpoints and integrations</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold mb-4">🎮 Demo: Scratch Card Component</h3>
              <p className="text-gray-600 mb-6">
                Try our scratch card component! This demonstrates the core functionality that will power the platform.
              </p>

              <div className="flex flex-col items-center space-y-4">
                {!showCard && !gameResult && (
                  <Button onClick={() => setShowCard(true)} size="lg">
                    Start Demo Scratch Card
                  </Button>
                )}

                {showCard && !gameResult && (
                  <AdvancedScratchCard
                    width={400}
                    height={300}
                    scratchPercentage={60}
                    onComplete={handleGameComplete}
                    prizes={samplePrizes}
                    winProbability={0.4}
                    enableParticles={true}
                    enableSound={true}
                    enableHaptics={true}
                    scratchRadius={25}
                    animationSpeed={1}
                    className="mx-auto"
                  />
                )}

                {gameResult && (
                  <div className="text-center space-y-4">
                    <Button onClick={resetGame} variant="outline">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">🎨 WYSIWYG Builder</h3>
            <p className="text-gray-600">
              Drag-and-drop interface for creating beautiful scratch cards with custom elements, prizes, and branding.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">🔗 Multi-Channel Distribution</h3>
            <p className="text-gray-600">
              Distribute campaigns via web, email, SMS, and social media with embeddable widgets and API integration.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">📊 Advanced Analytics</h3>
            <p className="text-gray-600">
              Track performance, user behavior, and ROI with comprehensive analytics and exportable reports.
            </p>
          </div>
        </div>
      </main>
      </div>
    </AuthProvider>
  );
}
