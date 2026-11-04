import { SITE_CONFIG } from './siteConfig';
import nodemailer from 'nodemailer';

export type EmailErrorCode =
  | 'CONFIG_MISSING'
  | 'AUTH_FAILED'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_ADDRESS'
  | 'DISPATCH_FAILED';

export interface EmailResult {
  success: boolean;
  errorCode?: EmailErrorCode;
  message?: string;
  messageId?: string;
}

export interface InquiryEmailData {
  name?: string | null;
  company?: string | null;
  phone?: string | null;
  email: string;
  requirement?: string | null;
  message?: string | null;
  submittedAt: string | Date;
  source?: string | null;
  type?: string;
  assetCount?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
}

export interface InvestorEmailData {
  fullName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  investorType: string;
  organization?: string | null;
  websiteLinkedin?: string | null;
  investmentExperience?: string | null;
  investmentRange?: string | null;
  investmentTimeline?: string | null;
  interestMessage?: string | null;
  contributionMessage?: string | null;
  submittedAt: string | Date;
}

export interface MagicLinkEmailData {
  to: string;
  name?: string | null;
  agencyName?: string | null;
  magicLink: string;
  expiresMinutes?: number;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function getMailFrom(): string {
  return (
    process.env.MAIL_FROM ||
    `"VigilAMC Portal" <${process.env.SMTP_USER || 'alerts@vigilamc.in'}>`
  );
}

function createSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports with STARTTLS
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  });
}

function mapNodemailerError(err: any): { errorCode: EmailErrorCode; message: string } {
  const msg = err?.message || 'Email dispatch failed';
  const code = (err?.code || '').toString().toUpperCase();
  const response = (err?.response || '').toString().toLowerCase();

  if (code === 'EAUTH' || response.includes('authentication') || response.includes('bad credentials')) {
    return { errorCode: 'AUTH_FAILED', message: 'SMTP authentication failed. Verify SMTP_USER and SMTP_PASS.' };
  }
  if (response.includes('quota') || response.includes('rate limit') || response.includes('too many')) {
    return { errorCode: 'QUOTA_EXCEEDED', message: 'Email quota or rate limit exceeded.' };
  }
  if (code === 'EENVELOPE' || response.includes('recipient') || response.includes('invalid address')) {
    return { errorCode: 'INVALID_ADDRESS', message: 'Invalid recipient email address.' };
  }
  return { errorCode: 'DISPATCH_FAILED', message: msg };
}

/**
 * Universal email dispatcher: tries SMTP first, then Resend if key exists,
 * or gracefully returns CONFIG_MISSING so UI can show fallback.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailResult> {
  const { to, subject, text, html } = options;

  if (!to || !to.includes('@')) {
    return { success: false, errorCode: 'INVALID_ADDRESS', message: 'A valid email address is required.' };
  }

  // 1. Try secure SMTP transport (pre-approved primary)
  const transport = createSmtpTransport();
  if (transport) {
    try {
      const info = await transport.sendMail({
        from: getMailFrom(),
        to,
        subject,
        text,
        html: html || undefined,
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      const mapped = mapNodemailerError(err);
      console.error('[SMTP Error]:', mapped);
      return { success: false, ...mapped };
    }
  }

  // 2. Swappable fallback: Resend API if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: getMailFrom(),
          to: [to],
          subject,
          text,
          html,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          errorCode: 'DISPATCH_FAILED',
          message: errJson?.message || 'Resend API returned error',
        };
      }

      const resData = await res.json().catch(() => ({}));
      return { success: true, messageId: resData?.id };
    } catch (err: any) {
      return { success: false, errorCode: 'DISPATCH_FAILED', message: err?.message };
    }
  }

  // 3. Neither SMTP nor Resend configured -> typed CONFIG_MISSING
  return {
    success: false,
    errorCode: 'CONFIG_MISSING',
    message: 'SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS missing).',
  };
}

/**
 * Send Magic Link / Portal Invitation Email
 */
export async function sendMagicLinkEmail(data: MagicLinkEmailData): Promise<EmailResult> {
  const agency = data.agencyName || 'Your Fire Safety AMC Agency';
  const minutes = data.expiresMinutes || 30;
  const recipientName = data.name || 'Valued Client';

  const subject = `Client Portal Sign-In Link — ${agency}`;

  const text = `
Hello ${recipientName},

You have been invited to access the VigilAMC Client Portal for ${agency}.

Click the secure link below to sign in:
${data.magicLink}

This link is valid for ${minutes} minutes and can only be used once.

If you did not request this link, you can safely ignore this email.

---
VigilAMC Compliance & Fire Safety Infrastructure
https://vigilamc.vercel.app
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8F2; padding: 32px 16px; margin: 0; color: #1C1917;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #FFE4D6; padding: 32px; box-shadow: 0 4px 20px rgba(28,25,23,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #EA580C; margin: 0 0 6px 0; font-size: 22px; font-weight: 700;">${agency}</h2>
      <p style="margin: 0; color: #44403C; font-size: 14px;">Client Compliance & Report Portal</p>
    </div>
    
    <p style="font-size: 15px; line-height: 1.5; color: #1C1917;">Hello <strong>${recipientName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #44403C;">
      Click the button below to sign in to your secure portal to inspect your building compliance records, view verified inspection reports, and download certified Form-B certificates:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.magicLink}" style="display: inline-block; background-color: #EA580C; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);">
        Sign In to Client Portal →
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #78716C; margin-top: 24px;">
      Or copy and paste this link into your browser:<br>
      <a href="${data.magicLink}" style="color: #EA580C; word-break: break-all;">${data.magicLink}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #F5EBE1; margin: 24px 0;">

    <p style="font-size: 12px; color: #78716C; margin: 0;">
      ⏱️ This link is single-use and expires in <strong>${minutes} minutes</strong>. If you did not request access, please disregard this email.
    </p>
  </div>
</body>
</html>
`.trim();

  return sendEmail({
    to: data.to,
    subject,
    text,
    html,
  });
}

