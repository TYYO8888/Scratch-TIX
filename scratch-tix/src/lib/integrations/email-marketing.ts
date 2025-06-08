import { z } from 'zod';

// Base integration interface
export interface EmailMarketingIntegration {
  id: string;
  name: string;
  type: 'mailchimp' | 'klaviyo' | 'sendgrid' | 'constant_contact' | 'hubspot';
  isActive: boolean;
  config: Record<string, any>;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Common schemas
const ContactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

const CampaignDataSchema = z.object({
  campaignId: z.string(),
  campaignName: z.string(),
  participantEmail: z.string().email(),
  hasWon: z.boolean(),
  prize: z.object({
    id: z.string(),
    name: z.string(),
    value: z.string(),
  }).optional(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

// Mailchimp Integration
export class MailchimpIntegration {
  private apiKey: string;
  private serverPrefix: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; serverPrefix: string }) {
    this.apiKey = config.apiKey;
    this.serverPrefix = config.serverPrefix;
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
  }

  async addContact(listId: string, contact: z.infer<typeof ContactSchema>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/lists/${listId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: contact.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: contact.firstName || '',
            LNAME: contact.lastName || '',
            PHONE: contact.phone || '',
            ...contact.customFields,
          },
          tags: contact.tags || [],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Mailchimp add contact error:', error);
      return false;
    }
  }

  async addToSegment(listId: string, segmentId: string, email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/lists/${listId}/segments/${segmentId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Mailchimp add to segment error:', error);
      return false;
    }
  }

  async triggerAutomation(workflowId: string, email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/automations/${workflowId}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: {
            list_id: 'your_list_id', // Would be configured
          },
          settings: {
            subject_line: 'Congratulations on your win!',
            from_name: 'Scratch TIX',
            reply_to: 'noreply@scratchtix.com',
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Mailchimp trigger automation error:', error);
      return false;
    }
  }
}

// Klaviyo Integration
export class KlaviyoIntegration {
  private apiKey: string;
  private baseUrl = 'https://a.klaviyo.com/api';

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  async createProfile(contact: z.infer<typeof ContactSchema>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: {
            type: 'profile',
            attributes: {
              email: contact.email,
              first_name: contact.firstName,
              last_name: contact.lastName,
              phone_number: contact.phone,
              properties: contact.customFields || {},
            },
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Klaviyo create profile error:', error);
      return false;
    }
  }

  async trackEvent(email: string, eventName: string, properties: Record<string, any>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/events/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: {
            type: 'event',
            attributes: {
              profile: {
                email: email,
              },
              metric: {
                name: eventName,
              },
              properties: properties,
              time: new Date().toISOString(),
            },
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Klaviyo track event error:', error);
      return false;
    }
  }

  async addToList(listId: string, email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/lists/${listId}/relationships/profiles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: [
            {
              type: 'profile',
              attributes: {
                email: email,
              },
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Klaviyo add to list error:', error);
      return false;
    }
  }
}

// SendGrid Integration
export class SendGridIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  async addContact(contact: z.infer<typeof ContactSchema>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/marketing/contacts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: [
            {
              email: contact.email,
              first_name: contact.firstName,
              last_name: contact.lastName,
              phone_number: contact.phone,
              custom_fields: contact.customFields || {},
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid add contact error:', error);
      return false;
    }
  }

  async addToList(listId: string, contactIds: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/marketing/lists/${listId}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_ids: contactIds,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid add to list error:', error);
      return false;
    }
  }

  async sendTransactionalEmail(
    to: string,
    templateId: string,
    dynamicData: Record<string, any>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              dynamic_template_data: dynamicData,
            },
          ],
          from: {
            email: 'noreply@scratchtix.com',
            name: 'Scratch TIX',
          },
          template_id: templateId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid send email error:', error);
      return false;
    }
  }
}

// Integration Manager
export class EmailMarketingManager {
  private integrations: Map<string, any> = new Map();

