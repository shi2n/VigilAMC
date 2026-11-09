import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { SITE_CONFIG } from './siteConfig';
import { db } from './db';

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

export interface EmailSenderInfo {
  name: string;
  role?: string | null;
  agencyName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64 string
  content_type?: string;
  content_id?: string;
  disposition?: 'attachment' | 'inline';
}

export interface SendEmailOptions {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export interface RenderEmailShellOptions {
  heading: string;
  bodyHtml: string;
  bodyText: string;
  sender: EmailSenderInfo;
  previewText?: string;
}

export interface MagicLinkEmailData {
  to: string;
  name?: string | null;
  agencyName?: string | null;
  magicLink: string;
  expiresMinutes?: number;
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

export interface FormBEmailOptions {
  to: string;
  cc?: string | null;
  subject: string;
  message?: string | null;
  buildingId: string;
  buildingName: string;
  reportRef: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
  sender: EmailSenderInfo;
  organizationId?: string | null;
  createdById?: string | null;
}

export interface OverdueDigestEmailOptions {
  to: string;
  cc?: string | null;
  subject: string;
  message?: string | null;
  clientName: string;
  summaryCounts: {
    overdue: number;
    dueSoon: number;
    totalAssets: number;
  };
  items: Array<{
    buildingName: string;
    locationZone: string;
    assetTag: string;
    assetType: string;
    dueDate: string;
    status: 'EXPIRED' | 'DUE_SOON' | 'OK';
    dueNotice: string;
  }>;
  sender: EmailSenderInfo;
  organizationId?: string | null;
  clientId?: string | null;
  createdById?: string | null;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Collects VigilAMC logo and optional sender signature CID attachments.
 */
export function getBrandedEmailAttachments(extraAttachments: EmailAttachment[] = []): {
  attachments: EmailAttachment[];
  hasSignatureImage: boolean;
} {
  const attachments: EmailAttachment[] = [...extraAttachments];

  // 1. CID inline Logo (source: public/logo.jpg < 60KB)
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');
      attachments.push({
        filename: 'logo.jpg',
        content: logoBase64,
        content_type: 'image/jpeg',
        content_id: 'vigilamc-logo',
        disposition: 'inline',
      });
    }
  } catch (err) {
    console.warn('[Branded Email]: Unable to load logo inline image:', err);
  }

  // 2. Optional Signature image if /public/signature.png or .jpg exists
  let hasSignatureImage = false;
  try {
    const sigPng = path.join(process.cwd(), 'public', 'signature.png');
    const sigJpg = path.join(process.cwd(), 'public', 'signature.jpg');
    if (fs.existsSync(sigPng)) {
      attachments.push({
        filename: 'signature.png',
        content: fs.readFileSync(sigPng).toString('base64'),
        content_type: 'image/png',
        content_id: 'sender-signature',
        disposition: 'inline',
      });
      hasSignatureImage = true;
    } else if (fs.existsSync(sigJpg)) {
      attachments.push({
        filename: 'signature.jpg',
        content: fs.readFileSync(sigJpg).toString('base64'),
        content_type: 'image/jpeg',
        content_id: 'sender-signature',
        disposition: 'inline',
      });
      hasSignatureImage = true;
    }
  } catch (err) {
    console.warn('[Branded Email]: Signature check exception:', err);
  }

