'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Award, 
  Settings,
  BarChart3,
  Workflow,
  TestTube,
  Gauge,
  Palette,
  Globe,
  Shield,
  Cpu,
  Database,
  Cloud,
  Sparkles,
  Target,
  Brain,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdvancedMetrics {
  workflows: {
    active: number;
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
  };
  abTests: {
    running: number;
    completed: number;
    significantResults: number;
    averageUplift: number;
  };
  performance: {
    cacheHitRate: number;
    cdnHitRate: number;
    averageResponseTime: number;
    optimizationScore: number;
  };
  whiteLabel: {
    activeConfigs: number;
    customDomains: number;
    brandingThemes: number;
    clientSatisfaction: number;
  };
}

const mockAdvancedMetrics: AdvancedMetrics = {
  workflows: {
    active: 12,
    totalExecutions: 8947,
    successRate: 98.5,
    averageExecutionTime: 1.2,
  },
  abTests: {
    running: 5,
    completed: 23,
    significantResults: 18,
    averageUplift: 15.7,
  },
  performance: {
    cacheHitRate: 94.2,
    cdnHitRate: 97.8,
    averageResponseTime: 145,
    optimizationScore: 96,
  },
  whiteLabel: {
    activeConfigs: 8,
    customDomains: 6,
    brandingThemes: 15,
    clientSatisfaction: 4.8,
  },
};