  addIntegration(integration: EmailMarketingIntegration): void {
    let client;

    switch (integration.type) {
      case 'mailchimp':
        client = new MailchimpIntegration(integration.config);
        break;
      case 'klaviyo':
        client = new KlaviyoIntegration(integration.config);
        break;
      case 'sendgrid':
        client = new SendGridIntegration(integration.config);
        break;
      default:
        throw new Error(`Unsupported integration type: ${integration.type}`);
    }

    this.integrations.set(integration.id, {
      client,
      config: integration,
    });
  }

  async handleCampaignEvent(
    integrationId: string,
    eventType: 'participant_joined' | 'participant_won' | 'participant_lost',
    data: z.infer<typeof CampaignDataSchema>
  ): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      console.error(`Integration not found: ${integrationId}`);
      return false;
    }

    const { client, config } = integration;

    try {
      switch (eventType) {
        case 'participant_joined':
          return await this.handleParticipantJoined(client, config, data);
        case 'participant_won':
          return await this.handleParticipantWon(client, config, data);
        case 'participant_lost':
          return await this.handleParticipantLost(client, config, data);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Email marketing integration error:`, error);
      return false;
    }
  }

  private async handleParticipantJoined(client: any, config: any, data: any): Promise<boolean> {
    const contact = {
      email: data.participantEmail,
      customFields: {
        campaign_id: data.campaignId,
        campaign_name: data.campaignName,
        participation_date: data.timestamp,
      },
    };

    switch (config.type) {
      case 'mailchimp':
        await client.addContact(config.config.listId, contact);
        return await client.addToSegment(config.config.listId, config.config.participantsSegmentId, data.participantEmail);
      case 'klaviyo':
        await client.createProfile(contact);
        await client.trackEvent(data.participantEmail, 'Joined Campaign', {
          campaign_id: data.campaignId,
          campaign_name: data.campaignName,
        });
        return await client.addToList(config.config.participantsListId, data.participantEmail);
      case 'sendgrid':
        return await client.addContact(contact);
      default:
        return false;
    }
  }

  private async handleParticipantWon(client: any, config: any, data: any): Promise<boolean> {
    switch (config.type) {
      case 'mailchimp':
        await client.addToSegment(config.config.listId, config.config.winnersSegmentId, data.participantEmail);
        return await client.triggerAutomation(config.config.winnerAutomationId, data.participantEmail);
      case 'klaviyo':
        await client.trackEvent(data.participantEmail, 'Won Prize', {
          campaign_id: data.campaignId,
          campaign_name: data.campaignName,
          prize_name: data.prize?.name,
          prize_value: data.prize?.value,
        });
        return await client.addToList(config.config.winnersListId, data.participantEmail);
      case 'sendgrid':
        return await client.sendTransactionalEmail(
          data.participantEmail,
          config.config.winnerTemplateId,
          {
            campaign_name: data.campaignName,
            prize_name: data.prize?.name,
            prize_value: data.prize?.value,
          }
        );
      default:
        return false;
    }
  }

  private async handleParticipantLost(client: any, config: any, data: any): Promise<boolean> {
    switch (config.type) {
      case 'mailchimp':
        return await client.addToSegment(config.config.listId, config.config.losersSegmentId, data.participantEmail);
      case 'klaviyo':
        await client.trackEvent(data.participantEmail, 'Did Not Win', {
          campaign_id: data.campaignId,
          campaign_name: data.campaignName,
        });
        return await client.addToList(config.config.encouragementListId, data.participantEmail);
      case 'sendgrid':
        return await client.sendTransactionalEmail(
          data.participantEmail,
          config.config.encouragementTemplateId,
          {
            campaign_name: data.campaignName,
          }
        );
      default:
        return false;
    }
  }

  getIntegration(integrationId: string): any {
    return this.integrations.get(integrationId);
  }

  removeIntegration(integrationId: string): boolean {
    return this.integrations.delete(integrationId);
  }

  listIntegrations(): string[] {
    return Array.from(this.integrations.keys());
  }
}

// Export singleton instance
export const emailMarketingManager = new EmailMarketingManager();
