'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Building2,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  Check,
  Wrench,
  Search,
  Filter,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Smartphone,
  Send,
  Camera,
  MapPin,
  Calendar,
  AlertCircle,
  Shield,
  Download,
  Mail,
  HelpCircle,
  Gauge
} from 'lucide-react';

// ============================================================
// STATIC FICTIONAL SEED DATA (ZERO live API calls, ZERO real client data)
// ============================================================
const DEMO_AGENCY = {
  name: 'Apex Shield Fire AMC (Demo Agency)',
  phone: '+91 98000 00000',
  email: 'demo@apexshield.in',
  city: 'New Delhi',
  licenseNo: 'DL/FIRE/2026/894',
  signatoryName: 'Capt. Rajesh Varma (Retd.)',
  signatoryDesignation: 'Lead Fire Auditor (IS 2190 / NBC 2016)',
};

const DEMO_CLIENTS = [
  {
    id: 'demo-c1',
    name: 'Horizon Heights Tech Park (Demo Client)',
    type: 'Commercial IT Park',
    siteCount: 3,
    assetCount: 48,
    compliancePercent: 94,
    expiring30dCount: 2,
    overdueCount: 1,
    statusOk: 45,
    lastInspection: '02 Nov 2026',
    address: 'Plot 14, Sector 62, Noida, NCR',
    contactPerson: 'Sunil Mehta (Facility Director)',
    activeWorkOrders: 1,
  },
  {
    id: 'demo-c2',
    name: 'Cyber Residency Welfare Association (Demo Client)',
    type: 'High-Rise Residential (G+24)',
    siteCount: 2,
    assetCount: 36,
    compliancePercent: 100,
    expiring30dCount: 0,
    overdueCount: 0,
    statusOk: 36,
    lastInspection: '28 Oct 2026',
    address: 'Golf Course Road, Gurugram, NCR',
    contactPerson: 'Col. P.K. Joshi (RWA Secretary)',
    activeWorkOrders: 0,
  },
  {
    id: 'demo-c3',
    name: 'Grand Central Commercial Plaza (Demo Client)',
    type: 'Retail & Multiplex Complex',
    siteCount: 4,
    assetCount: 64,
    compliancePercent: 88,
    expiring30dCount: 5,
    overdueCount: 3,
    statusOk: 56,
    lastInspection: '15 Oct 2026',
    address: 'Connaught Place Outer Circle, New Delhi',
    contactPerson: 'Ritu Sen (Operations Head)',
    activeWorkOrders: 2,
  },
];

const DEMO_RADAR_ITEMS = [
  {
    tag: 'EXT-04',
    type: 'CO₂ Gas 4.5kg',
    building: 'Horizon Heights Tech Park',
    location: 'Server Room Hub 2nd Floor',
    days: -4,
    status: 'OVERDUE',
    bracket: 30,
  },
  {
    tag: 'EXT-18',
    type: 'ABC Dry Powder 6kg',
    building: 'Horizon Heights Tech Park',
    location: 'Lift Lobby 5th Floor',
    days: 12,
    status: 'DUE_SOON',
    bracket: 30,
  },
  {
    tag: 'HYD-02',
    type: 'Landing Valve 63mm',
    building: 'Grand Central Commercial Plaza',
    location: 'North Staircase 3rd Floor',
    days: 28,
    status: 'DUE_SOON',
    bracket: 30,
  },
  {
    tag: 'EXT-29',
    type: 'Mechanical Foam 9L',
    building: 'Grand Central Commercial Plaza',
    location: 'DG Room Basement B2',
    days: 42,
    status: 'DUE_SOON',
    bracket: 60,
  },
  {
    tag: 'HR-06',
    type: 'Hose Reel Drum 30m',
    building: 'Cyber Residency Welfare Association',
    location: 'Tower B Podium Level',
    days: 56,
    status: 'DUE_SOON',
    bracket: 60,
  },
  {
    tag: 'EXT-44',
    type: 'Clean Agent 4kg',
    building: 'Horizon Heights Tech Park',
    location: 'Main UPS Room Basement 1',
    days: 74,
    status: 'DUE_SOON',
    bracket: 90,
  },
  {
    tag: 'ALM-08',
    type: 'Manual Call Point & Strobe',
    building: 'Grand Central Commercial Plaza',
    location: 'Food Court Exit Gate 3',
    days: 88,
    status: 'DUE_SOON',
    bracket: 90,
  },
];

