import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteLayout } from "@/components/SiteLayout";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  themeColor: "#023E8A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.SITE_URL),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VigilAMC",
  },
  title: "VigilAMC — Never Miss a Compliance Deadline Again | Fire Safety AMC Software India",
  description: "Serving fire safety AMC teams and fire protection agencies across India. Track annual maintenance contracts, log GPS-verified inspections with location details and photos, quote defect repairs, and generate client-ready Form-B reports in minutes.",
  keywords: [
    "Fire Safety AMC Software India",
    "Fire NOC Compliance India",
    "Fire Safety Compliance Software",
    "Fire Safety AMC Software",
    "Fire Protection Maintenance",
    "Form-B Certification",
    "GPS Fire Inspection Tracking",
    "Extinguisher Inspection Tracking",
    "Hydrant Inspection Software",
    "NBC 2016 Fire Compliance",
    "IS 2190 Maintenance",
    "VigilAMC"
  ],
  authors: [{ name: SITE_CONFIG.FOUNDER_NAME, url: SITE_CONFIG.SITE_URL }],
  creator: SITE_CONFIG.COMPANY_NAME,
  publisher: SITE_CONFIG.COMPANY_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/favicon.svg",
    apple: "/icon-192x192.png",
  },
  openGraph: {
    title: "VigilAMC — Never Miss a Compliance Deadline Again | Pan-India Fire Safety AMC Software",
    description: "Serving fire safety AMC teams and fire protection agencies across India. Track annual maintenance contracts, log GPS-verified inspections with location details and photos, quote defect repairs, and generate client-ready Form-B reports in minutes.",
    url: SITE_CONFIG.SITE_URL,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VigilAMC — Never Miss a Compliance Deadline Again | Pan-India Fire Safety AMC Software",
    description: "Serving fire safety AMC teams and fire protection agencies across India. Track annual maintenance contracts, log GPS-verified inspections with location details and photos, quote defect repairs, and generate client-ready Form-B reports in minutes.",
    creator: "@vigilamc",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-[#0077B6] selection:text-white">
        <SiteLayout>
          {children}
        </SiteLayout>
        <Toaster />
      </body>
    </html>
  );
}
