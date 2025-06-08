import { z } from 'zod';

// Workflow Types
export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'split_test';
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected steps
  isActive: boolean;
}

export interface CampaignWorkflow {
  id: string;
  name: string;
  description: string;
  campaignId: string;
  organizationId: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  analytics: WorkflowAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'time_based' | 'event_based' | 'user_action' | 'api_call';
  config: Record<string, any>;
  isActive: boolean;
}

export interface WorkflowAnalytics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  stepAnalytics: Record<string, {
    executions: number;
    successRate: number;
    averageTime: number;
  }>;
}

// Workflow Execution Context
export interface WorkflowContext {
  userId?: string;
  sessionId: string;
  campaignId: string;
  participantData: Record<string, any>;
  executionId: string;
  startTime: Date;
  variables: Record<string, any>;
  stepHistory: Array<{
    stepId: string;
    timestamp: Date;
    result: 'success' | 'failure' | 'skipped';
    data?: any;
  }>;
}

// Validation Schemas
const WorkflowStepSchema = z.object({
  id: z.string(),
  type: z.enum(['trigger', 'condition', 'action', 'delay', 'split_test']),
  name: z.string(),
  description: z.string(),
  config: z.record(z.any()),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  connections: z.array(z.string()),
  isActive: z.boolean(),
});

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  campaignId: z.string(),
  steps: z.array(WorkflowStepSchema),
  triggers: z.array(z.object({
    type: z.enum(['time_based', 'event_based', 'user_action', 'api_call']),
    config: z.record(z.any()),
    isActive: z.boolean().default(true),
  })),
});

// Workflow Engine
export class WorkflowEngine {
  private workflows: Map<string, CampaignWorkflow> = new Map();
  private executionQueue: Array<{
    workflowId: string;
    context: WorkflowContext;
    priority: number;
  }> = [];
  private isProcessing = false;

  constructor() {
    this.startProcessing();
  }

  // Workflow Management
  async createWorkflow(workflowData: z.infer<typeof CreateWorkflowSchema>): Promise<CampaignWorkflow> {
    const validatedData = CreateWorkflowSchema.parse(workflowData);
    
    const workflow: CampaignWorkflow = {
      id: `workflow_${Date.now()}`,
      ...validatedData,
      organizationId: 'org_1', // In production, get from context
      status: 'draft',
      triggers: validatedData.triggers.map(trigger => ({
        id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...trigger,
      })),
      analytics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        stepAnalytics: {},
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async executeWorkflow(workflowId: string, context: Partial<WorkflowContext>): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'active') {
      return false;
    }

    const fullContext: WorkflowContext = {
      sessionId: `session_${Date.now()}`,
      campaignId: workflow.campaignId,
      participantData: {},
      executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      variables: {},
      stepHistory: [],
      ...context,
    };

    // Add to execution queue
    this.executionQueue.push({
      workflowId,
      context: fullContext,
      priority: 1,
    });

    return true;
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (true) {
      if (this.executionQueue.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      // Sort by priority
      this.executionQueue.sort((a, b) => b.priority - a.priority);
      const execution = this.executionQueue.shift()!;

      try {
        await this.processWorkflowExecution(execution.workflowId, execution.context);
      } catch (error) {
        console.error('Workflow execution error:', error);
      }
    }
  }

  private async processWorkflowExecution(workflowId: string, context: WorkflowContext): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const startTime = Date.now();
    let success = true;

    try {
      // Find trigger steps
      const triggerSteps = workflow.steps.filter(step => step.type === 'trigger');
      
      for (const triggerStep of triggerSteps) {
        await this.executeStep(triggerStep, workflow, context);
      }

      workflow.analytics.successfulExecutions++;
    } catch (error) {
      console.error('Workflow execution failed:', error);
      workflow.analytics.failedExecutions++;
      success = false;
    }

    // Update analytics
    const executionTime = Date.now() - startTime;
    workflow.analytics.totalExecutions++;
    workflow.analytics.averageExecutionTime = 
      (workflow.analytics.averageExecutionTime * (workflow.analytics.totalExecutions - 1) + executionTime) / 
      workflow.analytics.totalExecutions;

    workflow.updatedAt = new Date().toISOString();
  }

  private async executeStep(step: WorkflowStep, workflow: CampaignWorkflow, context: WorkflowContext): Promise<any> {
    if (!step.isActive) {
      context.stepHistory.push({
        stepId: step.id,
        timestamp: new Date(),
        result: 'skipped',
      });
      return null;
    }

    const stepStartTime = Date.now();
    let result: any = null;
    let success = true;

    try {
      switch (step.type) {
        case 'trigger':
          result = await this.executeTriggerStep(step, context);
          break;
        case 'condition':
          result = await this.executeConditionStep(step, context);
          break;
        case 'action':
          result = await this.executeActionStep(step, context);
          break;
        case 'delay':
          result = await this.executeDelayStep(step, context);
          break;
        case 'split_test':
          result = await this.executeSplitTestStep(step, context);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Execute connected steps
      for (const connectionId of step.connections) {
        const connectedStep = workflow.steps.find(s => s.id === connectionId);
        if (connectedStep) {
          await this.executeStep(connectedStep, workflow, context);
        }
      }

    } catch (error) {
      console.error(`Step execution failed: ${step.id}`, error);
      success = false;
    }

    // Update step analytics
    const stepTime = Date.now() - stepStartTime;
    if (!workflow.analytics.stepAnalytics[step.id]) {
      workflow.analytics.stepAnalytics[step.id] = {
        executions: 0,
        successRate: 0,
        averageTime: 0,
      };
    }

    const stepAnalytics = workflow.analytics.stepAnalytics[step.id];
    stepAnalytics.executions++;
    stepAnalytics.averageTime = 
      (stepAnalytics.averageTime * (stepAnalytics.executions - 1) + stepTime) / 
      stepAnalytics.executions;
    stepAnalytics.successRate = 
      (stepAnalytics.successRate * (stepAnalytics.executions - 1) + (success ? 1 : 0)) / 
      stepAnalytics.executions;

    context.stepHistory.push({
      stepId: step.id,
      timestamp: new Date(),
      result: success ? 'success' : 'failure',
      data: result,
    });

    return result;
  }

  private async executeTriggerStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Trigger steps initiate the workflow
    return { triggered: true, timestamp: new Date().toISOString() };
  }

