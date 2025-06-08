import { z } from 'zod';

// Base integration interface
export interface SocialMediaIntegration {
  id: string;
  name: string;
  type: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';
  isActive: boolean;
  config: Record<string, any>;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Common schemas
const PostContentSchema = z.object({
  text: z.string(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  link: z.string().url().optional(),
});

const CampaignShareDataSchema = z.object({
  campaignId: z.string(),
  campaignName: z.string(),
  campaignUrl: z.string().url(),
  participantName: z.string().optional(),
  hasWon: z.boolean(),
  prize: z.object({
    name: z.string(),
    value: z.string(),
  }).optional(),
  brandName: z.string(),
  customMessage: z.string().optional(),
});

// Facebook Integration
export class FacebookIntegration {
  private accessToken: string;
  private pageId: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: { accessToken: string; pageId: string }) {
    this.accessToken = config.accessToken;
    this.pageId = config.pageId;
  }

  async createPost(content: z.infer<typeof PostContentSchema>): Promise<string | null> {
    try {
      const postData: any = {
        message: content.text,
        access_token: this.accessToken,
      };

      if (content.link) {
        postData.link = content.link;
      }

      if (content.imageUrl) {
        postData.picture = content.imageUrl;
      }

      const response = await fetch(`${this.baseUrl}/${this.pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      return result.id || null;
    } catch (error) {
      console.error('Facebook post creation error:', error);
      return null;
    }
  }

  async createStory(imageUrl: string, link?: string): Promise<string | null> {
    try {
      const storyData: any = {
        photo: imageUrl,
        access_token: this.accessToken,
      };

      if (link) {
        storyData.link = link;
      }

      const response = await fetch(`${this.baseUrl}/${this.pageId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      const result = await response.json();
      return result.id || null;
    } catch (error) {
      console.error('Facebook story creation error:', error);
      return null;
    }
  }

  async schedulePost(content: z.infer<typeof PostContentSchema>, publishTime: Date): Promise<string | null> {
    try {
      const postData: any = {
        message: content.text,
        scheduled_publish_time: Math.floor(publishTime.getTime() / 1000),
        published: false,
        access_token: this.accessToken,
      };

      if (content.link) {
        postData.link = content.link;
      }

      const response = await fetch(`${this.baseUrl}/${this.pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      return result.id || null;
    } catch (error) {
      console.error('Facebook scheduled post error:', error);
      return null;
    }
  }
}

// Instagram Integration
export class InstagramIntegration {
  private accessToken: string;
  private accountId: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: { accessToken: string; accountId: string }) {
    this.accessToken = config.accessToken;
    this.accountId = config.accountId;
  }

  async createPost(content: z.infer<typeof PostContentSchema>): Promise<string | null> {
    try {
      // Step 1: Create media object
      const mediaData: any = {
        image_url: content.imageUrl,
        caption: content.text + (content.hashtags ? ' ' + content.hashtags.map(tag => `#${tag}`).join(' ') : ''),
        access_token: this.accessToken,
      };

      const mediaResponse = await fetch(`${this.baseUrl}/${this.accountId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mediaData),
      });

      const mediaResult = await mediaResponse.json();
      const mediaId = mediaResult.id;

      if (!mediaId) {
        throw new Error('Failed to create media object');
      }

      // Step 2: Publish media
      const publishResponse = await fetch(`${this.baseUrl}/${this.accountId}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaId,
          access_token: this.accessToken,
        }),
      });

      const publishResult = await publishResponse.json();
      return publishResult.id || null;
    } catch (error) {
      console.error('Instagram post creation error:', error);
      return null;
    }
  }

  async createStory(imageUrl: string): Promise<string | null> {
    try {
      const storyData = {
        image_url: imageUrl,
        media_type: 'STORIES',
        access_token: this.accessToken,
      };

      const response = await fetch(`${this.baseUrl}/${this.accountId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      const result = await response.json();
      return result.id || null;
    } catch (error) {
      console.error('Instagram story creation error:', error);
      return null;
    }
  }
}

// Twitter Integration
export class TwitterIntegration {
  private bearerToken: string;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(config: { bearerToken: string }) {
    this.bearerToken = config.bearerToken;
  }

  async createTweet(content: z.infer<typeof PostContentSchema>): Promise<string | null> {
    try {
      const tweetText = content.text + 
        (content.hashtags ? ' ' + content.hashtags.map(tag => `#${tag}`).join(' ') : '') +
        (content.mentions ? ' ' + content.mentions.map(mention => `@${mention}`).join(' ') : '');

      const tweetData: any = {
        text: tweetText,
      };

      if (content.link) {
        tweetData.text += ` ${content.link}`;
      }

      const response = await fetch(`${this.baseUrl}/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetData),
      });

      const result = await response.json();
      return result.data?.id || null;
    } catch (error) {
      console.error('Twitter tweet creation error:', error);
      return null;
    }
  }

  async createThread(tweets: string[]): Promise<string[] | null> {
    try {
      const tweetIds: string[] = [];
      let replyToId: string | undefined;

      for (const tweetText of tweets) {
        const tweetData: any = {
          text: tweetText,
        };

        if (replyToId) {
          tweetData.reply = {
            in_reply_to_tweet_id: replyToId,
          };
        }

        const response = await fetch(`${this.baseUrl}/tweets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tweetData),
        });

        const result = await response.json();
        const tweetId = result.data?.id;

        if (!tweetId) {
          throw new Error('Failed to create tweet in thread');
        }

        tweetIds.push(tweetId);
        replyToId = tweetId;
      }

