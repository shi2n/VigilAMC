import type { Metadata } from "next";
import "./globals.css";
import { SiteLayout } from "@/components/SiteLayout";

export const metadata: Metadata = {
  title: "VigilAMC — Never Miss a Compliance Deadline Again | Fire Safety AMC Autopilot",
  description: "VigilAMC puts every fire extinguisher, hydrant, alarm panel, due date, and client Form-B compliance report on autopilot. Zero missed audits. Guaranteed compliance.",
  keywords: [
    "Fire Safety AMC",
    "Fire NOC Compliance",
    "Form-B Certification",
    "Extinguisher QR Tracking",
    "Hydrant Inspection Software",
    "NFPA Compliance Tracker",
    "VigilAMC"
  ],
  authors: [{ name: "VigilAMC Technologies" }],
  openGraph: {
    title: "VigilAMC — Never Miss a Compliance Deadline Again",
    description: "Enterprise fire safety equipment tracking, automated inspection scheduling, and 1-click Form-B NOC filing.",
    type: "website",
  }
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