const DEMO_VERIFY_RECORDS: Record<string, any> = {
  'EXT-01': {
    tag: 'EXT-01',
    type: 'ABC Dry Powder 6kg (Stored Pressure)',
    serial: 'SN-VIGIL-2024-9982',
    capacity: '6 KG',
    status: 'OPERATIONAL',
    building: 'Horizon Heights Tech Park',
    location: '2nd Floor Main Server Room Entrance',
    lastServiceDate: '06 Nov 2026',
    nextDueDate: '05 Nov 2027',
    hydroTestDue: 'October 2028',
    pressureReading: '14.2 Bar (Green Zone)',
    inspectedBy: 'Arun Kumar (Lead Tech - Badge #TECH-402)',
    agency: 'Apex Shield Fire AMC Services',
    complianceStandard: 'IS 2190:2024 / NBC 2016 Part 4',
  },
  'HYD-04': {
    tag: 'HYD-04',
    type: 'Single Head Hydrant Landing Valve 63mm',
    serial: 'SN-HYD-DEL-4410',
    capacity: '63mm Gunmetal',
    status: 'OPERATIONAL',
    building: 'Grand Central Commercial Plaza',
    location: 'East Wing Staircase Landings Level 2',
    lastServiceDate: '02 Nov 2026',
    nextDueDate: '01 May 2027',
    hydroTestDue: 'Annual Flow Tested (7 Bar)',
    pressureReading: 'Static 7.1 Bar / Flow Tested',
    inspectedBy: 'Vijay Singh (Badge #TECH-408)',
    agency: 'Apex Shield Fire AMC Services',
    complianceStandard: 'IS 3844 / IS 5290 / NBC 2016',
  },
  'CO2-02': {
    tag: 'CO2-02',
    type: 'Carbon Dioxide (CO₂) Gas Extinguisher 4.5kg',
    serial: 'SN-CO2-ND-1102',
    capacity: '4.5 KG High-Pressure Alloy',
    status: 'OPERATIONAL',
    building: 'Cyber Residency Welfare Association',
    location: 'Lift Machine Room Rooftop',
    lastServiceDate: '28 Oct 2026',
    nextDueDate: '27 Oct 2027',
    hydroTestDue: 'August 2029',
    pressureReading: 'Tare Weight OK (No gas loss)',
    inspectedBy: 'Arun Kumar (Lead Tech - Badge #TECH-402)',
    agency: 'Apex Shield Fire AMC (Reg. DL/FIRE/2026/894)',
    complianceStandard: 'IS 2878 / IS 2190',
  },
};

