"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { ShieldCheck, Plus, Building2, User, Mail, Phone, CheckCircle2, Lock, X } from "lucide-react";

interface Masjid {
  id: string;
  name: string;
  location: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  adminPermissions: Array<{
    masjidId: string;
    masjid: { name: string };
    canAccessMainPage: boolean;
    canAccessDocuments: boolean;
    canAccessDonations: boolean;
    canAccessRolesPermissions: boolean;
    canAccessProperties: boolean;
    canAccessTenants: boolean;
    canAccessMembers: boolean;
    canAccessStaff: boolean;
    canAccessEvents: boolean;
    canAccessAnnouncements: boolean;
  }>;
}

export default function SuperAdminAdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedMasjidId, setSelectedMasjidId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAdminsAndMasjids = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/data");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
        setMasjids(data.masjids || []);
        if (data.masjids?.length > 0) setSelectedMasjidId(data.masjids[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminsAndMasjids();
  }, []);

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedMasjidId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          masjidId: selectedMasjidId,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setEmail("");
        setPhone("");
        fetchAdminsAndMasjids();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save admin.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-bold flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-[#BF8B36]" /> Admin Management & Permission Assignment
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Create Masjid Administrators and assign them to specific Masjid institutions.
            </p>
          </div>

          <button
            onClick={() => {
              setAdminId(null);
              setName("");
              setEmail("");
              setPhone("");
              setSelectedMasjidId(masjids.length > 0 ? masjids[0].id : "");
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>
        </div>

        {/* Admins & Permissions Matrix */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading administrators...</div>
        ) : admins.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No Masjid Admins created yet.
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                  <tr>
                    <th className="px-5 py-4">Admin Name</th>
                    <th className="px-5 py-4">Assigned Masjid</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {admins.map((adm) => {
                    const perm = adm.adminPermissions?.[0];
                    return (
                      <tr key={adm.id} className="hover:bg-[#F8F6F0]/80 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#181E1A]">{adm.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{adm.email}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#194331]">
                          {perm?.masjid?.name || "Unassigned"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setAdminId(adm.id);
                              setName(adm.name);
                              setEmail(adm.email);
                              setPhone(adm.phone || "");
                              if (perm) {
                                setSelectedMasjidId(perm.masjidId);
                              } else {
                                setSelectedMasjidId(masjids.length > 0 ? masjids[0].id : "");
                              }
                              setShowModal(true);
                            }}
                            className="text-[11px] font-bold text-[#BF8B36] hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Admin & Configure Permissions */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">
                  {adminId ? "Edit Admin & Permissions" : "Create Admin & Assign Permissions"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdmin} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maulana Mohammed"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!!adminId}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin.jama@mosque.org"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Assigned Masjid</label>
                  <select
                    value={selectedMasjidId}
                    onChange={(e) => setSelectedMasjidId(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#194331]"
                  >
                    {masjids.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
                    ))}
                  </select>
                </div>



                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Admin & Permissions"}
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
