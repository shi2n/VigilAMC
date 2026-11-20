/**
 * Clean messaging event hook for Part 3 (sound / native notifications).
 * Part 2 calls onMessageReceived() whenever a live incoming message arrives.
 * Part 3 wires audio/notification listeners via registerMessageReceivedListener().
 */

export interface IncomingMessageHookEvent {
  surface: 'DASHBOARD' | 'TECHNICIAN';
  messageId: string;
  technicianId: string;
  senderRole: 'AGENCY' | 'TECHNICIAN';
  senderName?: string;
  preview: string;
  hasImage: boolean;
  createdAt: string;
}

export type MessageReceivedListener = (event: IncomingMessageHookEvent) => void;

const listeners = new Set<MessageReceivedListener>();

export function registerMessageReceivedListener(listener: MessageReceivedListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function unregisterMessageReceivedListener(listener: MessageReceivedListener): void {
  listeners.delete(listener);
}

/**
 * Single exported hook invoked on incoming live messages across both surfaces.
 * Part 3 attaches sound / alert handlers without modifying chat components.
 */
export function onMessageReceived(event: IncomingMessageHookEvent): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.warn('[messagingHooks] Listener error:', err);
    }
  });

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('vigil:message-received', { detail: event }));
    } catch {
      // Ignore CustomEvent dispatch failures
    }
  }
}
