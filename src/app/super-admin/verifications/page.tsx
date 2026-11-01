"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import {
  ClipboardCheck,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Building2,
  Users,
  HeartHandshake,
  Megaphone,
  Calendar,
  Home,
  FileText,
  UserCheck,
  Clock,
  XCircle,
  Eye,
  X,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function VerificationQueuePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    masjidAdditionRequests: [] as any[],
    masjidAdminApplications: [] as any[],
    pendingMasjids: [] as any[],
    pendingUsers: [] as any[],
    pendingDonations: [] as any[],
    pendingAnnouncements: [] as any[],
    pendingEvents: [] as any[],
    pendingProperties: [] as any[],
    pendingDocuments: [] as any[],
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Masjid Addition Requests");

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState<{
    type: "MASJID_REQUEST" | "ADMIN_APP" | "CONTENT";
    id: string;
    entityType?: string;
    title: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Details modal state
  const [viewingItem, setViewingItem] = useState<{
    title: string;
    details: { label: string; value: string | React.ReactNode }[];
  } | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/verifications");
      if (res.ok) {
        const json = await res.json();
        setData({
          masjidAdditionRequests: json.masjidAdditionRequests || [],
          masjidAdminApplications: json.masjidAdminApplications || [],
          pendingMasjids: json.pendingMasjids || [],
          pendingUsers: json.pendingUsers || [],
          pendingDonations: json.pendingDonations || [],
          pendingAnnouncements: json.pendingAnnouncements || [],
          pendingEvents: json.pendingEvents || [],
          pendingProperties: json.pendingProperties || [],
          pendingDocuments: json.pendingDocuments || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Masjid Addition Request Action
  const handleMasjidRequestAction = async (requestId: string, action: "APPROVE" | "REJECT", reason?: string) => {
    setActionLoading(`req-${requestId}-${action}`);
    try {
      const res = await fetch("/api/super-admin/verifications/masjid-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action, rejectionReason: reason }),
      });
      if (res.ok) {
        setRejectModal(null);
        setRejectionReason("");
        loadQueue();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to process request.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  // Masjid Admin Application Action
  const handleAdminAppAction = async (applicationId: string, action: "APPROVE" | "REJECT", reason?: string) => {
    setActionLoading(`app-${applicationId}-${action}`);
    try {
      const res = await fetch("/api/super-admin/verifications/admin-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action, rejectionReason: reason }),
      });
      if (res.ok) {
        setRejectModal(null);
        setRejectionReason("");
        loadQueue();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to process application.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete handlers for cleaning up rejected/duplicate requests
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this Masjid addition request?")) return;
    setActionLoading(`del-req-${id}`);
    try {
      const res = await fetch(`/api/super-admin/verifications/masjid-request?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadQueue();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to delete request.");
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAdminApp = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this Masjid Admin application?")) return;
    setActionLoading(`del-app-${id}`);
    try {
      const res = await fetch(`/api/super-admin/verifications/admin-application?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadQueue();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to delete application.");
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveMasjid = async (id: string) => {
    setActionLoading(`masjid-${id}`);
    try {
      const res = await fetch("/api/super-admin/masjids/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masjidId: id, status: "VERIFIED" }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.autoRejected) {
          alert("This masjid was automatically rejected because a duplicate verified masjid already exists.");
        }
        loadQueue();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to approve masjid.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveUser = async (id: string) => {
    setActionLoading(`user-${id}`);
    try {
      const res = await fetch("/api/super-admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, isApproved: true }),
      });
      if (res.ok) {
        loadQueue();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to approve user.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleContentAction = async (entityType: string, entityId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(`${entityType}-${entityId}-${action}`);
    try {
      const res = await fetch("/api/super-admin/verifications/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, action }),
      });
      if (res.ok) {
        loadQueue();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Action failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingAdditionReqCount = data.masjidAdditionRequests.filter((r) => r.status === "PENDING").length;
  const pendingAdminAppCount = data.masjidAdminApplications.filter((a) => a.status === "PENDING").length;

  const tabs = [
    {
      id: "Masjid Addition Requests",
      label: "Masjid Addition Requests",
      count: pendingAdditionReqCount,
      icon: Building2,
    },
    {
      id: "Masjid Admin Applications",
      label: "Masjid Admin Applications",
      count: pendingAdminAppCount,
      icon: ShieldAlert,
    },
    { id: "Masjids", label: "Staged Masjids", count: data.pendingMasjids.length, icon: Building2 },
    { id: "Users", label: "Pending Users", count: data.pendingUsers.length, icon: Users },
    { id: "Donations", label: "Donations", count: data.pendingDonations.length, icon: HeartHandshake },
    { id: "Announcements", label: "Announcements", count: data.pendingAnnouncements.length, icon: Megaphone },
    { id: "Events", label: "Events", count: data.pendingEvents.length, icon: Calendar },
    { id: "Properties", label: "Properties", count: data.pendingProperties.length, icon: Home },
    { id: "Documents", label: "Documents", count: data.pendingDocuments.length, icon: FileText },
  ];

  const totalPending = tabs.reduce((acc, tab) => acc + tab.count, 0);

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-10 bg-[#FBFBFB] min-h-screen px-2 sm:px-6 pt-4 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <ClipboardCheck className="w-7 h-7 text-[#BF8B36]" /> Verification Queue
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Review and verify user Masjid addition requests, Masjid Admin applications, and platform items.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="text-center px-6 py-2.5 bg-white border border-[#E5DFD3] shadow-xs rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Total Pending Actions
              </p>
              <p className="text-xl font-mono font-bold text-[#181E1A] leading-none">{totalPending}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-[#E5DFD3]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#194331] text-white border-b-0 shadow-xs"
                  : "bg-white text-slate-500 border border-[#E5DFD3] border-b-0 hover:bg-slate-50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-emerald-300" : "text-slate-400"}`} />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-red-100 text-red-600 font-bold"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#BF8B36] animate-spin mb-4" />
            <p className="text-xs font-mono text-slate-400">Loading verification queue...</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5DFD3] rounded-b-2xl rounded-tr-2xl shadow-xs overflow-hidden">
            {/* =========================================================================
                TAB 1: MASJID ADDITION REQUESTS (SUBMITTED BY REGULAR USERS)
                ========================================================================= */}
            {activeTab === "Masjid Addition Requests" && (
              data.masjidAdditionRequests.length === 0 ? (
                <EmptyState icon={Building2} message="No user-submitted Masjid addition requests." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                      <tr>
                        <th className="px-5 py-4">Ref ID & Masjid</th>
                        <th className="px-5 py-4">City & Location</th>
                        <th className="px-5 py-4">Contact Person</th>
                        <th className="px-5 py-4">Date Submitted</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {data.masjidAdditionRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4">
                            <span className="font-mono text-[10px] font-bold text-[#BF8B36] block">
                              {req.customId || req.id.substring(0, 8)}
                            </span>
                            <span className="font-bold text-[#181E1A] text-sm">{req.masjidName}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800">{req.city}</p>
                            <p className="text-[11px] text-slate-500">{req.location}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-800">{req.contactName}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{req.contactPhone}</p>
                            {req.contactEmail && (
                              <p className="text-[10px] text-slate-400 font-mono">{req.contactEmail}</p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {req.status === "APPROVED" ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                                APPROVED
                              </span>
                            ) : req.status === "REJECTED" ? (
                              <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold text-[10px] rounded-full border border-red-200">
                                REJECTED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-full border border-amber-200">
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  setViewingItem({
                                    title: `Masjid Request: ${req.masjidName}`,
                                    details: [
                                      { label: "Reference ID", value: req.customId || req.id },
                                      { label: "Masjid Name", value: req.masjidName },
                                      { label: "City", value: req.city },
                                      { label: "Location / Address", value: req.location },
                                      { label: "Contact Person", value: req.contactName },
                                      { label: "Phone", value: req.contactPhone },
                                      { label: "Email", value: req.contactEmail || "Not provided" },
                                      { label: "Additional Info", value: req.additionalInfo || "None" },
                                      { label: "Submitted", value: new Date(req.createdAt).toLocaleString() },
                                      { label: "Current Status", value: req.status },
                                      { label: "Rejection Reason", value: req.rejectionReason || "None" },
                                    ],
                                  })
                                }
                                title="View Details"
                                className="p-1.5 text-slate-400 hover:text-[#194331] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteRequest(req.id)}
                                disabled={actionLoading === `del-req-${req.id}`}
                                title="Delete / Dismiss Request"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                {actionLoading === `del-req-${req.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>

                              {req.status === "PENDING" && (
                                <>
                                  <ActionButton
                                    loading={actionLoading === `req-${req.id}-REJECT`}
                                    onClick={() =>
                                      setRejectModal({
                                        type: "MASJID_REQUEST",
                                        id: req.id,
                                        title: `Reject Request: ${req.masjidName}`,
                                      })
                                    }
                                    label="Reject"
                                    variant="danger"
                                  />
                                  <ActionButton
                                    loading={actionLoading === `req-${req.id}-APPROVE`}
                                    onClick={() => handleMasjidRequestAction(req.id, "APPROVE")}
                                    label="Approve & Create Masjid"
                                  />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* =========================================================================
                TAB 2: MASJID ADMIN APPLICATIONS (SUBMITTED BY ADMIN APPLICANTS)
                ========================================================================= */}
            {activeTab === "Masjid Admin Applications" && (
              data.masjidAdminApplications.length === 0 ? (
                <EmptyState icon={ShieldAlert} message="No Masjid Admin applications pending." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                      <tr>
                        <th className="px-5 py-4">App Ref & Applicant</th>
                        <th className="px-5 py-4">Target Masjid & City</th>
                        <th className="px-5 py-4">Contact Info</th>
                        <th className="px-5 py-4">Date Submitted</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {data.masjidAdminApplications.map((app: any) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4">
                            <span className="font-mono text-[10px] font-bold text-[#BF8B36] block">
                              {app.customId || app.id.substring(0, 8)}
                            </span>
                            <span className="font-bold text-[#181E1A] text-sm">{app.applicantName}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800">{app.masjidName}</p>
                            <p className="text-[11px] text-slate-500">{app.city} • {app.location}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#194331]">{app.applicantEmail}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{app.applicantPhone}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {app.status === "APPROVED" ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                                APPROVED
                              </span>
                            ) : app.status === "REJECTED" ? (
                              <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold text-[10px] rounded-full border border-red-200">
                                REJECTED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-full border border-amber-200">
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  setViewingItem({
                                    title: `Admin Application: ${app.applicantName}`,
                                    details: [
                                      { label: "Application ID", value: app.customId || app.id },
                                      { label: "Applicant Name", value: app.applicantName },
                                      { label: "Applicant Email", value: app.applicantEmail },
                                      { label: "Applicant Phone", value: app.applicantPhone },
                                      { label: "Target Masjid", value: app.masjidName },
                                      { label: "City", value: app.city },
                                      { label: "Address / Location", value: app.location },
                                      { label: "Contact Name", value: app.contactName },
                                      { label: "Contact Phone", value: app.contactPhone },
                                      { label: "Additional Info", value: app.additionalInfo || "None" },
                                      { label: "Submission Date", value: new Date(app.createdAt).toLocaleString() },
                                      { label: "Application Status", value: app.status },
                                      { label: "Rejection Reason", value: app.rejectionReason || "None" },
                                    ],
                                  })
                                }
                                title="View Details"
                                className="p-1.5 text-slate-400 hover:text-[#194331] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteAdminApp(app.id)}
                                disabled={actionLoading === `del-app-${app.id}`}
                                title="Delete / Dismiss Application"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                {actionLoading === `del-app-${app.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>

                              {app.status === "PENDING" && (
                                <>
                                  <ActionButton
                                    loading={actionLoading === `app-${app.id}-REJECT`}
                                    onClick={() =>
                                      setRejectModal({
                                        type: "ADMIN_APP",
                                        id: app.id,
                                        title: `Reject Application: ${app.applicantName}`,
                                      })
                                    }
                                    label="Reject"
                                    variant="danger"
                                  />
                                  <ActionButton
                                    loading={actionLoading === `app-${app.id}-APPROVE`}
                                    onClick={() => handleAdminAppAction(app.id, "APPROVE")}
                                    label="Approve & Grant Admin"
                                  />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* MASJIDS TAB */}
            {activeTab === "Masjids" &&
              (data.pendingMasjids.length === 0 ? (
                <EmptyState icon={Building2} message="No masjids waiting for approval." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                      <tr>
                        <th className="px-5 py-4">Masjid Name</th>
                        <th className="px-5 py-4">City</th>
                        <th className="px-5 py-4">Registered Admin</th>
                        <th className="px-5 py-4">Contact</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {data.pendingMasjids.map((m: any) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 font-bold text-[#181E1A]">{m.name}</td>
                          <td className="px-5 py-4 text-slate-600">{m.city?.name || "N/A"}</td>
                          <td className="px-5 py-4">
                            {m.admins?.[0]?.user?.name || "Unknown"}
                            <div className="text-[10px] text-slate-400 font-mono">
                              {m.admins?.[0]?.user?.email}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-600">{m.contactNumber || "N/A"}</td>
                          <td className="px-5 py-4 text-right">
                            <ActionButton
                              loading={actionLoading === `masjid-${m.id}`}
                              onClick={() => handleApproveMasjid(m.id)}
                              label="Approve & Verify"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

            {/* USERS TAB */}
            {activeTab === "Users" &&
              (data.pendingUsers.length === 0 ? (
                <EmptyState icon={Users} message="No community users waiting for approval." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                      <tr>
                        <th className="px-5 py-4">User Name</th>
                        <th className="px-5 py-4">Email</th>
                        <th className="px-5 py-4">Phone</th>
                        <th className="px-5 py-4">Role</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {data.pendingUsers.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 font-bold text-[#181E1A]">{u.name}</td>
                          <td className="px-5 py-4 text-slate-600 font-mono">{u.email}</td>
                          <td className="px-5 py-4 font-mono text-slate-600">{u.phone || "N/A"}</td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider rounded-md border border-blue-100">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <ActionButton
                              loading={actionLoading === `user-${u.id}`}
                              onClick={() => handleApproveUser(u.id)}
                              label="Approve User"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

            {/* DONATIONS TAB */}
            {activeTab === "Donations" &&
              (data.pendingDonations.length === 0 ? (
                <EmptyState icon={HeartHandshake} message="No donation campaigns waiting for approval." />
              ) : (
                <ContentTable
                  items={data.pendingDonations}
                  entityType="DONATION"
                  cols={["Campaign Title", "Masjid", "Category", "Goal Amount"]}
                  renderRow={(item: any) => (
                    <>
                      <td className="px-5 py-4 font-bold text-[#181E1A]">{item.title}</td>
                      <td className="px-5 py-4 text-slate-600">{item.masjid?.name}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-[9px] font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-[#194331]">
                        ₹{item.goalAmount.toLocaleString("en-IN")}
                      </td>
                    </>
                  )}
                  actionLoading={actionLoading}
                  handleAction={handleContentAction}
                />
              ))}

            {/* ANNOUNCEMENTS TAB */}
            {activeTab === "Announcements" &&
              (data.pendingAnnouncements.length === 0 ? (
                <EmptyState icon={Megaphone} message="No announcements waiting for approval." />
              ) : (
                <ContentTable
                  items={data.pendingAnnouncements}
                  entityType="ANNOUNCEMENT"
                  cols={["Announcement Title", "Masjid", "Category", "Important"]}
                  renderRow={(item: any) => (
                    <>
                      <td className="px-5 py-4 font-bold text-[#181E1A]">{item.title}</td>
                      <td className="px-5 py-4 text-slate-600">{item.masjid?.name}</td>
                      <td className="px-5 py-4 text-slate-500 font-bold">{item.category}</td>
                      <td className="px-5 py-4">
                        {item.isImportant ? <span className="text-red-500 font-bold">Yes</span> : "No"}
                      </td>
                    </>
                  )}
                  actionLoading={actionLoading}
                  handleAction={handleContentAction}
                />
              ))}

            {/* EVENTS TAB */}
            {activeTab === "Events" &&
              (data.pendingEvents.length === 0 ? (
                <EmptyState icon={Calendar} message="No events waiting for approval." />
              ) : (
                <ContentTable
                  items={data.pendingEvents}
                  entityType="EVENT"
                  cols={["Event Title", "Masjid", "Date", "Location"]}
                  renderRow={(item: any) => (
                    <>
                      <td className="px-5 py-4 font-bold text-[#181E1A]">{item.title}</td>
                      <td className="px-5 py-4 text-slate-600">{item.masjid?.name}</td>
                      <td className="px-5 py-4 font-mono text-slate-500">
                        {new Date(item.eventDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{item.location}</td>
                    </>
                  )}
                  actionLoading={actionLoading}
                  handleAction={handleContentAction}
                />
              ))}

            {/* PROPERTIES TAB */}
            {activeTab === "Properties" &&
              (data.pendingProperties.length === 0 ? (
                <EmptyState icon={Home} message="No properties waiting for approval." />
              ) : (
                <ContentTable
                  items={data.pendingProperties}
                  entityType="PROPERTY"
                  cols={["Property ID", "Masjid", "Location", "Rent"]}
                  renderRow={(item: any) => (
                    <>
                      <td className="px-5 py-4 font-bold text-[#181E1A] font-mono">
                        {item.propertyCustomId}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.masjid?.name}</td>
                      <td className="px-5 py-4 text-slate-500">{item.location}</td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-700">
                        ₹{item.monthlyRent.toLocaleString("en-IN")}
                      </td>
                    </>
                  )}
                  actionLoading={actionLoading}
                  handleAction={handleContentAction}
                />
              ))}

            {/* DOCUMENTS TAB */}
            {activeTab === "Documents" &&
              (data.pendingDocuments.length === 0 ? (
                <EmptyState icon={FileText} message="No documents waiting for approval." />
              ) : (
                <ContentTable
                  items={data.pendingDocuments}
                  entityType="DOCUMENT"
                  cols={["Document Title", "Masjid", "Type", "Visibility"]}
                  renderRow={(item: any) => (
                    <>
                      <td className="px-5 py-4 font-bold text-[#181E1A]">{item.title}</td>
                      <td className="px-5 py-4 text-slate-600">{item.masjid?.name}</td>
                      <td className="px-5 py-4 text-slate-500">{item.type}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[9px] font-bold">
                          {item.visibility}
                        </span>
                      </td>
                    </>
                  )}
                  actionLoading={actionLoading}
                  handleAction={handleContentAction}
                />
              ))}
          </div>
        )}

        {/* =========================================================================
            REJECTION REASON MODAL
            ========================================================================= */}
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs"
              onClick={() => {
                setRejectModal(null);
                setRejectionReason("");
              }}
            ></div>
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">{rejectModal.title}</h3>
                <p className="text-xs text-[#525E56] mt-1">
                  Please provide a reason for rejecting this submission.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rejection Reason / Notes *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Duplicate listing, incomplete verification documents, unverified committee contacts..."
                  className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason.trim()}
                  onClick={() => {
                    if (rejectModal.type === "MASJID_REQUEST") {
                      handleMasjidRequestAction(rejectModal.id, "REJECT", rejectionReason);
                    } else if (rejectModal.type === "ADMIN_APP") {
                      handleAdminAppAction(rejectModal.id, "REJECT", rejectionReason);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW DETAILS MODAL
            ========================================================================= */}
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={() => setViewingItem(null)}></div>
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-left space-y-5 animate-scaleUp max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">{viewingItem.title}</h3>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {viewingItem.details.map((item, idx) => (
                  <div key={idx} className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3] flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{item.label}</span>
                    <span className="font-medium text-slate-800 break-words">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Reusable Components

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="py-20 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-[#F8F6F0] border border-[#E5DFD3] flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
      </div>
      <p className="text-slate-500 font-bold text-sm">{message}</p>
      <p className="text-slate-400 text-xs mt-1">All caught up!</p>
    </div>
  );
}

function ActionButton({ loading, onClick, label, variant = "primary" }: any) {
  if (variant === "danger") {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-[10px] font-bold text-white bg-[#194331] hover:bg-[#113224] px-3 py-1.5 rounded-lg transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-3 h-3 text-[#BF8B36]" />}
      {label}
    </button>
  );
}

function ContentTable({ items, entityType, cols, renderRow, actionLoading, handleAction }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left whitespace-nowrap">
        <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
          <tr>
            {cols.map((col: string, idx: number) => (
              <th key={idx} className="px-5 py-4">
                {col}
              </th>
            ))}
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5DFD3]">
          {items.map((item: any) => (
            <tr key={item.id} className="hover:bg-slate-50 transition">
              {renderRow(item)}
              <td className="px-5 py-4 text-right space-x-2">
                <ActionButton
                  loading={actionLoading === `${entityType}-${item.id}-REJECT`}
                  onClick={() => handleAction(entityType, item.id, "REJECT")}
                  label="Reject"
                  variant="danger"
                />
                <ActionButton
                  loading={actionLoading === `${entityType}-${item.id}-APPROVE`}
                  onClick={() => handleAction(entityType, item.id, "APPROVE")}
                  label="Approve"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
