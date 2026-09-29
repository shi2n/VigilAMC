import type { Metadata } from "next";
import "./globals.css";
import { SiteLayout } from "@/components/SiteLayout";

export const metadata: Metadata = {
  metadataBase: new URL("https://vigilamc.vercel.app"),
  title: "VigilAMC — Never Miss a Compliance Deadline Again | Fire Safety AMC Software",
  description: "VigilAMC helps fire protection agencies track annual maintenance contracts, log inspections with QR codes, and generate client-ready Form-B reports in minutes.",
  keywords: [
    "Fire Safety AMC Software",
    "Fire Protection Maintenance",
    "Form-B Certification",
    "Extinguisher QR Tracking",
    "Hydrant Inspection Software",
    "NBC 2016 Fire Compliance",
    "IS 2190 Maintenance",
    "Maharashtra Fire Prevention Act",
    "VigilAMC"
  ],
  authors: [{ name: "Shaizan", url: "https://vigilamc.vercel.app" }],
  creator: "VigilAMC",
  publisher: "VigilAMC",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VigilAMC — Never Miss a Compliance Deadline Again",
    description: "VigilAMC helps fire protection agencies track annual maintenance contracts, log inspections with QR codes, and generate client-ready Form-B reports in minutes.",
    url: "https://vigilamc.vercel.app",
    siteName: "VigilAMC",
    images: [
      {
        url: "/brag.jpg",
        width: 1200,
        height: 630,
        alt: "VigilAMC Fire Safety AMC Operations Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VigilAMC — Never Miss a Compliance Deadline Again",
    description: "VigilAMC helps fire protection agencies track annual maintenance contracts, log inspections with QR codes, and generate client-ready Form-B reports in minutes.",
    creator: "@vigilamc",
    images: ["/brag.jpg"],
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
      </body>
    </html>
  );
}
