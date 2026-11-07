'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { EQUIPMENT_TYPES } from '@/lib/compliance';
import { PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS } from '@/lib/compliance-engine';

export default function CertificateDetailPage() {
  const params = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/certificates/${params.id}`);
        const data = await res.json();
        setCert(data.certificate);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCertificate();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !cert) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] py-20 flex justify-center text-[#44403C]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C]" />
      </div>
    );
  }

  const building = cert.building || {};
  const company = building.company || {};
  const assets = building.equipments || building.assets || [];

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="no-print space-y-3">
        <Link
          href="/certificates"
          className="inline-flex items-center gap-1.5 text-xs text-[#44403C] hover:text-[#1C1917] font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Inspection Reports</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E4D8] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-[#1C1917] tracking-tight">
                VigilAMC Fire Safety Inspection &amp; Maintenance Report
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                {cert.certificateNumber}
              </span>
            </div>
            <p className="text-xs text-[#44403C] mt-1">
              Equipment Inspection, Maintenance Records and Field Verification Report.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {building.id && (
              <Link
                href={`/report/${building.id}`}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#FED7AA] text-xs font-bold text-[#1C1917]"
              >
                Open Full 5-Page Report
              </Link>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 space-y-6">
        <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1">
          <div className="text-xs font-black uppercase tracking-widest text-[#C2410C]">
            VIGILAMC FIRE SAFETY INSPECTION &amp; MAINTENANCE REPORT
          </div>
          <p className="text-xs font-bold text-slate-700 max-w-2xl mx-auto">
            Equipment Inspection, Maintenance Records and Field Verification Report.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Servicing Agency Details:</div>
            <div className="font-bold text-sm text-slate-900">{company?.name || cert.signatoryName || 'Servicing Agency'}</div>
            <div className="text-slate-600 text-[11px]">
              Agency License Ref: <strong className="text-slate-900">{cert.licensedAgencyNumber || 'Not Provided'}</strong>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Report Reference ID:</span>
              <span className="font-mono font-bold text-sm text-slate-900">{cert.certificateNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Date of Generation:</span>
              <span className="font-semibold text-slate-800">{new Date(cert.issueDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Reporting Period:</span>
              <span className="font-bold text-slate-800">{cert.period}</span>
            </div>
          </div>
        </div>

        <div className="py-2 border-b border-slate-200 space-y-1 text-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Premises Inspected:</div>
          <div className="font-bold text-base text-slate-900">{building.name}</div>
          <div className="text-slate-700">
            <strong>Address: </strong>
            {building.address} {building.city ? `, ${building.city}` : ''}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Registered Equipment Schedule ({assets.length} Units)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
              Status: {cert.overallResult}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-2 border-r border-slate-300">Equipment ID</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Location</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Type &amp; Capacity</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Last Service</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Next Due</th>
                  <th className="py-1.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 px-3 text-center text-slate-600">
                      No fire safety equipment has been registered in this system for the selected premises. Inspection and compliance status cannot be determined.
                    </td>
                  </tr>
                ) : (
                  assets.slice(0, 15).map((a: any) => {
                    const eqInfo = EQUIPMENT_TYPES[a.type];
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2 font-mono font-bold border-r border-slate-200">{a.qrCode}</td>
                        <td className="py-1.5 px-2 border-r border-slate-200">{a.location || '—'}</td>
                        <td className="py-1.5 px-2 font-medium border-r border-slate-200">
                          {eqInfo?.name || a.type} {a.capacity ? `(${a.capacity})` : ''}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-200">
                          {a.lastServiceDate ? new Date(a.lastServiceDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-1.5 px-2 font-bold border-r border-slate-200">
                          {a.nextDueDate ? new Date(a.nextDueDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-slate-800">{a.status || 'RECORDED'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-[10.5px] text-slate-700 space-y-1 leading-relaxed">
          <div className="font-bold text-slate-900 uppercase">Important Legal Disclaimer</div>
          {PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-300 bg-slate-50">
            <ShieldCheck className="w-8 h-8 text-emerald-700 shrink-0" />
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <div className="font-bold text-slate-900 uppercase">VigilAMC Platform Authenticity Record</div>
              <div className="font-mono text-[9px] text-slate-500">Record ID: {cert.id}</div>
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <div className="font-bold text-xs text-slate-900">
              {cert.signatoryName || 'Authorized Agency Representative'}
            </div>
            <div className="text-[10px] text-slate-600">
              Authorized Agency Representative
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
