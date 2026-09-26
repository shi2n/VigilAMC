'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  Printer,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  // New certificate form
  const [form, setForm] = useState({
    buildingId: '',
    formType: 'FORM_B',
    period: `Jan ${new Date().getFullYear()} - Jun ${new Date().getFullYear()}`,
    notes: 'Certified that all fire fighting installations have been inspected and maintained in good working condition.',
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
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setIssueModalOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Form-B Compliance Certificates
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              Statutory Form-B & Form-15
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Official bi-annual compliance certificates mandated under Indian Fire Safety Acts for Fire NOC renewals.
          </p>
        </div>

        <button
          onClick={() => setIssueModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Form-B</span>
        </button>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#0d1322] border border-slate-800 rounded-2xl">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No certificates issued yet</h3>
          <p className="text-xs text-slate-500 mt-1">Click above to generate your first Form-B compliance certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#0d1322] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-black/50"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                    {cert.certificateNumber}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {cert.formType}
                  </span>
                </div>

                {/* Building info */}
                <Link href={`/certificates/${cert.id}`}>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {cert.building?.name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 mt-1">Period: {cert.period}</p>

                {/* Audit numbers */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">AUDITED</span>
                    <span className="font-black text-white">{cert.totalAssetsInspected}</span>
                  </div>
                  <div>
                    <span className="text-emerald-500 text-[10px] block">FUNCTIONAL</span>
                    <span className="font-black text-emerald-400">{cert.functionalCount}</span>
                  </div>
                  <div>
                    <span className="text-amber-500 text-[10px] block">REFILLED</span>
                    <span className="font-black text-amber-400">{cert.refilledCount}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Valid Until: {new Date(cert.validUntil).toLocaleDateString()}</span>
                  <span className="font-semibold text-emerald-400">✓ {cert.overallResult}</span>
                </div>
              </div>

              {/* View Action */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <Link
                  href={`/certificates/${cert.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <span>View Official Certificate & PDF</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Certificate Modal */}
      {issueModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Issue Form-B Compliance Certificate</h3>
              </div>
              <button onClick={() => setIssueModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Building *</label>
                <select
                  required
                  value={form.buildingId}
                  onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.assets?.length || 0} Assets) - {b.fireNocNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Certificate Form Type</label>
                  <select
                    value={form.formType}
                    onChange={(e) => setForm({ ...form, formType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="FORM_B">Form-B (Maharashtra Fire Safety Act)</option>
                    <option value="FORM_15">Form-15 (National Model Bye-Laws)</option>
                    <option value="ANNUAL_FITNESS">Annual AMC Fitness Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Audit Period</label>
                  <input
                    type="text"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Statutory Certification Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-emerald-400">Automatic Compliance Aggregation:</span>
                <p className="mt-0.5">
                  The system will automatically audit all extinguishers currently registered to this building, compiling functional vs refilled units, and affix the licensed agency digital QR stamp.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  Generate & Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
