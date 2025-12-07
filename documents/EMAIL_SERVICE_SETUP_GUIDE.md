# Email Service Configuration Guide

## Current Status
🟡 **Console-Only Mode** - Emails are only logged to console (development mode)

To enable actual email sending, you need to configure an email service provider.

---

## Quick Setup Options

### Option 1: SendGrid (Recommended - Easy & Free Tier)

1. **Sign up for SendGrid**: https://signup.sendgrid.com/
2. **Get API Key**: 
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key

3. **Update configuration** in `src/services/email/emailService.ts`:
```typescript
const emailConfig: EmailConfig = {
  provider: 'sendgrid',
  apiKey: 'YOUR_SENDGRID_API_KEY_HERE',
  fromEmail: 'noreply@yourdomain.com',
  fromName: 'DocsShelf',
};
```

4. **Verify sender email** (required by SendGrid):
   - Go to Settings → Sender Authentication
   - Verify your sender email address

**Pricing**: Free tier includes 100 emails/day

---

### Option 2: Mailgun (Good for Higher Volume)

1. **Sign up**: https://signup.mailgun.com/
2. **Get API Key & Domain**:
   - Dashboard → API Keys → Copy Private API Key
   - Dashboard → Sending → Domains → Copy your domain

3. **Update configuration**:
```typescript
const emailConfig: EmailConfig = {
  provider: 'mailgun',
  apiKey: 'YOUR_MAILGUN_API_KEY',
  apiEndpoint: 'https://api.mailgun.net/v3/YOUR_DOMAIN',
  fromEmail: 'noreply@yourdomain.com',
  fromName: 'DocsShelf',
};
```

**Pricing**: Free tier includes 5,000 emails/month for 3 months

---

### Option 3: Custom Backend API

If you have your own backend that handles emails:

```typescript
const emailConfig: EmailConfig = {
  provider: 'custom',
  apiEndpoint: 'https://your-backend.com/api/send-email',
  apiKey: 'YOUR_API_KEY', // optional
  fromEmail: 'noreply@yourdomain.com',
  fromName: 'DocsShelf',
};
```

Your API should accept POST requests with this format:
```json
{
  "to": "user@example.com",
  "from": "noreply@yourdomain.com",
  "fromName": "DocsShelf",
  "subject": "Email Subject",
  "body": "Plain text body",
  "html": "<html>HTML body</html>"
}
```

---

### Option 4: AWS SES (For Production Scale)

**Note**: AWS SES integration needs additional implementation.

1. Set up AWS SES account
2. Verify sender email/domain
3. Install AWS SDK: `npm install @aws-sdk/client-ses`
4. Implement AWS SES provider in `emailService.ts`

---

## Environment Variables (Recommended for Production)

Instead of hardcoding API keys, use environment variables:

1. Create `.env` file:
```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=DocsShelf
```

2. Install dotenv: `npm install react-native-dotenv`

3. Update `emailService.ts`:
```typescript
const emailConfig: EmailConfig = {
  provider: process.env.EMAIL_PROVIDER as any || 'console-only',
  apiKey: process.env.EMAIL_API_KEY,
  fromEmail: process.env.EMAIL_FROM || 'noreply@docsshelf.app',
  fromName: process.env.EMAIL_FROM_NAME || 'DocsShelf',
};
```

---

## Testing Email Service

After configuration, test by triggering password reset:

1. Go to Login screen
2. Click "Forgot Password?"
3. Enter your email
4. Click "Send Reset Link"
5. Check your email inbox (and spam folder)

---

## Troubleshooting

### Emails Not Being Sent

1. **Check console logs** for error messages:
   - Look for `[EmailService]` logs
   - Check for API key errors
   - Verify provider configuration

2. **Verify API key** is correct and has proper permissions

3. **Check sender verification**:
   - SendGrid requires verified sender email
   - Mailgun requires verified domain

4. **Check spam folder** - emails might be filtered

### Still Using Console-Only Mode

If `provider: 'console-only'` is set, emails will only log to console.
Change to your actual provider: `'sendgrid'`, `'mailgun'`, or `'custom'`

---

## Email Templates Included

✅ **Password Reset Request** - Sent when user requests password reset
✅ **Password Reset Confirmation** - Sent after successful password reset
✅ **Account Lockout Alert** - Sent when account is locked due to failed attempts

All templates include:
- Plain text version (for email clients that don't support HTML)
- HTML version with professional styling
- Security information
- Clear call-to-action

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Rotate API keys** regularly
4. **Monitor email sending** for abuse
5. **Implement rate limiting** to prevent spam
6. **Use verified sender domains** to avoid spam filters

---

## Next Steps

1. Choose an email provider (SendGrid recommended for quick setup)
2. Get API key from provider
3. Update `src/services/email/emailService.ts` with your configuration
4. Test password reset flow
5. Monitor logs for successful email delivery

For questions or issues, check the provider's documentation:
- SendGrid: https://docs.sendgrid.com/
- Mailgun: https://documentation.mailgun.com/
