'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { REPORT_TYPES } from '@/lib/compliance-engine';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const [form, setForm] = useState({
    buildingId: '',
    formType: 'FIRE_SAFETY_INSPECTION_REPORT',
    period: `Jan ${new Date().getFullYear()} - Jun ${new Date().getFullYear()}`,
    notes: 'Documented equipment inspection and maintenance report.',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certRes, bldRes] = await Promise.all([
        fetch('/api/certificates'),
        fetch('/api/buildings'),
      ]);
      const certData = await certRes.json();
      const bldData = await bldRes.json();

      setCertificates(certData.certificates || []);
      const blds = bldData.buildings || [];
      setBuildings(blds);
      if (blds.length > 0 && !form.buildingId) {
        setForm((prev) => ({ ...prev, buildingId: blds[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.buildingId) {
      window.location.href = `/report/${form.buildingId}?reportType=${form.formType}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0E4D8] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              Fire Safety Inspection &amp; Maintenance Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] text-xs font-bold border border-[#FED7AA]">
              Delhi · Noida · Gurugram
            </span>
          </div>
          <p className="text-sm text-[#44403C] mt-1">
            Jurisdiction-aware equipment inspection, maintenance records, and field verification reports.
          </p>
        </div>

        <button
          onClick={() => setIssueModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Inspection Report</span>
        </button>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-[#44403C]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C]" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-12 text-center text-[#44403C] bg-white border border-[#F0E4D8] rounded-2xl">
          <FileCheck2 className="w-12 h-12 text-[#C2410C] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1C1917]">No inspection reports generated yet</h3>
          <p className="text-xs text-[#44403C] mt-1">
            Click above to generate a Fire Safety Inspection &amp; Maintenance Report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border border-[#F0E4D8] hover:border-[#EA580C]/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#C2410C] bg-[#FFF0E6] px-2.5 py-1 rounded-lg border border-[#FED7AA]">
                    {cert.certificateNumber}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {cert.formType || 'INSPECTION_REPORT'}
                  </span>
                </div>

                <Link href={`/report/${cert.building?.id || cert.id}`}>
                  <h3 className="text-lg font-bold text-[#1C1917] hover:text-[#EA580C] transition-colors">
                    {cert.building?.name || 'Registered Building'}
                  </h3>
                </Link>
                <p className="text-xs text-[#44403C] mt-1">Period: {cert.period}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-[#44403C] pt-2 border-t border-[#F0E4D8]">
                  <span>Generated: {new Date(cert.issueDate).toLocaleDateString('en-IN')}</span>
                  <span className="font-bold text-[#1C1917]">{cert.overallResult}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0E4D8]">
                <Link
                  href={`/report/${cert.building?.id || cert.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#FFF0E6] hover:bg-[#FED7AA] text-[#1C1917] text-xs font-bold transition-colors"
                >
                  <span>View 5-Page Inspection Report</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#EA580C]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {issueModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#F0E4D8] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#EA580C]" />
                <h3 className="font-bold text-[#1C1917] text-base">
                  Generate Fire Safety Inspection Report
                </h3>
              </div>
              <button onClick={() => setIssueModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1C1917] font-bold mb-1">Select Building *</label>
                <select
                  required
                  value={form.buildingId}
                  onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
                  className="w-full bg-[#FFF8F2] border border-[#E7D6C7] rounded-lg p-2.5 text-[#1C1917]"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.assets?.length || 0} Assets)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1C1917] font-bold mb-1">Report Type</label>
                <select
                  value={form.formType}
                  onChange={(e) => setForm({ ...form, formType: e.target.value })}
                  className="w-full bg-[#FFF8F2] border border-[#E7D6C7] rounded-lg p-2.5 text-[#1C1917]"
                >
                  {Object.values(REPORT_TYPES).map((rt) => (
                    <option key={rt.code} value={rt.code}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 text-[#44403C] hover:text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold shadow-sm cursor-pointer"
                >
                  Open Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
