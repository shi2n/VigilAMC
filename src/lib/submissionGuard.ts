/**
 * submissionGuard.ts
 * Prevents rapid double/triple submissions across forms in VigilAMC.
 * In-flight lock + 3-second payload deduplication window.
 */

const recentSubmissions = new Map<string, number>();

/**
 * Checks whether an action with a given key or payload signature was already
 * submitted recently (within windowMs, default 3000ms).
 * Returns true if this is a duplicate submission that should be ignored.
 */
export function isDuplicateSubmission(actionKey: string, windowMs = 3000): boolean {
  const now = Date.now();
  const lastTime = recentSubmissions.get(actionKey);

  if (lastTime && now - lastTime < windowMs) {
    return true;
  }

  recentSubmissions.set(actionKey, now);

  // Auto clean-up after 10 seconds to keep memory lean
  setTimeout(() => {
    if (recentSubmissions.get(actionKey) === now) {
      recentSubmissions.delete(actionKey);
    }
  }, 10000);

  return false;
}

/**
 * Clears an action key (e.g. if the request failed and user should be allowed to retry immediately).
 */
export function clearSubmissionLock(actionKey: string): void {
  recentSubmissions.delete(actionKey);
}
