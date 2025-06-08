export interface PerformanceMetrics {
  // Timing metrics
  pageLoadTime: number;
  scratchCardInitTime: number;
  firstInteractionTime: number;
  completionTime: number;
  
  // User interaction metrics
  totalScratchStrokes: number;
  averageStrokeLength: number;
  scratchingDuration: number;
  pausesBetweenStrokes: number;
  
  // Technical metrics
  frameRate: number;
  memoryUsage: number;
  canvasRenderTime: number;
  particleCount: number;
  
  // Device metrics
  deviceType: 'mobile' | 'tablet' | 'desktop';
  touchSupport: boolean;
  screenResolution: string;
  browserInfo: string;
  connectionSpeed: string;
  
  // Engagement metrics
  timeToFirstScratch: number;
  engagementScore: number;
  completionRate: number;
  bounceRate: number;
}

export interface UserBehaviorEvent {
  type: 'scratch_start' | 'scratch_stroke' | 'scratch_pause' | 'scratch_complete' | 'prize_reveal' | 'share_action' | 'exit_intent';
  timestamp: number;
  data: Record<string, any>;
  sessionId: string;
  userId?: string;
}

export interface AnalyticsConfig {
  enableRealTimeTracking: boolean;
  enableHeatmaps: boolean;
  enablePerformanceMonitoring: boolean;
  enableUserBehaviorTracking: boolean;
  enableA11yTracking: boolean;
  batchSize: number;
  flushInterval: number;
  endpoint?: string;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private events: UserBehaviorEvent[] = [];
  private config: AnalyticsConfig;
  private sessionId: string;
  private startTime: number;
  private frameRateMonitor: number | null = null;
  private memoryMonitor: number | null = null;
  private heatmapData: Array<{ x: number; y: number; intensity: number; timestamp: number }> = [];
  
  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    
    this.initializeMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring(): void {
    // Initialize performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.startPerformanceMonitoring();
    }

    // Initialize user behavior tracking
    if (this.config.enableUserBehaviorTracking) {
      this.startBehaviorTracking();
    }

    // Initialize heatmap tracking
    if (this.config.enableHeatmaps) {
      this.startHeatmapTracking();
    }

    // Collect initial device metrics
    this.collectDeviceMetrics();

