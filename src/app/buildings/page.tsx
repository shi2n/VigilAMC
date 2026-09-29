'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ShieldAlert,
  Flame,
  FileCheck2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { getNocStatus } from '@/lib/compliance';

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [newModalOpen, setNewModalOpen] = useState(false);

  // New building form state
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: 'New Delhi',
    pincode: '110001',
    occupancyType: 'Commercial',
    totalFloors: 10,
    basements: 1,
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    fireNocNumber: '',
    nocAuthority: 'Delhi Fire Service (DFS)',
    nocExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/buildings');
      const data = await res.json();
      setBuildings(data.buildings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setNewModalOpen(false);
        fetchBuildings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBuildings = buildings.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.fireNocNumber.toLowerCase().includes(search.toLowerCase());

    const matchType = filterType === 'ALL' || b.occupancyType.toLowerCase().includes(filterType.toLowerCase());
    return matchSearch && matchType;
  });

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Client Buildings & Facilities
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {buildings.length} Sites
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage multi-floor extinguisher registries, Fire NOC deadlines, and AMC service coverage.
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Building</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by building name, address, NOC number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Commercial">Commercial IT / Offices</option>
            <option value="Residential">Residential High-Rise</option>
            <option value="Hospital">Hospital / Healthcare</option>
            <option value="Mall">Mall / Retail</option>
          </select>
        </div>
      </div>

      {/* Buildings Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : filteredBuildings.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#0d1322] border border-slate-800 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No buildings found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new building.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBuildings.map((building) => {
            const noc = getNocStatus(building.nocExpiryDate);
            const totalAssets = building.assets?.length || 0;
            const operationalAssets = building.assets?.filter((a: any) => a.status === 'OPERATIONAL').length || 0;
            const healthPct = totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 100;

            return (
              <div
                key={building.id}
                className="bg-[#0d1322] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {building.occupancyType}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${noc.badgeClass}`}>
                      {noc.label}
                    </span>
                  </div>

                  {/* Title & Address */}
                  <Link href={`/buildings/${building.id}`}>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {building.name}
                    </h3>
                  </Link>

                  <div className="flex items-start gap-1.5 text-xs text-slate-400 mt-1 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{building.address}, {building.city} - {building.pincode}</span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Contact:</span>
                      <span className="font-medium truncate max-w-[170px]">{building.contactPerson}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Phone:</span>
                      <a href={`tel:${building.contactPhone}`} className="text-red-400 hover:underline">
                        {building.contactPhone}
                      </a>
                    </div>
                  </div>

                  {/* Extinguisher Stats */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-red-500" />
                        <span>{totalAssets} Extinguishers</span>
                      </span>
                      <span className={`text-xs ${healthPct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {healthPct}% Compliant
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${healthPct >= 90 ? 'bg-emerald-500' : healthPct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${healthPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Floors: {building.totalFloors} + {building.basements} Basements</span>
                      <span className="text-slate-500">NOC: {building.fireNocNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/assets/print-qr?buildingId=${building.id}`}
                    className="text-xs text-slate-400 hover:text-white font-medium"
                  >
                    Print Stickers
                  </Link>

                  <Link
                    href={`/buildings/${building.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    <span>View Assets & Floor Map</span>
                    <ArrowRight className="w-3 h-3 text-red-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Building Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-lg">Register New Client Building</h3>
              </div>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBuilding} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Building Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Heights Towers"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Occupancy Category *</label>
                  <select
                    value={form.occupancyType}
                    onChange={(e) => setForm({ ...form, occupancyType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Commercial">Commercial IT / Corporate Offices</option>
                    <option value="Residential">Residential Co-op Housing Society</option>
                    <option value="Hospital">Hospital / Healthcare / Clinic</option>
                    <option value="Mall">Shopping Mall / Multiplex</option>
                    <option value="Industrial">Industrial Plant / Warehouse</option>
                    <option value="Hotel">Hotel / Hospitality</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Plot number, Sector, Landmark"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Floors</label>
                  <input
                    type="number"
                    value={form.totalFloors}
                    onChange={(e) => setForm({ ...form, totalFloors: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Basements</label>
                  <input
                    type="number"
                    value={form.basements}
                    onChange={(e) => setForm({ ...form, basements: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Fire NOC Details */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Statutory Fire NOC Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Fire NOC Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NOC/DFS/2026/042"
                      value={form.fireNocNumber}
                      onChange={(e) => setForm({ ...form, fireNocNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Issuing Authority</label>
                    <input
                      type="text"
                      value={form.nocAuthority}
                      onChange={(e) => setForm({ ...form, nocAuthority: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">NOC Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={form.nocExpiryDate}
                      onChange={(e) => setForm({ ...form, nocExpiryDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="Secretary / Facility Head"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="office@building.com"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md"
                >
                  Create Building Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
