'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export function FloatingWhatsApp() {
  return (
    <aside aria-label="Direct WhatsApp Contact" className="no-print">
      <a
        href={SITE_CONFIG.WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Shaizan on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BA5C] text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5 fill-current text-white stroke-none" />
        <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}

export default FloatingWhatsApp;
