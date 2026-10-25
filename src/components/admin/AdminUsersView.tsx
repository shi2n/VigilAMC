'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Check,
  X,
  Mail,
  Building2,
} from 'lucide-react';

interface AdminUsersViewProps {
  currentUser?: any;
  userProfile?: any;
  company?: any;
}

export function AdminUsersView({ currentUser, userProfile, company }: AdminUsersViewProps) {
  const [activeTab, setActiveTab] = useState<'USERS' | 'PERMISSIONS'>('USERS');

  const rawFullName = userProfile?.fullName?.trim() || currentUser?.user_metadata?.full_name?.trim();
  const cleanFullName =
    rawFullName && rawFullName.toLowerCase() !== 'jordan michael' ? rawFullName : '';
  const emailPrefix = (userProfile?.email || currentUser?.email || '')?.split('@')[0] || '';
  const formattedFallback = emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : 'Agency Admin';
  const adminDisplayName = cleanFullName || formattedFallback;

  const permissionsMatrix = [
    { module: 'Subscription & Billing Management', admin: true, tech: false },
    { module: 'Manage Plan (Upgrade / Downgrade)', admin: true, tech: false },
    { module: 'Add / Edit / Deactivate Technicians', admin: true, tech: false },
    { module: 'Reset Technician Passwords', admin: true, tech: false },
    { module: 'Create & Manage Clients', admin: true, tech: false },
    { module: 'Create & Manage Buildings / Towers', admin: true, tech: false },
    { module: 'Add & Batch Generate Fire Assets & Schedules', admin: true, tech: false },
    { module: 'Assign Technicians to Facilities', admin: true, tech: false },
    { module: 'Assign & Dispatch Work Orders', admin: true, tech: false },
    { module: 'Audit Log & Activity Inspection', admin: true, tech: false },
    { module: 'Access Technician Mobile Form', admin: true, tech: true },
    { module: 'Perform Field Safety Inspections', admin: true, tech: true },
    { module: 'Update Equipment Service Status & Dates', admin: true, tech: true },
    { module: 'Upload Field Photos & Inspection Notes', admin: true, tech: true },
    { module: 'Complete Assigned Work Orders', admin: true, tech: true },
    { module: 'View Assigned Facility Inventory', admin: true, tech: true },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-[#FED7AA] gap-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'USERS'
              ? 'border-[#C2410C] text-[#C2410C]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Agency Administrators</span>
        </button>

        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'PERMISSIONS'
              ? 'border-[#C2410C] text-[#C2410C]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Roles &amp; Permissions Matrix</span>
        </button>
      </div>

      {activeTab === 'USERS' && (
        <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#FED7AA] bg-slate-50/80 flex items-center justify-between ">
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">Agency Administrators</h3>
              <p className="text-xs text-slate-500">
                Accounts with administrative oversight, billing control, and technician seat management.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF0E6] text-[#C2410C] border border-[#C2410C]/30">
              Agency Admin
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-[#FED7AA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2410C] to-[#1C1917] text-white flex items-center justify-center font-black shadow-md ">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {adminDisplayName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#C2410C] text-white ">
                      AGENCY ADMIN
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentUser?.email || userProfile?.email || 'admin@agency.com'}</span>
                    <span>•</span>
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company?.name || 'Vigil Fire Solutions'}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                ACTIVE &bull; VERIFIED
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PERMISSIONS' && (
        <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#FED7AA] bg-slate-50/80 ">
            <h3 className="text-base font-bold text-[#1C1917]">Role-Based Access Control Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict multi-tenant security architecture separating administrative operations from field execution.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#FED7AA] bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-5">Capability / Function</th>
                  <th className="py-3 px-5 text-center w-36">Agency Admin</th>
                  <th className="py-3 px-5 text-center w-36">Field Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {permissionsMatrix.map((item, i) => (
                  <tr key={i} className="hover:bg-[#FFF0E6]/80 transition-colors">
                    <td className="py-3 px-5 font-medium">{item.module}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-300">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      {item.tech ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-300">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-400 border border-slate-200">
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
