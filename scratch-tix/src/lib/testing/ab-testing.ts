import { z } from 'zod';

// A/B Testing Types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  campaignId: string;
  organizationId: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  type: 'simple' | 'multivariate' | 'multi_armed_bandit';
  variants: ABTestVariant[];
  trafficAllocation: Record<string, number>; // variant_id -> percentage
  targetMetrics: ABTestMetric[];
  segmentation: ABTestSegmentation;
  schedule: ABTestSchedule;
  results: ABTestResults;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  config: {
    scratchPercentage?: number;
    winProbability?: number;
    design?: {
      primaryColor?: string;
      secondaryColor?: string;
      backgroundImage?: string;
      overlayImage?: string;
    };
    prizes?: Array<{
      id: string;
      probability: number;
      value: string;
    }>;
    messaging?: {
      title?: string;
      description?: string;
      callToAction?: string;
    };
    features?: {
      enableSound?: boolean;
      enableHaptics?: boolean;
      enableParticles?: boolean;
      scratchRadius?: number;
    };
  };
  participants: number;
  conversions: number;
  revenue: number;
}

export interface ABTestMetric {
  id: string;
  name: string;
  type: 'conversion_rate' | 'revenue' | 'engagement_time' | 'completion_rate' | 'share_rate';
  goal: 'maximize' | 'minimize';
  primaryMetric: boolean;
  currentValue?: number;
  targetValue?: number;
  confidenceLevel: number;
  statisticalSignificance?: number;
}

export interface ABTestSegmentation {
  enabled: boolean;
  criteria: Array<{
    type: 'device' | 'location' | 'user_segment' | 'traffic_source' | 'time_of_day';
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'between';
    value: any;
  }>;
  trafficSplit: number; // Percentage of total traffic to include in test
}

export interface ABTestSchedule {
  startDate?: string;
  endDate?: string;
  duration?: number; // in days
  minSampleSize: number;
  maxSampleSize?: number;
  autoStop: {
    enabled: boolean;
    confidenceThreshold: number;
    minimumRunTime: number; // in hours
  };
}

export interface ABTestResults {
  status: 'insufficient_data' | 'running' | 'significant' | 'inconclusive';
  winningVariant?: string;
  confidence: number;
  pValue?: number;
  effectSize?: number;
  recommendations: string[];
  variantResults: Record<string, {
    participants: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    revenuePerParticipant: number;
    confidence: number;
    uplift?: number;
  }>;
  statisticalAnalysis: {
    sampleSizeReached: boolean;
    minimumDetectableEffect: number;
    power: number;
    alpha: number;
  };
}

// Validation Schemas
const CreateABTestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  campaignId: z.string(),
  type: z.enum(['simple', 'multivariate', 'multi_armed_bandit']).default('simple'),
  variants: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    isControl: z.boolean().default(false),
    config: z.record(z.any()),
  })).min(2),
  trafficAllocation: z.record(z.number().min(0).max(100)),
  targetMetrics: z.array(z.object({
    name: z.string(),
    type: z.enum(['conversion_rate', 'revenue', 'engagement_time', 'completion_rate', 'share_rate']),
    goal: z.enum(['maximize', 'minimize']).default('maximize'),
    primaryMetric: z.boolean().default(false),
    targetValue: z.number().optional(),
    confidenceLevel: z.number().min(0.8).max(0.99).default(0.95),
  })),
  segmentation: z.object({
    enabled: z.boolean().default(false),
    criteria: z.array(z.object({
      type: z.enum(['device', 'location', 'user_segment', 'traffic_source', 'time_of_day']),
      operator: z.enum(['equals', 'not_equals', 'in', 'not_in', 'between']),
      value: z.any(),
    })).default([]),
    trafficSplit: z.number().min(1).max(100).default(100),
  }),
  schedule: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    duration: z.number().positive().optional(),
    minSampleSize: z.number().positive().default(100),
    maxSampleSize: z.number().positive().optional(),
    autoStop: z.object({
      enabled: z.boolean().default(true),
      confidenceThreshold: z.number().min(0.8).max(0.99).default(0.95),
      minimumRunTime: z.number().positive().default(24),
    }),
  }),
});

// A/B Testing Engine
export class ABTestingEngine {
  private tests: Map<string, ABTest> = new Map();
  private participantAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId

  // Test Management
  async createTest(testData: z.infer<typeof CreateABTestSchema>): Promise<ABTest> {
    const validatedData = CreateABTestSchema.parse(testData);
    
    // Validate traffic allocation
    const totalAllocation = Object.values(validatedData.trafficAllocation).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Traffic allocation must sum to 100%');
    }