  return { attachments, hasSignatureImage };
}

/**
 * 1. SHARED BRANDED EMAIL TEMPLATE (used by all email paths)
 * FIRE identity: canvas #FFF8F2, card #FFFFFF, accent #EA580C / #C2410C, text #1C1917 / #44403C.
 * Inline CSS only, table-based, low image-to-text ratio (CID logo + optional signature only).
 */
export function renderEmailShell(options: RenderEmailShellOptions): { html: string; text: string } {
  const { heading, bodyHtml, bodyText, sender, previewText } = options;
  const { hasSignatureImage } = getBrandedEmailAttachments();

  const senderName = sender.name || 'Authorized Representative';
  const senderRole = sender.role || 'Service Management';
  const agencyName = sender.agencyName || 'Vigil Fire & Safety Solutions';
  const phoneLine = sender.phone ? `Phone: ${sender.phone}` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FFF8F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px;">${escapeHtml(previewText)}</div>` : ''}

  <!-- Canvas Table -->
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFF8F2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (max 600px) -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #FFE4D6; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(28, 25, 23, 0.06);">

          <!-- HEADER: CID inline logo + wordmark -->
          <tr>
            <td style="padding: 24px 28px 18px 28px; border-bottom: 2px solid #EA580C; background-color: #FFFFFF;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle" style="width: 200px;">
                    <a href="https://vigilamc.com" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">
                      <img src="cid:vigilamc-logo" alt="VigilAMC" width="180" style="display: block; max-width: 180px; height: auto; border: 0;" />
                    </a>
                  </td>
                  <td align="right" valign="middle" style="font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 0.5px;">
                    Fire Safety &amp; AMC
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HEADING & BODY -->
          <tr>
            <td style="padding: 28px 28px 16px 28px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #1C1917; line-height: 1.35; letter-spacing: -0.2px;">
                ${escapeHtml(heading)}
              </h1>
              <div style="font-size: 14px; line-height: 1.6; color: #44403C;">
                ${bodyHtml}
              </div>
            </td>
          </tr>

          <!-- SIGNATURE BLOCK (Sending Agency User) -->
          <tr>
            <td style="padding: 12px 28px 24px 28px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-top: 1px solid #FFE4D6; padding-top: 16px;">
                ${hasSignatureImage ? `
                <tr>
                  <td style="padding-bottom: 8px;">
                    <img src="cid:sender-signature" alt="Signature" style="max-height: 48px; width: auto; display: block; border: 0;" />
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="font-size: 14px; font-weight: 800; color: #1C1917; line-height: 1.3;">
                    ${escapeHtml(senderName)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #44403C; line-height: 1.4; padding-top: 2px;">
                    ${escapeHtml(senderRole)} &bull; <strong>${escapeHtml(agencyName)}</strong>
                  </td>
                </tr>
                ${phoneLine ? `
                <tr>
                  <td style="font-size: 12px; color: #78716C; line-height: 1.4; padding-top: 2px;">
                    ${escapeHtml(phoneLine)}
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="font-size: 12px; color: #EA580C; line-height: 1.4; padding-top: 6px;">
                    <a href="https://vigilamc.com" target="_blank" rel="noopener noreferrer" style="color: #EA580C; text-decoration: none; font-weight: 700;">vigilamc.com</a>
                    &nbsp;&bull;&nbsp;
                    Reply-To: <a href="mailto:support@vigilamc.com" style="color: #EA580C; text-decoration: none;">support@vigilamc.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 16px 28px 20px 28px; background-color: #FFF8F2; border-top: 1px solid #FFE4D6; text-align: center;">
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #78716C;">
                VigilAMC &middot; New Delhi, India &middot;
                <a href="mailto:support@vigilamc.com" style="color: #78716C; text-decoration: underline;">support@vigilamc.com</a> &middot;
                <a href="https://vigilamc.com" target="_blank" rel="noopener noreferrer" style="color: #78716C; text-decoration: underline;">vigilamc.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = `
${heading}
${'='.repeat(Math.min(heading.length, 60))}

${bodyText}

---
${senderName}
${senderRole} | ${agencyName}
${phoneLine ? `${phoneLine}\n` : ''}Platform: https://vigilamc.com
Reply-To: support@vigilamc.com

---
VigilAMC · New Delhi, India · support@vigilamc.com · vigilamc.com
`.trim();

  return { html, text };
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
    secure: port === 465,
    auth: { user, pass },
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
    return { errorCode: 'AUTH_FAILED', message: 'SMTP authentication failed. Verify credentials.' };
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
 * Universal spam-safe email dispatcher.
 * Uses verified vigilamc.com senders, Resend API first (or SMTP), plain-text + HTML, and CID attachments.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { from, to, cc, replyTo = 'support@vigilamc.com', subject, text, html, attachments = [] } = options;

  const toList = Array.isArray(to) ? to : [to];
  const validRecipients = toList.map((e) => (e || '').trim()).filter((e) => e.includes('@'));

  if (validRecipients.length === 0) {
    return { success: false, errorCode: 'INVALID_ADDRESS', message: 'A valid recipient email address is required.' };
  }

  const ccList = cc ? (Array.isArray(cc) ? cc : [cc]).map((e) => e.trim()).filter((e) => e.includes('@')) : undefined;

  const fromAddress = from || 'VigilAMC <support@vigilamc.com>';

  // 1. Resend API Dispatch (Primary for verified vigilamc.com domain)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resendAttachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        content_type: att.content_type,
        content_id: att.content_id,
      }));

      const payload: Record<string, any> = {
        from: fromAddress,
        to: validRecipients,
        reply_to: replyTo,
        subject: subject.slice(0, 60),
        text,
        html: html || undefined,
      };

      if (ccList && ccList.length > 0) {
        payload.cc = ccList;
      }

      if (resendAttachments.length > 0) {
        payload.attachments = resendAttachments;
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('[Resend API Error]:', errJson);
        return {
          success: false,
          errorCode: 'DISPATCH_FAILED',
          message: errJson?.message || `Resend dispatch failed with HTTP ${res.status}`,
        };
      }

      const resData = await res.json().catch(() => ({}));
      return { success: true, messageId: resData?.id };
    } catch (err: any) {
      console.error('[Resend Fetch Error]:', err?.message);
      return { success: false, errorCode: 'DISPATCH_FAILED', message: err?.message };
    }
  }

  // 2. SMTP Transport Fallback
  const transport = createSmtpTransport();
  if (transport) {
    try {
      const nodemailerAttachments = attachments.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        cid: att.content_id,
        contentType: att.content_type,
      }));

      const info = await transport.sendMail({
        from: fromAddress,
        to: validRecipients,
        cc: ccList,
        replyTo,
        subject: subject.slice(0, 60),
        text,
        html: html || undefined,
        attachments: nodemailerAttachments,
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      const mapped = mapNodemailerError(err);
      console.error('[SMTP Transport Error]:', mapped);
      return { success: false, ...mapped };
    }
  }

  // 3. Neither configured -> typed CONFIG_MISSING
  return {
    success: false,
    errorCode: 'CONFIG_MISSING',
    message: 'RESEND_API_KEY environment variable is not configured.',
  };
}

