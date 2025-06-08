import { z } from 'zod';

// White Label Types
export interface BrandingTheme {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  isDefault: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      monospace: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  customCSS?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhiteLabelConfig {
  id: string;
  name: string;
  organizationId: string;
  domain: string;
  subdomain?: string;
  branding: {
    logo: {
      light: string;
      dark: string;
      favicon: string;
      appleTouchIcon: string;
    };
    companyName: string;
    tagline?: string;
    description: string;
    contactInfo: {
      email: string;
      phone?: string;
      address?: string;
      website?: string;
    };
    socialMedia: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  theme: BrandingTheme;
  features: {
    customDomain: boolean;
    removeWatermark: boolean;
    customEmailTemplates: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    customIntegrations: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    twitterCard: string;
    structuredData: Record<string, any>;
  };
  legal: {
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
  };
  customization: {
    headerHTML?: string;
    footerHTML?: string;
    customJS?: string;
    googleAnalytics?: string;
    facebookPixel?: string;
    customTracking?: Array<{
      name: string;
      code: string;
      position: 'head' | 'body';
    }>;
  };
  status: 'draft' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// Validation Schemas
const BrandingThemeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
    accent: z.string().regex(/^#[0-9A-F]{6}$/i),
    background: z.string().regex(/^#[0-9A-F]{6}$/i),
    surface: z.string().regex(/^#[0-9A-F]{6}$/i),
    text: z.object({
      primary: z.string().regex(/^#[0-9A-F]{6}$/i),
      secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
      disabled: z.string().regex(/^#[0-9A-F]{6}$/i),
    }),
    success: z.string().regex(/^#[0-9A-F]{6}$/i),
    warning: z.string().regex(/^#[0-9A-F]{6}$/i),
    error: z.string().regex(/^#[0-9A-F]{6}$/i),
    info: z.string().regex(/^#[0-9A-F]{6}$/i),
  }),
  typography: z.object({
    fontFamily: z.object({
      primary: z.string(),
      secondary: z.string(),
      monospace: z.string(),
    }),
  }).optional(),
  customCSS: z.string().optional(),
});

const WhiteLabelConfigSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().min(1),
  subdomain: z.string().optional(),
  branding: z.object({
    logo: z.object({
      light: z.string().url(),
      dark: z.string().url(),
      favicon: z.string().url(),
      appleTouchIcon: z.string().url(),
    }),
    companyName: z.string().min(1),
    tagline: z.string().optional(),
    description: z.string(),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().optional(),
      website: z.string().url().optional(),
    }),
    socialMedia: z.object({
      facebook: z.string().url().optional(),
      twitter: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      instagram: z.string().url().optional(),
    }).optional(),
  }),
  features: z.object({
    customDomain: z.boolean().default(false),
    removeWatermark: z.boolean().default(false),
    customEmailTemplates: z.boolean().default(false),
    advancedAnalytics: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
    whiteLabel: z.boolean().default(false),
    customIntegrations: z.boolean().default(false),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    ogImage: z.string().url(),
    twitterCard: z.string(),
  }),
  legal: z.object({
    privacyPolicy: z.string().url(),
    termsOfService: z.string().url(),
    cookiePolicy: z.string().url(),
    gdprCompliant: z.boolean().default(false),
    ccpaCompliant: z.boolean().default(false),
  }),
});

// White Label System
export class WhiteLabelSystem {
  private themes: Map<string, BrandingTheme> = new Map();
  private configs: Map<string, WhiteLabelConfig> = new Map();
  private domainMappings: Map<string, string> = new Map(); // domain -> configId

  constructor() {
    this.initializeDefaultThemes();
  }

  // Theme Management
  async createTheme(themeData: z.infer<typeof BrandingThemeSchema>): Promise<BrandingTheme> {
    const validatedData = BrandingThemeSchema.parse(themeData);
    
    const theme: BrandingTheme = {
      id: `theme_${Date.now()}`,
      ...validatedData,
      organizationId: 'org_1', // In production, get from context
      isDefault: false,
      typography: {
        fontFamily: {
          primary: 'Inter, system-ui, sans-serif',
          secondary: 'Georgia, serif',
          monospace: 'Monaco, monospace',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
        ...validatedData.typography,
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms',
        },
        easing: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.themes.set(theme.id, theme);
    return theme;
  }

  // White Label Configuration
  async createWhiteLabelConfig(configData: z.infer<typeof WhiteLabelConfigSchema>): Promise<WhiteLabelConfig> {
    const validatedData = WhiteLabelConfigSchema.parse(configData);
    
    // Check domain availability
    if (this.domainMappings.has(validatedData.domain)) {
      throw new Error('Domain already in use');
    }

    const config: WhiteLabelConfig = {
      id: `config_${Date.now()}`,
      ...validatedData,
      organizationId: 'org_1', // In production, get from context
      theme: this.getDefaultTheme(),
      customization: {},
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.configs.set(config.id, config);
    this.domainMappings.set(config.domain, config.id);
    
    if (config.subdomain) {
      this.domainMappings.set(config.subdomain, config.id);
    }

    return config;
  }

  // CSS Generation
  generateCSS(themeId: string): string {
    const theme = this.themes.get(themeId);
    if (!theme) return '';

    const css = `
      :root {
        /* Colors */
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text-primary: ${theme.colors.text.primary};
        --color-text-secondary: ${theme.colors.text.secondary};
        --color-text-disabled: ${theme.colors.text.disabled};
        --color-success: ${theme.colors.success};
        --color-warning: ${theme.colors.warning};
        --color-error: ${theme.colors.error};
        --color-info: ${theme.colors.info};

        /* Typography */
        --font-family-primary: ${theme.typography.fontFamily.primary};
        --font-family-secondary: ${theme.typography.fontFamily.secondary};
        --font-family-monospace: ${theme.typography.fontFamily.monospace};
        
        --font-size-xs: ${theme.typography.fontSize.xs};
        --font-size-sm: ${theme.typography.fontSize.sm};
        --font-size-base: ${theme.typography.fontSize.base};
        --font-size-lg: ${theme.typography.fontSize.lg};
        --font-size-xl: ${theme.typography.fontSize.xl};
        --font-size-2xl: ${theme.typography.fontSize['2xl']};
        --font-size-3xl: ${theme.typography.fontSize['3xl']};
        --font-size-4xl: ${theme.typography.fontSize['4xl']};

        --font-weight-light: ${theme.typography.fontWeight.light};
        --font-weight-normal: ${theme.typography.fontWeight.normal};
        --font-weight-medium: ${theme.typography.fontWeight.medium};
        --font-weight-semibold: ${theme.typography.fontWeight.semibold};
        --font-weight-bold: ${theme.typography.fontWeight.bold};

        /* Spacing */
        --spacing-xs: ${theme.spacing.xs};
        --spacing-sm: ${theme.spacing.sm};
        --spacing-md: ${theme.spacing.md};
        --spacing-lg: ${theme.spacing.lg};
        --spacing-xl: ${theme.spacing.xl};
        --spacing-2xl: ${theme.spacing['2xl']};
        --spacing-3xl: ${theme.spacing['3xl']};
        --spacing-4xl: ${theme.spacing['4xl']};

        /* Border Radius */
        --border-radius-none: ${theme.borderRadius.none};
        --border-radius-sm: ${theme.borderRadius.sm};
        --border-radius-md: ${theme.borderRadius.md};
        --border-radius-lg: ${theme.borderRadius.lg};
        --border-radius-xl: ${theme.borderRadius.xl};
        --border-radius-full: ${theme.borderRadius.full};

        /* Shadows */
        --shadow-sm: ${theme.shadows.sm};
        --shadow-md: ${theme.shadows.md};
        --shadow-lg: ${theme.shadows.lg};
        --shadow-xl: ${theme.shadows.xl};

        /* Animations */
        --duration-fast: ${theme.animations.duration.fast};
        --duration-normal: ${theme.animations.duration.normal};
        --duration-slow: ${theme.animations.duration.slow};
        
        --easing-linear: ${theme.animations.easing.linear};
        --easing-ease-in: ${theme.animations.easing.easeIn};
        --easing-ease-out: ${theme.animations.easing.easeOut};
        --easing-ease-in-out: ${theme.animations.easing.easeInOut};
      }

      /* Base Styles */
      body {
        font-family: var(--font-family-primary);
        color: var(--color-text-primary);
        background-color: var(--color-background);
        line-height: ${theme.typography.lineHeight.normal};
      }

      /* Button Styles */
      .btn-primary {
        background-color: var(--color-primary);
        color: white;
        border: none;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--border-radius-md);
        font-weight: var(--font-weight-medium);
        transition: all var(--duration-normal) var(--easing-ease-in-out);
      }

      .btn-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      /* Card Styles */
      .card {
        background-color: var(--color-surface);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-sm);
        padding: var(--spacing-lg);
        transition: box-shadow var(--duration-normal) var(--easing-ease-in-out);
      }

      .card:hover {
        box-shadow: var(--shadow-md);
      }

      /* Scratch Card Styles */
      .scratch-card {
        border-radius: var(--border-radius-xl);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
      }

      /* Custom CSS */
      ${theme.customCSS || ''}
    `;

    return css.trim();
  }

  // HTML Generation
  generateHTML(configId: string, content: string): string {
    const config = this.configs.get(configId);
    if (!config) return content;

    const css = this.generateCSS(config.theme.id);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.seo.title}</title>
        <meta name="description" content="${config.seo.description}">
        <meta name="keywords" content="${config.seo.keywords.join(', ')}">
        
        <!-- Open Graph -->
        <meta property="og:title" content="${config.seo.title}">
        <meta property="og:description" content="${config.seo.description}">
        <meta property="og:image" content="${config.seo.ogImage}">
        <meta property="og:type" content="website">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="${config.seo.twitterCard}">
        <meta name="twitter:title" content="${config.seo.title}">
        <meta name="twitter:description" content="${config.seo.description}">
        <meta name="twitter:image" content="${config.seo.ogImage}">
        
        <!-- Favicon -->
        <link rel="icon" href="${config.branding.logo.favicon}">
        <link rel="apple-touch-icon" href="${config.branding.logo.appleTouchIcon}">
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <!-- Custom Styles -->
        <style>${css}</style>
        
        <!-- Custom Header HTML -->
        ${config.customization.headerHTML || ''}
        
        <!-- Analytics -->
        ${config.customization.googleAnalytics ? `
          <script async src="https://www.googletagmanager.com/gtag/js?id=${config.customization.googleAnalytics}"></script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.customization.googleAnalytics}');
          </script>
        ` : ''}
        
        ${config.customization.facebookPixel ? `
          <script>
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${config.customization.facebookPixel}');
            fbq('track', 'PageView');
          </script>
        ` : ''}
      </head>
      <body>
        ${content}
        
        <!-- Custom Footer HTML -->
        ${config.customization.footerHTML || ''}
        
        <!-- Custom JavaScript -->
        ${config.customization.customJS ? `<script>${config.customization.customJS}</script>` : ''}
        
        <!-- Custom Tracking -->
        ${config.customization.customTracking?.map(tracking => 
          tracking.position === 'body' ? `<script>${tracking.code}</script>` : ''
        ).join('') || ''}
      </body>
      </html>
    `;
  }

  // Domain Resolution
  getConfigByDomain(domain: string): WhiteLabelConfig | null {
    const configId = this.domainMappings.get(domain);
    return configId ? this.configs.get(configId) || null : null;
  }

  // Helper Methods
  private initializeDefaultThemes(): void {
    const defaultTheme: BrandingTheme = {
      id: 'default',
      name: 'Default Theme',
      description: 'Default Scratch TIX theme',
      organizationId: 'system',
      isDefault: true,
      colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          disabled: '#9ca3af',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      typography: {
        fontFamily: {
          primary: 'Inter, system-ui, sans-serif',
          secondary: 'Georgia, serif',
          monospace: 'Monaco, monospace',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms',
        },
        easing: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.themes.set(defaultTheme.id, defaultTheme);
  }

  private getDefaultTheme(): BrandingTheme {
    return this.themes.get('default')!;
  }

  // Public methods
  getTheme(themeId: string): BrandingTheme | undefined {
    return this.themes.get(themeId);
  }

  listThemes(): BrandingTheme[] {
    return Array.from(this.themes.values());
  }

  getConfig(configId: string): WhiteLabelConfig | undefined {
    return this.configs.get(configId);
  }

  listConfigs(): WhiteLabelConfig[] {
    return Array.from(this.configs.values());
  }
}

// Export singleton instance
export const whiteLabelSystem = new WhiteLabelSystem();
