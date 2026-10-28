import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { SiteLayout } from "@/components/SiteLayout";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Toaster } from "@/components/ui/sonner";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#C2410C",
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
  title: "VigilAMC - Fire Safety AMC & Compliance Software | India",
  description:
    "VigilAMC is the simple software that fire-safety service companies across India use to track every extinguisher, pump and alarm, record visits with live GPS, photos and client signatures, and send compliance-ready Form-B reports in minutes.",
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
    "VigilAMC",
  ],
  authors: [{ name: SITE_CONFIG.FOUNDER_NAME, url: SITE_CONFIG.SITE_URL }],
  creator: SITE_CONFIG.COMPANY_NAME,
  publisher: SITE_CONFIG.COMPANY_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/logo-tile-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/logo-tile-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/favicon-32.png",
    apple: "/brand/apple-touch-icon-180.png",
  },
  openGraph: {
    title: "VigilAMC - Fire Safety AMC & Compliance Software | India",
    description:
      "Never Miss a Fire Compliance Deadline Again. Track every extinguisher, pump and alarm with live GPS, photo proof, client signatures, and 1-tap compliance reports.",
    url: SITE_CONFIG.SITE_URL,
    siteName: SITE_CONFIG.COMPANY_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VigilAMC - Fire Safety AMC & Compliance Software | India",
    description:
      "Never Miss a Fire Compliance Deadline Again. Track every extinguisher, pump and alarm with live GPS, photo proof, client signatures, and 1-tap compliance reports.",
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
    <html lang="en" className={`${sora.variable} ${inter.variable} scroll-smooth`}>
      <body className="antialiased bg-white text-[#1C1917] min-h-screen flex flex-col font-sans selection:bg-[#EA580C] selection:text-white">
        <SiteLayout>{children}</SiteLayout>
        <Toaster />
      </body>
    </html>
  );
}
