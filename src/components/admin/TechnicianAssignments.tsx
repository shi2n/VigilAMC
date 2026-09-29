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
    // Find which technicians are currently assigned to this building
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
      // For each technician, update their assignedBuildingIds list
      await Promise.all(
        technicians.map((t) => {
          const isSelected = selectedTechIds.includes(t.id);
          const currentBuildingIds = (t.assignedBuildings || []).map((b: any) => b.id);
          const hasThisBuilding = currentBuildingIds.includes(assignModalBuilding.id);

          if (isSelected && !hasThisBuilding) {
            // Add building to this tech
            const updated = [...currentBuildingIds, assignModalBuilding.id];
            return fetch(`/api/admin/technicians/${t.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assignedBuildingIds: updated }),
            });
          } else if (!isSelected && hasThisBuilding) {
            // Remove building from this tech
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

      showToast(`Updated technician assignments for ${assignModalBuilding.name}`);
      setAssignModalBuilding(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save assignments');
    } finally {
      setSaving(false);
    }
  };

  const filteredBuildings = buildings.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.client?.name && b.client.name.toLowerCase().includes(search.toLowerCase())) ||
    (b.address && b.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility by name, client, address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Refresh Assignments"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Buildings Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && buildings.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-sm font-semibold">Loading assignments matrix...</p>
          </div>
        ) : filteredBuildings.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No facilities found</p>
          </div>
        ) : (
          filteredBuildings.map((building) => {
            const assignedTechs = technicians.filter((t) =>
              t.assignedBuildings?.some((b: any) => b.id === building.id)
            );

            return (
              <div
                key={building.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{building.name}</h4>
                    <p className="text-xs text-amber-400 font-medium">{building.client?.name || 'Client'}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{building.address}</span>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950 text-slate-300 border border-slate-800 shrink-0">
                    {building.totalEquipments || building.equipments?.length || 0} Assets
                  </span>
                </div>

                {/* Assigned Technicians list */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Assigned Technicians ({assignedTechs.length})
                    </span>
                    <button
                      onClick={() => openAssignModal(building)}
                      className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1"
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
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="font-medium">{tech.fullName}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">
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

      {/* =========================================================================
          MODAL: ASSIGN TECHNICIANS TO FACILITY
      ========================================================================= */}
      {assignModalBuilding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Assign Technicians</h3>
                <p className="text-xs text-slate-400">{assignModalBuilding.name}</p>
              </div>
              <button
                onClick={() => setAssignModalBuilding(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignments} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Select which field technicians are authorized to access and perform inspections at this facility:
              </p>

              <div className="max-h-56 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                {technicians.length === 0 ? (
                  <p className="p-3 text-center text-slate-500 text-xs">No active technicians available.</p>
                ) : (
                  technicians.map((tech) => (
                    <label
                      key={tech.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white"
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
                          className="rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-900"
                        />
                        <div>
                          <span className="font-bold text-white block">{tech.fullName}</span>
                          <span className="text-[10px] text-slate-500">{tech.email}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          tech.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
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
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50 flex items-center gap-1.5"
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