/**
 * 2. FORM B REPORT EMAIL DISPATCHER
 * Generates branded email with attached Form B PDF (<5MB) and logs audit record.
 */
export async function sendFormBReportEmail(options: FormBEmailOptions): Promise<EmailResult> {
  const {
    to,
    cc,
    subject,
    message,
    buildingId,
    buildingName,
    reportRef,
    pdfBuffer,
    pdfFilename,
    sender,
    organizationId,
    createdById,
  } = options;

  const agency = sender.agencyName || 'Vigil Fire & Safety Solutions';
  const from = `"${agency} via VigilAMC" <reports@vigilamc.com>`;

  const bodyHtml = `
<p style="margin: 0 0 14px 0;">Hello,</p>
<p style="margin: 0 0 14px 0;">
  Please find attached the certified <strong>Form B Fire Safety Inspection &amp; Maintenance Report</strong> for <strong>${escapeHtml(buildingName)}</strong> (Reference: <code>${escapeHtml(reportRef)}</code>).
</p>
${message ? `
<div style="background-color: #FFF8F2; border-left: 3px solid #EA580C; padding: 12px 16px; margin: 16px 0; font-size: 13.5px; color: #1C1917; border-radius: 4px;">
  ${escapeHtml(message).replace(/\n/g, '<br>')}
</div>` : ''}
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin: 16px 0; padding: 14px;">
  <tr>
    <td style="font-size: 12px; color: #64748B; width: 35%; padding-bottom: 6px;">Premises / Site:</td>
    <td style="font-size: 13px; font-weight: 700; color: #1C1917; padding-bottom: 6px;">${escapeHtml(buildingName)}</td>
  </tr>
  <tr>
    <td style="font-size: 12px; color: #64748B; padding-bottom: 6px;">Report Reference:</td>
    <td style="font-size: 12px; font-family: monospace; font-weight: 700; color: #EA580C; padding-bottom: 6px;">${escapeHtml(reportRef)}</td>
  </tr>
  <tr>
    <td style="font-size: 12px; color: #64748B; padding-bottom: 6px;">Attached Document:</td>
    <td style="font-size: 12px; font-weight: 600; color: #1C1917; padding-bottom: 6px;">${escapeHtml(pdfFilename)} (${Math.round(pdfBuffer.length / 1024)} KB)</td>
  </tr>
  <tr>
    <td style="font-size: 12px; color: #64748B;">Authenticity Check:</td>
    <td style="font-size: 12px; color: #EA580C;">
      <a href="https://vigilamc.com/verify/${encodeURIComponent(reportRef)}" target="_blank" rel="noopener noreferrer" style="color: #EA580C; font-weight: 600; text-decoration: underline;">
        Verify Report Integrity &rarr;
      </a>
    </td>
  </tr>
</table>
<p style="margin: 14px 0 0 0; font-size: 12.5px; color: #78716C;">
  This document carries full field inspection logs, asset rosters, and statutory Form-B maintenance declarations. If any corrective actions are highlighted, please contact our team to schedule required rectifications.
</p>
  `.trim();

  const bodyText = `
Hello,

Please find attached the certified Form B Fire Safety Inspection & Maintenance Report for ${buildingName} (Ref: ${reportRef}).

${message ? `Note from Agency:\n${message}\n\n` : ''}
Premises: ${buildingName}
Report Ref: ${reportRef}
Attached File: ${pdfFilename} (${Math.round(pdfBuffer.length / 1024)} KB)
Verify Report: https://vigilamc.com/verify/${encodeURIComponent(reportRef)}

This document carries full field inspection logs, asset rosters, and statutory Form-B declarations.
  `.trim();

  const { html, text } = renderEmailShell({
    heading: `Form B Inspection Report: ${buildingName}`,
    bodyHtml,
    bodyText,
    sender,
    previewText: `Certified Form B Report for ${buildingName} (${reportRef})`,
  });

  const pdfAttachment: EmailAttachment = {
    filename: pdfFilename,
    content: pdfBuffer.toString('base64'),
    content_type: 'application/pdf',
    disposition: 'attachment',
  };

  const { attachments } = getBrandedEmailAttachments([pdfAttachment]);

  const result = await sendEmail({
    from,
    to,
    cc: cc || undefined,
    replyTo: 'support@vigilamc.com',
    subject,
    text,
    html,
    attachments,
  });

  // Audit trail: Log to EmailLog
  try {
    if (db) {
      await (db as any).emailLog.create({
        data: {
          organizationId: organizationId || null,
          kind: 'REPORT',
          to: Array.isArray(to) ? to.join(', ') : to,
          cc: cc || null,
          subject: subject.slice(0, 120),
          refId: buildingId,
          resendId: result.messageId || null,
          sentAt: new Date(),
          createdById: createdById || null,
        },
      });
    }
  } catch (err) {
    console.error('[EmailLog Audit Error]:', err);
  }

  return result;
}