export default function AdvancedDashboardPage() {
  const { userData, organization } = useAuth();
  const [metrics, setMetrics] = useState<AdvancedMetrics>(mockAdvancedMetrics);
  const [selectedFeature, setSelectedFeature] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        workflows: {
          ...prev.workflows,
          totalExecutions: prev.workflows.totalExecutions + Math.floor(Math.random() * 5),
        },
        performance: {
          ...prev.performance,
          averageResponseTime: prev.performance.averageResponseTime + (Math.random() - 0.5) * 10,
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const AdvancedMetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    suffix = '',
    prefix = '',
    description
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: any;
    color?: string;
    suffix?: string;
    prefix?: string;
    description?: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );

  const FeatureCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    status, 
    metrics: cardMetrics,
    onClick 
  }: {
    title: string;
    description: string;
    icon: any;
    color: string;
    status: 'active' | 'beta' | 'coming_soon';
    metrics: Array<{ label: string; value: string }>;
    onClick: () => void;
  }) => (
    <div 
      className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 bg-${color}-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'beta' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'active' ? 'Active' : status === 'beta' ? 'Beta' : 'Coming Soon'}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <div className="space-y-2">
        {cardMetrics.map((metric, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-500">{metric.label}</span>
            <span className="font-medium text-gray-900">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
            Advanced Features
          </h1>
          <p className="text-gray-600">
            Enterprise-grade capabilities for maximum performance and customization
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button>
            <Rocket className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI-Powered Optimization Active
            </h2>
            <p className="opacity-90">
              Advanced algorithms are continuously optimizing your campaigns for maximum performance
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{metrics.performance.optimizationScore}</p>
            <p className="opacity-90">Optimization Score</p>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdvancedMetricCard
          title="Active Workflows"
          value={metrics.workflows.active}
          change={8.3}
          icon={Workflow}
          color="purple"
          description="Automated campaign workflows"
        />
        <AdvancedMetricCard
          title="A/B Tests Running"
          value={metrics.abTests.running}
          change={12.5}
          icon={TestTube}
          color="blue"
          description="Active optimization tests"
        />
        <AdvancedMetricCard
          title="Performance Score"
          value={metrics.performance.optimizationScore}
          change={2.1}
          icon={Gauge}
          color="green"
          suffix="/100"
          description="Overall system performance"
        />
        <AdvancedMetricCard
          title="White Label Configs"
          value={metrics.whiteLabel.activeConfigs}
          change={15.7}
          icon={Palette}
          color="orange"
          description="Custom brand configurations"
        />
      </div>

      {/* Feature Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <FeatureCard
          title="Campaign Workflows"
          description="Advanced multi-step automation with conditional logic and triggers"
          icon={Workflow}
          color="purple"
          status="active"
          metrics={[
            { label: 'Success Rate', value: `${metrics.workflows.successRate}%` },
            { label: 'Avg. Execution', value: `${metrics.workflows.averageExecutionTime}s` },
            { label: 'Total Runs', value: metrics.workflows.totalExecutions.toLocaleString() },
          ]}
          onClick={() => setSelectedFeature('workflows')}
        />

        <FeatureCard
          title="A/B Testing Engine"
          description="Statistical significance testing with automatic optimization"
          icon={TestTube}
          color="blue"
          status="active"
          metrics={[
            { label: 'Significant Results', value: `${metrics.abTests.significantResults}/${metrics.abTests.completed}` },
            { label: 'Average Uplift', value: `${metrics.abTests.averageUplift}%` },
            { label: 'Running Tests', value: metrics.abTests.running.toString() },
          ]}
          onClick={() => setSelectedFeature('ab-testing')}
        />

        <FeatureCard
          title="Performance Optimizer"
          description="Advanced caching, CDN integration, and real-time optimization"
          icon={Gauge}
          color="green"
          status="active"
          metrics={[
            { label: 'Cache Hit Rate', value: `${metrics.performance.cacheHitRate}%` },
            { label: 'CDN Hit Rate', value: `${metrics.performance.cdnHitRate}%` },
            { label: 'Response Time', value: `${Math.round(metrics.performance.averageResponseTime)}ms` },
          ]}
          onClick={() => setSelectedFeature('performance')}
        />

        <FeatureCard
          title="White Label System"
          description="Complete branding customization and multi-tenant architecture"
          icon={Palette}
          color="orange"
          status="active"
          metrics={[
            { label: 'Custom Domains', value: metrics.whiteLabel.customDomains.toString() },
            { label: 'Brand Themes', value: metrics.whiteLabel.brandingThemes.toString() },
            { label: 'Client Rating', value: `${metrics.whiteLabel.clientSatisfaction}/5.0` },
          ]}
          onClick={() => setSelectedFeature('white-label')}
        />

        <FeatureCard
          title="Advanced Analytics"
          description="Machine learning insights and predictive analytics"
          icon={Brain}
          color="indigo"
          status="beta"
          metrics={[
            { label: 'ML Models', value: '12 Active' },
            { label: 'Predictions', value: '98.5% Accuracy' },
            { label: 'Insights', value: '247 Generated' },
          ]}
          onClick={() => setSelectedFeature('ml-analytics')}
        />

        <FeatureCard
          title="Enterprise Security"
          description="Advanced security features and compliance tools"
          icon={Shield}
          color="red"
          status="active"
          metrics={[
            { label: 'Security Score', value: '99.8/100' },
            { label: 'Compliance', value: 'GDPR, CCPA' },
            { label: 'Threats Blocked', value: '1,247' },
          ]}
          onClick={() => setSelectedFeature('security')}
        />
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            System Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
                <span className="text-sm text-gray-600">23%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <span className="text-sm text-gray-600">67%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Database Load</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-sm text-gray-600">45%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Network I/O</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                </div>
                <span className="text-sm text-gray-600">34%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            Infrastructure Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">API Gateway</span>
              </div>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Database Cluster</span>
              </div>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">CDN Network</span>
              </div>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Cache Layer</span>
              </div>
              <span className="text-sm text-yellow-600">Optimizing</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">ML Pipeline</span>
              </div>
              <span className="text-sm text-green-600">Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <Workflow className="w-6 h-6 mb-2" />
            <span className="text-sm">Create Workflow</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col">
            <TestTube className="w-6 h-6 mb-2" />
            <span className="text-sm">Start A/B Test</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col">
            <Gauge className="w-6 h-6 mb-2" />
            <span className="text-sm">Optimize Performance</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col">
            <Palette className="w-6 h-6 mb-2" />
            <span className="text-sm">Create Brand Theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
