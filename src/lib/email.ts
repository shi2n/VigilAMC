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

export async function sendInquiryNotification(data: InquiryEmailData): Promise<{ success: boolean; message?: string }> {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'vigilamc@gmail.com';
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

  // If Resend API key is configured in Vercel environment variables:
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'VigilAMC Alerts <onboarding@resend.dev>',
          to: [recipient],
          subject: subject,
          text: emailText,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        console.error('[Resend Error]:', errJson);
        return { success: false, message: 'Resend API returned error' };
      }

      console.log('[Resend Success]: Email delivered to', recipient);
      return { success: true };
    } catch (err: any) {
      console.error('[Email Dispatch Error]:', err.message);
      return { success: false, message: err.message };
    }
  }

  // If a generic webhook (Zapier, Make, Slack, Discord) is set:
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
      console.log('[Webhook Success]: Notification sent to webhook');
    } catch (e) {
      console.error('[Webhook Error]:', e);
    }
  }

  return { success: true, message: 'Notification logged and queued.' };
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

export async function sendInvestorNotification(data: InvestorEmailData): Promise<{ success: boolean; message?: string }> {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'vigilamc@gmail.com';
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

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'VigilAMC Investor Relations <onboarding@resend.dev>',
          to: [recipient],
          subject: subject,
          text: emailText,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        console.error('[Resend Error]:', errJson);
        return { success: false, message: 'Resend API returned error' };
      }

      console.log('[Resend Success]: Investor alert delivered to', recipient);
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
      console.log('[Webhook Success]: Investor notification sent to webhook');
    } catch (e) {
      console.error('[Webhook Error]:', e);
    }
  }

  return { success: true, message: 'Investor notification logged.' };
}