/**
 * 3. OVERDUE-DATE UPDATE EMAIL DISPATCHER (Agency -> Client)
 * Summary strip + itemized table rows with status chips + audit logging.
 */
export async function sendOverdueDigestEmail(options: OverdueDigestEmailOptions): Promise<EmailResult> {
  const {
    to,
    cc,
    subject,
    message,
    clientName,
    summaryCounts,
    items,
    sender,
    organizationId,
    clientId,
    createdById,
  } = options;

  const agency = sender.agencyName || 'Vigil Fire & Safety Solutions';
  const from = `"${agency} via VigilAMC" <support@vigilamc.com>`;

  const tableRowsHtml = items.map((item) => {
    const isExpired = item.status === 'EXPIRED';
    const isDueSoon = item.status === 'DUE_SOON';
    const chipBg = isExpired ? '#FEF2F2' : isDueSoon ? '#FFFBEB' : '#ECFDF5';
    const chipColor = isExpired ? '#DC2626' : isDueSoon ? '#D97706' : '#059669';
    const chipBorder = isExpired ? '#FECACA' : isDueSoon ? '#FDE68A' : '#A7F3D0';

    return `
    <tr style="border-bottom: 1px solid #F1F5F9;">
      <td style="padding: 10px 8px; font-size: 12px; color: #1C1917; font-weight: 600;">${escapeHtml(item.buildingName)}</td>
      <td style="padding: 10px 8px; font-size: 11.5px; color: #44403C;">${escapeHtml(item.locationZone)}</td>
      <td style="padding: 10px 8px; font-size: 11.5px; font-family: monospace; font-weight: 700; color: #EA580C;">
        ${escapeHtml(item.assetTag)}<br>
        <span style="font-family: sans-serif; font-size: 10px; color: #78716C; font-weight: normal;">${escapeHtml(item.assetType)}</span>
      </td>
      <td style="padding: 10px 8px; font-size: 11.5px; color: #1C1917; text-align: center;">${escapeHtml(item.dueDate)}</td>
      <td style="padding: 10px 8px; text-align: center;">
        <span style="display: inline-block; background-color: ${chipBg}; color: ${chipColor}; border: 1px solid ${chipBorder}; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase;">
          ${escapeHtml(item.status)}
        </span>
        <div style="font-size: 10px; color: ${chipColor}; font-weight: 700; margin-top: 2px;">
          ${escapeHtml(item.dueNotice)}
        </div>
      </td>
    </tr>`;
  }).join('');

  const bodyHtml = `
<p style="margin: 0 0 14px 0;">Hello <strong>${escapeHtml(clientName)}</strong>,</p>
<p style="margin: 0 0 16px 0;">
  Here is the latest fire safety compliance status and equipment service due schedule for your registered facilities.
</p>
${message ? `
<div style="background-color: #FFF8F2; border-left: 3px solid #EA580C; padding: 12px 16px; margin: 16px 0; font-size: 13.5px; color: #1C1917; border-radius: 4px;">
  ${escapeHtml(message).replace(/\n/g, '<br>')}
</div>` : ''}

<!-- Summary Strip -->
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 16px 0 20px 0; text-align: center;">
  <tr>
    <td style="width: 32%; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 12px 8px;">
      <div style="font-size: 10px; font-weight: 800; color: #DC2626; text-transform: uppercase;">Overdue</div>
      <div style="font-size: 20px; font-weight: 900; color: #DC2626; margin-top: 2px;">${summaryCounts.overdue}</div>
      <div style="font-size: 10px; color: #78716C;">Items Expired</div>
    </td>
    <td style="width: 2%;"></td>
    <td style="width: 32%; background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 8px;">
      <div style="font-size: 10px; font-weight: 800; color: #D97706; text-transform: uppercase;">Due Soon</div>
      <div style="font-size: 20px; font-weight: 900; color: #D97706; margin-top: 2px;">${summaryCounts.dueSoon}</div>
      <div style="font-size: 10px; color: #78716C;">&le; 30 Days</div>
    </td>
    <td style="width: 2%;"></td>
    <td style="width: 32%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 8px;">
      <div style="font-size: 10px; font-weight: 800; color: #1C1917; text-transform: uppercase;">Tracked</div>
      <div style="font-size: 20px; font-weight: 900; color: #1C1917; margin-top: 2px;">${summaryCounts.totalAssets}</div>
      <div style="font-size: 10px; color: #78716C;">Total Assets</div>
    </td>
  </tr>
</table>

<!-- Equipment Items Table -->
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
  <thead>
    <tr style="background-color: #1C1917; color: #FFFFFF;">
      <th style="padding: 10px 8px; font-size: 11px; text-align: left;">Building</th>
      <th style="padding: 10px 8px; font-size: 11px; text-align: left;">Floor / Zone</th>
      <th style="padding: 10px 8px; font-size: 11px; text-align: left;">Asset Tag</th>
      <th style="padding: 10px 8px; font-size: 11px; text-align: center;">Due Date</th>
      <th style="padding: 10px 8px; font-size: 11px; text-align: center;">Status</th>
    </tr>
  </thead>
  <tbody>
    ${tableRowsHtml || '<tr><td colspan="5" style="padding: 16px; text-align: center; color: #64748B; font-size: 12px;">No equipment due or overdue in selected scope.</td></tr>'}
  </tbody>
</table>

<!-- Plain CTA Line -->
<p style="margin: 16px 0 0 0; font-size: 13px; line-height: 1.5; color: #1C1917;">
  To schedule servicing, hydraulic pressure testing, or dispatch a technician, simply reply to this email or contact our service desk directly${sender.phone ? ` at <strong>${escapeHtml(sender.phone)}</strong>` : ''}.
</p>
  `.trim();

  const bodyText = `
Hello ${clientName},

Here is the latest fire safety compliance status and equipment service due schedule for your registered facilities.

${message ? `Note from Agency:\n${message}\n\n` : ''}
SUMMARY:
- Overdue: ${summaryCounts.overdue}
- Due Soon: ${summaryCounts.dueSoon}
- Assets Tracked: ${summaryCounts.totalAssets}

EQUIPMENT ITEMS:
${items.map((i) => `• [${i.status}] ${i.buildingName} | ${i.locationZone} | ${i.assetTag} (${i.assetType}) | Due: ${i.dueDate} (${i.dueNotice})`).join('\n')}

To schedule servicing, hydraulic testing, or dispatch a technician, please reply to this email or contact our service desk directly${sender.phone ? ` at ${sender.phone}` : ''}.
  `.trim();

  const { html, text } = renderEmailShell({
    heading: `Fire Safety Equipment Due & Overdue Digest: ${clientName}`,
    bodyHtml,
    bodyText,
    sender,
    previewText: `${summaryCounts.overdue} overdue, ${summaryCounts.dueSoon} due soon across ${clientName} facilities`,
  });

  const { attachments } = getBrandedEmailAttachments();

  const result = await sendEmail({
    from,
    to,
    cc: cc || undefined,
    replyTo: 'support@vigilamc.com',
    subject,
    text,
    html,
    attachments,
  });

  // Audit trail: Log to EmailLog
  try {
    if (db) {
      await (db as any).emailLog.create({
        data: {
          organizationId: organizationId || null,
          kind: 'OVERDUE_DIGEST',
          to: Array.isArray(to) ? to.join(', ') : to,
          cc: cc || null,
          subject: subject.slice(0, 120),
          refId: clientId || null,
          resendId: result.messageId || null,
          sentAt: new Date(),
          createdById: createdById || null,
        },
      });
    }
  } catch (err) {
    console.error('[EmailLog Audit Error]:', err);
  }

  return result;
}

