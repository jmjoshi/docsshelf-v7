/**
 * Email Service
 * Abstract email sending service that can be configured with different providers
 * Supports: SendGrid, AWS SES, Mailgun, Custom API
 */

interface EmailConfig {
  provider: 'sendgrid' | 'aws-ses' | 'mailgun' | 'custom' | 'console-only';
  apiKey?: string;
  apiEndpoint?: string;
  fromEmail: string;
  fromName: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Send email using configured provider
   */
  async send(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    console.log(`[EmailService] Sending email to ${message.to}`);
    console.log(`[EmailService] Subject: ${message.subject}`);
    
    switch (this.config.provider) {
      case 'sendgrid':
        return this.sendWithSendGrid(message);
      
      case 'aws-ses':
        return this.sendWithAWSSES(message);
      
      case 'mailgun':
        return this.sendWithMailgun(message);
      
      case 'custom':
        return this.sendWithCustomAPI(message);
      
      case 'console-only':
      default:
        // Development mode - just log to console
        console.log('[EmailService] Console-only mode - Email content:');
        console.log(message.body);
        return { success: true };
    }
  }

  /**
   * SendGrid integration
   */
  private async sendWithSendGrid(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.config.apiKey) {
      return { success: false, error: 'SendGrid API key not configured' };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: message.to }],
          }],
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName,
          },
          subject: message.subject,
          content: [{
            type: message.html ? 'text/html' : 'text/plain',
            value: message.html || message.body,
          }],
        }),
      });

      if (response.ok) {
        console.log('[EmailService] Email sent successfully via SendGrid');
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('[EmailService] SendGrid error:', errorText);
        return { success: false, error: `SendGrid error: ${response.status}` };
      }
    } catch (error) {
      console.error('[EmailService] SendGrid send failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * AWS SES integration
   */
  private async sendWithAWSSES(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement AWS SES using AWS SDK
    console.log('[EmailService] AWS SES not implemented yet');
    return { success: false, error: 'AWS SES not implemented' };
  }

  /**
   * Mailgun integration
   */
  private async sendWithMailgun(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.config.apiKey || !this.config.apiEndpoint) {
      return { success: false, error: 'Mailgun API key or endpoint not configured' };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
      formData.append('to', message.to);
      formData.append('subject', message.subject);
      formData.append('text', message.body);
      if (message.html) {
        formData.append('html', message.html);
      }

      const response = await fetch(`${this.config.apiEndpoint}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        console.log('[EmailService] Email sent successfully via Mailgun');
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('[EmailService] Mailgun error:', errorText);
        return { success: false, error: `Mailgun error: ${response.status}` };
      }
    } catch (error) {
      console.error('[EmailService] Mailgun send failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Custom API integration
   */
  private async sendWithCustomAPI(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.config.apiEndpoint) {
      return { success: false, error: 'Custom API endpoint not configured' };
    }

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          to: message.to,
          from: this.config.fromEmail,
          fromName: this.config.fromName,
          subject: message.subject,
          body: message.body,
          html: message.html,
        }),
      });

      if (response.ok) {
        console.log('[EmailService] Email sent successfully via custom API');
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('[EmailService] Custom API error:', errorText);
        return { success: false, error: `Custom API error: ${response.status}` };
      }
    } catch (error) {
      console.error('[EmailService] Custom API send failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Email configuration - UPDATE THIS with your email provider details
const emailConfig: EmailConfig = {
  // Change this to your email provider
  provider: 'console-only', // Options: 'sendgrid', 'aws-ses', 'mailgun', 'custom', 'console-only'
  
  // Provider API credentials (required for non-console providers)
  // apiKey: process.env.EMAIL_API_KEY || 'your-api-key-here',
  // apiEndpoint: process.env.EMAIL_API_ENDPOINT || 'https://api.mailgun.net/v3/your-domain',
  
  // Sender information
  fromEmail: 'noreply@docsshelf.app',
  fromName: 'DocsShelf',
};

// Export singleton instance
export const emailService = new EmailService(emailConfig);

// Export types
export type { EmailConfig, EmailMessage };
