import { Prize, Campaign } from '@/lib/types/campaign';

export interface PrizeDistribution {
  prizeId: string;
  probability: number;
  maxWinners: number;
  currentWinners: number;
  timeRestrictions?: {
    startTime?: Date;
    endTime?: Date;
    dailyLimit?: number;
    hourlyLimit?: number;
  };
  userRestrictions?: {
    maxWinsPerUser?: number;
    cooldownPeriod?: number; // minutes
    requiresVerification?: boolean;
  };
}

export interface AntifraudConfig {
  maxAttemptsPerUser: number;
  maxAttemptsPerIP: number;
  suspiciousPatternDetection: boolean;
  velocityChecking: boolean;
  deviceFingerprinting: boolean;
  geolocationValidation: boolean;
}

export interface PrizeEngineConfig {
  campaignId: string;
  prizes: PrizeDistribution[];
  antifraud: AntifraudConfig;
  globalWinRate: number;
  dynamicProbability: boolean;
  fairnessMode: 'random' | 'guaranteed' | 'balanced';
}

export interface UserSession {
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
  attempts: number;
  wins: number;
  lastAttempt: Date;
  firstAttempt: Date;
}

export interface PrizeResult {
  hasWon: boolean;
  prize?: Prize;
  reason?: string;
  metadata: {
    sessionId: string;
    timestamp: Date;
    probability: number;
    antifraudScore: number;
    fairnessAdjustment: number;
  };
}

export class PrizeEngine {
  private config: PrizeEngineConfig;
  private sessions: Map<string, UserSession> = new Map();
  private winHistory: Array<{ timestamp: Date; prizeId: string; sessionId: string }> = [];
  private suspiciousActivities: Set<string> = new Set();

  constructor(config: PrizeEngineConfig) {
    this.config = config;
    this.initializeEngine();
  }

  private initializeEngine(): void {
    // Validate prize probabilities
    const totalProbability = this.config.prizes.reduce((sum, prize) => sum + prize.probability, 0);
    if (totalProbability > 1) {
      console.warn('Total prize probability exceeds 100%. Normalizing...');
      this.normalizeProbabilities();
    }

    // Initialize win tracking
    this.loadWinHistory();
  }

  private normalizeProbabilities(): void {
    const totalProbability = this.config.prizes.reduce((sum, prize) => sum + prize.probability, 0);
    this.config.prizes.forEach(prize => {
      prize.probability = prize.probability / totalProbability;
    });
  }

