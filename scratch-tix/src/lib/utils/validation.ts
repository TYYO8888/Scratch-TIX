import { z } from 'zod';
import DOMPurify from 'dompurify';

// Campaign validation schema
export const CampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['scratch', 'coupon', 'voucher']),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
  
  // Design configuration
  design: z.object({
    template: z.string().optional(),
    backgroundImage: z.string().url().optional(),
    overlayImage: z.string().url().optional(),
    dimensions: z.object({
      width: z.number().min(200).max(1200),
      height: z.number().min(200).max(1200),
    }),
  }),

  // Prize configuration
  prizes: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Prize name is required').max(50),
    description: z.string().max(200).optional(),
    image: z.string().url().optional(),
    value: z.string().max(50),
    probability: z.number().min(0).max(1),
    maxWinners: z.number().min(1).max(10000),
    isActive: z.boolean().default(true),
  })),

  // Game settings
  gameSettings: z.object({
    scratchPercentage: z.number().min(10).max(100).default(75),
    enableSound: z.boolean().default(true),
    enableRetry: z.boolean().default(false),
    maxRetries: z.number().min(0).max(10).default(0),
    redirectUrl: z.string().url().optional(),
    showRules: z.boolean().default(true),
  }),

  // Distribution settings
  distribution: z.object({
    channels: z.array(z.enum(['web', 'email', 'sms', 'social'])),
    restrictions: z.object({
      uniqueEmail: z.boolean().default(true),
      uniquePhone: z.boolean().default(false),
      geoRestrictions: z.array(z.string()).optional(),
      ageRestrictions: z.object({
        minAge: z.number().min(13).max(100).optional(),
        maxAge: z.number().min(13).max(100).optional(),
      }).optional(),
    }),
  }),
});

// Participant validation schema
export const ParticipantSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').optional(),
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().min(13).max(120).optional(),
  country: z.string().length(2, 'Country code must be 2 characters').optional(),
  consentGiven: z.boolean().refine(val => val === true, 'Consent is required'),
});

// User registration schema
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(50),
  organizationName: z.string().min(1, 'Organization name is required').max(100),
});

// Template schema
export const TemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  category: z.string().min(1, 'Category is required').max(50),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  design: z.object({
    elements: z.array(z.object({
      type: z.enum(['text', 'image', 'shape']),
      properties: z.record(z.any()),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    })),
  }),
  isPublic: z.boolean().default(false),
});

// Sanitization function
export function sanitizeUserInput(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u'],
    ALLOWED_ATTR: [],
  });
}

// Validation helper functions
export function validateCampaignData(data: unknown) {
  try {
    return CampaignSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Invalid campaign data');
  }
}

export function validateParticipantData(data: unknown) {
  try {
    return ParticipantSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Invalid participant data');
  }
}

export function validateUserRegistration(data: unknown) {
  try {
    return UserRegistrationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Invalid user registration data');
  }
}

export function validateTemplateData(data: unknown) {
  try {
    return TemplateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Invalid template data');
  }
}