    // Ensure at least one primary metric
    const primaryMetrics = validatedData.targetMetrics.filter(m => m.primaryMetric);
    if (primaryMetrics.length === 0) {
      validatedData.targetMetrics[0].primaryMetric = true;
    }

    const test: ABTest = {
      id: `test_${Date.now()}`,
      ...validatedData,
      organizationId: 'org_1', // In production, get from context
      status: 'draft',
      variants: validatedData.variants.map((variant, index) => ({
        id: `variant_${Date.now()}_${index}`,
        ...variant,
        participants: 0,
        conversions: 0,
        revenue: 0,
      })),
      targetMetrics: validatedData.targetMetrics.map((metric, index) => ({
        id: `metric_${Date.now()}_${index}`,
        ...metric,
      })),
      results: {
        status: 'insufficient_data',
        confidence: 0,
        recommendations: [],
        variantResults: {},
        statisticalAnalysis: {
          sampleSizeReached: false,
          minimumDetectableEffect: 0.05,
          power: 0.8,
          alpha: 0.05,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tests.set(test.id, test);
    return test;
  }

  // Participant Assignment
  assignParticipant(testId: string, userId: string, sessionData?: Record<string, any>): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if user already assigned
    const userAssignments = this.participantAssignments.get(userId) || new Map();
    if (userAssignments.has(testId)) {
      return userAssignments.get(testId)!;
    }

    // Check segmentation criteria
    if (test.segmentation.enabled && !this.matchesSegmentation(test.segmentation, sessionData)) {
      return null;
    }

    // Check traffic split
    if (Math.random() * 100 > test.segmentation.trafficSplit) {
      return null;
    }

    // Assign variant based on traffic allocation
    const variantId = this.selectVariant(test.trafficAllocation);
    
    // Store assignment
    userAssignments.set(testId, variantId);
    this.participantAssignments.set(userId, userAssignments);

    // Update participant count
    const variant = test.variants.find(v => v.id === variantId);
    if (variant) {
      variant.participants++;
      test.updatedAt = new Date().toISOString();
    }

    return variantId;
  }

  // Event Tracking
  trackConversion(testId: string, userId: string, metricType: string, value: number = 1): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;

    const userAssignments = this.participantAssignments.get(userId);
    if (!userAssignments || !userAssignments.has(testId)) return false;

    const variantId = userAssignments.get(testId)!;
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return false;

    // Update variant metrics
    switch (metricType) {
      case 'conversion':
        variant.conversions++;
        break;
      case 'revenue':
        variant.revenue += value;
        break;
    }

    // Recalculate results
    this.calculateResults(test);
    
    // Check for auto-stop conditions
    if (test.schedule.autoStop.enabled) {
      this.checkAutoStopConditions(test);
    }

    test.updatedAt = new Date().toISOString();
    return true;
  }

  // Statistical Analysis
  private calculateResults(test: ABTest): void {
    const controlVariant = test.variants.find(v => v.isControl);
    if (!controlVariant || controlVariant.participants === 0) {
      test.results.status = 'insufficient_data';
      return;
    }

    const controlConversionRate = controlVariant.conversions / controlVariant.participants;
    let bestVariant = controlVariant;
    let bestConversionRate = controlConversionRate;
    let maxConfidence = 0;

    // Calculate results for each variant
    test.results.variantResults = {};
    
    for (const variant of test.variants) {
      if (variant.participants === 0) continue;

      const conversionRate = variant.conversions / variant.participants;
      const revenuePerParticipant = variant.revenue / variant.participants;
      
      // Calculate statistical significance vs control
      const { confidence, pValue } = this.calculateStatisticalSignificance(
        controlVariant.conversions,
        controlVariant.participants,
        variant.conversions,
        variant.participants
      );

      const uplift = variant.isControl ? 0 : ((conversionRate - controlConversionRate) / controlConversionRate) * 100;

      test.results.variantResults[variant.id] = {
        participants: variant.participants,
        conversions: variant.conversions,
        conversionRate,
        revenue: variant.revenue,
        revenuePerParticipant,
        confidence,
        uplift,
      };

      // Track best performing variant
      if (conversionRate > bestConversionRate && confidence > maxConfidence) {
        bestVariant = variant;
        bestConversionRate = conversionRate;
        maxConfidence = confidence;
      }
    }

    // Update overall test results
    test.results.confidence = maxConfidence;
    test.results.winningVariant = bestVariant.id;
    
    // Determine test status
    const minSampleSizeReached = test.variants.every(v => v.participants >= test.schedule.minSampleSize);
    test.results.statisticalAnalysis.sampleSizeReached = minSampleSizeReached;

    if (!minSampleSizeReached) {
      test.results.status = 'insufficient_data';
    } else if (maxConfidence >= 0.95) {
      test.results.status = 'significant';
    } else {
      test.results.status = 'running';
    }

    // Generate recommendations
    test.results.recommendations = this.generateRecommendations(test);
  }

