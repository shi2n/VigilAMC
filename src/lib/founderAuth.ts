const DEFAULT_FOUNDER_ADMIN_EMAILS = [
  'vigilamc@gmail.com',
  'shaizan@vigilamc.com',
  'shaizansiddiqui99@gmail.com',
];

export function getFounderAdminEmails(): string[] {
  const envEmails = process.env.FOUNDER_ADMIN_EMAILS;
  if (envEmails && envEmails.trim().length > 0) {
    return envEmails
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }
  return DEFAULT_FOUNDER_ADMIN_EMAILS;
}

export function isFounderOwner(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return getFounderAdminEmails().includes(normalized);
}
