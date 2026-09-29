'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import {
  Printer,
  ArrowLeft,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RefreshCw,
  FileCheck2
} from 'lucide-react';

export default function ComplianceReportPage() {
  const params = useParams();
  const buildingId = params.buildingId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/report/${buildingId}`);
        const json = await res.json();
        setData(json);

        if (json.building) {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vigilfire.in';
          const qr = await QRCode.toDataURL(`${origin}/report/${buildingId}`, {
            width: 130,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrDataUrl(qr);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (buildingId) {
      fetchReport();
    }
  }, [buildingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh] bg-[#080d1a]">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
          <p className="text-xs font-semibold">Generating client-ready compliance report...</p>
        </div>
      </div>
    );
  }

  const { company, building, report, summary } = data;
  const isCompliant = summary.overallStatus === 'COMPLIANT';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Top Controls (Hidden in Print) */}
      <div className="no-print flex items-center justify-between border-b border-slate-800/80 pb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Compliance Radar</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print / Save Form-B PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Compliance Document Layout */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl p-8 sm:p-12 text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* AMC Company Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {company?.name || 'Fire Safety AMC Solutions'}
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Govt. Licensed Fire Safety Agency • {company?.licenseNumber || 'DL/FIRE/LIC/2026'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                {company?.address || 'Official Registered Service Station'} • Phone: {company?.phone || '+91 98000 00000'} • Email: {company?.email || 'service@fireamc.in'}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 block sm:inline-block">
                Ref: {report.reportNumber}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Date: <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Audit Cycle: <strong>{report.cyclePeriod}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center py-2 mb-6">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
            Fire Safety Equipment Compliance Inspection Report
          </h1>
          <p className="text-xs text-slate-600 font-medium uppercase mt-0.5">
            Pursuant to {building.complianceCycle}
          </p>
        </div>

        {/* Building & Client Meta */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Client / Premise:</span>
            <div className="font-bold text-sm text-slate-900">{building.name}</div>
            <div className="text-slate-600">{building.address}</div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Contact:</span>
            <div className="font-semibold text-slate-800">{building.client?.name}</div>
            <div className="text-slate-600">
              {building.client?.contactPerson} • {building.client?.phone}
            </div>
          </div>
        </div>

        {/* COMPLIANCE STATUS SUMMARY STAMP */}
        <div
          className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isCompliant
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 ${
                isCompliant ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {isCompliant ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>
            <div>
              <div className="text-base font-black uppercase tracking-wide">
                {isCompliant ? 'Status: Fully Compliant' : 'Status: Action Needed'}
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                {isCompliant
                  ? 'All fire prevention and life safety equipment in this building has been serviced and is in proper working condition.'
                  : `${summary.overdue} equipment item(s) are overdue for mandatory refill/overhaul. Refill required prior to Fire NOC submission.`}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold uppercase text-slate-600">Audited Inventory</div>
            <div className="text-sm font-black text-slate-900">
              {summary.compliant} / {summary.total} Operational
            </div>
          </div>
        </div>

        {/* Equipment Schedule Table */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Schedule of Fire Safety Equipment &amp; Inspection Dates
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">IS 2190 Standard Maintenance</span>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300">S.No</th>
                  <th className="py-2 px-3 border-r border-slate-300">QR Tag ID</th>
                  <th className="py-2 px-3 border-r border-slate-300">Type & Capacity</th>
                  <th className="py-2 px-3 border-r border-slate-300">Location in Premise</th>
                  <th className="py-2 px-3 border-r border-slate-300">Last Serviced</th>
                  <th className="py-2 px-3 border-r border-slate-300">Next Service Due</th>
                  <th className="py-2 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {building.equipments.map((eq: any, index: number) => {
                  const pass = eq.currentStatus === 'COMPLIANT';

                  return (
                    <tr key={eq.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 border-r border-slate-200">{index + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                        {eq.qrCode}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200">
                        {eq.capacity} ({eq.type})
                      </td>
                      <td className="py-2 px-3 text-slate-600 border-r border-slate-200">{eq.location}</td>
                      <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                        {new Date(eq.lastServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2 px-3 font-semibold border-r border-slate-200">
                        <span className={eq.currentStatus === 'OVERDUE' ? 'text-red-700 font-bold' : eq.currentStatus === 'DUE_SOON' ? 'text-amber-700' : 'text-slate-800'}>
                          {new Date(eq.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`font-black text-[10px] px-2 py-0.5 rounded ${
                            pass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {pass ? 'PASS' : 'ACTION'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signoff & Municipal Authenticator */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Municipal Authenticator QR */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {qrDataUrl && <img src={qrDataUrl} alt="Report QR" className="w-16 h-16 object-contain" />}
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <span className="font-bold text-slate-800 uppercase block">Digital Audit Passport</span>
              <p>Scan with any camera to verify live compliance on VigilAMC records.</p>
              <p className="font-mono font-semibold text-slate-600">{report.reportNumber}</p>
            </div>
          </div>

          {/* Agency Signatory Block */}
          <div className="text-right space-y-1">
            <div className="h-10 flex items-center justify-end">
              <span className="font-serif italic text-base font-bold text-slate-800">Er. Rajesh Kumar Sharma</span>
            </div>
            <div className="font-bold text-xs text-slate-900">Authorized Inspecting Officer</div>
            <div className="text-[11px] text-slate-600">
              For <strong>{company?.name || 'Vigil Fire & Safety Solutions'}</strong>
            </div>
            <div className="text-[10px] text-slate-500">
              Govt. Licensed Fire Safety Agency (Lic: {company?.licenseNumber})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