  private loadWinHistory(): void {
    // In a real implementation, this would load from database
    // For now, we'll simulate some historical data
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      this.winHistory.push({
        timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
        prizeId: this.config.prizes[Math.floor(Math.random() * this.config.prizes.length)]?.prizeId || '',
        sessionId: `session_${i}`,
      });
    }
  }

  public async determinePrize(session: UserSession): Promise<PrizeResult> {
    // Update session tracking
    this.updateSession(session);

    // Run antifraud checks
    const antifraudScore = await this.calculateAntifraudScore(session);
    if (antifraudScore > 0.8) {
      return {
        hasWon: false,
        reason: 'Antifraud protection triggered',
        metadata: {
          sessionId: session.sessionId,
          timestamp: new Date(),
          probability: 0,
          antifraudScore,
          fairnessAdjustment: 0,
        },
      };
    }

    // Calculate base probability
    let baseProbability = this.config.globalWinRate;

    // Apply fairness adjustments
    const fairnessAdjustment = this.calculateFairnessAdjustment(session);
    const adjustedProbability = Math.min(1, baseProbability * fairnessAdjustment);

    // Determine if user wins
    const random = Math.random();
    const hasWon = random < adjustedProbability;

    if (!hasWon) {
      return {
        hasWon: false,
        metadata: {
          sessionId: session.sessionId,
          timestamp: new Date(),
          probability: adjustedProbability,
          antifraudScore,
          fairnessAdjustment,
        },
      };
    }

    // Select specific prize
    const selectedPrize = await this.selectPrize(session);
    if (!selectedPrize) {
      return {
        hasWon: false,
        reason: 'No available prizes',
        metadata: {
          sessionId: session.sessionId,
          timestamp: new Date(),
          probability: adjustedProbability,
          antifraudScore,
          fairnessAdjustment,
        },
      };
    }

    // Record the win
    this.recordWin(session, selectedPrize);

    return {
      hasWon: true,
      prize: this.convertToPrize(selectedPrize),
      metadata: {
        sessionId: session.sessionId,
        timestamp: new Date(),
        probability: adjustedProbability,
        antifraudScore,
        fairnessAdjustment,
      },
    };
  }

  private updateSession(session: UserSession): void {
    const existingSession = this.sessions.get(session.sessionId);
    if (existingSession) {
      existingSession.attempts++;
      existingSession.lastAttempt = new Date();
    } else {
      session.attempts = 1;
      session.wins = 0;
      session.firstAttempt = new Date();
      session.lastAttempt = new Date();
    }
    this.sessions.set(session.sessionId, session);
  }

  private async calculateAntifraudScore(session: UserSession): Promise<number> {
    let score = 0;

    // Check attempt velocity
    if (this.config.antifraud.velocityChecking) {
      const recentAttempts = this.getRecentAttempts(session.sessionId, 5); // Last 5 minutes
      if (recentAttempts > 10) score += 0.3;
      if (recentAttempts > 20) score += 0.5;
    }

    // Check IP-based attempts
    const ipAttempts = this.getIPAttempts(session.ipAddress);
    if (ipAttempts > this.config.antifraud.maxAttemptsPerIP) {
      score += 0.4;
    }

    // Check user attempts
    if (session.userId) {
      const userAttempts = this.getUserAttempts(session.userId);
      if (userAttempts > this.config.antifraud.maxAttemptsPerUser) {
        score += 0.3;
      }
    }

    // Check for suspicious patterns
    if (this.config.antifraud.suspiciousPatternDetection) {
      if (this.detectSuspiciousPattern(session)) {
        score += 0.6;
      }
    }

    // Device fingerprint analysis
    if (this.config.antifraud.deviceFingerprinting) {
      const deviceSuspicion = this.analyzeDeviceFingerprint(session.deviceFingerprint);
      score += deviceSuspicion * 0.2;
    }

    // Geolocation validation
    if (this.config.antifraud.geolocationValidation && session.geolocation) {
      const geoSuspicion = this.validateGeolocation(session.geolocation);
      score += geoSuspicion * 0.1;
    }

    return Math.min(1, score);
  }

  private calculateFairnessAdjustment(session: UserSession): number {
    switch (this.config.fairnessMode) {
      case 'random':
        return 1; // No adjustment

      case 'guaranteed':
        // Increase probability for users who haven't won
        const userSession = this.sessions.get(session.sessionId);
        if (!userSession || userSession.wins === 0) {
          const attemptMultiplier = Math.min(3, 1 + (userSession?.attempts || 0) * 0.1);
          return attemptMultiplier;
        }
        return 0.5; // Reduce for users who have already won

      case 'balanced':
        // Balance based on recent win distribution
        const recentWinRate = this.calculateRecentWinRate();
        const targetWinRate = this.config.globalWinRate;
        
        if (recentWinRate < targetWinRate * 0.8) {
          return 1.5; // Increase probability
        } else if (recentWinRate > targetWinRate * 1.2) {
          return 0.7; // Decrease probability
        }
        return 1;

      default:
        return 1;
    }
  }

  private async selectPrize(session: UserSession): Promise<PrizeDistribution | null> {
    // Filter available prizes
    const availablePrizes = this.config.prizes.filter(prize => {
      // Check if prize is still available
      if (prize.currentWinners >= prize.maxWinners) return false;

      // Check time restrictions
      if (prize.timeRestrictions) {
        const now = new Date();
        if (prize.timeRestrictions.startTime && now < prize.timeRestrictions.startTime) return false;
        if (prize.timeRestrictions.endTime && now > prize.timeRestrictions.endTime) return false;
        
        // Check daily/hourly limits
        if (prize.timeRestrictions.dailyLimit) {
          const todayWins = this.getTodayWins(prize.prizeId);
          if (todayWins >= prize.timeRestrictions.dailyLimit) return false;
        }
        
        if (prize.timeRestrictions.hourlyLimit) {
          const hourlyWins = this.getHourlyWins(prize.prizeId);
          if (hourlyWins >= prize.timeRestrictions.hourlyLimit) return false;
        }
      }

      // Check user restrictions
      if (prize.userRestrictions && session.userId) {
        const userWins = this.getUserPrizeWins(session.userId, prize.prizeId);
        if (prize.userRestrictions.maxWinsPerUser && userWins >= prize.userRestrictions.maxWinsPerUser) {
          return false;
        }

        // Check cooldown period
        if (prize.userRestrictions.cooldownPeriod) {
          const lastWin = this.getLastUserPrizeWin(session.userId, prize.prizeId);
          if (lastWin) {
            const cooldownEnd = new Date(lastWin.getTime() + prize.userRestrictions.cooldownPeriod * 60000);
            if (new Date() < cooldownEnd) return false;
          }
        }
      }

      return true;
    });

    if (availablePrizes.length === 0) return null;

    // Apply dynamic probability adjustments
    if (this.config.dynamicProbability) {
      this.adjustPrizeProbabilities(availablePrizes);
    }

    // Select prize based on probability
    const totalProbability = availablePrizes.reduce((sum, prize) => sum + prize.probability, 0);
    let random = Math.random() * totalProbability;

    for (const prize of availablePrizes) {
      random -= prize.probability;
      if (random <= 0) return prize;
    }

    return availablePrizes[0]; // Fallback
  }

  private adjustPrizeProbabilities(prizes: PrizeDistribution[]): void {
    prizes.forEach(prize => {
      // Adjust based on remaining inventory
      const remainingRatio = (prize.maxWinners - prize.currentWinners) / prize.maxWinners;
      
      // Increase probability for prizes with high inventory
      if (remainingRatio > 0.8) {
        prize.probability *= 1.2;
      } else if (remainingRatio < 0.2) {
        prize.probability *= 0.8;
      }
    });
  }

  private recordWin(session: UserSession, prize: PrizeDistribution): void {
    // Update prize counters
    prize.currentWinners++;

    // Update session
    const userSession = this.sessions.get(session.sessionId);
    if (userSession) {
      userSession.wins++;
    }

    // Record in win history
    this.winHistory.push({
      timestamp: new Date(),
      prizeId: prize.prizeId,
      sessionId: session.sessionId,
    });

    // Trim old history (keep last 1000 entries)
    if (this.winHistory.length > 1000) {
      this.winHistory = this.winHistory.slice(-1000);
    }
  }

  private convertToPrize(prizeDistribution: PrizeDistribution): Prize {
    // This would typically fetch full prize details from database
    return {
      id: prizeDistribution.prizeId,
      name: `Prize ${prizeDistribution.prizeId}`,
      description: 'Amazing prize description',
      value: '$100',
      type: 'discount',
      probability: prizeDistribution.probability,
      maxWinners: prizeDistribution.maxWinners,
      currentWinners: prizeDistribution.currentWinners,
      isActive: true,
      imageUrl: '/api/placeholder/200/200',
    };
  }

  // Helper methods for antifraud and analytics
  private getRecentAttempts(sessionId: string, minutes: number): number {
    const cutoff = new Date(Date.now() - minutes * 60000);
    return this.winHistory.filter(entry => 
      entry.sessionId === sessionId && entry.timestamp > cutoff
    ).length;
  }

  private getIPAttempts(ipAddress: string): number {
    // In real implementation, this would query database
    return Array.from(this.sessions.values())
      .filter(session => session.ipAddress === ipAddress)
      .reduce((sum, session) => sum + session.attempts, 0);
  }

  private getUserAttempts(userId: string): number {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .reduce((sum, session) => sum + session.attempts, 0);
  }

  private detectSuspiciousPattern(session: UserSession): boolean {
    // Implement pattern detection logic
    const userSession = this.sessions.get(session.sessionId);
    if (!userSession) return false;

    // Check for rapid-fire attempts
    const timeSinceFirst = new Date().getTime() - userSession.firstAttempt.getTime();
    const attemptsPerMinute = (userSession.attempts / (timeSinceFirst / 60000));
    
    return attemptsPerMinute > 10; // More than 10 attempts per minute
  }

  private analyzeDeviceFingerprint(fingerprint: string): number {
    // Implement device fingerprint analysis
    // Return suspicion score between 0 and 1
    return 0; // Placeholder
  }

  private validateGeolocation(geo: UserSession['geolocation']): number {
    // Implement geolocation validation
    // Return suspicion score between 0 and 1
    return 0; // Placeholder
  }

  private calculateRecentWinRate(): number {
    const recentWins = this.winHistory.filter(entry => 
      entry.timestamp > new Date(Date.now() - 60 * 60000) // Last hour
    ).length;
    
    const recentAttempts = Array.from(this.sessions.values())
      .filter(session => session.lastAttempt > new Date(Date.now() - 60 * 60000))
      .reduce((sum, session) => sum + session.attempts, 0);

    return recentAttempts > 0 ? recentWins / recentAttempts : 0;
  }

  private getTodayWins(prizeId: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.winHistory.filter(entry => 
      entry.prizeId === prizeId && entry.timestamp >= today
    ).length;
  }

  private getHourlyWins(prizeId: string): number {
    const hourAgo = new Date(Date.now() - 60 * 60000);
    
    return this.winHistory.filter(entry => 
      entry.prizeId === prizeId && entry.timestamp >= hourAgo
    ).length;
  }

  private getUserPrizeWins(userId: string, prizeId: string): number {
    return this.winHistory.filter(entry => {
      const session = this.sessions.get(entry.sessionId);
      return session?.userId === userId && entry.prizeId === prizeId;
    }).length;
  }

  private getLastUserPrizeWin(userId: string, prizeId: string): Date | null {
    const userWins = this.winHistory
      .filter(entry => {
        const session = this.sessions.get(entry.sessionId);
        return session?.userId === userId && entry.prizeId === prizeId;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return userWins.length > 0 ? userWins[0].timestamp : null;
  }

  // Public methods for analytics and management
  public getEngineStats() {
    return {
      totalSessions: this.sessions.size,
      totalWins: this.winHistory.length,
      currentWinRate: this.calculateRecentWinRate(),
      suspiciousActivities: this.suspiciousActivities.size,
      prizeInventory: this.config.prizes.map(prize => ({
        prizeId: prize.prizeId,
        remaining: prize.maxWinners - prize.currentWinners,
        percentage: ((prize.maxWinners - prize.currentWinners) / prize.maxWinners) * 100,
      })),
    };
  }

  public updateConfig(newConfig: Partial<PrizeEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.prizes) {
      this.normalizeProbabilities();
    }
  }
}
