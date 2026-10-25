'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import EmberLine from '@/components/home/EmberLine';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileCheck2,
  Download,
  AlertCircle,
  Building2,
  Camera,
  MapPin,
  Clock,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Check,
  Gauge
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/siteConfig';

export default function SampleReportPage() {
  const [downloading, setDownloading] = useState(false);
  const [reportFormat, setReportFormat] = useState<'maharashtra' | 'nbc'>('maharashtra');

  const handlePrint = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 150);
  };

  const sampleEquipments = [
    {
      id: 'eq-1',
      assetTag: 'VIGIL-DP-0101',
      type: 'ABC Dry Powder',
      capacity: '6 KG (Stored Pressure)',
      location: 'Ground Floor Reception Lobby',
      gps: '28.4595° N, 77.0266° E',
      time: '15 Jan 2026, 10:15 AM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jan 2027',
      hydroDueDate: 'Nov 2028',
      result: 'PASS',
      pressureBar: '14.2 Bar (Green Zone)',
      defectNote: null,
    },
    {
      id: 'eq-2',
      assetTag: 'VIGIL-CO-0102',
      type: 'Carbon Dioxide (CO2)',
      capacity: '4.5 KG High-Pressure',
      location: 'Ground Floor Server & UPS Room',
      gps: '28.4594° N, 77.0268° E',
      time: '15 Jan 2026, 10:28 AM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: 'IMMEDIATE',
      hydroDueDate: 'Dec 2027',
      result: 'DEFECT',
      pressureBar: 'Tare 10.20kg / Full Gross 14.70kg / Measured Gross 14.00kg',
      defectNote: 'Net Gas: 3.80kg vs 4.50kg • Loss: -0.70kg / -15.5% > 10% IS 2190 threshold — Immediate Refill Required',
    },
    {
      id: 'eq-3',
      assetTag: 'VIGIL-HY-0103',
      type: 'Single Landing Valve Hydrant',
      capacity: '63mm Gunmetal IS 5290',
      location: '1st Floor North Staircase Riser',
      gps: '28.4596° N, 77.0265° E',
      time: '15 Jan 2026, 10:45 AM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: 'IMMEDIATE',
      hydroDueDate: 'Annually Tested',
      result: 'DEFECT',
      pressureBar: 'Static 7.0 Bar / Leak @ 5.2 Bar',
      defectNote: 'Gland rubber flange washer leaking under pressure. Immediate washer replacement required.',
    },
    {
      id: 'eq-4',
      assetTag: 'VIGIL-HR-0104',
      type: 'First-Aid Hose Reel Drum',
      capacity: '30m x 20mm Braided Hose',
      location: '1st Floor Passenger Lift Corridor',
      gps: '28.4595° N, 77.0267° E',
      time: '15 Jan 2026, 10:52 AM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jul 2026',
      hydroDueDate: 'Operational',
      result: 'PASS',
      pressureBar: 'Jet Flow & Shut-Off Verified',
      defectNote: null,
    },
    {
      id: 'eq-5',
      assetTag: 'VIGIL-DP-0105',
      type: 'ABC Dry Powder',
      capacity: '6 KG (Stored Pressure)',
      location: '2nd Floor Open Office Workstations',
      gps: '28.4597° N, 77.0266° E',
      time: '15 Jan 2026, 11:05 AM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jan 2027',
      hydroDueDate: 'Nov 2028',
      result: 'PASS',
      pressureBar: '14.0 Bar (Green Zone)',
      defectNote: null,
    },
    {
      id: 'eq-6',
      assetTag: 'VIGIL-WM-0106',
      type: 'Water Mist / Clean Agent',
      capacity: '9 Litre Stainless Steel',
      location: '2nd Floor Executive Boardroom',
      gps: '28.4596° N, 77.0268° E',
      time: '15 Jan 2026, 11:18 AM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jan 2027',
      hydroDueDate: 'Oct 2029',
      result: 'PASS',
      pressureBar: '13.8 Bar Normal',
      defectNote: null,
    },
    {
      id: 'eq-7',
      assetTag: 'VIGIL-CA-0107',
      type: 'Clean Agent FE-36',
      capacity: '4 KG Ceiling/Wall Mounted',
      location: '3rd Floor Core Network Switch Room',
      gps: '28.4598° N, 77.0265° E',
      time: '15 Jan 2026, 11:30 AM',
      lastServiceDate: '12 Feb 2025',
      nextDueDate: '12 Feb 2026 (<30d)',
      hydroDueDate: 'Feb 2028',
      result: 'DUE_SOON',
      pressureBar: '13.5 Bar (Refill Due Soon)',
      defectNote: 'Annual statutory refilling deadline within 28 days. Scheduled for upcoming batch refill.',
    },
    {
      id: 'eq-8',
      assetTag: 'VIGIL-AP-0108',
      type: 'Addressable Fire Alarm Panel',
      capacity: '4 Loop / 508 Address Points',
      location: 'Ground Security Control Command Desk',
      gps: '28.4594° N, 77.0264° E',
      time: '15 Jan 2026, 11:45 AM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Apr 2026',
      hydroDueDate: 'Quarterly Loop Test',
      result: 'PASS',
      pressureBar: 'Loop 1-4 Normal • Float 27.2V',
      defectNote: null,
    },
    {
      id: 'eq-9',
      assetTag: 'VIGIL-PM-0109',
      type: 'Main Electric Fire Pump',
      capacity: '2280 LPM @ 7.0 Bar Head',
      location: 'Basement Sub-level 2 Main Pump House',
      gps: '28.4592° N, 77.0262° E',
      time: '15 Jan 2026, 12:10 PM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Feb 2026',
      hydroDueDate: 'Monthly Auto-Start Run',
      result: 'PASS',
      pressureBar: 'Auto-Cut 7.0 Bar / Cut-In 5.5 Bar',
      defectNote: null,
    },
    {
      id: 'eq-10',
      assetTag: 'VIGIL-PD-0110',
      type: 'Diesel Standby Fire Pump',
      capacity: '2280 LPM @ 7.0 Bar Head',
      location: 'Basement Sub-level 2 Main Pump House',
      gps: '28.4592° N, 77.0263° E',
      time: '15 Jan 2026, 12:25 PM',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Feb 2026',
      hydroDueDate: 'Monthly Auto-Start Run',
      result: 'PASS',
      pressureBar: 'Battery 25.4V • Diesel Tank 88%',
      defectNote: null,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FFF8F2] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-[#1C1917]">
      <EmberLine />
      {/* Top Format Switcher & Action Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 no-print space-y-4">
        <div data-testid="sample-report-glass-bar" className="glass-panel-dense flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#C2410C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to VigilAMC Home</span>
          </Link>

          {/* Format Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setReportFormat('maharashtra')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                reportFormat === 'maharashtra'
                  ? 'bg-white text-[#9A3412] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maharashtra / State Form-B
            </button>
            <button
              onClick={() => setReportFormat('nbc')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                reportFormat === 'nbc'
                  ? 'bg-white text-[#9A3412] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NBC 2016 &amp; IS 2190 Pan-India
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{downloading ? 'Preparing PDF...' : 'Download / Save as A4 PDF'}</span>
            </button>
          </div>
        </div>

        {/* Transparency Banner */}
        <div className="p-4 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] text-[#1C1917] text-xs flex items-start gap-3 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Authentic Sample Deliverable:</strong>
            <p className="mt-0.5 text-[#44403C] text-[11px]">
              This interactive report illustrates how VigilAMC compiles field GPS readings, timestamped photo evidence, and itemized defect quotes into official client certificates ready for licensed contractor signature. Click &ldquo;Download / Save as A4 PDF&rdquo; above to print or save a clean, watermark-free A4 document.
            </p>
          </div>
        </div>
      </div>

      {/* Official Printable Compliance Document Layout */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-10 text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* AMC Company Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Apex Fire Protection &amp; Safety Engineers Pvt. Ltd.
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                Licensed Fire Protection Agency &bull; Lic: <strong>DL/FIRE/LIC/2026/042</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                Plot 18, Commercial Tech Zone, Okhla Phase III, New Delhi 110020 &bull; Phone: +91 83838 90483 &bull; Email: service@apexfireengineers.in
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 block sm:inline-block">
                Ref: {reportFormat === 'maharashtra' ? 'FORM-B/2026/APEX-042' : 'NBC-AUDIT/2026/042'}
              </span>
              <div className="text-[11px] text-slate-600 mt-1">
                Inspection Date: <strong>15 Jan 2026</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Statutory Filing Cycle: <strong>Jan 2026 &ndash; Jun 2026 (Biannual Period 01)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center py-2 mb-5">
          {reportFormat === 'maharashtra' ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">
                [ See Section 3(3) and Rule 4(2) of Maharashtra Fire Prevention and Life Safety Measures Act, 2006 ]
              </span>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                FORM &apos;B&apos; &bull; CERTIFICATE BY LICENSED AGENCY
              </h1>
              <p className="text-xs text-slate-600 font-medium uppercase mt-0.5">
                Certificate regarding maintenance of fire prevention and life safety measures in good repair and efficient condition
              </p>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">
                [ As per National Building Code of India 2016 Part 4 &amp; IS 2190:2024 Standards ]
              </span>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                COMPREHENSIVE FIRE SAFETY AUDIT &amp; EQUIPMENT INSPECTION SCHEDULE
              </h1>
              <p className="text-xs text-slate-600 font-medium uppercase mt-0.5">
                Biannual Inspection, Physical Verification &amp; Defect Assessment Certificate (Pan-India Model)
              </p>
            </>
          )}
        </div>

        {/* Building & Client Meta Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Facility / Premise:</span>
            <div className="font-bold text-sm text-slate-900">Apex Business Towers (Tower B)</div>
            <div className="text-slate-600">Plot 14, Commercial Tech Park, Sector 24, Sample City, India 110001</div>
            <div className="text-[11px] text-slate-500 mt-1">Occupancy Classification: Group E (Business / IT Complex, B2+G+14 Floors)</div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Authorized Representative:</span>
            <div className="font-semibold text-slate-800">Apex Tech Park Facility Management Services</div>
            <div className="text-slate-600">Mr. R. K. Sharma (Head of Facility Operations)</div>
            <div className="text-[11px] text-slate-500 mt-1">Contact: facilities@apextechpark.com &bull; Phone: +91 98200 45678</div>
          </div>
        </div>

        {/* Audit KPI Status Bar */}
        <div className="p-3.5 rounded-xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white shrink-0 bg-[#9A3412]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-wide text-slate-900">
                Physical Inspection &amp; Pressure Verification Summary
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Every unit verified on site with GPS coordinates, reading logs, and photographic defect evidence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
              7 Operational
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-bold">
              1 Due Soon
            </span>
            <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 font-bold">
              2 Defects Quoted
            </span>
          </div>
        </div>

        {/* Equipment Schedule Table (10 items with GPS, readings, and color-coded status) */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Schedule of Fire Safety Equipment &amp; Inspection Dates
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">IS 2190 / NBC 2016 Part 4 Audit Schedule</span>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-2.5 border-r border-slate-300">S.No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Asset ID / Serial</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Equipment Type</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Premise Floor &amp; GPS Location</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Test Reading / Parameters</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300">Next Due</th>
                  <th className="py-2.5 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sampleEquipments.map((eq, index) => (
                  <tr key={eq.id} className="hover:bg-slate-50 text-[11px]">
                    <td className="py-2 px-2.5 text-slate-500 border-r border-slate-200 text-center font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {eq.assetTag}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                      <div>{eq.type}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{eq.capacity}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                      <div className="font-medium text-slate-800">{eq.location}</div>
                      <div className="text-[10px] text-cyan-800 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C2410C]" />
                        <span>{eq.gps}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-700 border-r border-slate-200">
                      <div className="font-mono text-[11px] font-semibold">{eq.pressureBar}</div>
                      {eq.defectNote && (
                        <div className="text-[10px] text-red-600 font-sans mt-0.5 leading-tight">
                          {eq.defectNote}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700 border-r border-slate-200 whitespace-nowrap font-mono text-[10px]">
                      {eq.nextDueDate}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {eq.result === 'PASS' && (
                        <span className="font-black text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          PASS
                        </span>
                      )}
                      {eq.result === 'DUE_SOON' && (
                        <span className="font-black text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          REFILL DUE (&lt;30d)
                        </span>
                      )}
                      {eq.result === 'DEFECT' && (
                        <span className="font-black text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          DEFECT FLAGGED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Photo Evidence Annexure Section */}
        <div className="mb-8 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#C2410C]" />
              <span>Annexure 1: Field Photographic Evidence &amp; GPS Time-Stamps</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">3 Verified Samples Attached</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: CO2 Underweight Defect */}
            <div className="border border-red-300 rounded-xl bg-red-50/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono border-b border-red-200 pb-1.5">
                <span className="font-bold text-red-700">VIGIL-CO-0102</span>
                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold">DEFECT</span>
              </div>
              <div className="h-28 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center border border-slate-800 relative overflow-hidden">
                <Gauge className="w-6 h-6 text-red-400 mb-1" />
                <span className="text-[10px] font-mono text-cyan-200">DIGITAL SCALE VERIFICATION</span>
                <span className="text-sm font-bold font-mono text-red-400 mt-0.5">14.00 KG GROSS</span>
                <span className="text-[9px] text-slate-400">Tare: 10.20kg &bull; Full: 14.70kg &bull; Net: 3.80kg (-0.70kg / -15.5%)</span>
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400">
                  15/01/26 10:28 AM
                </div>
              </div>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <p><strong>Location:</strong> Server Room (GF)</p>
                <p className="font-mono text-[9px] text-slate-500">GPS: 28.4594° N, 77.0268° E</p>
                <p className="text-red-700 font-semibold text-[10px]">Loss -15.5% (&gt;10% IS 2190) &bull; Immediate Refill Required</p>
              </div>
            </div>

            {/* Card 2: Hydrant Landing Valve Washer Leak */}
            <div className="border border-red-300 rounded-xl bg-red-50/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono border-b border-red-200 pb-1.5">
                <span className="font-bold text-red-700">VIGIL-HY-0103</span>
                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold">DEFECT</span>
              </div>
              <div className="h-28 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center border border-slate-800 relative overflow-hidden">
                <AlertTriangle className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-[10px] font-mono text-cyan-200">HYDRANT LEAKAGE PROOF</span>
                <span className="text-sm font-bold font-mono text-amber-400 mt-0.5">5.2 BAR PRESSURE</span>
                <span className="text-[9px] text-slate-400">Flange Washer Seepage Detected</span>
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400">
                  15/01/26 10:45 AM
                </div>
              </div>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <p><strong>Location:</strong> 1st Floor North Staircase</p>
                <p className="font-mono text-[9px] text-slate-500">GPS: 28.4596° N, 77.0265° E</p>
                <p className="text-red-700 font-semibold text-[10px]">Washer Worn &bull; Replacement Quoted</p>
              </div>
            </div>

            {/* Card 3: Main Fire Pump Cut-Out Check */}
            <div className="border border-emerald-300 rounded-xl bg-emerald-50/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono border-b border-emerald-200 pb-1.5">
                <span className="font-bold text-emerald-800">VIGIL-PM-0109</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">PASS</span>
              </div>
              <div className="h-28 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center border border-slate-800 relative overflow-hidden">
                <Gauge className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-[10px] font-mono text-cyan-200">MAIN PUMP AUTO-START RUN</span>
                <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5">7.0 BAR PRESSURE</span>
                <span className="text-[9px] text-slate-400">Auto Cut-In 5.5 Bar / Cut-Out 7.0 Bar</span>
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400">
                  15/01/26 12:10 PM
                </div>
              </div>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <p><strong>Location:</strong> Pump Room Sub-Level 2</p>
                <p className="font-mono text-[9px] text-slate-500">GPS: 28.4592° N, 77.0262° E</p>
                <p className="text-emerald-700 font-semibold text-[10px]">Fully Operational &bull; Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Defect Remediation & Refill Estimate Table */}
        <div className="mb-8 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-[#C2410C]" />
              <span>Annexure 2: Actionable Defect Remediation &amp; Refill Estimate</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Estimate Ref: EST-2026-APEX-042</span>
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            The following parts and services are recommended based on the physical inspection findings above. Client authorization below authorizes immediate remediation to ensure full statutory compliance.
          </p>

          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300">Item Description</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 text-center">Equipment Tag</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 text-center">Qty</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-right">Unit Rate (₹)</th>
                  <th className="py-2 px-3 text-right">Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                    4.5kg CO2 Gas Refill (IS 2878) + Safety Pin &amp; Tamper Seal Replacement
                  </td>
                  <td className="py-2 px-2.5 font-mono text-center border-r border-slate-200">VIGIL-CO-0102</td>
                  <td className="py-2 px-2.5 text-center border-r border-slate-200 font-mono">1 Unit</td>
                  <td className="py-2 px-3 text-right border-r border-slate-200 font-mono">₹1,450.00</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹1,450.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                    63mm Gunmetal Landing Valve Heavy-Duty Rubber Flange Washer &amp; Gland Repacking
                  </td>
                  <td className="py-2 px-2.5 font-mono text-center border-r border-slate-200">VIGIL-HY-0103</td>
                  <td className="py-2 px-2.5 text-center border-r border-slate-200 font-mono">1 Unit</td>
                  <td className="py-2 px-3 text-right border-r border-slate-200 font-mono">₹680.00</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹680.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                    4kg Clean Agent FE-36 Advance Annual Refilling &amp; Leak Test
                  </td>
                  <td className="py-2 px-2.5 font-mono text-center border-r border-slate-200">VIGIL-CA-0107</td>
                  <td className="py-2 px-2.5 text-center border-r border-slate-200 font-mono">1 Unit</td>
                  <td className="py-2 px-3 text-right border-r border-slate-200 font-mono">₹2,400.00</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹2,400.00</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-200 text-slate-700">
                    Total Net Estimate (Excl. 18% GST):
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-900">₹4,530.00</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-200 text-[#9A3412]">
                    Total Including 18% GST (CGST 9% + SGST 9%):
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-[#9A3412] text-xs">₹5,345.40</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dual Signoff Block: Client Approval + Licensed Agency Stamp */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Client Facility Approval */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-3 bg-slate-50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              1. Client Facility Manager Authorization:
            </span>
            <p className="text-[11px] text-slate-600 leading-snug">
              I acknowledge inspection findings and approve the itemized defect repair/refill estimate outlined in Annexure 2.
            </p>
            <div className="pt-4 border-t border-slate-200 space-y-1">
              <div className="h-10 flex items-end">
                <span className="font-serif italic text-sm font-bold text-slate-700">R. K. Sharma</span>
              </div>
              <div className="font-bold text-xs text-slate-900">Authorized Signatory &bull; Facility Operations</div>
              <div className="text-[10px] text-slate-500">For Apex Tech Park Facility Management Services</div>
              <div className="text-[10px] text-slate-400 font-mono">Date: 16 Jan 2026</div>
            </div>
          </div>

          {/* Licensed Agency Certification Stamp */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-3 bg-slate-50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              2. Licensed Fire Agency Seal &amp; Declaration:
            </span>
            <p className="text-[11px] text-slate-600 leading-snug">
              Certified that all fire fighting installations have been physically inspected and recorded as per state fire act provisions.
            </p>
            <div className="pt-4 border-t border-slate-200 space-y-1">
              <div className="h-10 flex items-end">
                <span className="font-serif italic text-sm font-bold text-slate-700">V. P. Deshmukh</span>
              </div>
              <div className="font-bold text-xs text-slate-900">Chief Fire Safety Engineer (B.E. Fire)</div>
              <div className="text-[10px] text-slate-600">
                For <strong>Apex Fire Protection &amp; Safety Engineers Pvt. Ltd.</strong>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Licensed Agency No: <strong>DL/FIRE/LIC/2026/042</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Notice */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 text-center leading-relaxed">
          <p>
            <strong>Statutory Compliance Disclaimer:</strong> Requirements, statutory report formats, and inspection cadences vary by state, municipal fire directorate, building occupancy type, and applicable fire safety acts. VigilAMC is pure software for organizing service records and workflow documentation. Final compliance filings must be reviewed, sealed, and endorsed by authorized licensed fire safety agencies.
          </p>
        </div>
      </div>
    </div>
  );
}
