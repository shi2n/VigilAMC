'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Sparkles,
  QrCode
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function SampleReportPage() {
  const [downloading, setDownloading] = useState(false);

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
      qrCode: 'VIGIL-SMP-0101',
      type: 'ABC Dry Powder',
      capacity: '6 KG',
      location: 'Ground Floor Main Reception Lobby',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jan 2027',
      hydroDueDate: 'Nov 2028',
      result: 'PASS',
      pressureBar: '14.5 Bar',
    },
    {
      id: 'eq-2',
      qrCode: 'VIGIL-SMP-0102',
      type: 'Carbon Dioxide (CO2)',
      capacity: '4.5 KG',
      location: 'Ground Floor Server & UPS Room',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jan 2027',
      hydroDueDate: 'Dec 2027',
      result: 'PASS',
      pressureBar: 'Tare 10.2kg / Gross 14.7kg',
    },
    {
      id: 'eq-3',
      qrCode: 'VIGIL-SMP-0103',
      type: 'Single Landing Valve Hydrant',
      capacity: '63mm Gunmetal',
      location: '1st Floor North Staircase Riser',
      lastServiceDate: '10 Jan 2026',
      nextDueDate: '09 Jul 2026',
      hydroDueDate: 'Annually Tested',
      result: 'PASS',
      pressureBar: 'Static 7.0 Bar / Dynamic 3.5 Bar',
    },
    {
      id: 'eq-4',
      qrCode: 'VIGIL-SMP-0104',
      type: 'First-Aid Hose Reel Drum',
      capacity: '30m x 20mm Rubber Hose',
      location: '1st Floor Lift Corridor',
      lastServiceDate: '10 Jan 2026',
      nextDueDate: '09 Jul 2026',
      hydroDueDate: 'Operational',
      result: 'PASS',
      pressureBar: 'Jet Flow Verified',
    },
    {
      id: 'eq-5',
      qrCode: 'VIGIL-SMP-0105',
      type: 'ABC Dry Powder',
      capacity: '6 KG',
      location: '2nd Floor Open Office Workstations',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jan 2027',
      hydroDueDate: 'Nov 2028',
      result: 'PASS',
      pressureBar: '14.2 Bar',
    },
    {
      id: 'eq-6',
      qrCode: 'VIGIL-SMP-0106',
      type: 'Water Mist / Clean Agent',
      capacity: '9 Litre',
      location: '2nd Floor Executive Boardroom',
      lastServiceDate: '15 Jan 2026',
      nextDueDate: '14 Jan 2027',
      hydroDueDate: 'Oct 2029',
      result: 'PASS',
      pressureBar: '13.8 Bar',
    },
    {
      id: 'eq-7',
      qrCode: 'VIGIL-SMP-0107',
      type: 'Addressable Fire Alarm Panel',
      capacity: '4 Loop / 508 Points',
      location: 'Building Security Operations Control Desk',
      lastServiceDate: '18 Jan 2026',
      nextDueDate: '17 Apr 2026',
      hydroDueDate: 'Quarterly Loop Test',
      result: 'PASS',
      pressureBar: 'Battery Backup & Standby Normal',
    },
    {
      id: 'eq-8',
      qrCode: 'VIGIL-SMP-0108',
      type: 'Main Fire Pump & Jockey Pump',
      capacity: '2280 LPM @ 7.0 Bar',
      location: 'Basement Sub-level 2 Main Pump House',
      lastServiceDate: '08 Jan 2026',
      nextDueDate: '07 Feb 2026',
      hydroDueDate: 'Monthly Auto-Start Run',
      result: 'PASS',
      pressureBar: 'Auto-cut on 6.2 Bar / Cut-in 5.0 Bar',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      {/* Top Banner (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0077B6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to VigilAMC Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <StatusBadge status="SAMPLE" />
            <button
              onClick={handlePrint}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>{downloading ? 'Preparing Print...' : 'Download / Print as PDF'}</span>
            </button>
          </div>
        </div>

        {/* Transparency Banner */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Transparent Sample Report:</strong>
            <p className="mt-0.5 text-amber-800">
              This document illustrates the layout and data fields generated when using VigilAMC to compile equipment inspection logs and service records. All company names, premise addresses, and asset IDs shown below are fictional sample data created for demonstration purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Official Printable Compliance Document Layout */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-10 text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* Sample Watermark Banner */}
        <div className="bg-slate-100 border border-slate-300 rounded-lg py-2 px-4 mb-6 text-center text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">
          *** SAMPLE COMPLIANCE INSPECTION REPORT &bull; DEMO DATA FOR ILLUSTRATION ONLY ***
        </div>

        {/* AMC Company Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Sample Fire Safety Services Pvt. Ltd.
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Licensed Fire Protection Agency &bull; Lic: DL/FIRE/LIC/SAMPLE-2026
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                Plot 24, Okhla Industrial Area Phase III, New Delhi, Delhi NCR 110020 &bull; Phone: +91 98000 00000 &bull; Email: service@samplefireamc.in
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 block sm:inline-block">
                Ref: FORM-B/2026/SMP-402
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Date: <strong>20 Jan 2026</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Filing Cycle: <strong>Jan 2026 &ndash; Jun 2026 (Biannual)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center py-2 mb-6">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
            Fire Safety Equipment &amp; Installation Inspection Schedule
          </h1>
          <p className="text-xs text-slate-600 font-medium uppercase mt-0.5">
            Biannual Maintenance Certificate (Model Form-B Format)
          </p>
        </div>

        {/* Building & Client Meta */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Client / Premise:</span>
            <div className="font-bold text-sm text-slate-900">Apex Commercial Tower (Demo Building)</div>
            <div className="text-slate-600">Plot 14, DLF Cyber City, Sector 24, Gurugram, Delhi NCR 122002</div>
            <div className="text-[11px] text-slate-500 mt-1">Occupancy: Commercial IT / Office (B+G+14 Floors)</div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Facility Contact:</span>
            <div className="font-semibold text-slate-800">Apex Facility Management Services</div>
            <div className="text-slate-600">Mr. R. K. Sharma (Head of Facilities)</div>
            <div className="text-[11px] text-slate-500 mt-1">Email: facilities@apex-demo.com &bull; Phone: +91 98200 00000</div>
          </div>
        </div>

        {/* COMPLIANCE STATUS SUMMARY STAMP */}
        <div className="p-4 rounded-xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50 border-emerald-300 text-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 bg-emerald-600">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-base font-black uppercase tracking-wide">
                Inspection Summary: All Audited Items Verified
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                Physical verification and operational checks completed across registered fire safety assets for this cycle.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold uppercase text-slate-600">Sample Audit Count</div>
            <div className="text-sm font-black text-slate-900">
              8 of 8 Sample Assets Verified
            </div>
          </div>
        </div>

        {/* Equipment Schedule Table */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Schedule of Fire Safety Equipment &amp; Inspection Dates
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">IS 2190 / NBC 2016 Part 4 Reference</span>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300">S.No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">QR Tag ID</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Equipment Type</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Premise Location</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Last Service</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Next Service Due</th>
                  <th className="py-2.5 px-3 text-right">Inspection Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sampleEquipments.map((eq, index) => (
                  <tr key={eq.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 border-r border-slate-200">{index + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                      {eq.qrCode}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-200">
                      <div>{eq.type} ({eq.capacity})</div>
                      <div className="text-[10px] text-slate-500 font-normal">{eq.pressureBar}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">{eq.location}</td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      {eq.lastServiceDate}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-200">
                      {eq.nextDueDate}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-black text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {eq.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signoff & Authenticator Block */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
            <div className="w-14 h-14 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 text-slate-800 shrink-0">
              <QrCode className="w-10 h-10 text-[#023E8A]" />
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <span className="font-bold text-slate-800 uppercase block">Digital Verification Passport</span>
              <p>Sample report generated using VigilAMC compliance platform.</p>
              <p className="font-mono font-semibold text-slate-600">ID: FORM-B/2026/SMP-402</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="h-8 flex items-center justify-end">
              <span className="font-serif italic text-base font-bold text-slate-700">Sample Inspecting Officer</span>
            </div>
            <div className="font-bold text-xs text-slate-900">Authorized Inspecting Officer</div>
            <div className="text-[11px] text-slate-600">
              For <strong>Sample Fire Safety Services Pvt. Ltd.</strong>
            </div>
            <div className="text-[10px] text-slate-500">
              Licensed Agency No: DL/FIRE/LIC/SAMPLE-2026
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Notice */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 text-center leading-relaxed">
          <p>
            <strong>Statutory Compliance Disclaimer:</strong> Requirements, statutory report formats, and inspection cadences vary by state, municipal jurisdiction, building occupancy type, and applicable fire safety acts. VigilAMC is software for organizing service records and workflow documentation. Final compliance filings must be reviewed and submitted with licensed fire compliance professionals and relevant local fire authorities.
          </p>
        </div>
      </div>
    </div>
  );
}