      return tweetIds;
    } catch (error) {
      console.error('Twitter thread creation error:', error);
      return null;
    }
  }
}

// LinkedIn Integration
export class LinkedInIntegration {
  private accessToken: string;
  private organizationId: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(config: { accessToken: string; organizationId: string }) {
    this.accessToken = config.accessToken;
    this.organizationId = config.organizationId;
  }

  async createPost(content: z.infer<typeof PostContentSchema>): Promise<string | null> {
    try {
      const postData = {
        author: `urn:li:organization:${this.organizationId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text,
            },
            shareMediaCategory: content.imageUrl ? 'IMAGE' : 'NONE',
            ...(content.imageUrl && {
              media: [
                {
                  status: 'READY',
                  description: {
                    text: content.text,
                  },
                  media: content.imageUrl,
                  title: {
                    text: 'Scratch TIX Campaign',
                  },
                },
              ],
            }),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      return result.id || null;
    } catch (error) {
      console.error('LinkedIn post creation error:', error);
      return null;
    }
  }
}

// Social Media Manager
export class SocialMediaManager {
  private integrations: Map<string, any> = new Map();

  addIntegration(integration: SocialMediaIntegration): void {
    let client;

    switch (integration.type) {
      case 'facebook':
        client = new FacebookIntegration(integration.config);
        break;
      case 'instagram':
        client = new InstagramIntegration(integration.config);
        break;
      case 'twitter':
        client = new TwitterIntegration(integration.config);
        break;
      case 'linkedin':
        client = new LinkedInIntegration(integration.config);
        break;
      default:
        throw new Error(`Unsupported integration type: ${integration.type}`);
    }

    this.integrations.set(integration.id, {
      client,
      config: integration,
    });
  }

  async shareWinnerPost(
    integrationIds: string[],
    shareData: z.infer<typeof CampaignShareDataSchema>
  ): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};

    for (const integrationId of integrationIds) {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        results[integrationId] = null;
        continue;
      }

      const { client, config } = integration;
      const content = this.generateWinnerContent(shareData, config.config.type);

      try {
        let postId: string | null = null;

        switch (config.config.type) {
          case 'facebook':
            postId = await client.createPost(content);
            break;
          case 'instagram':
            postId = await client.createPost(content);
            break;
          case 'twitter':
            postId = await client.createTweet(content);
            break;
          case 'linkedin':
            postId = await client.createPost(content);
            break;
        }

        results[integrationId] = postId;
      } catch (error) {
        console.error(`Social media sharing error for ${integrationId}:`, error);
        results[integrationId] = null;
      }
    }

    return results;
  }

  private generateWinnerContent(
    shareData: z.infer<typeof CampaignShareDataSchema>,
    platform: string
  ): z.infer<typeof PostContentSchema> {
    const baseText = shareData.customMessage || 
      `🎉 Congratulations to our latest winner! ${shareData.participantName || 'Someone'} just won ${shareData.prize?.name} (${shareData.prize?.value}) in our ${shareData.campaignName} campaign!`;

    const hashtags = ['ScratchTIX', 'Winner', 'Contest', shareData.brandName.replace(/\s+/g, '')];
    
    // Platform-specific adjustments
    switch (platform) {
      case 'twitter':
        return {
          text: baseText.substring(0, 240), // Leave room for hashtags and link
          hashtags: hashtags.slice(0, 3), // Limit hashtags for Twitter
          link: shareData.campaignUrl,
        };
      case 'instagram':
        return {
          text: baseText,
          hashtags: [...hashtags, 'InstagramContest', 'Giveaway'],
          imageUrl: shareData.prize ? '/api/placeholder/1080/1080' : undefined,
        };
      case 'facebook':
        return {
          text: baseText,
          link: shareData.campaignUrl,
          imageUrl: shareData.prize ? '/api/placeholder/1200/630' : undefined,
        };
      case 'linkedin':
        return {
          text: `${baseText}\n\nJoin our campaign and try your luck: ${shareData.campaignUrl}`,
          hashtags: hashtags.slice(0, 5),
        };
      default:
        return {
          text: baseText,
          hashtags,
          link: shareData.campaignUrl,
        };
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
export const socialMediaManager = new SocialMediaManager();
