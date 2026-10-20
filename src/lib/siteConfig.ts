/**
 * Centralized VigilAMC Brand, Contact, and URL Configuration
 * Single source of truth for domains, phone numbers, emails, and direct WhatsApp links.
 */

export const SITE_CONFIG = {
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://vigilamc.com',
  CONTACT_EMAIL: 'shaizan@vigilamc.com',
  SUPPORT_EMAIL: 'support@vigilamc.com',
  FOUNDER_NAME: 'Shaizan',
  FOUNDER_TITLE: 'Founder, VigilAMC',
  FOUNDER_CITY: 'New Delhi, India',
  PHONE_DISPLAY: '+91 83838 90483',
  PHONE_TEL: 'tel:+918383890483',
  WHATSAPP_NUMBER: '918383890483',
  WHATSAPP_URL:
    'https://wa.me/918383890483?text=Hi%20Shaizan%2C%20I%20run%20a%20Fire%20Safety%20AMC%20agency%20and%20want%20to%20see%20a%20quick%20demo%20of%20VigilAMC.',
  COMPANY_NAME: 'VigilAMC',
  LEGAL_NAME: 'VigilAMC Technologies',
  ADDRESS_DISPLAY: 'New Delhi 110092, India',
  LICENSE_DEMO: 'DL/FIRE/LIC/2026/042',
  SOCIAL: {
    LINKEDIN: 'https://www.linkedin.com/company/vigilamc/',
    INSTAGRAM: 'https://www.instagram.com/vigilamc',
    TWITTER: 'https://x.com/vigilamc',
    YOUTUBE: 'https://www.youtube.com/@vigilamc',
  },
} as const;

export default SITE_CONFIG;
