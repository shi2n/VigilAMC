'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  QrCode,
  Smartphone,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Search,
  Filter,
  Camera,
  MapPin,
  Calendar,
  Building2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

type PreviewTab = 'dashboard' | 'assets' | 'scanner' | 'defects' | 'report';

export function ProductInterfacePreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as const, label: 'Operations Dashboard', icon: LayoutDashboard, status: 'LIVE' as const },
    { id: 'assets' as const, label: 'Asset Inventory', icon: QrCode, status: 'LIVE' as const },
    { id: 'scanner' as const, label: 'Technician QR Scanner', icon: Smartphone, status: 'LIVE' as const },
    { id: 'defects' as const, label: 'Defect Tracking', icon: AlertTriangle, status: 'LIVE' as const },
    { id: 'report' as const, label: 'Compliance Report', icon: FileCheck2, status: 'BETA' as const },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Top Bar with Tabs */}
      <div className="bg-slate-900 text-white p-3 sm:p-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-200">
              VigilAMC Platform Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Sample Data &bull; Demo Views
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0077B6] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="hidden md:inline">
                  <StatusBadge status={tab.status} size="xs" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Content Container */}
      <div className="p-4 sm:p-6 bg-slate-50 min-h-[460px]">
        {/* TAB 1: OPERATIONS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-[#023E8A]">Operations Control Radar</h4>
                <p className="text-[11px] text-slate-500">Demo Organization: Apex Safety Works (Sample Fleet)</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                [SAMPLE DATA]
              </span>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Total Fire Assets</div>
                <div className="text-2xl font-black text-[#023E8A] mt-1">142</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Across 4 Sample Buildings</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold text-emerald-600 uppercase">Fully Compliant</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">128</div>
                <div className="text-[10px] text-slate-400 mt-0.5">90.1% Service Pass Rate</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold text-amber-600 uppercase">Service Due &lt;30d</div>
                <div className="text-2xl font-black text-amber-600 mt-1">11</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Refill Schedule Active</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold text-red-600 uppercase">Defects Pending</div>
                <div className="text-2xl font-black text-red-600 mt-1">3</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Repair Workorders Issued</div>
              </div>
            </div>

            {/* Recent Audits Table Mockup */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Recent Field Service Check-ins</span>
                <span className="text-[10px] font-normal text-slate-400">Synced via Offline Mobile App</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-mono font-bold text-slate-800">VIGIL-SMP-0101</span>
                    <span className="text-slate-500">6kg ABC Powder &bull; Tower A, 4th Floor</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">14.5 Bar &bull; Verified</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-mono font-bold text-slate-800">VIGIL-SMP-0103</span>
                    <span className="text-slate-500">Landing Valve 63mm &bull; Tower B, Stair 2</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">Pressure 7 Bar &bull; Verified</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-mono font-bold text-slate-800">VIGIL-SMP-0112</span>
                    <span className="text-slate-500">4.5kg CO2 Cylinder &bull; Server Room Basement</span>
                  </div>
                  <span className="text-[11px] text-red-600 font-semibold">Underweight &bull; Defect Flagged</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSET INVENTORY */}
        {activeTab === 'assets' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-[#023E8A]">Equipment Registry &amp; Tag Manager</h4>
                <p className="text-[11px] text-slate-500">Filter by location, equipment type, and hydrostatic test deadlines</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                [SAMPLE DATA]
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  readOnly
                  value="Filter by QR, Building, or Category..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-400 text-xs"
                />
              </div>
              <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 font-medium text-xs">
                All Buildings (4)
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">QR Tag</th>
                    <th className="py-2 px-3">Equipment</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3">Refill Due</th>
                    <th className="py-2 px-3">Hydro Due</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">VIGIL-SMP-0101</td>
                    <td className="py-2.5 px-3 font-medium">ABC Powder (6kg)</td>
                    <td className="py-2.5 px-3 text-slate-500">Tower A &bull; 4th Floor Lobby</td>
                    <td className="py-2.5 px-3">14 Jan 2027</td>
                    <td className="py-2.5 px-3 text-slate-500">Nov 2028</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        COMPLIANT
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">VIGIL-SMP-0102</td>
                    <td className="py-2.5 px-3 font-medium">CO2 Cylinder (4.5kg)</td>
                    <td className="py-2.5 px-3 text-slate-500">Tower A &bull; Ground Server Rm</td>
                    <td className="py-2.5 px-3">14 Jan 2027</td>
                    <td className="py-2.5 px-3 text-slate-500">Dec 2027</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        COMPLIANT
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">VIGIL-SMP-0103</td>
                    <td className="py-2.5 px-3 font-medium">Hydrant Landing Valve</td>
                    <td className="py-2.5 px-3 text-slate-500">Tower B &bull; 1st Floor Stair</td>
                    <td className="py-2.5 px-3 text-amber-700 font-bold">15 Feb 2026</td>
                    <td className="py-2.5 px-3 text-slate-500">Annual</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        DUE SOON
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICIAN QR SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-[#023E8A]">Technician Mobile Field Scanner</h4>
                <p className="text-[11px] text-slate-500">Works 100% offline in underground basements and pump rooms</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                [SAMPLE WORKFLOW]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Phone Viewfinder Mockup */}
              <div className="max-w-xs mx-auto w-full p-4 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>VigilAMC Tech Scanner</span>
                  <span className="text-emerald-400 font-bold">OFFLINE READY</span>
                </div>

                <div className="relative aspect-square w-full rounded-xl bg-slate-800 flex items-center justify-center border-2 border-dashed border-cyan-400/80 p-4">
                  <div className="text-center space-y-2">
                    <QrCode className="w-16 h-16 text-cyan-300 mx-auto" />
                    <p className="text-[11px] text-cyan-100 font-mono">TAG SCANNED: VIGIL-SMP-0101</p>
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  GPS Verified &bull; Lat 19.0760, Lon 72.8777
                </div>
              </div>

              {/* Inspection Checklist Form Mockup */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900 border-b pb-2">
                  Inspection Form &bull; 6kg ABC Extinguisher
                </div>

                <div className="space-y-2 text-slate-700">
                  <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span>1. Pressure Gauge in Green Zone</span>
                    <span className="text-emerald-600 font-bold">PASS (14.5 Bar)</span>
                  </label>
                  <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span>2. Safety Pin &amp; Tamper Seal Intact</span>
                    <span className="text-emerald-600 font-bold">PASS (Original)</span>
                  </label>
                  <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span>3. Discharge Horn &amp; Hose Clear</span>
                    <span className="text-emerald-600 font-bold">PASS (Clean)</span>
                  </label>
                  <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span>4. Cylinder Body &amp; Bracket Secure</span>
                    <span className="text-emerald-600 font-bold">PASS (No Rust)</span>
                  </label>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg text-center">
                    Submit Record
                  </button>
                  <button className="px-3 py-2 bg-red-100 text-red-700 font-bold rounded-lg text-center">
                    Flag Defect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEFECT TRACKING */}
        {activeTab === 'defects' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-[#023E8A]">Defect Audit &amp; Repair Dispatch</h4>
                <p className="text-[11px] text-slate-500">Capture photo proof of issues, generate repair quotes, and track closures</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                [SAMPLE DATA]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-red-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-700 text-[10px]">
                    HIGH SEVERITY
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DEF-2026-081</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">Pressure Gauge Depressurized</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Asset: VIGIL-SMP-0112 (4.5kg CO2) &bull; Basement Electrical Room</p>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  <strong>Technician Observation:</strong> Cylinder weight measured 2.1kg below statutory tare weight threshold. Immediate refilling and seal replacement required.
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Status: <strong>Quote Dispatched</strong></span>
                  <span className="text-xs font-bold text-[#0077B6]">View Evidence Photo &rarr;</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-700 text-[10px]">
                    MEDIUM SEVERITY
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DEF-2026-082</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">Landing Valve Washer Leakage</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Asset: VIGIL-SMP-0103 (Hydrant) &bull; Tower B 1st Floor Riser</p>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  <strong>Technician Observation:</strong> Minor weeping at gland packing under 7 bar static test. Replace rubber gasket and tighten packing nut.
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Status: <strong>Repair Assigned</strong></span>
                  <span className="text-xs font-bold text-[#0077B6]">View Evidence Photo &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMPLIANCE REPORT */}
        {activeTab === 'report' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-[#023E8A]">Client-Facing Compliance Report</h4>
                <p className="text-[11px] text-slate-500">Aggregates verified field inspection logs into statutory model Form-B format</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/sample-report"
                  className="px-3 py-1 rounded bg-[#0077B6] text-white font-bold text-[11px] hover:bg-[#023E8A] transition-colors"
                >
                  View Full Sample PDF
                </Link>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  [SAMPLE REPORT]
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <div className="font-black text-sm text-slate-900">Apex Commercial Tower (Demo Premise)</div>
                  <div className="text-[11px] text-slate-500">Biannual Fire Safety Equipment Inspection Certificate</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  ALL ASSETS PASS
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block">Report Number</span>
                  <strong className="text-slate-800 font-mono">FORM-B/2026/SMP-402</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Filing Cycle</span>
                  <strong className="text-slate-800">Jan &ndash; Jun 2026</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Inspected Items</span>
                  <strong className="text-slate-800">8 / 8 Verified</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Agency Lic. No.</span>
                  <strong className="text-slate-800">MH/FIRE/LIC/SAMPLE</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Click &ldquo;View Full Sample PDF&rdquo; to review the complete multi-asset schedule with print/download functionality.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