    // Set up periodic data flushing
    setInterval(() => {
      this.flushData();
    }, this.config.flushInterval);
  }

  private startPerformanceMonitoring(): void {
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        this.metrics.frameRate = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }
      
      this.frameRateMonitor = requestAnimationFrame(measureFrameRate);
    };
    
    measureFrameRate();

    // Monitor memory usage
    if ('memory' in performance) {
      this.memoryMonitor = setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }, 5000) as any;
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
    });
  }

  private startBehaviorTracking(): void {
    // Track mouse/touch movements for engagement analysis
    let lastInteractionTime = 0;
    let interactionCount = 0;

    const trackInteraction = (event: MouseEvent | TouchEvent) => {
      const currentTime = performance.now();
      
      if (lastInteractionTime === 0) {
        this.metrics.firstInteractionTime = currentTime - this.startTime;
      }
      
      interactionCount++;
      lastInteractionTime = currentTime;

      // Calculate engagement score based on interaction frequency
      const timeSinceStart = currentTime - this.startTime;
      this.metrics.engagementScore = (interactionCount / (timeSinceStart / 1000)) * 100;
    };

    document.addEventListener('mousedown', trackInteraction);
    document.addEventListener('touchstart', trackInteraction);
    document.addEventListener('mousemove', trackInteraction);
    document.addEventListener('touchmove', trackInteraction);

    // Track exit intent
    document.addEventListener('mouseleave', () => {
      this.trackEvent('exit_intent', { timestamp: performance.now() });
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { timestamp: performance.now() });
      } else {
        this.trackEvent('page_visible', { timestamp: performance.now() });
      }
    });
  }

  private startHeatmapTracking(): void {
    const trackHeatmapPoint = (event: MouseEvent | TouchEvent) => {
      const x = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const y = 'touches' in event ? event.touches[0].clientY : event.clientY;
      
      this.heatmapData.push({
        x,
        y,
        intensity: 1,
        timestamp: performance.now(),
      });

      // Limit heatmap data size
      if (this.heatmapData.length > 1000) {
        this.heatmapData = this.heatmapData.slice(-800);
      }
    };

    document.addEventListener('mousedown', trackHeatmapPoint);
    document.addEventListener('touchstart', trackHeatmapPoint);
  }

  private collectDeviceMetrics(): void {
    // Device type detection
    const userAgent = navigator.userAgent;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    
    if (/Mobile|Android|iPhone|iPod/.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Tablet/.test(userAgent)) {
      deviceType = 'tablet';
    }

    this.metrics.deviceType = deviceType;
    this.metrics.touchSupport = 'ontouchstart' in window;
    this.metrics.screenResolution = `${screen.width}x${screen.height}`;
    this.metrics.browserInfo = userAgent;

    // Connection speed estimation
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionSpeed = connection.effectiveType || 'unknown';
    }
  }

  public trackScratchStart(): void {
    this.metrics.timeToFirstScratch = performance.now() - this.startTime;
    this.trackEvent('scratch_start', {
      timeToFirstScratch: this.metrics.timeToFirstScratch,
    });
  }

  public trackScratchStroke(x: number, y: number, pressure?: number): void {
    if (!this.metrics.totalScratchStrokes) {
      this.metrics.totalScratchStrokes = 0;
    }
    this.metrics.totalScratchStrokes++;

    this.trackEvent('scratch_stroke', {
      x,
      y,
      pressure: pressure || 1,
      strokeNumber: this.metrics.totalScratchStrokes,
    });
  }

  public trackScratchComplete(hasWon: boolean, prizeValue?: string): void {
    this.metrics.completionTime = performance.now() - this.startTime;
    this.metrics.completionRate = 1;

    this.trackEvent('scratch_complete', {
      hasWon,
      prizeValue,
      completionTime: this.metrics.completionTime,
      totalStrokes: this.metrics.totalScratchStrokes,
    });

    if (hasWon) {
      this.trackEvent('prize_reveal', {
        prizeValue,
        completionTime: this.metrics.completionTime,
      });
    }
  }

  public trackCanvasRenderTime(renderTime: number): void {
    this.metrics.canvasRenderTime = renderTime;
  }

  public trackParticleCount(count: number): void {
    this.metrics.particleCount = count;
  }

  public trackShareAction(platform: string): void {
    this.trackEvent('share_action', {
      platform,
      timestamp: performance.now(),
    });
  }

  private trackEvent(type: UserBehaviorEvent['type'], data: Record<string, any>): void {
    this.events.push({
      type,
      timestamp: performance.now(),
      data,
      sessionId: this.sessionId,
    });

    // Auto-flush if batch size is reached
    if (this.events.length >= this.config.batchSize) {
      this.flushData();
    }
  }

  private async flushData(): Promise<void> {
    if (this.events.length === 0) return;

    const payload = {
      sessionId: this.sessionId,
      metrics: this.metrics,
      events: [...this.events],
      heatmapData: this.config.enableHeatmaps ? [...this.heatmapData] : [],
      timestamp: Date.now(),
    };

    // Clear local data
    this.events = [];
    if (this.config.enableHeatmaps) {
      this.heatmapData = [];
    }

    try {
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Fallback: store in localStorage for development
        const stored = localStorage.getItem('scratch_analytics') || '[]';
        const analytics = JSON.parse(stored);
        analytics.push(payload);
        
        // Keep only last 10 sessions
        if (analytics.length > 10) {
          analytics.splice(0, analytics.length - 10);
        }
        
        localStorage.setItem('scratch_analytics', JSON.stringify(analytics));
      }
    } catch (error) {
      console.warn('Failed to flush analytics data:', error);
      
      // Re-add events back to queue on failure
      this.events.unshift(...payload.events);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics } as PerformanceMetrics;
  }

  public getHeatmapData(): Array<{ x: number; y: number; intensity: number; timestamp: number }> {
    return [...this.heatmapData];
  }

  public generateReport(): {
    performance: PerformanceMetrics;
    engagement: {
      totalEvents: number;
      engagementScore: number;
      completionRate: number;
      averageSessionTime: number;
    };
    technical: {
      averageFrameRate: number;
      memoryUsage: number;
      renderPerformance: string;
    };
  } {
    const sessionTime = (performance.now() - this.startTime) / 1000;
    
    return {
      performance: this.getMetrics(),
      engagement: {
        totalEvents: this.events.length,
        engagementScore: this.metrics.engagementScore || 0,
        completionRate: this.metrics.completionRate || 0,
        averageSessionTime: sessionTime,
      },
      technical: {
        averageFrameRate: this.metrics.frameRate || 0,
        memoryUsage: this.metrics.memoryUsage || 0,
        renderPerformance: this.metrics.frameRate && this.metrics.frameRate > 30 ? 'Good' : 'Poor',
      },
    };
  }

  public destroy(): void {
    // Clean up monitoring
    if (this.frameRateMonitor) {
      cancelAnimationFrame(this.frameRateMonitor);
    }
    
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }

    // Final data flush
    this.flushData();
  }
}

// Accessibility monitoring
export class AccessibilityMonitor {
  private violations: Array<{
    type: string;
    element: string;
    description: string;
    timestamp: number;
  }> = [];

  constructor() {
    this.initializeA11yMonitoring();
  }

  private initializeA11yMonitoring(): void {
    // Monitor for missing alt text
    this.checkImages();
    
    // Monitor for keyboard navigation
    this.checkKeyboardNavigation();
    
    // Monitor for color contrast
    this.checkColorContrast();
    
    // Monitor for ARIA labels
    this.checkAriaLabels();
  }

  private checkImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt) {
        this.violations.push({
          type: 'missing_alt_text',
          element: `img[${index}]`,
          description: 'Image missing alt text',
          timestamp: performance.now(),
        });
      }
    });
  }

  private checkKeyboardNavigation(): void {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element, index) => {
      if (element.tabIndex < 0 && !element.hasAttribute('aria-hidden')) {
        this.violations.push({
          type: 'keyboard_navigation',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          description: 'Element not keyboard accessible',
          timestamp: performance.now(),
        });
      }
    });
  }

  private checkColorContrast(): void {
    // This would require more complex color analysis
    // For now, we'll just check for common issues
    const elements = document.querySelectorAll('*');
    elements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simple check for white text on white background
      if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
        this.violations.push({
          type: 'color_contrast',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          description: 'Poor color contrast detected',
          timestamp: performance.now(),
        });
      }
    });
  }

  private checkAriaLabels(): void {
    const interactiveElements = document.querySelectorAll('button, input, select, textarea');
    interactiveElements.forEach((element, index) => {
      const hasLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby') ||
                      element.querySelector('label');
      
      if (!hasLabel) {
        this.violations.push({
          type: 'missing_aria_label',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          description: 'Interactive element missing accessible label',
          timestamp: performance.now(),
        });
      }
    });
  }

  public getViolations() {
    return [...this.violations];
  }

  public getAccessibilityScore(): number {
    const totalElements = document.querySelectorAll('*').length;
    const violationCount = this.violations.length;
    return Math.max(0, 100 - (violationCount / totalElements) * 100);
  }
}
