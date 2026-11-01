"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  RotateCcw,
  Building2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Eye,
  Filter,
  X,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  customId: string | null;
  isApproved: boolean;
  isSuspended: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  masjidId: string | null;
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

interface MasjidOption {
  id: string;
  name: string;
  city?: { name: string } | null;
}

export default function SuperAdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DELETED">("ACTIVE");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [masjids, setMasjids] = useState<MasjidOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMasjidId, setSelectedMasjidId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [userToRestore, setUserToRestore] = useState<AdminUser | null>(null);

  // Fetch available Masjids for filter
  const fetchMasjids = async () => {
    try {
      const res = await fetch("/api/masjids/available");
      if (res.ok) {
        const data = await res.json();
        setMasjids(data.masjids || []);
      }
    } catch (e) {
      console.error("Failed to load masjids list:", e);
    }
  };

  // Fetch users based on active tab and filters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("deleted", activeTab === "DELETED" ? "true" : "false");
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (selectedMasjidId) params.set("masjidId", selectedMasjidId);
      if (selectedRole) params.set("role", selectedRole);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasjids();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, selectedMasjidId, selectedRole]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle Soft Delete
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
        alert(data.error || "Failed to soft delete user.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Restore
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

  // Toggle user approval
  const handleToggleApproval = async (userId: string, currentApproved: boolean) => {
    const nextApproved = !currentApproved;
    setActionLoading(`approve-${userId}`);
    try {
      const res = await fetch("/api/super-admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isApproved: nextApproved }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isApproved: nextApproved } : u))
        );
      } else {
        alert("Failed to update approval status.");
      }
    } catch (err) {
      console.error(err);
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
            <span>Users List</span>
          </h1>
          <p className="text-xs text-[#525E56] mt-1.5 leading-relaxed">
            Manage all registered community musallis, Masjid administrators, and soft-deleted records across the digital network.
          </p>
        </div>

        {/* Tabs: Active Users vs Deleted Users List */}
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
            <span>Active Users</span>
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

        {/* Filter Bar */}
        <div className="bg-white p-4 border border-[#E5DFD3] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, ID..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl text-xs focus:outline-none focus:border-[#BF8B36]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter by Masjid */}
            <div className="relative min-w-[200px]">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMasjidId}
                onChange={(e) => setSelectedMasjidId(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#BF8B36] cursor-pointer"
              >
                <option value="">All Masjids</option>
                {masjids.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.city?.name ? `(${m.city.name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Role */}
            <div className="relative min-w-[140px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#BF8B36] cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="USER">Regular Users</option>
                <option value="MASJID_ADMIN">Masjid Admins</option>
                <option value="SUPER_ADMIN">Super Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono">
            Loading {activeTab === "ACTIVE" ? "active users" : "deleted users"}...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-16 text-center text-xs text-slate-400 font-mono">
            No {activeTab === "ACTIVE" ? "active" : "deleted"} users match your filters.
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-4">User & Identifier</th>
                    <th className="px-5 py-4">Contact Info</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Associated Masjid</th>
                    {activeTab === "ACTIVE" ? (
                      <>
                        <th className="px-5 py-4 text-center">Approval Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-5 py-4">Deletion Info</th>
                        <th className="px-5 py-4 text-right">Restore Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8F6F0]/80 transition">
                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#181E1A] text-sm">{u.name}</p>
                        <p className="text-[10.5px] text-[#BF8B36] font-mono font-bold">
                          {u.customId || u.id.substring(0, 8)}
                        </p>
                      </td>

                      {/* Contact Info */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#194331]">{u.email}</p>
                        <p className="text-[11px] text-slate-500">{u.phone || "No phone added"}</p>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : u.role === "MASJID_ADMIN"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-[#E6F0EB] text-[#194331] border-[#B7D4C5]"
                          }`}
                        >
                          {u.role.replace("_", " ")}
                        </span>
                      </td>

                      {/* Associated Masjid */}
                      <td className="px-5 py-4">
                        {u.masjid ? (
                          <div>
                            <p className="font-bold text-[#181E1A]">{u.masjid.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {u.masjid.city?.name || u.masjid.location || "City not set"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No Masjid Assigned</span>
                        )}
                      </td>

                      {/* ACTIVE TAB: Status & Actions */}
                      {activeTab === "ACTIVE" ? (
                        <>
                          <td className="px-5 py-4 text-center">
                            {u.isApproved ? (
                              <span className="bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-3 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#194331]" /> APPROVED
                              </span>
                            ) : (
                              <span className="bg-[#FBF4E4] text-[#BF8B36] border border-[#E5D2B0] px-3 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#BF8B36]" /> PENDING
                              </span>
                            )}
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
                                onClick={() => handleToggleApproval(u.id, u.isApproved)}
                                disabled={actionLoading === `approve-${u.id}`}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  u.isApproved
                                    ? "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800"
                                    : "bg-[#194331] text-white hover:bg-[#113224]"
                                }`}
                              >
                                {actionLoading === `approve-${u.id}`
                                  ? "..."
                                  : u.isApproved
                                  ? "Revoke"
                                  : "Approve"}
                              </button>

                              <button
                                onClick={() => setUserToDelete(u)}
                                title="Move to Deleted Users List"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        /* DELETED TAB: Deletion Info & Restore */
                        <>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-red-700">
                              {u.deletedAt ? new Date(u.deletedAt).toLocaleDateString() : "Unknown date"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              By: {u.deletedBy || "Administrator"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setUserToRestore(u)}
                              disabled={actionLoading === `restore-${u.id}`}
                              className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore User</span>
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

        {/* =========================================================================
            VIEW DETAILS MODAL
            ========================================================================= */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={() => setViewingUser(null)}></div>
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
              <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#181E1A]">User Details</h3>
                  <p className="text-xs text-[#525E56] font-mono mt-0.5">
                    {viewingUser.customId || viewingUser.id}
                  </p>
                </div>
                <button
                  onClick={() => setViewingUser(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
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
                    {viewingUser.masjid ? `${viewingUser.masjid.name} (${viewingUser.masjid.city?.name || viewingUser.masjid.location})` : "None"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Role</span>
                    <span className="font-mono font-bold text-slate-700">{viewingUser.role}</span>
                  </div>
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Registered On</span>
                    <span className="font-medium text-slate-700">
                      {new Date(viewingUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
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

        {/* =========================================================================
            CONFIRM DELETE MODAL
            ========================================================================= */}
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
                  Are you sure you want to remove <strong className="text-[#181E1A]">{userToDelete.name}</strong>? Their account will be moved to the <strong>Deleted Users List</strong>. You can restore it at any time.
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
                  {actionLoading ? "Removing..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CONFIRM RESTORE MODAL
            ========================================================================= */}
        {userToRestore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={() => setUserToRestore(null)}></div>
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#181E1A]">Restore User Account?</h3>
                <p className="text-xs text-[#525E56] mt-1.5 leading-relaxed">
                  Restore <strong className="text-[#181E1A]">{userToRestore.name}</strong> back to the active users list? Their community and donation access will be reinstated.
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
                  {actionLoading ? "Restoring..." : "Restore Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