export default function DemoPage() {
  // Tour State: 6 guided steps (1-based index)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected building & Expiry Radar Filter
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('demo-c1');
  const [radarFilterDays, setRadarFilterDays] = useState<number>(30);

  // Step 2: Task Dispatch Simulation
  const [taskDispatched, setTaskDispatched] = useState<boolean>(false);

  // Step 3: Checklist items & photo stamp
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    gauge: true,
    seal: true,
    hose: true,
    bracket: false,
  });
  const [photoCaptured, setPhotoCaptured] = useState<boolean>(false);

  // Step 4: Report preview page
  const [reportPage, setReportPage] = useState<number>(1);

  // Step 5: Portal acknowledgement
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  // Step 6: Verify Tag Lookup
  const [verifyTagInput, setVerifyTagInput] = useState<string>('EXT-01');
  const [activeVerifyTag, setActiveVerifyTag] = useState<string>('EXT-01');

  // Helpers
  const selectedBuilding =
    DEMO_CLIENTS.find((c) => c.id === selectedBuildingId) || DEMO_CLIENTS[0];

  const filteredRadar = DEMO_RADAR_ITEMS.filter((item) => item.bracket <= radarFilterDays);

  const activeVerifyRecord = DEMO_VERIFY_RECORDS[activeVerifyTag] || DEMO_VERIFY_RECORDS['EXT-01'];

  const tourSteps = [
    { number: 1, title: 'Dashboard', sub: 'Portfolio & Expiry Radar' },
    { number: 2, title: 'Dispatch Task', sub: 'Technician Push Notification' },
    { number: 3, title: 'Field Checklist', sub: 'Interactive Check & GPS Photo' },
    { number: 4, title: 'Build Report', sub: '5-Page Form-B Audit' },
    { number: 5, title: 'Client Portal', sub: 'Transparent Receipts' },
    { number: 6, title: 'Public Verify', sub: 'Live Asset Lookup' },
  ];

  return (
    <div
      data-testid="demo-container"
      className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col selection:bg-orange-100 selection:text-orange-900"
    >
      {/* ============================================================ */}
      {/* HEADER BAR — VigilAMC Guided Tour Header */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE7F2] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand & Demo Pill */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-tile-192.png"
                alt="VigilAMC Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded-lg shadow-xs transition-transform group-hover:scale-105"
              />
              <span className="font-extrabold text-base sm:text-lg text-[#1C1917] tracking-tight">
                Vigil<span className="text-[#FF8C42]">AMC</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-pulse" />
              Demo Data · Interactive Tour
            </span>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#DCE7F2] bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-[#44403C] flex items-center gap-1 transition-colors"
              aria-label="Previous tour step"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="text-xs font-extrabold text-[#1C1917] px-2">
              Step {currentStep} of 6
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}
              disabled={currentStep === 6}
              className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center gap-1 shadow-xs transition-colors"
              aria-label="Next tour step"
            >
              <span className="hidden sm:inline">Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar & Dots */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-[#F0E4D8]/60 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[620px] gap-2 py-1">
            {tourSteps.map((step) => {
              const isActive = currentStep === step.number;
              const isPast = currentStep > step.number;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex-1 flex items-center gap-2 text-left p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#FFF0E6] border border-[#FED7AA] shadow-xs'
                      : 'hover:bg-white/80'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                      isActive
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-[11px] font-bold truncate leading-tight ${
                        isActive ? 'text-[#C2410C]' : 'text-[#1C1917]'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-[9px] text-[#57534E] truncate hidden md:block">
                      {step.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ============================================================ */}
        {/* STEP 1: DASHBOARD & EXPIRED RADAR */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <section className="space-y-6" data-testid="demo-step-1">
            {/* Step Introduction Card */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl bg-white/80 border border-[#DCE7F2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Step 1 · Interactive Operations Dashboard
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
                  Portfolio Audit &amp; Expiry Radar
                </h1>
                <p className="text-xs sm:text-sm text-[#44403C] mt-1 max-w-2xl leading-relaxed">
                  Real-time statutory readiness tracking across all AMC client sites. Click any building card to inspect site details, or toggle the expiry radar filter.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="shrink-0 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE7F2] shadow-xs">
                <div className="text-xs font-bold text-[#57534E] uppercase tracking-wider">
                  Assets Tracked
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] mt-1">
                  148
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Barcoded &amp; Mapped
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE7F2] shadow-xs">
                <div className="text-xs font-bold text-[#57534E] uppercase tracking-wider">
                  Overall Compliance
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                  94.2%
                </div>
                <div className="text-[11px] text-[#57534E] mt-1">IS 2190 &amp; Form-B Standard</div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE7F2] shadow-xs">
                <div className="text-xs font-bold text-[#57534E] uppercase tracking-wider">
                  Due in 30 Days
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#EA580C] mt-1">
                  7
                </div>
                <div className="text-[11px] text-[#C2410C] font-semibold mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Scheduled for service
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE7F2] shadow-xs">
                <div className="text-xs font-bold text-[#57534E] uppercase tracking-wider">
                  Overdue Equipment
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] mt-1">
                  4
                </div>
                <div className="text-[11px] text-[#B91C1C] font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Work order dispatched
                </div>
              </div>
            </div>

            {/* Split: Interactive Client Cards & Selected Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Buildings List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#EA580C]" />
                    AMC Managed Sites (Click to inspect)
                  </h2>
                  <span className="text-xs text-[#57534E]">3 Active Properties</span>
                </div>

                <div className="space-y-3">
                  {DEMO_CLIENTS.map((client) => {
                    const isSelected = client.id === selectedBuildingId;
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => setSelectedBuildingId(client.id)}
                        className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-md'
                            : 'bg-white/80 border-[#DCE7F2] hover:bg-white hover:border-stone-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-extrabold text-sm sm:text-base text-[#1C1917]">
                              {client.name}
                            </div>
                            <div className="text-xs text-[#57534E] mt-0.5">{client.type} · {client.address}</div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              client.compliancePercent >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {client.compliancePercent}% Compliant
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
                          <div>
                            <span className="text-[#57534E]">Assets:</span>{' '}
                            <strong className="text-[#1C1917]">{client.assetCount}</strong>
                          </div>
                          <div>
                            <span className="text-[#57534E]">Due &le;30d:</span>{' '}
                            <strong className="text-[#C2410C]">{client.expiring30dCount}</strong>
                          </div>
                          <div>
                            <span className="text-[#57534E]">Overdue:</span>{' '}
                            <strong className="text-[#DC2626]">{client.overdueCount}</strong>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Expiry Radar Filter Strip */}
                <div className="bg-white p-5 rounded-2xl border border-[#DCE7F2] space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#EA580C]" />
                      Statutory Expiry Radar (Live Filter)
                    </div>
                    {/* 30 / 60 / 90 Days Filter Chips */}
                    <div className="flex items-center gap-1.5 bg-[#FFF0E6] p-1 rounded-xl border border-[#FED7AA]">
                      {[30, 60, 90].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setRadarFilterDays(days)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            radarFilterDays === days
                              ? 'bg-white text-[#EA580C] shadow-xs'
                              : 'text-[#57534E] hover:text-[#1C1917]'
                          }`}
                        >
                          &le; {days} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {filteredRadar.map((item) => (
                      <div
                        key={item.tag}
                        className="py-2.5 flex items-center justify-between text-xs gap-3"
                      >
                        <div className="min-w-0">
                          <span className="font-extrabold text-[#1C1917] font-mono mr-2">
                            {item.tag}
                          </span>
                          <span className="text-[#57534E]">{item.type}</span>
                          <div className="text-[11px] text-stone-400 truncate">
                            {item.building} · {item.location}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.days < 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-[#C2410C]'
                          }`}
                        >
                          {item.days < 0 ? `${Math.abs(item.days)}d Overdue` : `Due in ${item.days}d`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Building Details Card */}
              <div className="space-y-4">
                <div className="text-sm font-extrabold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Site Compliance Profile
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DCE7F2] shadow-sm space-y-5">
                  <div>
                    <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">
                      Selected Property
                    </span>
                    <h3 className="text-lg font-extrabold text-[#1C1917] mt-0.5">
                      {selectedBuilding.name}
                    </h3>
                    <p className="text-xs text-[#57534E] mt-1">{selectedBuilding.address}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Contact Person:</span>
                      <strong className="text-[#1C1917]">{selectedBuilding.contactPerson}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Last Audit Date:</span>
                      <strong className="text-[#1C1917]">{selectedBuilding.lastInspection}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Active Work Orders:</span>
                      <strong className="text-[#EA580C]">{selectedBuilding.activeWorkOrders} in progress</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#57534E]">Form-B Certificate:</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        Active &amp; Valid
                      </span>
                    </div>
                  </div>

                  {/* Circular Compliance Ring Visual */}
                  <div className="p-4 bg-[#FFF8F2] rounded-xl border border-[#FED7AA]/50 flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-stone-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#EA580C]"
                          strokeDasharray={`${selectedBuilding.compliancePercent}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xs font-extrabold text-[#1C1917]">
                        {selectedBuilding.compliancePercent}%
                      </span>
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-[#1C1917]">Audit Readiness Score</div>
                      <div className="text-[11px] text-[#57534E] mt-0.5">
                        Statutory extinguisher &amp; hydrant testing verified under IS 2190 / NBC 2016.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Task Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 2: ASSIGN TASK (Technician Push Notification) */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <section className="space-y-6" data-testid="demo-step-2">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl bg-white/80 border border-[#DCE7F2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  Step 2 · Instant Field Dispatch
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
                  One-Click Technician Work Order
                </h1>
                <p className="text-xs sm:text-sm text-[#44403C] mt-1 max-w-2xl leading-relaxed">
                  Click &ldquo;Assign to technician&rdquo; to witness the real-time push notification deliver directly to the field technician&rsquo;s phone frame.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-2 border border-[#DCE7F2] bg-white text-xs font-bold rounded-xl text-[#44403C] hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Field Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Dispatch Panel */}
              <div className="bg-white p-6 rounded-2xl border border-[#DCE7F2] shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                    Work Order #WO-2026-8812
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    PENDING DISPATCH
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#1C1917]">
                    Quarterly Pressure &amp; Safety Audit
                  </h3>
                  <p className="text-xs text-[#57534E] mt-1">
                    Horizon Tower Alpha · Server Room Hub &amp; Electrical Risers (4 Extinguishers Due)
                  </p>
                </div>

                <div className="p-4 bg-[#FFF8F2] rounded-xl border border-[#FED7AA] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#57534E]">Client / Site:</span>
                    <strong className="text-[#1C1917]">Horizon Heights Tech Park</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#57534E]">Assigned Technician:</span>
                    <strong className="text-[#1C1917]">Arun Kumar (Lead Tech - Badge #TECH-402)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#57534E]">Scheduled Window:</span>
                    <strong className="text-[#1C1917]">Today, 10:00 AM – 1:00 PM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#57534E]">Target Assets:</span>
                    <strong className="text-[#EA580C]">EXT-01, EXT-04, EXT-18, HYD-02</strong>
                  </div>
                </div>

                {/* Primary Dispatch Action Button */}
                <button
                  type="button"
                  data-testid="assign-tech-btn"
                  onClick={() => setTaskDispatched(true)}
                  className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    taskDispatched
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white'
                  }`}
                >
                  {taskDispatched ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Dispatched to Arun Kumar! (Click to Re-send)</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Assign to technician</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#57534E] text-center">
                  Dispatches push payload with task checklist, equipment tags, and navigation pin.
                </p>
              </div>

              {/* Right Column: Phone Frame with Sliding Push Notification */}
              <div className="flex justify-center">
                <div className="w-[320px] sm:w-[340px] h-[580px] bg-[#1C1917] rounded-[42px] p-3 shadow-2xl border-4 border-stone-800 relative overflow-hidden flex flex-col">
                  {/* Phone Speaker Notch */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-stone-900 rounded-full z-30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-stone-800 mr-2" />
                    <div className="w-10 h-1 rounded-full bg-stone-800" />
                  </div>

                  {/* Phone Screen Inner Container */}
                  <div className="relative w-full h-full bg-[#FFF8F2] rounded-[32px] overflow-hidden flex flex-col pt-10 px-3.5 pb-4">
                    {/* Simulated Mobile Status Bar */}
                    <div className="flex justify-between items-center text-[11px] text-stone-600 font-bold px-1 mb-3">
                      <span>11:42 AM</span>
                      <span>5G 98%</span>
                    </div>

                    {/* Sliding Notification Banner */}
                    <div
                      data-testid="simulated-push-notification"
                      className={`transition-all duration-500 ease-out transform ${
                        taskDispatched
                          ? 'translate-y-0 opacity-100 scale-100'
                          : '-translate-y-24 opacity-0 scale-95 pointer-events-none'
                      }`}
                    >
                      <div
                        className="p-3.5 rounded-2xl shadow-xl text-white space-y-2 border border-white/20"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(28,25,23,0.96) 0%, rgba(194,65,12,0.92) 100%)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/brand/logo-tile-192.png"
                              alt="Logo"
                              className="w-5 h-5 rounded-md object-cover"
                            />
                            <span className="font-extrabold text-[11px] tracking-tight">
                              VigilAMC Field Dispatch
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-300">Just now</span>
                        </div>

                        <div className="text-xs font-bold leading-tight">
                          New AMC Inspection Task Assigned
                        </div>
                        <div className="text-[11px] text-stone-200 leading-snug">
                          Horizon Tower Alpha · 4 Extinguishers Due · High Priority (IS 2190 Compliance)
                        </div>

                        <div className="pt-1 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="w-full py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-[11px] rounded-lg text-center transition-colors shadow-xs"
                          >
                            Open Task in Field App &rarr;
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Phone Screen Mock Background (Field Technician Workspace) */}
                    <div className="flex-1 mt-4 p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#EA580C]">TODAY&rsquo;S RUN</span>
                          <span className="text-[10px] text-[#57534E]">Arun Kumar (#402)</span>
                        </div>
                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                          <div className="font-bold text-[#1C1917]">Horizon Tower Alpha</div>
                          <div className="text-[11px] text-[#57534E]">4 Assets · Target 1:00 PM</div>
                        </div>
                      </div>

                      <div className="text-center text-[11px] text-[#57534E] py-2">
                        {taskDispatched
                          ? '✓ Task received on field device'
                          : 'Waiting for agency dispatch...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 3: CHECKLIST + GPS STAMPED PHOTO */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <section className="space-y-6" data-testid="demo-step-3">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl bg-white/80 border border-[#DCE7F2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                  <Camera className="w-3.5 h-3.5" />
                  Step 3 · Field Inspection &amp; Photo Proof
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
                  Standardized Checklist &amp; GPS Burn-in Proof
                </h1>
                <p className="text-xs sm:text-sm text-[#44403C] mt-1 max-w-2xl leading-relaxed">
                  Tick the statutory checklist items below, then click &ldquo;Capture photo&rdquo; to simulate a real audit photo proof with embedded coordinates and timestamp.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-3.5 py-2 border border-[#DCE7F2] bg-white text-xs font-bold rounded-xl text-[#44403C] hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Build Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Interactive Field Checklist */}
              <div className="bg-white p-6 rounded-2xl border border-[#DCE7F2] shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                      Asset Tag: EXT-01
                    </span>
                    <h3 className="text-lg font-extrabold text-[#1C1917]">
                      ABC Dry Powder 6kg
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    IS 2190 Checklist
                  </span>
                </div>

                {/* 4 Interactive Checklist Rows */}
                <div className="space-y-2.5">
                  {[
                    { key: 'gauge', title: 'Pressure Gauge in Green Zone (14.2 Bar verified)', note: 'Pointer in safe operating range' },
                    { key: 'seal', title: 'Safety Pin & Tamper Seal Intact', note: 'Lead seal unbroken' },
                    { key: 'hose', title: 'Discharge Hose Free of Cracks & Blockages', note: 'Flexibility test passed' },
                    { key: 'bracket', title: 'Mounting Bracket Secure & Unobstructed', note: 'Wall anchor solid' },
                  ].map((row) => (
                    <label
                      key={row.key}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        checklist[row.key]
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                          : 'bg-stone-50 border-stone-200 text-[#44403C] hover:bg-stone-100/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checklist[row.key]}
                        onChange={(e) =>
                          setChecklist((prev) => ({ ...prev, [row.key]: e.target.checked }))
                        }
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                      />
                      <div className="text-xs flex-1">
                        <div className="font-bold">{row.title}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{row.note}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Capture Photo Button */}
                <button
                  type="button"
                  data-testid="capture-photo-btn"
                  onClick={() => setPhotoCaptured(true)}
                  className="w-full min-h-[46px] py-2.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{photoCaptured ? 'Re-take Photo Proof' : 'Capture photo proof'}</span>
                </button>
              </div>

              {/* Right Column: GPS Stamped Photo Proof Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#DCE7F2] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#EA580C]" />
                    GPS-Stamped Photo Record
                  </span>
                  <span className="text-xs text-[#57534E]">Anti-Fraud Verification</span>
                </div>

                {photoCaptured ? (
                  <div
                    data-testid="stamped-photo-card"
                    className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md aspect-4/3 bg-stone-900 group"
                  >
                    {/* Simulated inspection photo */}
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/guide-fire-noc-india.jpg"
                        alt="Inspected Fire Extinguisher Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Stamped GPS Burn-In Bar (Anti-Tamper Record) */}
                    <div
                      className="absolute bottom-0 inset-x-0 p-3 text-white space-y-1 select-none backdrop-blur-md"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(28,25,23,0.92) 25%, rgba(0,0,0,0.98) 100%)',
                      }}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-tight text-amber-300">
                        <span>LAT: 28.5355° N | LON: 77.3910° E</span>
                        <span>ACC: ±2.4m</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-200">
                        <span>06 Nov 2026 · 11:43:08 IST</span>
                        <span>TAG: EXT-01 (Stored Pressure)</span>
                      </div>
                      <div className="text-[10px] text-stone-300 truncate">
                        Tech: Arun Kumar (#TECH-402) · Site: Horizon Tower Alpha 2F
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      VERIFIED PASS
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-stone-300 p-12 text-center space-y-3 bg-[#FFF8F2]">
                    <Camera className="w-10 h-10 text-stone-400 mx-auto" />
                    <div className="text-sm font-bold text-[#1C1917]">No Photo Captured Yet</div>
                    <p className="text-xs text-[#57534E] max-w-xs mx-auto">
                      Click the &ldquo;Capture photo proof&rdquo; button on the left to simulate real-time camera capture with GPS burn-in.
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-[#57534E] leading-relaxed">
                  ✓ Anti-tamper proof complies with legal audit standards. Geo-coordinates cannot be mocked or faked from gallery uploads.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 4: BUILD REPORT (5-Page Form-B Audit) */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <section className="space-y-6" data-testid="demo-step-4">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl bg-white/80 border border-[#DCE7F2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  Step 4 · Statutory Form-B Audit
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
                  Instant Statutory Audit Generation
                </h1>
                <p className="text-xs sm:text-sm text-[#44403C] mt-1 max-w-2xl leading-relaxed">
                  Click &ldquo;Build Report&rdquo; to compile field inspections into a multi-page statutory report complete with summary strips, ledger, findings, and evidence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-3.5 py-2 border border-[#DCE7F2] bg-white text-xs font-bold rounded-xl text-[#44403C] hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Client Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Report Pagination & Page Navigation */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE7F2] shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#EA580C]" />
                  <div>
                    <h3 className="font-extrabold text-base text-[#1C1917]">
                      Form-B Half-Yearly Fire Audit Report
                    </h3>
                    <div className="text-xs text-[#57534E]">
                      Ref: FORM-B-2026-H2 · Horizon Heights Tech Park
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setReportPage((p) => Math.max(1, p - 1))}
                    disabled={reportPage === 1}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold disabled:opacity-40 hover:bg-stone-50"
                  >
                    &larr; Prev Page
                  </button>
                  <span className="text-xs font-bold text-[#1C1917] px-2">
                    Page {reportPage} of 5
                  </span>
                  <button
                    type="button"
                    onClick={() => setReportPage((p) => Math.min(5, p + 1))}
                    disabled={reportPage === 5}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold disabled:opacity-40 hover:bg-stone-50"
                  >
                    Next Page &rarr;
                  </button>
                  <Link
                    href="/sample-report"
                    target="_blank"
                    className="min-h-[36px] px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs ml-2"
                  >
                    <span>Full View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* REPORT PREVIEW CONTAINER */}
              <div
                data-testid="report-preview-container"
                className="bg-[#FFFDFB] p-6 sm:p-8 rounded-xl border border-stone-300 shadow-inner min-h-[420px]"
              >
                {/* PAGE 1: Cover Page with Required Summary Strip */}
                {reportPage === 1 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                      <div>
                        <div className="text-xs font-extrabold text-[#C2410C] uppercase tracking-wider">
                          Statutory Form-B Compliance Certificate
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#1C1917] mt-1">
                          Horizon Heights Tech Park
                        </h2>
                        <div className="text-xs text-[#57534E]">
                          Sector 62, Noida, Uttar Pradesh · Commercial B-1 Occupancy
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-bold text-[#1C1917]">Apex Shield Fire AMC</div>
                        <div className="text-stone-500">License: DL/FIRE/2026/894</div>
                      </div>
                    </div>

                    {/* MANDATORY DELIVERABLE: Cover page with summary strip: 7 assets / 71% / 1 overdue / 3 findings */}
                    <div
                      data-testid="report-summary-strip"
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-[#FED7AA] bg-[#FFF0E6]"
                    >
                      <div>
                        <div className="text-[11px] font-bold text-[#57534E] uppercase">Assets Audited</div>
                        <div className="text-2xl font-extrabold text-[#1C1917] mt-0.5">7 Assets</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#57534E] uppercase">Pass Rate</div>
                        <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">71%</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#57534E] uppercase">Overdue</div>
                        <div className="text-2xl font-extrabold text-[#DC2626] mt-0.5">1 Overdue</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#57534E] uppercase">Defect Findings</div>
                        <div className="text-2xl font-extrabold text-[#EA580C] mt-0.5">3 Findings</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#44403C] leading-relaxed pt-2">
                      <p>
                        This inspection report records that portable fire extinguishers, hydrant landing valves, and rising mains have been inspected with reference to <strong>IS 2190:2024</strong> and <strong>National Building Code (NBC) 2016 Part 4</strong>.
                      </p>
                      <p>
                        Inspection recorded by field technician: <strong>Rajesh Varma</strong>. Digital record secured with timestamped GPS evidence.
                      </p>
                    </div>

                    <div className="pt-4 flex justify-between items-end border-t border-stone-200 text-xs">
                      <div>
                        <div className="text-stone-400">Audit Date:</div>
                        <div className="font-bold text-[#1C1917]">06 November 2026</div>
                      </div>
                      <div className="text-right">
                        <div className="text-stone-400">Digital Seal:</div>
                        <div className="font-bold text-emerald-700">✓ Cryptographically Signed</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 2: Executive Summary & Standards */}
                {reportPage === 2 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-extrabold text-[#1C1917]">
                      Page 2 · Regulatory Scope &amp; Reference Standards
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <strong className="text-[#1C1917]">IS 2190:2024 (Fifth Revision):</strong>
                        <p className="text-stone-600 mt-1">
                          Quarterly physical inspections, monthly visual inspections, and hydraulic pressure testing schedules for portable and mobile fire extinguishers.
                        </p>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <strong className="text-[#1C1917]">NBC 2016 Part 4 Mandate:</strong>
                        <p className="text-stone-600 mt-1">
                          Fire protection risers, hose reel pressure limits (minimum 3.5 bar at highest outlet), and clear access pathways confirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 3: Asset Inventory & Inspection Ledger */}
                {reportPage === 3 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-extrabold text-[#1C1917]">
                      Page 3 · Asset Inspection Ledger
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-stone-200 text-[#57534E]">
                            <th className="py-2">Tag</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Location</th>
                            <th className="py-2">Pressure</th>
                            <th className="py-2">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          <tr>
                            <td className="py-2 font-mono font-bold">EXT-01</td>
                            <td>ABC Dry Powder 6kg</td>
                            <td>2F Server Room</td>
                            <td>14.2 Bar</td>
                            <td className="text-emerald-700 font-bold">PASS</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-mono font-bold">EXT-04</td>
                            <td>CO₂ Gas 4.5kg</td>
                            <td>Electrical Riser</td>
                            <td>Gross 12.8kg</td>
                            <td className="text-red-700 font-bold">OVERDUE</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-mono font-bold">HYD-02</td>
                            <td>Landing Valve 63mm</td>
                            <td>North Staircase</td>
                            <td>7.0 Bar</td>
                            <td className="text-emerald-700 font-bold">PASS</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PAGE 4: Defect Findings & Corrective Action */}
                {reportPage === 4 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-extrabold text-[#1C1917]">
                      Page 4 · Defect Findings &amp; Workshop Log
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <strong className="text-red-800">Finding #1 (EXT-04):</strong> CO₂ weight loss exceeded 10% statutory allowance. Unit removed for authorized factory refill.
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <strong className="text-amber-800">Finding #2 (HR-02):</strong> Missing brass nozzle safety chain. Replacement installed on-site.
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <strong className="text-amber-800">Finding #3 (EXT-18):</strong> Mounting bracket loose on gypsum partition. Remounted with heavy-duty toggle anchors.
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 5: GPS Stamped Photographic Evidence */}
                {reportPage === 5 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-extrabold text-[#1C1917]">
                      Page 5 · Photographic Proof Sheet
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2 border border-stone-200 rounded-xl bg-stone-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/guide-fire-noc-india.jpg"
                          alt="Evidence 1"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="mt-1 font-mono text-[10px] text-stone-600">
                          EXT-01: 28.5355°N 77.3910°E
                        </div>
                      </div>
                      <div className="p-2 border border-stone-200 rounded-xl bg-stone-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/scene-pump.jpg"
                          alt="Evidence 2"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="mt-1 font-mono text-[10px] text-stone-600">
                          HYD-02: 28.5358°N 77.3915°E
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 5: CLIENT PORTAL (Receipt Acknowledgement) */}
        {/* ============================================================ */}
        {currentStep === 5 && (
          <section className="space-y-6" data-testid="demo-step-5">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl bg-white/80 border border-[#DCE7F2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Step 5 · Client Transparency &amp; Receipts
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
                  Transparent Client Access &amp; Delivery Proof
                </h1>
                <p className="text-xs sm:text-sm text-[#44403C] mt-1 max-w-2xl leading-relaxed">
                  Building owners and RWA presidents receive secure, passwordless magic links to review Form-B audits and acknowledge receipts. Click &ldquo;Acknowledge receipt&rdquo; to test it!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-3.5 py-2 border border-[#DCE7F2] bg-white text-xs font-bold rounded-xl text-[#44403C] hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Next: Public Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Client Portal Interface */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE7F2] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                    Client Portal View
                  </span>
                  <h3 className="text-lg font-extrabold text-[#1C1917] mt-2">
                    Horizon Heights Tech Park (Property Management Portal)
                  </h3>
                  <div className="text-xs text-[#57534E]">
                    Signed in as: Sunil Mehta (Facility Director) · demo client
                  </div>
                </div>

                <div className="text-xs font-bold text-stone-500">
                  Delivered via VigilAMC Secure Sync
                </div>
              </div>

              {/* Report Delivery Card */}
              <div className="p-5 bg-[#FFF8F2] rounded-2xl border border-[#FED7AA] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#EA580C]" />
                    <span className="font-extrabold text-sm text-[#1C1917]">
                      Form-B Half-Yearly Statutory Compliance Audit (Ref: FORM-B-2026-H2)
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E]">
                    Submitted by Apex Shield Fire AMC on 06 Nov 2026 · 7 Assets · 71% Pass Rate
                  </p>
                </div>

                {/* MANDATORY DELIVERABLE: "Acknowledge receipt" button flips to "Acknowledged ✓ · demo client · date" */}
                <div>
                  {acknowledged ? (
                    <div
                      data-testid="acknowledged-badge"
                      className="px-4 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Acknowledged ✓ · Sunil Mehta (Demo Client) · 06 Nov 2026</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      data-testid="acknowledge-receipt-btn"
                      onClick={() => setAcknowledged(true)}
                      className="min-h-[44px] px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge receipt</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl text-xs text-[#57534E] leading-relaxed">
                <strong>Statutory Proof of Delivery:</strong> When a client acknowledges receipt, VigilAMC records the exact timestamp, IP address, and identity. This eliminates disputes over whether compliance reports were received on time.
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* STEP 6: VERIFY (Public Equipment Verification) */}
        {/* ============================================================ */}
        {currentStep === 6 && (
          <section className="space-y-6" data-testid="demo-step-6">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl bg-white/80 border border-[#DCE7F2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Step 6 · Public Asset Verification
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
                  Instant Public Asset Compliance Check
                </h1>
                <p className="text-xs sm:text-sm text-[#44403C] mt-1 max-w-2xl leading-relaxed">
                  Every asset tag can be verified publicly by tenants, building occupants, or visiting fire marshals. Type or click any sample tag below.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-3.5 py-2 border border-[#DCE7F2] bg-white text-xs font-bold rounded-xl text-[#44403C] hover:bg-stone-50"
                >
                  Back
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Start Free Testing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Verification Lookup & Result Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Tag Selector & Input */}
              <div className="bg-white p-6 rounded-2xl border border-[#DCE7F2] shadow-sm space-y-4">
                <div>
                  <label htmlFor="verify-tag" className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5">
                    Enter Asset Tag ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="verify-tag"
                      type="text"
                      value={verifyTagInput}
                      onChange={(e) => setVerifyTagInput(e.target.value)}
                      placeholder="e.g. EXT-01"
                      className="flex-1 min-h-[44px] px-3.5 py-2 text-sm font-mono font-bold text-[#1C1917] bg-[#FFF8F2] border border-[#DCE7F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    />
                    <button
                      type="button"
                      data-testid="verify-lookup-btn"
                      onClick={() => {
                        const clean = verifyTagInput.trim().toUpperCase();
                        if (DEMO_VERIFY_RECORDS[clean]) {
                          setActiveVerifyTag(clean);
                        } else {
                          setActiveVerifyTag('EXT-01');
                        }
                      }}
                      className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-bold rounded-xl"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <div className="text-xs font-bold text-[#57534E] mb-2">Or click sample tag:</div>
                  <div className="flex flex-wrap gap-2">
                    {['EXT-01', 'HYD-04', 'CO2-02'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setVerifyTagInput(tag);
                          setActiveVerifyTag(tag);
                        }}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all ${
                          activeVerifyTag === tag
                            ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-[#44403C] hover:bg-stone-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-[#57534E] leading-relaxed pt-2">
                  In production, any phone camera scanning the physical tag label opens this exact verify certificate at <code className="bg-stone-100 px-1 py-0.5 rounded">/verify/[tag]</code>.
                </div>
              </div>

              {/* Right Column: High-Fidelity Verification Certificate Card */}
              <div className="lg:col-span-2">
                <div
                  data-testid="demo-verification-card"
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE7F2] shadow-md space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                          Statutory Verification Passed
                        </div>
                        <h2 className="text-xl font-extrabold text-[#1C1917] font-mono">
                          {activeVerifyRecord.tag}
                        </h2>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-300">
                      OPERATIONAL · READY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-stone-400">Equipment Type:</div>
                      <div className="font-extrabold text-[#1C1917] mt-0.5">{activeVerifyRecord.type}</div>
                    </div>
                    <div>
                      <div className="text-stone-400">Location:</div>
                      <div className="font-bold text-[#1C1917] mt-0.5">{activeVerifyRecord.location}</div>
                    </div>
                    <div>
                      <div className="text-stone-400">Facility / Building:</div>
                      <div className="font-bold text-[#1C1917] mt-0.5">{activeVerifyRecord.building}</div>
                    </div>
                    <div>
                      <div className="text-stone-400">Pressure / Gauge Reading:</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{activeVerifyRecord.pressureReading}</div>
                    </div>
                    <div>
                      <div className="text-stone-400">Last Serviced:</div>
                      <div className="font-bold text-[#1C1917] mt-0.5">{activeVerifyRecord.lastServiceDate}</div>
                    </div>
                    <div>
                      <div className="text-stone-400">Next Service Due:</div>
                      <div className="font-bold text-[#EA580C] mt-0.5">{activeVerifyRecord.nextDueDate}</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FFF8F2] rounded-xl border border-[#FED7AA] text-xs text-[#57534E] space-y-1">
                    <div>
                      <strong>Authorized AMC Agency:</strong> {activeVerifyRecord.agency}
                    </div>
                    <div>
                      <strong>Compliance Standard:</strong> {activeVerifyRecord.complianceStandard}
                    </div>
                    <div>
                      <strong>Inspecting Technician:</strong> {activeVerifyRecord.inspectedBy}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Step Summary Card */}
            <div className="p-6 sm:p-8 bg-linear-to-r from-[#1C1917] to-stone-900 rounded-3xl text-white space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FF8C42] border border-white/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Tour Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to automate your agency&rsquo;s AMC operations?
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                VigilAMC replaces lost clipboards and disputed bills with GPS-verified proof, Form-B statutory reports, and automated client receipts.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm rounded-full shadow-lg transition-colors"
                >
                  Start free 30-day pilot
                </Link>
                <a
                  href="mailto:vigilamc@gmail.com?subject=VigilAMC%20Live%20Demo%20Request"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-full border border-white/20 transition-colors"
                >
                  Book a live demo
                </a>
                <Link
                  href="/sample-report"
                  className="px-5 py-3 bg-white/5 hover:bg-white/15 text-stone-200 font-bold text-sm rounded-full transition-colors"
                >
                  See sample report &rarr;
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ============================================================ */}
      {/* STICKY BOTTOM CTA BAR */}
      {/* ============================================================ */}
      <aside aria-label="Quick Actions" className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DCE7F2] p-3 sm:p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#57534E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#1C1917]">VigilAMC Testing Program:</span>
            <span>Free full access during active testing period</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Link
              href="/sample-report"
              className="hidden md:inline-flex px-3.5 py-2 text-xs font-bold text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              See sample report
            </Link>
            <a
              href="mailto:vigilamc@gmail.com?subject=VigilAMC%20Live%20Demo%20Request"
              className="px-3.5 py-2 rounded-xl border border-[#DCE7F2] bg-white text-xs font-bold text-[#1C1917] hover:bg-stone-50 transition-colors"
            >
              Book a live demo
            </a>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Start free 30-day pilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
