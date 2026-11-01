"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { ShieldCheck, Check, X, ShieldAlert, Plus, Trash2 } from "lucide-react";

interface RoleItem {
  key: string;
  label: string;
}

interface RolePermissionMatrix {
  [permissionKey: string]: {
    [roleKey: string]: boolean;
  };
}

export default function MasjidAdminRolesPage() {
  const initialRoles: RoleItem[] = [
    { key: "IMAM", label: "IMAM" },
    { key: "MUEZZIN", label: "MUEZZIN" },
    { key: "MUTAWALLI", label: "MUTAWALLI" },
    { key: "COMMITTEE_MEMBER", label: "COMMITTEE MEMBER" },
    { key: "ACCOUNTANT", label: "ACCOUNTANT" },
    { key: "LAWYER", label: "LAWYER" },
    { key: "ELECTRICIAN", label: "ELECTRICIAN" },
    { key: "PLUMBER", label: "PLUMBER" },
    { key: "WORKER", label: "WORKER" },
  ];

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
      ],
    },
  ];

  // All permissions start completely clean (0 permissions assigned)
  const initialMatrix: RolePermissionMatrix = {};

  const [rolesList, setRolesList] = useState<RoleItem[]>(initialRoles);
  const [matrix, setMatrix] = useState<RolePermissionMatrix>(initialMatrix);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (if updated by user)
  useEffect(() => {
    const savedRoles = localStorage.getItem("masjidRolesList");
    const savedMatrix = localStorage.getItem("masjidRolesMatrix");
    
    if (savedRoles) {
      try {
        setRolesList(JSON.parse(savedRoles));
      } catch (e) {
        console.error("Failed to parse saved roles");
      }
    }
    
    if (savedMatrix) {
      try {
        setMatrix(JSON.parse(savedMatrix));
      } catch (e) {
        console.error("Failed to parse saved matrix");
        setMatrix({});
      }
    } else {
      setMatrix({});
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("masjidRolesList", JSON.stringify(rolesList));
      localStorage.setItem("masjidRolesMatrix", JSON.stringify(matrix));
    }
  }, [rolesList, matrix, isLoaded]);

  // Modal State
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");

  const clearAllPermissions = () => {
    if (!confirm("Are you sure you want to clear all assigned permissions? All checkmarks will be removed.")) return;
    setMatrix({});
    localStorage.removeItem("masjidRolesMatrix");
    setLastUpdated("All permissions cleared successfully.");
    setTimeout(() => setLastUpdated(null), 3000);
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
    setLastUpdated(`Updated ${roleKey} permission.`);
    setTimeout(() => setLastUpdated(null), 2500);
  };

  const handleAddCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    const formattedKey = newRoleTitle.trim().toUpperCase().replace(/\s+/g, "_");
    const formattedLabel = newRoleTitle.trim().toUpperCase();

    if (rolesList.some((r) => r.key === formattedKey)) {
      alert("Role with this name already exists.");
      return;
    }

    const newRoleObj: RoleItem = { key: formattedKey, label: formattedLabel };
    setRolesList((prev) => [...prev, newRoleObj]);

    // Give default view_dashboard access to new role
    setMatrix((prev) => ({
      ...prev,
      view_dashboard: {
        ...(prev.view_dashboard || {}),
        [formattedKey]: true,
      },
    }));

    setNewRoleTitle("");
    setShowAddRoleModal(false);
    setLastUpdated(`Added new role "${formattedLabel}" to matrix.`);
    setTimeout(() => setLastUpdated(null), 2500);
  };

  const handleDeleteRole = (roleKeyToDelete: string, roleLabelToDelete: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleLabelToDelete}" from the RBAC Matrix?`)) return;

    setRolesList((prev) => prev.filter((r) => r.key !== roleKeyToDelete));

    // Remove role from matrix
    setMatrix((prev) => {
      const newMatrix: RolePermissionMatrix = {};
      Object.keys(prev).forEach((permKey) => {
        const { [roleKeyToDelete]: _, ...rest } = prev[permKey] || {};
        newMatrix[permKey] = rest;
      });
      return newMatrix;
    });

    setLastUpdated(`Deleted role "${roleLabelToDelete}" from matrix.`);
    setTimeout(() => setLastUpdated(null), 2500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-[#194331]" /> Role & Permission Matrix (RBAC)
            </h1>
            <p className="text-xs text-[#525E56] mt-1 font-mono">
              Staff Access Governance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Role</span>
            </button>
            <button
              onClick={clearAllPermissions}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Permissions</span>
            </button>
            <span className="bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-3 py-1.5 rounded-xl text-xs font-bold font-mono inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#194331]" /> Access Granted
            </span>
            <span className="bg-[#F0F2F1] text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold font-mono inline-flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-slate-400" /> No Access
            </span>
          </div>
        </div>

        {/* Section Instruction */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#F8F6F0] p-4 border border-[#E5DFD3] rounded-2xl">
          <div>
            <h2 className="font-serif text-base font-bold text-[#181E1A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#BF8B36]" /> Role & Permission Matrix
            </h2>
            <p className="text-xs text-[#525E56] mt-0.5">
              Click any cell to toggle access. Hover over column headers to delete custom roles.
            </p>
          </div>

          {lastUpdated && (
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl animate-fadeIn">
              ✓ {lastUpdated}
            </span>
          )}
        </div>

        {/* Interactive RBAC Matrix Table */}
        <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="w-full">
            <table className="w-full text-xs text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-mono text-[9px] sm:text-[10px] tracking-wider uppercase">
                  <th className="px-3 sm:px-5 py-4 w-[140px] sm:w-[180px] font-bold text-[#181E1A]">Permission</th>
                  {rolesList.map((r) => (
                    <th key={r.key} className="px-1 sm:px-2 py-4 text-center font-bold text-[#194331] group relative leading-tight break-words">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="max-w-full">{r.label}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(r.key, r.label)}
                          title={`Delete ${r.label} role`}
                          className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD3]/60">
                {categories.map((cat) => (
                  <React.Fragment key={cat.name}>
                    {/* Category Header Row */}
                    <tr className="bg-[#F8F6F0]/60">
                      <td
                        colSpan={rolesList.length + 1}
                        className="px-5 py-2.5 font-mono text-[10px] font-bold text-[#BF8B36] tracking-widest uppercase border-y border-[#E5DFD3]/60"
                      >
                        {cat.name}
                      </td>
                    </tr>

                    {/* Permission Rows */}
                    {cat.permissions.map((perm) => (
                      <tr key={perm.key} className="hover:bg-[#F8F6F0]/40 transition">
                        <td className="px-5 py-3.5 font-bold text-[#181E1A]">
                          {perm.label}
                        </td>
                        {rolesList.map((r) => {
                          const isGranted = !!matrix[perm.key]?.[r.key];
                          return (
                            <td key={r.key} className="px-3 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(perm.key, r.key)}
                                title={`${isGranted ? "Revoke" : "Grant"} ${perm.label} for ${r.label}`}
                                className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs ${
                                  isGranted
                                    ? "bg-[#194331] text-white hover:bg-red-700 hover:scale-105"
                                    : "bg-[#F0F2F1] text-slate-400 hover:bg-[#194331] hover:text-white hover:scale-105"
                                }`}
                              >
                                {isGranted ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[2]" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Matrix Footer Bar */}
          <div className="bg-[#F8F6F0] px-5 py-3 border-t border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
            <p>Hover a column header to delete a role • Click any cell to toggle access</p>
            <p className="font-bold text-[#194331]">12 permissions • {rolesList.length} roles</p>
          </div>
        </div>

        {/* Modal: Add Custom Role */}
        {showAddRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowAddRoleModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Add Custom Role</h3>
                <button onClick={() => setShowAddRoleModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomRole} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role Title / Designation</label>
                  <input
                    type="text"
                    required
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    placeholder="e.g. KHATEEB, SECURITY GUARD, YOUTH DIRECTOR..."
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] uppercase font-bold text-[#194331]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    This new role will instantly appear as a new column in your RBAC Matrix table.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRoleModal(false)}
                    className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Add Role to Matrix
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
