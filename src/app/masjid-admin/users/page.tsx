"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import {
  Users,
  Search,
  CheckCircle2,
  Trash2,
  RotateCcw,
  UserCheck,
  Eye,
  X,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface CommunityMusalli {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  customId: string | null;
  isApproved: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  masjid: {
    id: string;
    name: string;
    location: string;
    city: {
      name: string;
    } | null;
  } | null;
}

export default function MasjidAdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [users, setUsers] = useState<CommunityMusalli[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<CommunityMusalli | null>(null);
  const [userToDelete, setUserToDelete] = useState<CommunityMusalli | null>(null);
  const [userToRestore, setUserToRestore] = useState<CommunityMusalli | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("deleted", activeTab === "DELETED" ? "true" : "false");
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load community users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Soft Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(`delete-${userToDelete.id}`);
    try {
      const res = await fetch(`/api/admin/users?userId=${userToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setUserToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to remove user.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  // Restore
  const handleConfirmRestore = async () => {
    if (!userToRestore) return;
    setActionLoading(`restore-${userToRestore.id}`);
    try {
      const res = await fetch("/api/admin/users/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToRestore.id }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToRestore.id));
        setUserToRestore(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to restore user.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-10">
        {/* Header */}
        <div className="border-b border-[#E5DFD3] pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-3">
            <Users className="w-8 h-8 text-[#194331]" />
            <span>Community Users List</span>
          </h1>
          <p className="text-xs text-[#525E56] mt-1.5 leading-relaxed">
            Registered musallis and community members associated with your Masjid.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5DFD3] gap-2">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "ACTIVE"
                ? "border-[#194331] text-[#194331] bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Active Musallis</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTab === "ACTIVE" ? "bg-[#194331] text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {activeTab === "ACTIVE" ? users.length : "•"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("DELETED")}
            className={`px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "DELETED"
                ? "border-red-600 text-red-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-red-700"
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Deleted Users List</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTab === "DELETED" ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {activeTab === "DELETED" ? users.length : "•"}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 border border-[#E5DFD3] rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search community members by name, email, phone..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl text-xs focus:outline-none focus:border-[#BF8B36]"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono">Loading community members...</div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-16 text-center text-xs text-slate-400 font-mono">
            No {activeTab === "ACTIVE" ? "community musallis" : "deleted users"} found.
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-4">Musalli Name & ID</th>
                    <th className="px-5 py-4">Contact Info</th>
                    <th className="px-5 py-4">Status</th>
                    {activeTab === "ACTIVE" ? (
                      <>
                        <th className="px-5 py-4">Registered On</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-5 py-4">Deleted Info</th>
                        <th className="px-5 py-4 text-right">Restore Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8F6F0]/80 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#181E1A] text-sm">{u.name}</p>
                        <p className="text-[10.5px] text-[#BF8B36] font-mono font-bold">
                          {u.customId || u.id.substring(0, 8)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-[#194331]">{u.email}</p>
                        <p className="text-[11px] text-slate-500">{u.phone || "No phone added"}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#194331]" /> ACTIVE MUSALLI
                        </span>
                      </td>

                      {activeTab === "ACTIVE" ? (
                        <>
                          <td className="px-5 py-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewingUser(u)}
                                title="View Details"
                                className="p-1.5 text-slate-400 hover:text-[#194331] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setUserToDelete(u)}
                                title="Remove to Deleted Users List"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-red-700">
                              {u.deletedAt ? new Date(u.deletedAt).toLocaleDateString() : "Unknown"}
                            </p>
                            <p className="text-[11px] text-slate-500">By: {u.deletedBy || "Admin"}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setUserToRestore(u)}
                              disabled={actionLoading === `restore-${u.id}`}
                              className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Musalli</span>
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={() => setViewingUser(null)}></div>
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
              <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#181E1A]">Musalli Information</h3>
                  <p className="text-xs text-[#525E56] font-mono mt-0.5">{viewingUser.customId || viewingUser.id}</p>
                </div>
                <button onClick={() => setViewingUser(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Full Name</span>
                  <span className="font-bold text-[#181E1A] text-sm">{viewingUser.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Email</span>
                    <span className="font-medium text-[#194331] break-all">{viewingUser.email}</span>
                  </div>
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Phone</span>
                    <span className="font-medium text-slate-700">{viewingUser.phone || "Not provided"}</span>
                  </div>
                </div>

                <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Associated Masjid</span>
                  <span className="font-bold text-[#181E1A]">
                    {viewingUser.masjid?.name || "This Masjid"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={() => setUserToDelete(null)}></div>
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#181E1A]">Move to Deleted Users List?</h3>
                <p className="text-xs text-[#525E56] mt-1.5 leading-relaxed">
                  Are you sure you want to remove <strong className="text-[#181E1A]">{userToDelete.name}</strong> from your active community members? You can restore their profile at any time from the Deleted Users tab.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading !== null}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  {actionLoading ? "Removing..." : "Delete Member"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Modal */}
        {userToRestore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={() => setUserToRestore(null)}></div>
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#181E1A]">Restore Community Musalli?</h3>
                <p className="text-xs text-[#525E56] mt-1.5 leading-relaxed">
                  Restore <strong className="text-[#181E1A]">{userToRestore.name}</strong> back to your active musallis list?
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToRestore(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  disabled={actionLoading !== null}
                  className="flex-1 bg-[#194331] hover:bg-[#113224] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  {actionLoading ? "Restoring..." : "Restore Member"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
