"use client";
import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../admin/layout";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Award,
  HeartHandshake,
  BadgeCheck,
  ShieldAlert,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  CreditCard,
  Building2,
  Download,
  Calendar,
} from "lucide-react";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [masjids, setMasjids] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    membershipType: "GENERAL",
    role: "Regular Musalli",
    monthlyContribution: "1000",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load User Scope & Masjids list
  useEffect(() => {
    async function loadAuthAndMasjids() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          const superAdmin = meData.user?.role === "SUPER_ADMIN";
          setIsSuperAdmin(superAdmin);

          if (superAdmin) {
            const mRes = await fetch("/api/super-admin/masjids");
            if (mRes.ok) {
              const mData = await mRes.json();
              setMasjids(mData.masjids || []);
            }
          } else {
            if (meData.user?.masjidScope) {
              setSelectedMasjidId(meData.user.masjidScope);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadAuthAndMasjids();
  }, []);

  // Fetch Members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const url = selectedMasjidId
        ? `/api/masjid-admin/members?masjidId=${selectedMasjidId}`
        : `/api/masjid-admin/members`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedMasjidId]);

  // Handle Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please fill in Name and Phone number");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/masjid-admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId: selectedMasjidId,
          ...formData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
        setShowAddModal(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          membershipType: "GENERAL",
          role: "Regular Musalli",
          monthlyContribution: "1000",
          notes: "",
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add member");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving member");
    } finally {
      setSaving(false);
    }
  };

  // Handle Edit Member
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setSaving(true);
    try {
      const res = await fetch("/api/masjid-admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId: selectedMasjidId,
          id: showEditModal.id,
          ...showEditModal,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
        setShowEditModal(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from committee members?`)) return;
    try {
      const res = await fetch(`/api/masjid-admin/members?id=${id}&masjidId=${selectedMasjidId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedTypeFilter === "ALL" || m.membershipType === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [members, searchQuery, selectedTypeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = members.length;
    const patrons = members.filter((m) => m.membershipType === "PATRON").length;
    const volunteers = members.filter((m) => m.membershipType === "VOLUNTEER").length;
    const monthlyDonors = members.filter((m) => m.membershipType === "MONTHLY_DONOR").length;

    return { total, patrons, volunteers, monthlyDonors };
  }, [members]);

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        {/* ========================================================================= */}
        {/* HEADER & ACTION BUTTON */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
              <Users className="w-8 h-8 text-[#BF8B36]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">
                  Committee Members Directory
                </h1>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Verified Directory
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Manage registered musallis, volunteers, patrons, and monthly contributors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isSuperAdmin && masjids.length > 0 && (
              <select
                value={selectedMasjidId}
                onChange={(e) => setSelectedMasjidId(e.target.value)}
                className="bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none"
              >
                <option value="">All Masjids Overview</option>
                {masjids.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#194331] hover:bg-[#123325] text-white font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#BF8B36]" />
              <span>Add New Member</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS OVERVIEW */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Total Members
              </span>
              <div className="p-2 bg-emerald-50 text-[#194331] rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.total}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Registered in Database</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Active Volunteers
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.volunteers}</p>
            <p className="text-[11px] text-amber-600 font-mono mt-1">Ready for Mosque Events</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Monthly Donors
              </span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.monthlyDonors}</p>
            <p className="text-[11px] text-blue-600 font-mono mt-1">Recurring Support</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Patrons & Committee
              </span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.patrons}</p>
            <p className="text-[11px] text-purple-600 font-mono mt-1">Senior Advisors</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH AND TYPE FILTER TABS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by member name, phone, email, locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#194331]"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              {[
                { id: "ALL", label: "All Members" },
                { id: "PATRON", label: "Patrons" },
                { id: "VOLUNTEER", label: "Volunteers" },
                { id: "MONTHLY_DONOR", label: "Monthly Donors" },
                { id: "GENERAL", label: "General Musallis" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                    selectedTypeFilter === tab.id
                      ? "bg-[#194331] text-white shadow-xs"
                      : "bg-[#F8F6F0] text-slate-600 hover:bg-[#E5DFD3]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MEMBERS LIST TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              Loading committee members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Members Found</p>
              <p className="text-xs font-mono text-slate-400">
                Try adjusting your search query or add a new committee member.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-slate-600 font-mono uppercase text-[11px]">
                    <th className="p-4 font-bold">Member Info</th>
                    <th className="p-4 font-bold">Contact Details</th>
                    <th className="p-4 font-bold">Membership & Role</th>
                    <th className="p-4 font-bold">Monthly Commitment</th>
                    <th className="p-4 font-bold text-center">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-amber-50/30 transition">
                      {/* Member Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#194331] text-[#BF8B36] font-bold font-serif flex items-center justify-center text-sm shadow-xs">
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">
                              ID: {member.id} • Joined {member.joinedDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{member.phone}</span>
                        </div>
                        {member.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.address && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{member.address}</span>
                          </div>
                        )}
                      </td>

                      {/* Membership & Role */}
                      <td className="p-4 space-y-1">
                        <div>
                          <span
                            className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                              member.membershipType === "PATRON"
                                ? "bg-purple-100 text-purple-800"
                                : member.membershipType === "VOLUNTEER"
                                ? "bg-amber-100 text-amber-800"
                                : member.membershipType === "MONTHLY_DONOR"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {member.membershipType.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs">{member.role}</p>
                      </td>

                      {/* Contribution */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-[#194331]">
                          {member.monthlyContribution || "₹ 0"}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">Per Month</p>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border border-emerald-200">
                          <BadgeCheck className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setShowViewModal(member)}
                            title="View ID Card / Profile"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowEditModal(member)}
                            title="Edit Member"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            title="Remove Member"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW MEMBER */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5DFD3] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#194331]" />
                <h3 className="font-serif text-lg font-bold text-slate-800">
                  Add Committee Member
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Hajj Farooq Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="farooq@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Membership Tier</label>
                  <select
                    value={formData.membershipType}
                    onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:border-[#194331]"
                  >
                    <option value="GENERAL">General Musalli</option>
                    <option value="VOLUNTEER">Active Volunteer</option>
                    <option value="MONTHLY_DONOR">Monthly Donor</option>
                    <option value="PATRON">Patron / Committee Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Mosque Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Youth Coordinator / Regular Musalli"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Monthly Contribution (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={formData.monthlyContribution}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyContribution: e.target.value })
                    }
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Address / Locality</label>
                <input
                  type="text"
                  placeholder="House # / Street Name / Neighborhood"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes (e.g. Sunday Madrasa volunteer, Elderly assistance)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold font-mono px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#194331] hover:bg-[#123325] text-white font-bold font-mono px-5 py-2 rounded-xl shadow"
                >
                  {saving ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW MEMBER DIGITAL CARD */}
      {/* ========================================================================= */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-[#E5DFD3] max-w-sm w-full overflow-hidden shadow-2xl space-y-4">
            {/* Header pattern */}
            <div className="bg-[#194331] p-6 text-center text-white relative">
              <button
                onClick={() => setShowViewModal(null)}
                className="absolute top-3 right-3 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-full bg-[#BF8B36] text-[#194331] font-serif font-bold text-2xl mx-auto flex items-center justify-center border-4 border-white shadow-md mb-2">
                {showViewModal.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h3 className="font-serif text-lg font-bold">{showViewModal.name}</h3>
              <p className="text-xs font-mono text-[#BF8B36]">{showViewModal.role}</p>
              <span className="mt-2 inline-block text-[10px] font-mono font-bold bg-white/20 px-3 py-0.5 rounded-full uppercase tracking-wider">
                ID: {showViewModal.id}
              </span>
            </div>

            <div className="p-6 space-y-3 text-xs text-slate-700 font-mono">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Membership Tier</span>
                <span className="font-bold text-[#194331]">{showViewModal.membershipType}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Phone</span>
                <span className="font-bold text-slate-800">{showViewModal.phone}</span>
              </div>
              {showViewModal.email && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Email</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">
                    {showViewModal.email}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Monthly Commitment</span>
                <span className="font-bold text-emerald-700">
                  {showViewModal.monthlyContribution}
                </span>
              </div>
              {showViewModal.address && (
                <div className="space-y-1">
                  <span className="text-slate-400 block">Locality Address</span>
                  <span className="text-slate-800 block font-sans font-medium text-xs">
                    {showViewModal.address}
                  </span>
                </div>
              )}
              {showViewModal.notes && (
                <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3] text-slate-600 text-[11px] font-sans">
                  <strong className="block text-slate-800 font-mono text-[10px]">
                    VOLUNTEER & COMMITTEE NOTES:
                  </strong>
                  {showViewModal.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F8F6F0] border-t border-[#E5DFD3] text-center">
              <button
                onClick={() => setShowViewModal(null)}
                className="w-full bg-[#194331] text-white font-mono font-bold text-xs py-2 rounded-xl shadow cursor-pointer"
              >
                Close Digital Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT MEMBER */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5DFD3] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-800">Edit Member Details</h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={showEditModal.name}
                    onChange={(e) => setShowEditModal({ ...showEditModal, name: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={showEditModal.phone}
                    onChange={(e) => setShowEditModal({ ...showEditModal, phone: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Membership Tier</label>
                  <select
                    value={showEditModal.membershipType}
                    onChange={(e) =>
                      setShowEditModal({ ...showEditModal, membershipType: e.target.value })
                    }
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  >
                    <option value="GENERAL">General Musalli</option>
                    <option value="VOLUNTEER">Active Volunteer</option>
                    <option value="MONTHLY_DONOR">Monthly Donor</option>
                    <option value="PATRON">Patron / Committee Member</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={showEditModal.role}
                    onChange={(e) => setShowEditModal({ ...showEditModal, role: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={showEditModal.notes}
                  onChange={(e) => setShowEditModal({ ...showEditModal, notes: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="bg-slate-100 text-slate-700 font-bold font-mono px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#194331] text-white font-bold font-mono px-5 py-2 rounded-xl shadow"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