/**
 * Send Magic Link / Portal Invitation Email
 */
export async function sendMagicLinkEmail(data: MagicLinkEmailData): Promise<EmailResult> {
  const agency = data.agencyName || 'Your Fire Safety AMC Agency';
  const minutes = data.expiresMinutes || 30;
  const recipientName = data.name || 'Valued Client';
  const subject = `Client Portal Sign-In Link — ${agency}`;

  const bodyHtml = `
<p style="margin: 0 0 14px 0;">Hello <strong>${escapeHtml(recipientName)}</strong>,</p>
<p style="margin: 0 0 20px 0; color: #44403C;">
  You have been invited to access the VigilAMC Client Portal for <strong>${escapeHtml(agency)}</strong>. Click the button below to inspect your building compliance records, view verified inspection reports, and download Form-B certificates:
</p>
<div style="text-align: center; margin: 28px 0;">
  <a href="${data.magicLink}" style="display: inline-block; background-color: #EA580C; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);">
    Sign In to Client Portal &rarr;
  </a>
</div>
<p style="font-size: 12px; line-height: 1.5; color: #78716C; margin-top: 24px;">
  Or copy and paste this link into your browser:<br>
  <a href="${data.magicLink}" style="color: #EA580C; word-break: break-all;">${data.magicLink}</a>
</p>
<p style="font-size: 11.5px; color: #78716C; margin-top: 16px;">
  ⏱️ This link is single-use and expires in <strong>${minutes} minutes</strong>. If you did not request access, please disregard this email.
</p>
  `.trim();

  const bodyText = `
Hello ${recipientName},

You have been invited to access the VigilAMC Client Portal for ${agency}.

Sign in using this secure link (valid for ${minutes} minutes):
${data.magicLink}

If you did not request this link, you can safely ignore this email.
  `.trim();

  const { html, text } = renderEmailShell({
    heading: `Sign In to ${agency} Portal`,
    bodyHtml,
    bodyText,
    sender: {
      name: 'VigilAMC Client Portal',
      role: 'Compliance & Access Service',
      agencyName: agency,
    },
    previewText: `Sign in link for ${agency} Client Portal`,
  });

  const { attachments } = getBrandedEmailAttachments();

  return sendEmail({
    from: `"${agency} via VigilAMC" <support@vigilamc.com>`,
    to: data.to,
    replyTo: 'support@vigilamc.com',
    subject,
    text,
    html,
    attachments,
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

  const { attachments } = getBrandedEmailAttachments();

  const res = await sendEmail({
    from: 'VigilAMC Alerts <alerts@vigilamc.com>',
    to: recipient,
    replyTo: 'support@vigilamc.com',
    subject,
    text: emailText,
    attachments,
  });

  if (res.success) return { success: true };

  // Generic webhook fallback if configured
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

  return { success: true, message: 'Notification logged.' };
}

export async function sendInvestorNotification(data: InvestorEmailData): Promise<{ success: boolean; message?: string }> {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || SITE_CONFIG.CONTACT_EMAIL;
  const subject = `New Investor Interest: ${data.fullName} (${data.investorType})`.slice(0, 60);

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

  const { attachments } = getBrandedEmailAttachments();

  const res = await sendEmail({
    from: 'VigilAMC Investor Relations <alerts@vigilamc.com>',
    to: recipient,
    replyTo: 'support@vigilamc.com',
    subject,
    text: emailText,
    attachments,
  });

  if (res.success) return { success: true };

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
