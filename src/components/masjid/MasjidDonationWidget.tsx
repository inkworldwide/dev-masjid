"use client";

import React, { useState, useEffect } from "react";
import { HeartHandshake, X, CheckCircle2, FileText, Sparkles, Building2 } from "lucide-react";

export const DONATION_TYPES = [
  "General Masjid Fund",
  "Construction",
  "Maintenance",
  "Education",
  "Zakat",
  "Charity",
  "Community Welfare",
  "Emergency",
  "Other",
];

export function SupportDonateButton({
  campaign,
  masjidId,
  masjidName,
  className,
}: {
  campaign?: any;
  masjidId?: string;
  masjidName?: string;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-masjid-donation-modal", {
          detail: { campaign, masjidId, masjidName },
        })
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-xs flex items-center gap-2 flex-1 justify-center sm:flex-none cursor-pointer"
      }
    >
      <HeartHandshake className="w-4 h-4 text-[#BF8B36]" />
      <span>Support / Donate</span>
    </button>
  );
}

export default function MasjidDonationWidget({
  campaigns = [],
  masjidName,
  masjidId,
}: {
  campaigns?: any[];
  masjidName: string;
  masjidId?: string;
}) {
  // Ensure default fallback campaign if empty
  const defaultFallbackCampaign = {
    id: masjidId ? `default-${masjidId}` : "general-welfare",
    title: `${masjidName} General Welfare & Maintenance Fund`,
    category: "GENERAL_FUND",
    goalAmount: 500000,
    raisedAmount: 0,
    masjidId,
  };

  const initialCampaigns = campaigns && campaigns.length > 0 ? campaigns : [defaultFallbackCampaign];

  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [expandedFunds, setExpandedFunds] = useState<Record<string, boolean>>({});
  const [selectedDonationType, setSelectedDonationType] = useState<string>("General Masjid Fund");
  const [otherDonationType, setOtherDonationType] = useState<string>("");
  const [otherPurpose, setOtherPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  const effectiveDonationType =
    selectedDonationType === "Other"
      ? otherDonationType.trim() || "Other Purpose"
      : selectedDonationType;

  // Local state for optimistic UI updates
  const [localCampaigns, setLocalCampaigns] = useState(initialCampaigns);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      setLocalCampaigns(campaigns);
    }
  }, [campaigns]);

  // Pre-fill user if logged in
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            if (data.user.name) setDonorName(data.user.name);
            if (data.user.email) setDonorEmail(data.user.email);
          }
        }
      } catch (err) {}
    }
    loadUser();
  }, []);

  // Listen to open-masjid-donation-modal custom event from SupportDonateButton
  useEffect(() => {
    const handleOpen = (e: any) => {
      const camp =
        e.detail?.campaign ||
        (localCampaigns.length > 0 ? localCampaigns[0] : defaultFallbackCampaign);
      setSelectedCampaign(camp);
      // Pre-allocate ₹1,000 for convenience
      setAllocations({ [`Campaign - ${camp.title}`]: 1000 });
      setReceipt(null);
    };

    window.addEventListener("open-masjid-donation-modal", handleOpen);
    return () => {
      window.removeEventListener("open-masjid-donation-modal", handleOpen);
    };
  }, [localCampaigns, defaultFallbackCampaign]);

  const fundCategories: Record<string, string[]> = {
    "General Funds": ["Masjid Work", "Salaries", "Maintenance Work", "Others"],
    "Charity Funds": ["Zakat", "Sadaqah", "Charity"],
    "Interest Funds": ["Interest"],
  };

  const toggleFund = (fundName: string) => {
    setExpandedFunds((prev) => {
      const isNowExpanded = !prev[fundName];
      if (!isNowExpanded) {
        // Clear allocations when unchecking
        setAllocations((currentAllocations) => {
          const updated = { ...currentAllocations };
          fundCategories[fundName].forEach((sub) => {
            updated[`${fundName} - ${sub}`] = 0;
          });
          return updated;
        });
      }
      return { ...prev, [fundName]: isNowExpanded };
    });
  };

  const setPresetAmount = (preset: number) => {
    if (!selectedCampaign) return;
    setAllocations({ [`Campaign - ${selectedCampaign.title}`]: preset });
  };

  const totalAmount = Object.values(allocations).reduce((a, b) => a + (Number(b) || 0), 0);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !donorName || !donorEmail || totalAmount <= 0) return;

    setSubmitting(true);

    const breakdown = Object.entries(allocations)
      .filter(([_, val]) => Number(val) > 0)
      .map(([key, val]) => {
        if (key.includes("Others") && otherPurpose.trim() !== "") {
          return `${key} (${otherPurpose.trim()}): ₹${val}`;
        }
        return `${key}: ₹${val}`;
      })
      .join(" | ");

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          donorName,
          donorEmail,
          amount: totalAmount,
          donationType: effectiveDonationType,
          notes: `[Donation Type: ${effectiveDonationType}] [Allocations: ${breakdown || "Direct Donation"}] ${notes}`.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReceipt(data.receipt);
        // Optimistic update
        setLocalCampaigns((prev) =>
          prev.map((c) =>
            c.id === selectedCampaign.id
              ? { ...c, raisedAmount: Number(c.raisedAmount) + Number(totalAmount) }
              : c
          )
        );
      } else {
        alert(data.error || "Failed to process donation.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while processing your donation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Sidebar Widget Card */}
      <div className="bg-white border border-[#E5DFD3] rounded-[24px] shadow-sm p-6 sm:p-7 space-y-5 text-left">
        <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
          <HeartHandshake className="w-5 h-5 text-[#BF8B36]" /> Support the Masjid
        </h3>

        <div className="space-y-4">
          {localCampaigns.map((c: any) => (
            <div
              key={c.id}
              className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#E5DFD3] space-y-4 hover:border-[#BF8B36] transition-colors group"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase tracking-wider">
                  {c.category?.replace("_", " ")}
                </span>
                <p className="font-serif text-base font-bold text-[#181E1A] leading-tight">
                  {c.title}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold font-mono">
                  <span className="text-[#194331]">
                    Raised: ₹{Number(c.raisedAmount || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-400">
                    Goal: ₹{Number(c.goalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#BF8B36] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.round(
                          (Number(c.raisedAmount || 0) / Math.max(Number(c.goalAmount || 1), 1)) * 100
                        ),
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCampaign(c);
                  setAllocations({ [`Campaign - ${c.title}`]: 1000 });
                  setReceipt(null);
                }}
                className="w-full bg-white border-2 border-[#194331] text-[#194331] group-hover:bg-[#194331] group-hover:text-white font-bold text-xs py-2.5 rounded-xl text-center shadow-xs cursor-pointer transition-all flex justify-center items-center gap-2"
              >
                <HeartHandshake className="w-4 h-4 text-[#BF8B36] group-hover:text-white" />
                <span>Donate Now</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP DONATION MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#181E1A]/70 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setSelectedCampaign(null);
              setReceipt(null);
            }}
          ></div>

          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-5 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200 text-left">
            {!receipt ? (
              // 🟢 Donation Form
              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase tracking-wider bg-[#FBF4E4] px-2 py-0.5 rounded-md border border-[#E5D2B0]">
                        {masjidName}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-1">
                      Support / Donate
                    </h3>
                    <p className="text-[11px] text-[#525E56] font-medium mt-0.5">
                      {selectedCampaign.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(null);
                      setReceipt(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Donation Type Pills Selector */}
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold text-[11px] flex items-center justify-between">
                    <span>Donation Type *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Select purpose or specify below</span>
                  </label>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {DONATION_TYPES.map((type) => {
                      const isSelected = selectedDonationType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedDonationType(type)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-[#BF8B36] text-white border-[#BF8B36] shadow-xs"
                              : "bg-white text-[#194331] border-[#D1D5DB] hover:border-[#BF8B36] hover:bg-[#FDFBF7]"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  {selectedDonationType === "Other" && (
                    <div className="pt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <input
                        type="text"
                        required
                        placeholder="Specify custom donation purpose (e.g. Iftar Sponsorship, Quran Distribution, Medical Aid)..."
                        value={otherDonationType}
                        onChange={(e) => setOtherDonationType(e.target.value)}
                        className="w-full bg-[#F8F6F0] border border-[#BF8B36] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#BF8B36] font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold text-[11px]">
                    Quick Select Donation Amount
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2500, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPresetAmount(preset)}
                        className={`py-2 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                          totalAmount === preset
                            ? "bg-[#194331] text-white border-[#194331] shadow-xs"
                            : "bg-[#F8F6F0] text-slate-700 border-[#E5DFD3] hover:border-[#BF8B36]"
                        }`}
                      >
                        ₹{preset.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Donor Name *</label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. Brother Zayd Khan"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="e.g. zayd@gmail.com"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>

                {/* Fund Allocations */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">
                    Allocate Your Donation (₹ INR)
                  </label>
                  <div className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl overflow-hidden shadow-inner">
                    {/* Primary Campaign Row */}
                    <div className="flex items-center justify-between p-3.5 border-b border-[#E5DFD3] bg-white">
                      <div className="pr-2">
                        <span className="font-bold text-[#194331] text-xs leading-tight block">
                          Campaign: {selectedCampaign.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">
                          Goal: ₹{Number(selectedCampaign.goalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={allocations[`Campaign - ${selectedCampaign.title}`] ?? ""}
                        onChange={(e) =>
                          setAllocations((prev) => ({
                            ...prev,
                            [`Campaign - ${selectedCampaign.title}`]: Number(e.target.value) || 0,
                          }))
                        }
                        placeholder="₹0"
                        className="w-24 text-right bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#BF8B36] font-mono font-bold transition-all"
                      />
                    </div>

                    {/* Specialized Categories Checkboxes */}
                    {Object.entries(fundCategories).map(([fund, subs]) => (
                      <div key={fund}>
                        <label className="flex items-center gap-2 bg-[#E5DFD3]/60 px-3.5 py-2 border-b border-[#E5DFD3] cursor-pointer hover:bg-[#E5DFD3]/80 transition">
                          <input
                            type="checkbox"
                            checked={!!expandedFunds[fund]}
                            onChange={() => toggleFund(fund)}
                            className="w-3.5 h-3.5 accent-[#194331] rounded-sm cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-[#194331] uppercase tracking-widest font-mono select-none">
                            {fund}
                          </span>
                        </label>

                        {expandedFunds[fund] &&
                          subs.map((sub) => (
                            <div
                              key={sub}
                              className="flex items-center justify-between p-3 border-b border-[#E5DFD3] last:border-b-0 bg-white/50 animate-in slide-in-from-top-1 fade-in duration-200"
                            >
                              {sub === "Others" ? (
                                <div className="pl-6 w-full pr-4">
                                  <input
                                    type="text"
                                    placeholder="Specify other purpose..."
                                    value={otherPurpose}
                                    onChange={(e) => setOtherPurpose(e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-300 text-xs font-medium text-slate-700 outline-none focus:border-[#194331] pb-1"
                                  />
                                </div>
                              ) : (
                                <span className="text-slate-700 text-xs font-medium pl-6">
                                  {sub}
                                </span>
                              )}
                              <input
                                type="number"
                                min={0}
                                value={allocations[`${fund} - ${sub}`] ?? ""}
                                onChange={(e) =>
                                  setAllocations((prev) => ({
                                    ...prev,
                                    [`${fund} - ${sub}`]: Number(e.target.value) || 0,
                                  }))
                                }
                                placeholder="₹0"
                                className="w-24 text-right bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#BF8B36] font-mono font-bold transition-all hover:border-[#BF8B36]"
                              />
                            </div>
                          ))}
                      </div>
                    ))}

                    {/* Total Row */}
                    <div className="flex items-center justify-between p-4 bg-[#194331] text-white">
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wider font-mono block">
                          Total Contribution
                        </span>
                        <span className="text-[10px] text-emerald-300 font-mono mt-0.5 block opacity-90">
                          {selectedCampaign.raisedAmount !== undefined &&
                            `Raised So Far: ₹${Number(selectedCampaign.raisedAmount).toLocaleString(
                              "en-IN"
                            )}`}
                        </span>
                      </div>
                      <span className="font-serif text-2xl font-bold">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    Notes / Du'a Intention (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. For general Sadaqah Jariyah and mosque maintenance."
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                {/* Gateway Info */}
                <div className="p-3 bg-[#FBF4E4] border border-[#E5D2B0] rounded-xl text-[11px] text-[#181E1A] font-medium leading-relaxed flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#BF8B36] shrink-0" />
                  <span>
                    <strong>Instant Receipt:</strong> Submitting will record your donation and issue an official tax-deductible receipt slip.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(null);
                      setReceipt(null);
                    }}
                    className="px-4 py-2.5 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || totalAmount <= 0}
                    className="px-6 py-2.5 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4 text-[#BF8B36]" />
                    <span>{submitting ? "Processing..." : `Donate ₹${totalAmount.toLocaleString("en-IN")}`}</span>
                  </button>
                </div>
              </form>
            ) : (
              // 📜 Generated Demo Receipt Modal view
              <div className="space-y-5 animate-in fade-in duration-300 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#181E1A]">Donation Receipt</h3>
                    <p className="text-xs text-[#525E56] font-medium">Official Record of Contribution</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(null);
                      setReceipt(null);
                    }}
                    className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Printable Receipt Slip */}
                <div className="relative bg-white border border-[#E5DFD3] rounded-t-xl rounded-b-md shadow-sm">
                  <div className="h-2 w-full bg-[#194331] rounded-t-xl"></div>

                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="bg-[#E5DFD3] text-[#194331] text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest font-mono">
                            Receipt No.
                          </span>
                        </div>
                        <p className="font-mono font-bold text-sm text-[#181E1A] tracking-wider">
                          {receipt.receiptNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">
                          Date
                        </p>
                        <p className="text-xs font-semibold text-[#181E1A]">
                          {new Date(receipt.date || Date.now()).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-[#E5DFD3] pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">
                            Donor
                          </p>
                          <p className="text-sm font-bold text-[#181E1A]">{receipt.donorName}</p>
                          <p className="text-xs text-[#525E56]">{receipt.donorEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">
                            Masjid / Organization
                          </p>
                          <p className="text-sm font-bold text-[#181E1A] leading-snug">
                            {masjidName}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">
                            Donation Type
                          </p>
                          <div className="text-xs font-bold text-[#194331] bg-[#F8F6F0] p-2.5 rounded-lg border border-[#E5DFD3] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#BF8B36] shrink-0"></span>
                            <span className="truncate">{receipt.donationType || "General Masjid Fund"}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">
                            Campaign Fund
                          </p>
                          <p className="text-xs font-semibold text-[#194331] bg-[#F8F6F0] p-2.5 rounded-lg border border-[#E5DFD3] truncate">
                            {receipt.campaignTitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#181E1A] pt-5 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">
                          Total Paid
                        </p>
                        <p className="font-serif text-3xl font-extrabold text-[#194331]">
                          ₹{Number(receipt.amount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Success</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-3 w-full"
                    style={{
                      backgroundImage: "radial-gradient(circle, #F8F6F0 4px, transparent 4.5px)",
                      backgroundSize: "10px 10px",
                      backgroundPosition: "bottom",
                      borderTop: "1px dashed #E5DFD3",
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 text-[#194331] font-bold text-xs hover:bg-[#F8F6F0] rounded-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(null);
                      setReceipt(null);
                    }}
                    className="px-6 py-2.5 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
