"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { ShieldCheck, UserX, Search, Plus, ExternalLink, Mail, Phone, Eye, UserPlus, Edit2, Trash2, Building2 } from "lucide-react";
import Link from "next/link";

export default function SuperAdminMasjidsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/data");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevokeAccess = async (userId: string) => {
    if (!confirm("Are you sure you want to suspend this admin?")) return;
    try {
      const res = await fetch("/api/super-admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isApproved: false }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAccess = async (userId: string) => {
    try {
      const res = await fetch("/api/super-admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isApproved: true }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this admin? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/super-admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete admin.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting admin.");
    }
  };

  const filteredAdmins = admins.filter((a) => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.customId && a.customId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const approvedAdmins = filteredAdmins.filter(a => a.isApproved !== false && !a.isSuspended);
  const suspendedAdmins = filteredAdmins.filter(a => a.isApproved === false || a.isSuspended);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminId || !newPassword) return;
    
    setIsUpdatingPassword(true);
    try {
      const res = await fetch(`/api/super-admin/users/${editingAdminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        alert("Password updated successfully.");
        setIsPasswordModalOpen(false);
        setNewPassword("");
      } else {
        alert("Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 text-left pb-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold">
              Masjids Admin Directory
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Masjids & Administrator Governance
            </p>
          </div>
          
          <Link 
            href="/masjids" 
            target="_blank"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 border border-[#E5DFD3] bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Directory
          </Link>
        </div>

        {/* Search & Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Admin Name, Email, or Masjid Name..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-xs focus:outline-none focus:border-[#BF8B36] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span>{approvedAdmins.length} Approved · {suspendedAdmins.length} Suspended</span>
            <Link 
              href="/super-admin/admins"
              className="flex items-center gap-1.5 bg-[#194331] text-white hover:bg-[#113224] px-4 py-2.5 rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Admin
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading directory...</div>
        ) : (
          <div className="space-y-6">
            
            {/* Approved Admins Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-serif text-lg font-bold text-[#181E1A]">Approved Admins <span className="text-slate-400 text-base">({approvedAdmins.length})</span></h2>
                </div>
                
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg">
                    <ShieldCheck className="w-3 h-3" /> Active Admins <span className="bg-emerald-200 px-1 rounded-md">{approvedAdmins.length}</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-lg">
                    <Building2 className="w-3 h-3" /> Assigned Masjids <span className="bg-blue-200 px-1 rounded-md">{approvedAdmins.filter(a => a.adminPermissions?.length > 0).length}</span>
                  </span>
                </div>
              </div>

              <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                      <tr>
                        <th className="px-4 py-2.5">User ID</th>
                        <th className="px-4 py-2.5">User Details</th>
                        <th className="px-4 py-2.5">Contact Info</th>
                        <th className="px-4 py-2.5 text-center">Approval Status</th>
                        <th className="px-4 py-2.5 text-center">Assigned Role</th>
                        <th className="px-4 py-2.5 text-center">Password</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {approvedAdmins.map(admin => (
                        <tr key={admin.id} className="hover:bg-[#F8F6F0]/50 transition">
                          <td className="px-4 py-2.5">
                            <span className="bg-black text-white px-2.5 py-0.5 rounded-lg font-mono font-bold tracking-wider text-[11px]">{admin.customId || "N/A"}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="font-bold text-[#194331] text-xs">{admin.name}</p>
                            <p className="text-[9.5px] text-slate-400 font-medium">Joined: {new Date(admin.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            {admin.adminPermissions?.[0]?.masjid && (
                              <Link href={`/api/scope?masjidId=${admin.adminPermissions[0].masjid.id}&redirect=/`} target="_blank" className="flex items-center gap-1 text-[9.5px] font-bold text-[#BF8B36] hover:underline mt-0.5">
                                <Building2 className="w-3 h-3" /> View Masjid ({admin.adminPermissions[0].masjid.name})
                              </Link>
                            )}
                          </td>
                          <td className="px-4 py-2.5 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                              <Mail className="w-3 h-3" /> {admin.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                              <Phone className="w-3 h-3" /> {admin.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 border border-emerald-500 text-emerald-600 font-bold text-[9px] tracking-widest rounded-md uppercase">APPROVED</span>
                              <button onClick={() => handleRevokeAccess(admin.id)} className="mt-0.5 text-[9px] font-bold text-red-500 hover:underline">Revoke Access</button>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 font-bold rounded-lg text-[10px]">Masjid Admin</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                              {visiblePasswords[admin.id] ? (
                                <span className="font-mono text-slate-700 tracking-normal text-[10px]">{admin.plainPassword || "Not Stored"}</span>
                              ) : (
                                <span className="tracking-widest text-xs">••••••••</span>
                              )}
                              <Eye 
                                onClick={() => togglePasswordVisibility(admin.id)}
                                className={`w-3 h-3 cursor-pointer transition ${visiblePasswords[admin.id] ? "text-emerald-600" : "hover:text-slate-600"}`} 
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 text-slate-400">
                              <button onClick={() => { setEditingAdminId(admin.id); setIsPasswordModalOpen(true); }} className="p-1 hover:text-[#BF8B36] hover:bg-[#FBF4E4] rounded-lg transition" title="Edit Password"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteAdmin(admin.id)} className="p-1 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {approvedAdmins.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs font-mono">No approved admins found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Suspended Accounts Section */}
            {suspendedAdmins.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 mt-8">
                  <div className="flex items-center gap-2">
                    <UserX className="w-6 h-6 text-amber-500" />
                    <h2 className="font-serif text-xl font-bold text-[#181E1A]">Suspended Accounts <span className="text-slate-400 text-lg">({suspendedAdmins.length})</span></h2>
                  </div>
                
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-lg">
                    <UserX className="w-3 h-3" /> Suspended Admins <span className="bg-amber-200 px-1.5 rounded-md">{suspendedAdmins.length}</span>
                  </span>
                </div>
              </div>

              <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                      <tr>
                        <th className="px-5 py-4">User ID</th>
                        <th className="px-5 py-4">User Details</th>
                        <th className="px-5 py-4">Contact Info</th>
                        <th className="px-5 py-4 text-center">Approval Status</th>
                        <th className="px-5 py-4 text-center">Assigned Role</th>
                        <th className="px-5 py-4 text-center">Password</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {suspendedAdmins.map(admin => (
                        <tr key={admin.id} className="hover:bg-[#F8F6F0]/50 transition opacity-80">
                          <td className="px-5 py-4">
                            <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-mono font-bold tracking-wider">{admin.customId || "N/A"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800 text-sm">{admin.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium mb-1">Joined: {new Date(admin.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            {admin.adminPermissions?.[0]?.masjid && (
                              <Link href={`/api/scope?masjidId=${admin.adminPermissions[0].masjid.id}&redirect=/`} target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:underline">
                                <Building2 className="w-3 h-3" /> View Masjid ({admin.adminPermissions[0].masjid.name})
                              </Link>
                            )}
                          </td>
                          <td className="px-5 py-4 space-y-1">
                            <div className="flex items-center gap-2 text-slate-600 font-mono">
                              <Mail className="w-3.5 h-3.5" /> {admin.email}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-mono">
                              <Phone className="w-3.5 h-3.5" /> {admin.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="px-3 py-1 border border-red-500 text-red-600 font-bold text-[10px] tracking-widest rounded-md uppercase">SUSPENDED</span>
                              <button onClick={() => handleApproveAccess(admin.id)} className="mt-1.5 text-[10px] font-bold text-emerald-600 hover:underline">Restore Access</button>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 font-bold rounded-lg text-[11px]">Masjid Admin</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                              <span className="tracking-widest">••••••••</span>
                              <Eye className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-slate-400">
                              <button onClick={() => handleApproveAccess(admin.id)} className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Approve"><ShieldCheck className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteAdmin(admin.id)} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {suspendedAdmins.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs font-mono">No suspended accounts.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            )}
            
          </div>
        )}
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full z-10">
            <h3 className="font-serif text-xl font-bold text-[#181E1A] mb-4">Reset Password</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#BF8B36]"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 text-xs hover:bg-[#F8F6F0] transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingPassword} className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer">
                  {isUpdatingPassword ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
