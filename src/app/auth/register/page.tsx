"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  ChevronDown,
  ShieldAlert,
  CheckCircle2,
  Clock,
  X,
  PlusCircle,
  Search,
  MapPin,
  Check,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface AvailableMasjid {
  id: string;
  name: string;
  location: string;
  address: string;
  city: {
    id: string;
    name: string;
  } | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER" as "MASJID_ADMIN" | "USER",
    masjidId: "",
    // Masjid Admin application fields
    masjidName: "",
    cityName: "",
    address: "",
    registrationNo: "",
    plotSize: "",
    masjidContact: "",
    description: "",
  });

  const [availableMasjids, setAvailableMasjids] = useState<AvailableMasjid[]>([]);
  const [loadingMasjids, setLoadingMasjids] = useState(false);
  const [masjidSearch, setMasjidSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [adminReferenceId, setAdminReferenceId] = useState("");
  const [showMasjidDetailsModal, setShowMasjidDetailsModal] = useState(false);
  const [showUserSuccessModal, setShowUserSuccessModal] = useState(false);

  // Request to Add Masjid modal state
  const [showRequestMasjidModal, setShowRequestMasjidModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    masjidName: "",
    location: "",
    city: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    additionalInfo: "",
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccessRef, setRequestSuccessRef] = useState<string | null>(null);

  // Load available verified Masjids
  const fetchAvailableMasjids = async () => {
    try {
      setLoadingMasjids(true);
      const res = await fetch("/api/masjids/available");
      if (res.ok) {
        const data = await res.json();
        setAvailableMasjids(data.masjids || []);
      }
    } catch (err) {
      console.error("Failed to fetch available masjids:", err);
    } finally {
      setLoadingMasjids(false);
    }
  };

  useEffect(() => {
    fetchAvailableMasjids();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.role === "USER" && !form.masjidId) {
      setError("Please select an approved Masjid from the list or submit a request to add yours.");
      return;
    }

    if (form.role === "MASJID_ADMIN" && !showMasjidDetailsModal) {
      setShowMasjidDetailsModal(true);
      return;
    }

    await submitRegistration();
  };

  const submitRegistration = async () => {
    let cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: cleanPhone || form.phone,
          password: form.password,
          role: form.role,
          masjidId: form.role === "USER" ? form.masjidId : undefined,
          masjidName: form.masjidName,
          cityName: form.cityName,
          address: form.address,
          registrationNo: form.registrationNo,
          plotSize: form.plotSize,
          masjidContact: form.masjidContact,
          description: form.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setShowMasjidDetailsModal(false);

      if (form.role === "USER") {
        setShowUserSuccessModal(true);
      } else {
        setAdminReferenceId(data.referenceId || "MAA-PENDING");
        setShowVerificationModal(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit "Request to Add Masjid"
  const handleRequestMasjidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");
    setRequestLoading(true);

    try {
      const res = await fetch("/api/masjid-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setRequestError(data.error || "Failed to submit request.");
        return;
      }

      setRequestSuccessRef(data.referenceId || "MRQ-SUBMITTED");
      // Refresh available list in case
      fetchAvailableMasjids();
    } catch {
      setRequestError("Network error while submitting request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const resetRequestModal = () => {
    setShowRequestMasjidModal(false);
    setRequestSuccessRef(null);
    setRequestError("");
    setRequestForm({
      masjidName: "",
      location: "",
      city: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      additionalInfo: "",
    });
  };

  const filteredMasjids = availableMasjids.filter((m) => {
    if (!masjidSearch.trim()) return true;
    const q = masjidSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.city?.name && m.city.name.toLowerCase().includes(q)) ||
      (m.location && m.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo />
          <p className="text-xs text-[#525E56] mt-2 font-mono">Masjid Management & Committee Platform</p>
        </div>

        <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm p-8 space-y-6 text-left">
          <div>
            <h1 className="font-serif text-xl font-bold text-[#181E1A]">Create your account</h1>
            <p className="text-xs text-[#525E56] mt-1">Select your role to join the digital network</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Brother Tariq Mahmood"
                  className="w-full pl-9 pr-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="naushad102003@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 44332"
                  className="w-full pl-9 pr-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>
            </div>

            {/* Register as Dropdown Selector */}
            <div>
              <label className="block text-xs font-bold text-[#181E1A] mb-1.5">Register as</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#194331]" />
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      role: e.target.value as "USER" | "MASJID_ADMIN",
                    }))
                  }
                  className="w-full pl-9 pr-9 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#E6F0EB] focus:outline-none focus:border-[#194331] font-bold text-[#194331] cursor-pointer appearance-none"
                >
                  <option value="USER">User</option>
                  <option value="MASJID_ADMIN">Masjid Admin</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#194331] pointer-events-none" />
              </div>
            </div>

            {/* 🕌 SELECT MASJID (For Regular Users) */}
            {form.role === "USER" && (
              <div className="space-y-1.5 pt-1 pb-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#181E1A]">
                    Select Masjid <span className="text-red-500">*</span>
                  </label>
                  {loadingMasjids && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    required
                    value={form.masjidId}
                    onChange={(e) => setForm((p) => ({ ...p, masjidId: e.target.value }))}
                    className="w-full pl-9 pr-9 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36] font-medium text-[#181E1A] cursor-pointer appearance-none"
                  >
                    <option value="">-- Choose your local Masjid --</option>
                    {availableMasjids.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.city?.name ? `(${m.city.name})` : m.location ? `(${m.location})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Request to Add Masjid Link */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Can't find your local Masjid?</span>
                  <button
                    type="button"
                    onClick={() => setShowRequestMasjidModal(true)}
                    className="text-[#BF8B36] hover:text-[#9A6D26] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Request to Add Masjid</span>
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#194331] hover:bg-[#113224] text-white py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#BF8B36]" /> : null}
              {loading
                ? "Creating account…"
                : form.role === "MASJID_ADMIN"
                ? "Continue to Masjid Details"
                : "Create Account"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#BF8B36] font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 font-bold">
          <Link href="/" className="hover:text-[#BF8B36] transition">
            ← Back to Homepage
          </Link>
        </p>
      </div>

      {/* =========================================================================
          🕌 MODAL 1: REQUEST TO ADD MASJID (FOR REGULAR USERS)
          ========================================================================= */}
      {showRequestMasjidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={resetRequestModal}></div>

          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-left space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Request to Add Masjid</h3>
                <p className="text-xs text-[#525E56] mt-1">
                  Submit your local Masjid details for Super Admin verification and inclusion.
                </p>
              </div>
              <button
                onClick={resetRequestModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccessRef ? (
              /* Success Confirmation View */
              <div className="space-y-5 py-2 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#181E1A]">Request Submitted Successfully!</h4>
                  <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Thank you for submitting your local Masjid. The Super Admin team will review and verify the details.
                  </p>
                </div>

                <div className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-2xl p-4 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Application Reference Number
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#194331]">{requestSuccessRef}</span>
                </div>

                <button
                  type="button"
                  onClick={resetRequestModal}
                  className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold py-3 rounded-xl text-xs transition shadow-xs cursor-pointer"
                >
                  Return to Registration
                </button>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleRequestMasjidSubmit} className="space-y-4">
                {requestError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {requestError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Masjid Name *</label>
                  <input
                    type="text"
                    required
                    value={requestForm.masjidName}
                    onChange={(e) => setRequestForm((p) => ({ ...p, masjidName: e.target.value }))}
                    placeholder="e.g. Masjid Al-Noor"
                    className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.city}
                      onChange={(e) => setRequestForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Hyderabad / Mumbai"
                      className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Location / Area *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.location}
                      onChange={(e) => setRequestForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Tolichowki, Main Road"
                      className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.contactName}
                      onChange={(e) => setRequestForm((p) => ({ ...p, contactName: e.target.value }))}
                      placeholder="e.g. Brother Mohammed"
                      className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.contactPhone}
                      onChange={(e) => setRequestForm((p) => ({ ...p, contactPhone: e.target.value }))}
                      placeholder="+91 98765 00000"
                      className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={requestForm.contactEmail}
                    onChange={(e) => setRequestForm((p) => ({ ...p, contactEmail: e.target.value }))}
                    placeholder="contact@masjid.org"
                    className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Information / Landmarks <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={requestForm.additionalInfo}
                    onChange={(e) => setRequestForm((p) => ({ ...p, additionalInfo: e.target.value }))}
                    placeholder="Provide details such as committee contacts or nearby landmarks to help verification..."
                    className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold py-3 rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    {requestLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#BF8B36]" /> : null}
                    {requestLoading ? "Submitting Request..." : "Submit Masjid Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          🕌 MODAL 2: MASJID ADMIN REGISTRATION DETAILS
          ========================================================================= */}
      {showMasjidDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs" onClick={() => setShowMasjidDetailsModal(false)}></div>

          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-left space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Register New Masjid</h3>
                <p className="text-xs text-[#525E56] mt-1">
                  Please provide the details of the Masjid you are registering for administrative management.
                </p>
              </div>
              <button
                onClick={() => setShowMasjidDetailsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitRegistration();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Masjid Name *</label>
                <input
                  type="text"
                  required
                  value={form.masjidName}
                  onChange={(e) => setForm((p) => ({ ...p, masjidName: e.target.value }))}
                  placeholder="e.g. Jama Masjid"
                  className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={form.cityName}
                    onChange={(e) => setForm((p) => ({ ...p, cityName: e.target.value }))}
                    placeholder="e.g. Delhi"
                    className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Plot Size *</label>
                  <input
                    type="text"
                    required
                    value={form.plotSize}
                    onChange={(e) => setForm((p) => ({ ...p, plotSize: e.target.value }))}
                    placeholder="e.g. 1500 Sq Yds"
                    className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Address / Location *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Street address..."
                  className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Registration No</label>
                  <input
                    type="text"
                    value={form.registrationNo}
                    onChange={(e) => setForm((p) => ({ ...p, registrationNo: e.target.value }))}
                    placeholder="WAQF/DL/..."
                    className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Masjid Contact *</label>
                  <input
                    type="text"
                    required
                    value={form.masjidContact}
                    onChange={(e) => setForm((p) => ({ ...p, masjidContact: e.target.value }))}
                    placeholder="Phone number..."
                    className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief history or details..."
                  className="w-full px-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold py-3 rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#BF8B36]" /> : null}
                  {loading ? "Submitting Application..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          🛡️ MODAL 3: MASJID ADMIN VERIFICATION PENDING MODAL
          ========================================================================= */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs"
            onClick={() => {
              setShowVerificationModal(false);
              router.push("/auth/login");
            }}
          ></div>

          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
            {/* Header with Icon */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FBF4E4] border border-[#E5D2B0] flex items-center justify-center text-[#BF8B36]">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  router.push("/auth/login");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h3 className="font-serif text-xl font-extrabold text-[#181E1A]">
                Masjid Admin Verification Pending
              </h3>
              <p className="text-xs text-[#525E56] mt-1 leading-relaxed">
                Thank you, <strong className="text-[#181E1A]">{form.name}</strong>! Your application for{" "}
                <strong className="text-[#181E1A]">{form.masjidName}</strong> has been received.
              </p>
            </div>

            {/* Reference ID Badge */}
            {adminReferenceId && (
              <div className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-2xl p-3.5 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Application Reference ID
                </span>
                <span className="font-mono text-sm font-extrabold text-[#194331]">{adminReferenceId}</span>
              </div>
            )}

            {/* Super Admin Notice Card */}
            <div className="bg-gradient-to-br from-[#FBF4E4] to-[#F8F6F0] border border-[#E5D2B0] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#BF8B36] font-bold text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Super Admin Verification Required</span>
              </div>
              <p className="text-[11.5px] text-slate-700 leading-relaxed font-medium">
                In accordance with platform governance, all newly registered Masjids and administrative applicants must first be reviewed and verified by the Super Admin before portal access is unlocked.
              </p>
            </div>

            {/* Status Checklist */}
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#194331] shrink-0" />
                <span>Account profile & contact details saved.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#BF8B36] shrink-0" />
                <span>Application queued for Super Admin audit.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Masjid Ops Portal access unlocked upon approval.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  router.push("/auth/login");
                }}
                className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold py-3 rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          🎉 MODAL 4: REGULAR USER REGISTRATION SUCCESS
          ========================================================================= */}
      {showUserSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs"
            onClick={() => {
              setShowUserSuccessModal(false);
              router.push("/auth/login");
            }}
          ></div>

          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full z-10 text-left space-y-5 animate-scaleUp">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-xl font-extrabold text-[#181E1A]">Account Created Successfully!</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Welcome to MOSQUE, <strong className="text-[#181E1A]">{form.name}</strong>! Your account has been registered and associated with your selected local Masjid.
              </p>
            </div>

            <div className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-2xl p-4 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#194331]">
                <Check className="w-4 h-4" />
                <span>Instant Community Access</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                You can now log in to view real-time prayer timings, community notices, and support your Masjid with direct donations.
              </p>
            </div>

            <button
              onClick={() => {
                setShowUserSuccessModal(false);
                router.push("/auth/login");
              }}
              className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold py-3 rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In to Your Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
