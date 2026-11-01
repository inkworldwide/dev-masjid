"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../admin/layout";
import { 
  Building2, ShieldCheck, Users, HeartHandshake, Clock, 
  Plus, ShieldAlert, CheckCircle2, UserCheck, X, AlertCircle, Globe,
  User, Mail, Phone, Lock, Eye, EyeOff
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  const [masjids, setMasjids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMasjids: 0,
    activeMasjids: 0,
    pendingMasjids: 0,
    totalAdmins: 0,
    totalUsers: 0,
    totalStaff: 0,
    totalImams: 0,
    totalDonationsAmount: 0,
  });

  // Modal State for Add New Masjid & Admin
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1); // Step 1: Admin Details, Step 2: Masjid Details
  
  // Step 1: Admin Details
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Masjid Details
  const [name, setName] = useState("");
  const [cityName, setCityName] = useState("");
  const [address, setAddress] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/data");
      const verifRes = await fetch("/api/super-admin/verifications");
      
      let totalPendingActions = 0;
      if (verifRes.ok) {
        const vData = await verifRes.json();
        totalPendingActions = 
          (vData.pendingMasjids?.length || 0) + 
          (vData.pendingUsers?.length || 0) + 
          (vData.pendingDonations?.length || 0) + 
          (vData.pendingAnnouncements?.length || 0) + 
          (vData.pendingEvents?.length || 0) + 
          (vData.pendingProperties?.length || 0) + 
          (vData.pendingDocuments?.length || 0);
      }

      if (res.ok) {
        const data = await res.json();
        const allMasjids = data.masjids || [];
        setMasjids(allMasjids);

        const active = allMasjids.filter((m: any) => m.status === "VERIFIED").length;

          setStats({
            totalMasjids: allMasjids.length,
            activeMasjids: active,
            pendingMasjids: totalPendingActions,
            totalAdmins: (data.admins || []).length,
            totalUsers: (data.users || []).length,
            totalStaff: data.totalStaff || 0,
            totalImams: data.totalImams || 0,
            totalDonationsAmount: data.totalDonationsAmount || 0,
          });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddMasjid = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!adminName.trim() || !adminEmail.trim()) {
      setModalStep(1);
      setErrorMsg("Administrator Name and Email are required.");
      return;
    }

    if (!name.trim() || !cityName.trim()) {
      setModalStep(2);
      setErrorMsg("Masjid Name and City are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/masjids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim(),
          adminPhone: adminPhone.trim(),
          adminPassword: adminPassword || "Admin@123",
          name: name.trim(),
          cityName: cityName.trim(),
          address: address.trim(),
          registrationNo: registrationNo.trim(),
          plotSize: plotSize.trim(),
          contactNumber: contactNumber.trim() || adminPhone.trim(),
          description: description.trim(),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setModalStep(1);
        setAdminName("");
        setAdminEmail("");
        setAdminPhone("");
        setAdminPassword("Admin@123");
        setName("");
        setCityName("");
        setAddress("");
        setRegistrationNo("");
        setPlotSize("");
        setContactNumber("");
        setDescription("");
        loadDashboardData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to add Masjid.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create new Masjid.");
    } finally {
      setSubmitting(false);
    }
  };



  const kpiCards = [
    { title: "Total Masjids", value: stats.totalMasjids, desc: "Registered platform congregations", icon: Building2, color: "bg-emerald-50 text-emerald-700 border-emerald-200", href: "/super-admin/masjids" },
    { title: "Active Masjids", value: stats.activeMasjids, desc: "Verified & operating Masjids", icon: ShieldCheck, color: "bg-blue-50 text-blue-700 border-blue-200", href: "/super-admin/masjids?status=VERIFIED" },
    { title: "Pending Verification", value: stats.pendingMasjids, desc: "Awaiting Super Admin approval", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200", href: "/super-admin/verifications" },
    { title: "Total Admins", value: stats.totalAdmins, desc: "Assigned Masjid Administrators", icon: UserCheck, color: "bg-purple-50 text-purple-700 border-purple-200", href: "/super-admin/admins" },
    { title: "Community Users", value: stats.totalUsers, desc: "Registered congregants & donors", icon: Users, color: "bg-teal-50 text-teal-700 border-teal-200", href: "/super-admin/users" },
    { title: "Total Staff", value: stats.totalStaff, desc: "Imams, Muezzins & Workers", icon: CheckCircle2, color: "bg-[#FBF4E4] text-[#BF8B36] border-[#E5D2B0]", href: "#" },
    { title: "Total Imams", value: stats.totalImams, desc: "Head religious leaders", icon: CheckCircle2, color: "bg-[#E6F0EB] text-[#194331] border-[#B7D4C5]", href: "#" },
    { title: "Total Donations", value: `₹${stats.totalDonationsAmount.toLocaleString("en-IN")}`, desc: "Processed Sadaqah & Zakat", icon: HeartHandshake, color: "bg-[#FBF4E4] text-[#BF8B36] border-[#E5D2B0]", href: "/super-admin/donations" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-[#BF8B36]" /> Super User Governance Dashboard
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Global administration overview of all registered Masjids, assigned Administrators, Imams, and community donations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Masjid</span>
            </button>
          </div>
        </div>

        {/* 📊 SUPER USER KPI CARDS */}
        
        {/* Section 1: Platform Growth & Revenue */}
        <div>
          <h3 className="font-serif text-sm font-bold text-[#181E1A] mb-4 flex items-center gap-2 border-b border-[#E5DFD3] pb-2">
            <Globe className="w-4 h-4 text-[#BF8B36]" /> Platform Growth & Finance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[kpiCards[0], kpiCards[1], kpiCards[2], kpiCards[7]].map((c, idx) => {
              const Icon = c.icon;
              return (
                <Link
                  href={c.href}
                  key={idx}
                  className="group relative bg-white border border-[#E5DFD3] rounded-[20px] p-5 shadow-xs hover:border-[#BF8B36] hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer min-h-[130px]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${c.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="font-mono text-[28px] leading-none font-bold text-[#181E1A] tracking-tight">
                      {c.value}
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Community & Staff */}
        <div className="pt-4">
          <h3 className="font-serif text-sm font-bold text-[#181E1A] mb-4 flex items-center gap-2 border-b border-[#E5DFD3] pb-2">
            <Users className="w-4 h-4 text-[#BF8B36]" /> Community & Governance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[kpiCards[3], kpiCards[4], kpiCards[5], kpiCards[6]].map((c, idx) => {
              const Icon = c.icon;
              return (
                <Link
                  href={c.href}
                  key={idx}
                  className="bg-white border border-[#E5DFD3] rounded-2xl p-4 shadow-2xs hover:border-[#BF8B36] hover:shadow-sm transition duration-200 flex items-center gap-4 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${c.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-[9.5px] font-mono text-slate-400 uppercase font-bold tracking-wider truncate">
                      {c.title}
                    </p>
                    <p className="font-mono text-lg font-bold text-[#181E1A]">
                      {c.value}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{c.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>



        {/* Modal: Add New Masjid & Admin Account */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-7 max-w-lg w-full z-10 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#181E1A]">Add New Masjid Congregation</h3>
                  <p className="text-[10.5px] text-[#525E56]">Register new Masjid & create assigned Administrator account</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stepper Tabs */}
              <div className="flex rounded-xl bg-[#F8F6F0] p-1 border border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    modalStep === 1
                      ? "bg-[#194331] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>1. Admin Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!adminName.trim() || !adminEmail.trim()) {
                      setErrorMsg("Please fill Administrator Name and Email before proceeding.");
                      return;
                    }
                    setErrorMsg("");
                    setModalStep(2);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    modalStep === 2
                      ? "bg-[#194331] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>2. Masjid Details</span>
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddMasjid} className="space-y-4">
                {/* STEP 1: ADMIN DETAILS */}
                {modalStep === 1 && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center gap-2 text-[#194331] font-bold text-xs">
                        <User className="w-4 h-4 text-[#BF8B36]" />
                        <span>Administrator Account Credentials</span>
                      </div>
                      
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Admin Full Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="e.g. Maulana Hafiz Zubair / Farooq Ahmad"
                            className="w-full bg-white border border-[#E5DFD3] rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#181E1A]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Official Email <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="email"
                              required
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              placeholder="admin@mosque.org"
                              className="w-full bg-white border border-[#E5DFD3] rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Mobile / Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              value={adminPhone}
                              onChange={(e) => setAdminPhone(e.target.value)}
                              placeholder="+91 98765 11111"
                              className="w-full bg-white border border-[#E5DFD3] rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Initial Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Admin@123"
                            className="w-full bg-white border border-[#E5DFD3] rounded-xl pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Default password: <span className="font-mono font-bold text-slate-600">Admin@123</span> (Can be changed anytime)</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!adminName.trim() || !adminEmail.trim()) {
                            setErrorMsg("Administrator Name and Email are required.");
                            return;
                          }
                          setErrorMsg("");
                          setModalStep(2);
                        }}
                        className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Next: Masjid Details</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: MASJID DETAILS */}
                {modalStep === 2 && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Masjid Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Fatehpuri Masjid / Moti Masjid / Jama Masjid"
                        className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#181E1A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">City Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={cityName}
                          onChange={(e) => setCityName(e.target.value)}
                          placeholder="e.g. Delhi, Hyderabad, Srinagar..."
                          className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#194331]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Plot Size (e.g. 15,000 Sq Yds)</label>
                        <input
                          type="text"
                          value={plotSize}
                          onChange={(e) => setPlotSize(e.target.value)}
                          placeholder="15,000 Sq Yards"
                          className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Address / Street Location</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Chandni Chowk, Old Delhi"
                        className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Waqf / Reg Number</label>
                        <input
                          type="text"
                          value={registrationNo}
                          onChange={(e) => setRegistrationNo(e.target.value)}
                          placeholder="WAQF-DL-2026-009"
                          className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Masjid Contact Phone</label>
                        <input
                          type="text"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="+91 98765 44321"
                          className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Short Description / History</label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Historic congregational mosque details..."
                        className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg("");
                          setModalStep(1);
                        }}
                        className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0] cursor-pointer flex items-center gap-1.5"
                      >
                        <span>⬅</span>
                        <span>Back</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {submitting ? "Adding Masjid..." : "Add Masjid to Platform"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
