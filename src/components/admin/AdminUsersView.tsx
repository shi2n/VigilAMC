'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Check,
  X,
  Mail,
  Building2,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface AdminUsersViewProps {
  currentUser?: any;
  company?: any;
}

export function AdminUsersView({ currentUser, company }: AdminUsersViewProps) {
  const [activeTab, setActiveTab] = useState<'USERS' | 'PERMISSIONS'>('USERS');

  const permissionsMatrix = [
    { module: 'Subscription & Billing Management', admin: true, tech: false },
    { module: 'Manage Plan (Upgrade / Downgrade)', admin: true, tech: false },
    { module: 'Add / Edit / Deactivate Technicians', admin: true, tech: false },
    { module: 'Reset Technician Passwords', admin: true, tech: false },
    { module: 'Create & Manage Clients', admin: true, tech: false },
    { module: 'Create & Manage Buildings / Towers', admin: true, tech: false },
    { module: 'Add & Batch Generate Fire Assets & QRs', admin: true, tech: false },
    { module: 'Assign Technicians to Facilities', admin: true, tech: false },
    { module: 'Assign & Dispatch Work Orders', admin: true, tech: false },
    { module: 'Audit Log & Activity Inspection', admin: true, tech: false },
    { module: 'Access Technician Mobile Scanner', admin: true, tech: true },
    { module: 'Perform Field Safety Inspections', admin: true, tech: true },
    { module: 'Update Equipment Service Status & Dates', admin: true, tech: true },
    { module: 'Upload Field Photos & Inspection Notes', admin: true, tech: true },
    { module: 'Complete Assigned Work Orders', admin: true, tech: true },
    { module: 'View Assigned Facility Inventory', admin: true, tech: true },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'USERS'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Agency Administrators</span>
        </button>

        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'PERMISSIONS'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Roles &amp; Permissions Matrix</span>
        </button>
      </div>

      {activeTab === 'USERS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Agency Administrators</h3>
              <p className="text-xs text-slate-400">
                Accounts with administrative oversight, billing control, and technician seat management.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Agency Master Account
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Agency Admin'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950">
                      PRIMARY ADMIN
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentUser?.email || 'admin@agency.com'}</span>
                    <span>•</span>
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{company?.name || 'Vigil Fire Solutions'}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                ACTIVE &bull; VERIFIED
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PERMISSIONS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 bg-slate-950/70">
            <h3 className="text-base font-bold text-white">Role-Based Access Control Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict multi-tenant security architecture separating administrative operations from field execution.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-5">Capability / Function</th>
                  <th className="py-3 px-5 text-center w-36">Agency Admin</th>
                  <th className="py-3 px-5 text-center w-36">Field Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {permissionsMatrix.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-5 font-medium">{item.module}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      {item.tech ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-800 text-slate-500 border border-slate-700">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
