"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { ShieldCheck, Check, X, ShieldAlert, Loader2 } from "lucide-react";

interface RoleItem {
  key: string;
  label: string;
}

interface RolePermissionMatrix {
  [permissionKey: string]: {
    [roleKey: string]: boolean;
  };
}

export default function SuperAdminRolesMatrixPage() {
  const categories = [
    {
      name: "GENERAL",
      permissions: [
        { key: "view_dashboard", label: "View Dashboard" },
        { key: "manage_profile", label: "Manage Profile" },
      ],
    },
    {
      name: "COMMITTEE",
      permissions: [
        { key: "manage_members", label: "Manage Members" },
        { key: "manage_announcements", label: "Manage Announcements" },
        { key: "manage_events", label: "Manage Events" },
        { key: "manage_media", label: "Manage Media" },
      ],
    },
    {
      name: "FINANCE",
      permissions: [
        { key: "manage_donations", label: "Manage Donations" },
        { key: "manage_finances", label: "Manage Finances" },
      ],
    },
    {
      name: "ADMINISTRATION",
      permissions: [
        { key: "manage_documents", label: "Manage Documents" },
        { key: "manage_staff", label: "Manage Staff" },
        { key: "manage_property", label: "Manage Property" },
        { key: "view_reports", label: "View Reports" },
        { key: "ads_buzz", label: "Ads Buzz" },
      ],
    },
  ];

  const [masjidsList, setMasjidsList] = useState<RoleItem[]>([]);
  const [matrix, setMatrix] = useState<RolePermissionMatrix>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Masjids and Matrix from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/super-admin/rbac");
        if (res.ok) {
          const data = await res.json();
          if (data.masjidsList) {
            setMasjidsList(data.masjidsList);
          }
          if (data.matrix) {
            setMatrix(data.matrix);
          }
        }
      } catch (err) {
        console.error("Failed to fetch RBAC data", err);
      } finally {
        setIsLoaded(true);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const saveMatrix = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/super-admin/rbac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      });
      if (res.ok) {
        setLastUpdated("Matrix saved successfully!");
      } else {
        setLastUpdated("Failed to save matrix.");
      }
    } catch (err) {
      console.error("Save error", err);
      setLastUpdated("Error saving matrix.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setLastUpdated(null), 3000);
    }
  };

  const togglePermission = (permKey: string, roleKey: string) => {
    setMatrix((prev) => {
      const currentRoleState = prev[permKey] || {};
      const newRoleState = !currentRoleState[roleKey];
      return {
        ...prev,
        [permKey]: {
          ...currentRoleState,
          [roleKey]: newRoleState,
        },
      };
    });
    setLastUpdated(`Unsaved changes. Please save when done.`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-[#194331]" /> Masjid Module Access Matrix
            </h1>
            <p className="text-xs text-[#525E56] mt-1 font-mono">
              Global Platform Governance & Feature Flags
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-3 py-1.5 rounded-xl text-xs font-bold font-mono inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#194331]" /> Enabled
            </span>
            <span className="bg-[#F0F2F1] text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold font-mono inline-flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-slate-400" /> Disabled
            </span>
            <button
              onClick={saveMatrix}
              disabled={isSaving || loading}
              className="bg-[#194331] hover:bg-[#113224] text-white disabled:bg-slate-300 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-2 ml-4 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Save Governance Matrix
            </button>
          </div>
        </div>

        {/* Section Instruction */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#F8F6F0] p-4 border border-[#E5DFD3] rounded-2xl">
          <div>
            <h2 className="font-serif text-base font-bold text-[#181E1A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#BF8B36]" /> Module Governance Matrix
            </h2>
            <p className="text-xs text-[#525E56] mt-0.5">
              Click any cell to toggle feature access for a specific Masjid.
            </p>
          </div>

          {lastUpdated && (
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl animate-fadeIn">
              ✓ {lastUpdated}
            </span>
          )}
        </div>

        {/* Interactive RBAC Matrix Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#BF8B36] animate-spin mb-4" />
            <p className="text-xs font-mono text-slate-400">Loading Masjids and Matrix...</p>
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="w-full">
              <table className="w-full text-xs text-left border-collapse table-fixed">
                <thead>
                  {/* Category Super Header */}
                  <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#181E1A] font-bold text-[9px] uppercase tracking-widest text-center">
                    <th className="px-3 py-3 w-[160px] sm:w-[200px] bg-white border-r border-[#E5DFD3]">
                      <span className="sr-only">Masjid Name</span>
                    </th>
                    {categories.map((cat) => (
                      <th key={cat.name} colSpan={cat.permissions.length} className="px-2 py-3 border-r border-[#E5DFD3] last:border-r-0 text-[#BF8B36] font-serif tracking-widest">
                        {cat.name}
                      </th>
                    ))}
                  </tr>
                  {/* Permissions Header */}
                  <tr className="bg-white border-b border-[#E5DFD3] text-[#525E56] font-mono text-[8.5px] sm:text-[9px] tracking-wider uppercase text-center">
                    <th className="px-3 py-3 sm:py-4 font-bold text-[#181E1A] text-left border-r border-[#E5DFD3]">
                      Masjid Name
                    </th>
                    {categories.flatMap(cat => cat.permissions).map((perm) => (
                      <th key={perm.key} className="px-1 py-3 sm:py-4 font-bold text-[#194331] leading-tight border-r border-[#E5DFD3]/50 last:border-r-0">
                        {perm.label.replace('Manage ', 'Manage\n')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]/60">
                  {masjidsList.length === 0 ? (
                    <tr>
                      <td colSpan={categories.flatMap(cat => cat.permissions).length + 1} className="px-5 py-12 text-center text-slate-400 text-xs font-mono bg-[#F8F6F0]/30">No registered masjids found.</td>
                    </tr>
                  ) : (
                    masjidsList.map((m) => (
                      <tr key={m.key} className="hover:bg-[#F8F6F0]/60 transition-colors group">
                        <td className="px-5 py-4 font-bold text-[#181E1A] border-r border-[#E5DFD3] bg-white group-hover:bg-[#F8F6F0]/60 transition-colors">
                          <span className="block truncate max-w-[150px]">{m.label}</span>
                        </td>
                        {categories.flatMap(cat => cat.permissions).map((perm) => {
                          const isGranted = !!matrix[perm.key]?.[m.key];
                          return (
                            <td key={perm.key} className="px-3 py-4 text-center border-r border-[#E5DFD3]/50 last:border-r-0">
                              <button
                                type="button"
                                onClick={() => togglePermission(perm.key, m.key)}
                                title={`${isGranted ? "Disable" : "Enable"} ${perm.label} for ${m.label}`}
                                className={`w-8 h-8 rounded-lg inline-flex items-center justify-center font-bold transition-all duration-300 cursor-pointer ${
                                  isGranted
                                    ? "bg-[#194331] text-white border border-[#194331] shadow-sm hover:bg-red-600 hover:border-red-600 hover:shadow-md hover:-translate-y-0.5"
                                    : "bg-white text-slate-300 border border-[#E5DFD3] shadow-2xs hover:border-[#BF8B36] hover:text-[#BF8B36] hover:bg-[#FBF4E4] hover:shadow-sm hover:-translate-y-0.5"
                                }`}
                              >
                                {isGranted ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[2.5]" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Bar */}
            <div className="bg-[#F8F6F0] px-5 py-3.5 border-t border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2 shrink-0">
              <p>Click any cell to toggle access</p>
              <p className="font-bold text-[#194331] bg-[#E6F0EB] px-3 py-1 rounded-lg border border-[#B7D4C5]">
                {categories.flatMap(cat => cat.permissions).length} modules • {masjidsList.length} masjids
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
