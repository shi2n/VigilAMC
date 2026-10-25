'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Plus,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { compressImageToDataUrl, uploadCompressedPhoto } from '@/lib/compressImage';

interface InspectionsViewProps {
  showToast: (msg: string) => void;
  onOpenImport?: () => void;
  initialInspections?: any[];
  buildings?: any[];
  equipments?: any[];
  onRefreshDashboard?: () => Promise<void> | void;
}

export function InspectionsView({
  showToast,
  onOpenImport,
  initialInspections,
  buildings = [],
  equipments = [],
  onRefreshDashboard,
}: InspectionsViewProps) {
  const [inspections, setInspections] = useState<any[]>(initialInspections || []);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'SERVICE_REQUIRED'>('ALL');
  const [search, setSearch] = useState('');

  // Record Inspection Modal state (with Cloudflare R2 WebP photo upload)
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    buildingId: '',
    equipmentId: '',
    status: 'PASSED',
    remarks: '',
    technicianName: '',
    photoUrl: '',
  });

  // Keep in sync with parent bootstrap state immediately
  useEffect(() => {
    if (Array.isArray(initialInspections)) {
      setInspections(initialInspections);
    }
  }, [initialInspections]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      if (onRefreshDashboard) {
        await onRefreshDashboard();
      } else {
        const res = await fetch('/api/inspections');
        const json = await res.json();
        if (res.ok) {
          setInspections(json.inspections || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialInspections) {
      fetchInspections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInspectionPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const previewUrl = await compressImageToDataUrl(file, {
        maxDimension: 1280,
        quality: 0.75,
        mimeType: 'image/webp',
      });
      setInspectionForm((prev) => ({ ...prev, photoUrl: previewUrl }));

      const uploaded = await uploadCompressedPhoto(file, 'inspections', {
        maxDimension: 1280,
        quality: 0.75,
        mimeType: 'image/webp',
      });
      setInspectionForm((prev) => ({ ...prev, photoUrl: uploaded.url }));
      showToast(`Inspection photo uploaded to R2 CDN (${Math.round(uploaded.sizeBytes / 1024)} KB WebP)!`);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Failed to upload inspection photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionForm.buildingId) {
      showToast('Please select a facility');
      return;
    }
    try {
      setSubmittingInspection(true);
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionForm),
      });
      const json = await res.json();
      if (res.ok) {
        showToast('Field inspection logged & synced!');
        setRecordModalOpen(false);
        setInspectionForm({
          buildingId: '',
          equipmentId: '',
          status: 'PASSED',
          remarks: '',
          technicianName: '',
          photoUrl: '',
        });
        await fetchInspections();
      } else {
        showToast(json.error || 'Failed to record inspection');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  const parseFirstPhotoUrl = (ins: any): string | null => {
    if (!ins?.photos) return null;
    if (Array.isArray(ins.photos) && ins.photos.length > 0) return ins.photos[0];
    if (typeof ins.photos === 'string') {
      try {
        const parsed = JSON.parse(ins.photos);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {
        if (ins.photos.startsWith('http') || ins.photos.startsWith('data:image/')) {
          return ins.photos;
        }
      }
    }
    return null;
  };

  const filteredInspections = inspections.filter((ins) => {
    const matchesSearch =
      (ins.building?.name && ins.building.name.toLowerCase().includes(search.toLowerCase())) ||
      (ins.technicianName && ins.technicianName.toLowerCase().includes(search.toLowerCase())) ||
      (ins.equipment?.qrCode && ins.equipment.qrCode.toLowerCase().includes(search.toLowerCase())) ||
      (ins.equipment?.type && ins.equipment.type.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || ins.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const matchingEquipments = inspectionForm.buildingId
    ? equipments.filter((eq: any) => eq.buildingId === inspectionForm.buildingId)
    : equipments;

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel-dense p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility, equipment ID, technician..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#FED7AA] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C2410C] shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#C2410C] text-white shadow-sm '
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({inspections.length})
            </button>
            <button
              onClick={() => setStatusFilter('PASSED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'PASSED'
                  ? 'bg-emerald-600 text-white shadow-sm '
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Passed ({inspections.filter((i) => i.status === 'PASSED').length})
            </button>
            <button
              onClick={() => setStatusFilter('SERVICE_REQUIRED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'SERVICE_REQUIRED'
                  ? 'bg-amber-500 text-white shadow-sm '
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Action Needed ({inspections.filter((i) => i.status === 'SERVICE_REQUIRED' || i.status === 'FAILED').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Inspection</span>
          </button>

          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#C2410C] bg-[#FFF0E6] hover:bg-[#FED7AA] border border-[#C2410C]/30 transition-all"
              title="Import Inspections from Excel (.xlsx)"
            >
              <span>Import Inspections</span>
            </button>
          )}

          <button
            onClick={fetchInspections}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Refresh Inspections"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C2410C]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Inspections Table / List */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
        {filteredInspections.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Inspections Recorded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Field inspections logged with photo evidence and GPS coordinates will automatically synchronize here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#FED7AA] bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Facility</th>
                  <th className="py-3.5 px-4">Equipment ID</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Photo Proof</th>
                  <th className="py-3.5 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInspections.map((ins) => {
                  const thumb = parseFirstPhotoUrl(ins);
                  return (
                    <tr key={ins.id} className="hover:bg-[#FFF0E6]/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                        {new Date(ins.date || ins.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {ins.building?.name || 'Facility'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[#C2410C] font-bold">{ins.equipment?.qrCode || 'Asset'}</span>
                          <span className="text-[10px] text-slate-400">({ins.equipment?.type || 'Extinguisher'})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {ins.technicianName || ins.technician?.fullName || 'Field Technician'}
                      </td>
                      <td className="py-3.5 px-4">
                        {ins.status === 'PASSED' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                            PASSED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                            {ins.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {thumb ? (
                          <a
                            href={thumb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#C2410C] hover:underline font-semibold"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt="Inspection evidence"
                              className="w-7 h-7 rounded object-cover border border-slate-200"
                            />
                            <span className="text-[10px]">R2 Proof</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">{ins.overallCondition || 'GOOD'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ins.building?.id && (
                          <Link
                            href={`/report/${ins.building.id}`} target="_blank" rel="noopener noreferrer"
                            className="text-[#C2410C] hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <span>Form-B</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Inspection Modal with R2 WebP Photo Upload */}
      {recordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#FED7AA] text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base">Record Field Inspection</h3>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Facility / Building *</label>
                <select
                  required
                  value={inspectionForm.buildingId}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, buildingId: e.target.value, equipmentId: '' })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
                >
                  <option value="">Select Facility...</option>
                  {buildings.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Equipment Asset (Optional)</label>
                <select
                  value={inspectionForm.equipmentId}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, equipmentId: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
                >
                  <option value="">General Facility Inspection</option>
                  {matchingEquipments.map((eq: any) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.qrCode} — {eq.type} ({eq.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Inspection Result</label>
                  <select
                    value={inspectionForm.status}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, status: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
                  >
                    <option value="PASSED">PASSED (Compliant)</option>
                    <option value="SERVICE_REQUIRED">SERVICE REQUIRED</option>
                    <option value="FAILED">FAILED (Defective)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700">Technician Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rakesh Sharma"
                    value={inspectionForm.technicianName}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, technicianName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Remarks / Reading Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Gauge 14.2 Bar green zone, safety pin & seal intact"
                  value={inspectionForm.remarks}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, remarks: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">
                  Photo Evidence (Auto-compressed WebP &rarr; Cloudflare R2)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200">
                    <Camera className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>{uploadingPhoto ? 'Uploading photo...' : 'Attach Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInspectionPhotoChange}
                      className="hidden"
                    />
                  </label>
                  {inspectionForm.photoUrl && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={inspectionForm.photoUrl}
                        alt="Inspection preview"
                        className="w-9 h-9 rounded-lg object-cover border border-slate-300 shadow-xs"
                      />
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {uploadingPhoto ? 'Uploading...' : 'R2 CDN Ready'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto || submittingInspection}
                  className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-bold shadow-xs transition-all"
                >
                  {submittingInspection ? 'Saving...' : 'Save Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