  private async executeConditionStep(step: WorkflowStep, context: WorkflowContext): Promise<boolean> {
    const { condition, operator, value } = step.config;
    
    // Evaluate condition based on context
    switch (condition) {
      case 'user_segment':
        return this.evaluateUserSegment(context.participantData, operator, value);
      case 'time_of_day':
        return this.evaluateTimeCondition(operator, value);
      case 'device_type':
        return this.evaluateDeviceCondition(context.participantData, operator, value);
      case 'previous_participation':
        return this.evaluatePreviousParticipation(context.userId, operator, value);
      default:
        return true;
    }
  }

  private async executeActionStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const { actionType, config } = step.config;

    switch (actionType) {
      case 'send_email':
        return await this.sendEmail(config, context);
      case 'update_user_segment':
        return await this.updateUserSegment(config, context);
      case 'trigger_webhook':
        return await this.triggerWebhook(config, context);
      case 'award_bonus_entry':
        return await this.awardBonusEntry(config, context);
      case 'send_push_notification':
        return await this.sendPushNotification(config, context);
      default:
        return null;
    }
  }

  private async executeDelayStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const { duration, unit } = step.config;
    const delayMs = this.convertToMilliseconds(duration, unit);
    
    // In production, this would schedule the continuation
    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000))); // Cap at 5s for demo
    
    return { delayed: true, duration: delayMs };
  }

  private async executeSplitTestStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const { variants, trafficSplit } = step.config;
    
    // Determine which variant to use
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const variant of variants) {
      cumulativeWeight += trafficSplit[variant.id] || 0;
      if (random <= cumulativeWeight) {
        context.variables.selectedVariant = variant.id;
        return { variant: variant.id, config: variant.config };
      }
    }
    
    return { variant: variants[0]?.id, config: variants[0]?.config };
  }

  // Helper methods
  private evaluateUserSegment(userData: any, operator: string, value: any): boolean {
    // Implement user segment evaluation logic
    return true;
  }

  private evaluateTimeCondition(operator: string, value: any): boolean {
    const currentHour = new Date().getHours();
    switch (operator) {
      case 'between':
        return currentHour >= value.start && currentHour <= value.end;
      case 'after':
        return currentHour >= value;
      case 'before':
        return currentHour <= value;
      default:
        return true;
    }
  }

  private evaluateDeviceCondition(userData: any, operator: string, value: any): boolean {
    const deviceType = userData.deviceType || 'desktop';
    return operator === 'equals' ? deviceType === value : deviceType !== value;
  }

  private evaluatePreviousParticipation(userId: string | undefined, operator: string, value: any): boolean {
    // In production, query database for user's participation history
    return true;
  }

  private async sendEmail(config: any, context: WorkflowContext): Promise<any> {
    // Integrate with email service
    console.log('Sending email:', config, context.participantData);
    return { sent: true, emailId: `email_${Date.now()}` };
  }

  private async updateUserSegment(config: any, context: WorkflowContext): Promise<any> {
    // Update user segment in database
    console.log('Updating user segment:', config, context.userId);
    return { updated: true };
  }

  private async triggerWebhook(config: any, context: WorkflowContext): Promise<any> {
    // Trigger external webhook
    console.log('Triggering webhook:', config.url, context);
    return { triggered: true, webhookId: `webhook_${Date.now()}` };
  }

  private async awardBonusEntry(config: any, context: WorkflowContext): Promise<any> {
    // Award bonus entry to user
    console.log('Awarding bonus entry:', config, context.userId);
    return { awarded: true, bonusEntries: config.amount };
  }

  private async sendPushNotification(config: any, context: WorkflowContext): Promise<any> {
    // Send push notification
    console.log('Sending push notification:', config, context.userId);
    return { sent: true, notificationId: `notif_${Date.now()}` };
  }

  private convertToMilliseconds(duration: number, unit: string): number {
    switch (unit) {
      case 'seconds':
        return duration * 1000;
      case 'minutes':
        return duration * 60 * 1000;
      case 'hours':
        return duration * 60 * 60 * 1000;
      case 'days':
        return duration * 24 * 60 * 60 * 1000;
      default:
        return duration;
    }
  }

  // Public methods for workflow management
  getWorkflow(workflowId: string): CampaignWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  listWorkflows(campaignId?: string): CampaignWorkflow[] {
    const workflows = Array.from(this.workflows.values());
    return campaignId ? workflows.filter(w => w.campaignId === campaignId) : workflows;
  }

  async updateWorkflow(workflowId: string, updates: Partial<CampaignWorkflow>): Promise<CampaignWorkflow | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(workflowId, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    return this.workflows.delete(workflowId);
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();
