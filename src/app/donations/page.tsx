"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { HeartHandshake, CheckCircle2, FileText, X, Building2, Sparkles } from "lucide-react";
import InnerDynamicLayout from "@/components/ads/InnerDynamicLayout";

interface Campaign {
  id: string;
  title: string;
  purpose: string;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  masjidId: string;
  masjid: {
    name: string;
    location: string;
  };
}

export default function PublicDonationsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Demo Donation Modal state
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState(1000);
  const [selectedDonationType, setSelectedDonationType] = useState<string>("General Masjid Fund");
  const [otherDonationType, setOtherDonationType] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  const effectiveDonationType =
    selectedDonationType === "Other"
      ? otherDonationType.trim() || "Other Purpose"
      : selectedDonationType;

  const [targetMasjidId, setTargetMasjidId] = useState<string | null>(null);

  useEffect(() => {
    // Check url search params for masjidId
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const mId = p.get("masjidId");
      if (mId) setTargetMasjidId(mId);
    }

    async function fetchCampaigns() {
      try {
        const url = targetMasjidId ? `/api/donations?masjidId=${targetMasjidId}` : "/api/donations";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserInfo() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setDonorName(meData.user.name || "");
            setDonorEmail(meData.user.email || "");
            if (!targetMasjidId && meData.user.masjidId) {
              setTargetMasjidId(meData.user.masjidId);
            }
          }
        }
      } catch (e) {
        // Guest user
      }
    }

    fetchUserInfo();
    fetchCampaigns();
  }, [targetMasjidId]);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !donorName || !donorEmail || amount <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          donorName,
          donorEmail,
          amount,
          donationType: effectiveDonationType,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReceipt(data.receipt);
        // Optimistic update
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === selectedCampaign.id
              ? { ...c, raisedAmount: Number(c.raisedAmount) + Number(amount) }
              : c
          )
        );
      } else {
        alert(data.error || "Failed to process demo donation.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const [categoryFilter, setCategoryFilter] = useState("All Causes");

  const categories = [
    "All Causes", "General Masjid Fund", "Construction", "Maintenance", 
    "Education", "Zakat", "Charity", "Community Welfare", "Emergency"
  ];

  const filteredCampaigns = campaigns.filter(c => {
    if (categoryFilter === "All Causes") return true;
    const mappedCategory = c.category.replace(/_/g, " ").toUpperCase();
    return mappedCategory === categoryFilter.toUpperCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <main className="flex-grow py-6 w-full">
        <InnerDynamicLayout page="donations" masjidId={targetMasjidId}>
          {/* Header */}
          <div className="border-b border-[#E5DFD3] pb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#BF8B36] uppercase font-mono">
              <HeartHandshake className="w-4 h-4 text-[#BF8B36]" /> Sadaqah & Zakat Initiatives
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#181E1A]">
              Active Masjid Donation Campaigns
            </h1>
            <p className="text-xs text-[#525E56]">
              Support verified local Masjids with general maintenance, Zakat welfare, and education funds.
            </p>
          </div>

          {/* Demo Notice Bar */}
          <div className="bg-[#FBF4E4] border border-[#E5D2B0] rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-[#181E1A]">
              <Sparkles className="w-4 h-4 text-[#BF8B36] shrink-0" />
              <span>
                <strong>Demo Donation Mode Active:</strong> All contributions trigger real-time raised total updates and generate an official demo tax receipt.
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#BF8B36] text-white border border-[#BF8B36] shadow-sm"
                    : "bg-white text-slate-600 border border-[#E5DFD3] hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading active campaigns...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
              No active donation campaigns match your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((c) => {
                const raised = Number(c.raisedAmount);
                const goal = Number(c.goalAmount);
                const progressPct = Math.min(Math.round((raised / goal) * 100), 100);

                return (
                  <div key={c.id} className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-5 flex flex-col justify-between hover:border-[#BF8B36] transition">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase bg-[#FBF4E4] px-3 py-1 rounded-full border border-[#E5D2B0]">
                          {c.category.replace("_", " ")}
                        </span>
                        <span className="text-xs font-bold font-mono text-[#194331]">{progressPct}% Funded</span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#181E1A]">{c.title}</h3>
                      <p className="text-xs font-semibold text-[#194331] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#BF8B36]" /> {c.masjid?.name} ({c.masjid?.location})
                      </p>
                      <p className="text-xs text-[#7D8A82] font-light leading-relaxed">
                        {c.purpose}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#E5DFD3]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold font-mono">
                          <span className="text-[#194331]">Raised: ₹{raised.toLocaleString("en-IN")}</span>
                          <span className="text-slate-400">Goal: ₹{goal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#BF8B36] rounded-full" style={{ width: `${progressPct}%` }}></div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCampaign(c);
                          setReceipt(null);
                        }}
                        className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs py-3 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <HeartHandshake className="w-4 h-4 text-[#BF8B36]" />
                        <span>Donate Now</span>
                      </button>
                      <Link
                        href={`/masjids/${c.masjidId}`}
                        className="w-full text-center text-xs font-semibold text-slate-500 hover:text-[#194331] py-1 transition block"
                      >
                        View Masjid Profile →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </InnerDynamicLayout>

        {/* Demo Donation Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setSelectedCampaign(null)}></div>
            
            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-5 max-h-[90vh] overflow-y-auto">
              
              {!receipt ? (
                // 🟢 Donation Form
                <form onSubmit={handleDonateSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#181E1A]">Demo Donation</h3>
                      <p className="text-[10px] text-[#BF8B36] font-mono font-bold uppercase">{selectedCampaign.title}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedCampaign(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Donation Type Pills Selector */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-bold text-[11px] flex items-center justify-between">
                      <span>Donation Type *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Select purpose or specify below</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {[
                        "General Masjid Fund",
                        "Construction",
                        "Maintenance",
                        "Education",
                        "Zakat",
                        "Charity",
                        "Community Welfare",
                        "Emergency",
                        "Other",
                      ].map((type) => {
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

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Donor Name</label>
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
                    <label className="block text-slate-600 font-bold mb-1">Email Address (for Receipt)</label>
                    <input
                      type="email"
                      required
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="e.g. zayd@gmail.com"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Donation Amount (₹ INR)</label>
                    <div className="flex gap-2 mb-2">
                      {[500, 1000, 2500, 5000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset)}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition ${
                            amount === preset ? "bg-[#194331] text-white border-[#194331]" : "bg-[#F8F6F0] text-[#181E1A] border-[#E5DFD3]"
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      required
                      min={10}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Notes / Intention (Optional)</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. For general Sadaqah and water maintenance."
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>

                  {/* Mosque Bank Transfer & UPI Details */}
                  <div className="p-3.5 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#194331] font-mono">
                      <span>🏦 Official Mosque Bank & UPI</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Direct Transfer</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
                      <div>
                        <span className="text-slate-400 block">Bank Name:</span>
                        <span className="font-bold text-slate-900">State Bank of India</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">A/C Number:</span>
                        <span className="font-bold text-slate-900">•••• •••• 4921</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">IFSC Code:</span>
                        <span className="font-bold text-slate-900">SBIN0001234</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">UPI ID / VPA:</span>
                        <span className="font-bold text-[#194331]">masjid@sbi</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FBF4E4] border border-[#E5D2B0] rounded-xl text-[11px] text-[#181E1A] font-medium leading-relaxed">
                    ℹ️ <strong>Instant Receipt:</strong> Submitting will record your contribution and generate an official verified donation receipt slip.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(null)}
                      className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      {submitting ? "Processing..." : "Complete Demo Donation"}
                    </button>
                  </div>
                </form>
              ) : (
                // 📜 Generated Demo Receipt Modal view
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#181E1A]">Donation Receipt</h3>
                      <p className="text-xs text-[#525E56] font-medium">Official Record of Contribution</p>
                    </div>
                    <button onClick={() => setSelectedCampaign(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Printable Receipt Slip */}
                  <div className="relative bg-white border border-[#E5DFD3] rounded-t-xl rounded-b-md shadow-sm">
                    {/* Top Decorative Border */}
                    <div className="h-2 w-full bg-[#194331] rounded-t-xl"></div>
                    
                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Header row of receipt */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-[#E5DFD3] text-[#194331] text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest font-mono">Receipt No.</span>
                          </div>
                          <p className="font-mono font-bold text-sm text-[#181E1A] tracking-wider">{receipt.receiptNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">Date</p>
                          <p className="text-xs font-semibold text-[#181E1A]">{new Date(receipt.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-[#E5DFD3] pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">Donor</p>
                            <p className="text-sm font-bold text-[#181E1A]">{receipt.donorName}</p>
                            <p className="text-xs text-[#525E56]">{receipt.donorEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">Masjid / Organization</p>
                            <p className="text-sm font-bold text-[#181E1A] leading-snug">{receipt.masjidName}</p>
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
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 font-mono">Total Paid</p>
                          <p className="font-serif text-3xl font-extrabold text-[#194331]">₹{receipt.amount.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Success</span>
                        </div>
                      </div>

                      {receipt.notes && (
                        <div className="text-[11px] text-[#525E56] italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="font-bold not-italic">Notes:</span> {receipt.notes}
                        </div>
                      )}
                    </div>
                    
                    {/* Receipt jagged bottom edge effect using CSS gradients or simple dashed line */}
                    <div className="h-3 w-full" style={{ backgroundImage: 'radial-gradient(circle, #F8F6F0 4px, transparent 4.5px)', backgroundSize: '10px 10px', backgroundPosition: 'bottom', borderTop: '1px dashed #E5DFD3' }}></div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2.5 text-[#194331] font-bold text-xs hover:bg-[#F8F6F0] rounded-xl transition flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Download PDF
                    </button>
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className="px-6 py-2.5 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl text-xs transition shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