export async function sendInquiryNotification(data: InquiryEmailData): Promise<{ success: boolean; message?: string }> {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || SITE_CONFIG.CONTACT_EMAIL;
  const subject = 'New VigilAMC Website Inquiry';

  const formattedDate = new Date(data.submittedAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const emailText = `
New VigilAMC Website Inquiry Received

----------------------------------------
Name:         ${data.name || 'Not provided'}
Company:      ${data.company || 'Not provided'}
Phone:        ${data.phone || 'Not provided'}
Email:        ${data.email}
Type:         ${data.type || 'General Lead'}
Requirement:  ${data.requirement || data.assetCount || 'General Compliance Inquiry'}
Message:      ${data.message || 'No additional message.'}
Preferred Slot: ${data.preferredDate || 'N/A'} ${data.preferredTime || ''}
Submitted at: ${formattedDate}
Source:       ${data.source || 'Website Lead Form'}
----------------------------------------
`.trim();

  console.log(`[EMAIL NOTIFICATION TO: ${recipient}]`);
  console.log(emailText);

  // If SMTP is available, use it!
  if (isSmtpConfigured()) {
    const res = await sendEmail({ to: recipient, subject, text: emailText });
    if (res.success) return { success: true };
  }

  // If Resend API key is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'VigilAMC Alerts <onboarding@resend.dev>',
          to: [recipient],
          subject,
          text: emailText,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('[Resend Error]:', errJson);
        return { success: false, message: 'Resend API returned error' };
      }
      return { success: true };
    } catch (err: any) {
      console.error('[Email Dispatch Error]:', err.message);
      return { success: false, message: err.message };
    }
  }

  // Generic webhook fallback
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*${subject}*\n\n\`\`\`\n${emailText}\n\`\`\``,
          inquiry: data,
        }),
      });
    } catch (e) {
      console.error('[Webhook Error]:', e);
    }
  }

  return { success: true, message: 'Notification logged and queued.' };
}

export async function sendInvestorNotification(data: InvestorEmailData): Promise<{ success: boolean; message?: string }> {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || SITE_CONFIG.CONTACT_EMAIL;
  const subject = `🚀 New Investor Interest: ${data.fullName} (${data.investorType})`;

  const formattedDate = new Date(data.submittedAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const emailText = `
New Investor Expression of Interest Received

----------------------------------------
Full Name:         ${data.fullName}
Email:             ${data.email}
Phone:             ${data.phone || 'Not provided'}
Location:          ${data.city || 'N/A'}, ${data.country || 'India'}
Investor Type:     ${data.investorType}
Organization/Firm: ${data.organization || 'Not provided'}
Website / LinkedIn:${data.websiteLinkedin || 'Not provided'}
Experience Level:  ${data.investmentExperience || 'Not specified'}
Investment Range:  ${data.investmentRange || 'Not specified'}
Timeline:          ${data.investmentTimeline || 'Not specified'}
Interest / Thesis: ${data.interestMessage || 'N/A'}
Value-Add:         ${data.contributionMessage || 'N/A'}
Submitted at:      ${formattedDate}
----------------------------------------
`.trim();

  console.log(`[INVESTOR NOTIFICATION TO: ${recipient}]`);
  console.log(emailText);

  if (isSmtpConfigured()) {
    const res = await sendEmail({ to: recipient, subject, text: emailText });
    if (res.success) return { success: true };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'VigilAMC Investor Relations <onboarding@resend.dev>',
          to: [recipient],
          subject,
          text: emailText,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('[Resend Error]:', errJson);
        return { success: false, message: 'Resend API returned error' };
      }
      return { success: true };
    } catch (err: any) {
      console.error('[Email Dispatch Error]:', err.message);
      return { success: false, message: err.message };
    }
  }

  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*${subject}*\n\n\`\`\`\n${emailText}\n\`\`\``,
          investor: data,
        }),
      });
    } catch (e) {
      console.error('[Webhook Error]:', e);
    }
  }

  return { success: true, message: 'Investor notification logged.' };
}
