'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Check,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  ShieldCheck,
  X,
  ChevronRight,
  Flame
} from 'lucide-react';

interface TechnicianAssignmentsProps {
  showToast: (msg: string) => void;
}

export function TechnicianAssignments({ showToast }: TechnicianAssignmentsProps) {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Assign modal state
  const [assignModalBuilding, setAssignModalBuilding] = useState<any | null>(null);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [techRes, bldRes] = await Promise.all([
        fetch('/api/admin/technicians'),
        fetch('/api/admin/buildings'),
      ]);

      const techJson = await techRes.json();
      const bldJson = await bldRes.json();

      setTechnicians(techJson.technicians || []);
      setBuildings(bldJson.buildings || []);
    } catch (e) {
      console.error(e);
      showToast('Error loading assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (building: any) => {
    setAssignModalBuilding(building);
    const currentlyAssigned = technicians
      .filter((t) => t.assignedBuildings?.some((b: any) => b.id === building.id))
      .map((t) => t.id);
    setSelectedTechIds(currentlyAssigned);
  };

  const handleSaveAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalBuilding) return;
    setSaving(true);

    try {
      await Promise.all(
        technicians.map((t) => {
          const isSelected = selectedTechIds.includes(t.id);
          const currentBuildingIds = (t.assignedBuildings || []).map((b: any) => b.id);
          const hasThisBuilding = currentBuildingIds.includes(assignModalBuilding.id);

          if (isSelected && !hasThisBuilding) {
            const updated = [...currentBuildingIds, assignModalBuilding.id];
            return fetch(`/api/admin/technicians/${t.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assignedBuildingIds: updated }),
            });
          } else if (!isSelected && hasThisBuilding) {
            const updated = currentBuildingIds.filter((id: string) => id !== assignModalBuilding.id);
            return fetch(`/api/admin/technicians/${t.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assignedBuildingIds: updated }),
            });
          }
          return Promise.resolve();
        })
      );

      showToast(`Facility assignments updated for ${assignModalBuilding.name}`);
      setAssignModalBuilding(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error updating assignments');
    } finally {
      setSaving(false);
    }
  };

  const filteredBuildings = buildings.filter((b) => {
    return (
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.client?.name && b.client.name.toLowerCase().includes(search.toLowerCase())) ||
      b.address.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DCE7F2] shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility by name, client, address..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE7F2] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007DB8] shadow-sm  dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors  dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400 dark:hover:text-white"
          title="Refresh Assignments"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#007DB8]' : ''}`} />
        </button>
      </div>

      {/* Buildings Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && buildings.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 space-y-3 dark:text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#007DB8] mx-auto" />
            <p className="text-sm font-semibold">Loading assignments matrix...</p>
          </div>
        ) : filteredBuildings.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 dark:text-slate-400">
            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No facilities found</p>
          </div>
        ) : (
          filteredBuildings.map((building) => {
            const assignedTechs = technicians.filter((t) =>
              t.assignedBuildings?.some((b: any) => b.id === building.id)
            );

            return (
              <div
                key={building.id}
                className="bg-white border border-[#DCE7F2] rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#007DB8]/40 transition-colors dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-xl dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{building.name}</h4>
                    <p className="text-xs text-[#007DB8] font-medium dark:text-amber-400">{building.client?.name || 'Client'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{building.address}</span>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF6FF] text-[#007DB8] border border-[#007DB8]/30 shrink-0  dark:text-slate-300 dark:border-slate-800">
                    {building.totalEquipments || building.equipments?.length || 0} Assets
                  </span>
                </div>

                {/* Assigned Technicians list */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Assigned Technicians ({assignedTechs.length})
                    </span>
                    <button
                      onClick={() => openAssignModal(building)}
                      className="text-[#007DB8] hover:underline font-bold text-xs flex items-center gap-1 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {assignedTechs.length > 0 ? (
                      assignedTechs.map((tech) => (
                        <span
                          key={tech.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700  dark:border-slate-800 dark:text-slate-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="font-medium">{tech.fullName}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Unrestricted (Accessible by all technicians)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ASSIGN TECHNICIANS TO FACILITY */}
      {assignModalBuilding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE7F2] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7F2] dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-[#023E8A] dark:text-white">Assign Technicians</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{assignModalBuilding.name}</p>
              </div>
              <button
                onClick={() => setAssignModalBuilding(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignments} className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Select which field technicians are authorized to access and perform inspections at this facility:
              </p>

              <div className="max-h-56 overflow-y-auto bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1  dark:border-slate-800">
                {technicians.length === 0 ? (
                  <p className="p-3 text-center text-slate-400 text-xs">No active technicians available.</p>
                ) : (
                  technicians.map((tech) => (
                    <label
                      key={tech.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTechIds.includes(tech.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTechIds([...selectedTechIds, tech.id]);
                            } else {
                              setSelectedTechIds(selectedTechIds.filter((id) => id !== tech.id));
                            }
                          }}
                          className="rounded text-[#007DB8] focus:ring-[#007DB8] border-slate-300 dark:bg-slate-900"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{tech.fullName}</span>
                          <span className="text-[10px] text-slate-500">{tech.email}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          tech.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        {tech.status}
                      </span>
                    </label>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalBuilding(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#007DB8] to-[#073F8F] hover:from-[#006494] hover:to-[#011F48] text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Assignments</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