  private calculateStatisticalSignificance(
    controlConversions: number,
    controlParticipants: number,
    variantConversions: number,
    variantParticipants: number
  ): { confidence: number; pValue: number } {
    // Simplified statistical significance calculation
    // In production, use proper statistical libraries
    
    const controlRate = controlConversions / controlParticipants;
    const variantRate = variantConversions / variantParticipants;
    
    const pooledRate = (controlConversions + variantConversions) / (controlParticipants + variantParticipants);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlParticipants + 1/variantParticipants));
    
    if (standardError === 0) {
      return { confidence: 0, pValue: 1 };
    }
    
    const zScore = Math.abs(variantRate - controlRate) / standardError;
    
    // Approximate p-value calculation
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    const confidence = 1 - pValue;
    
    return { confidence: Math.max(0, Math.min(1, confidence)), pValue };
  }

  private normalCDF(x: number): number {
    // Approximation of normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private selectVariant(trafficAllocation: Record<string, number>): string {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [variantId, allocation] of Object.entries(trafficAllocation)) {
      cumulative += allocation;
      if (random <= cumulative) {
        return variantId;
      }
    }
    
    // Fallback to first variant
    return Object.keys(trafficAllocation)[0];
  }

  private matchesSegmentation(segmentation: ABTestSegmentation, sessionData?: Record<string, any>): boolean {
    if (!sessionData) return true;
    
    return segmentation.criteria.every(criterion => {
      const value = sessionData[criterion.type];
      
      switch (criterion.operator) {
        case 'equals':
          return value === criterion.value;
        case 'not_equals':
          return value !== criterion.value;
        case 'in':
          return Array.isArray(criterion.value) && criterion.value.includes(value);
        case 'not_in':
          return Array.isArray(criterion.value) && !criterion.value.includes(value);
        case 'between':
          return value >= criterion.value.min && value <= criterion.value.max;
        default:
          return true;
      }
    });
  }

  private checkAutoStopConditions(test: ABTest): void {
    const runTime = Date.now() - new Date(test.createdAt).getTime();
    const minRunTimeMs = test.schedule.autoStop.minimumRunTime * 60 * 60 * 1000;
    
    if (runTime < minRunTimeMs) return;
    
    if (test.results.confidence >= test.schedule.autoStop.confidenceThreshold) {
      test.status = 'completed';
      test.results.recommendations.push('Test automatically stopped due to statistical significance.');
    }
  }

  private generateRecommendations(test: ABTest): string[] {
    const recommendations: string[] = [];
    
    if (test.results.status === 'significant' && test.results.winningVariant) {
      const winningVariant = test.variants.find(v => v.id === test.results.winningVariant);
      if (winningVariant) {
        recommendations.push(`Implement variant "${winningVariant.name}" as it shows significant improvement.`);
      }
    }
    
    if (test.results.status === 'running') {
      const totalParticipants = test.variants.reduce((sum, v) => sum + v.participants, 0);
      if (totalParticipants < test.schedule.minSampleSize * test.variants.length) {
        recommendations.push('Continue running the test to reach minimum sample size.');
      }
    }
    
    if (test.results.status === 'inconclusive') {
      recommendations.push('Consider running the test longer or increasing traffic allocation.');
    }
    
    return recommendations;
  }

  // Public methods
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  listTests(campaignId?: string): ABTest[] {
    const tests = Array.from(this.tests.values());
    return campaignId ? tests.filter(t => t.campaignId === campaignId) : tests;
  }

  async startTest(testId: string): Promise<boolean> {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'draft') return false;
    
    test.status = 'running';
    test.updatedAt = new Date().toISOString();
    return true;
  }

  async pauseTest(testId: string): Promise<boolean> {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return false;
    
    test.status = 'paused';
    test.updatedAt = new Date().toISOString();
    return true;
  }

  async completeTest(testId: string): Promise<boolean> {
    const test = this.tests.get(testId);
    if (!test) return false;
    
    test.status = 'completed';
    this.calculateResults(test);
    test.updatedAt = new Date().toISOString();
    return true;
  }
}

// Export singleton instance
export const abTestingEngine = new ABTestingEngine();
