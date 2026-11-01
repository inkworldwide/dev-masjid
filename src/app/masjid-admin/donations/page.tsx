"use client";
import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../admin/layout";
import {
  Heart,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Target,
  Users,
  CreditCard,
  Building2,
  ExternalLink,
  DollarSign,
  Receipt,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Edit2,
  Trash2,
  X,
  Link as LinkIcon,
  Share2,
  Upload,
} from "lucide-react";

export default function DonationsAndCampaignsPage() {
  const [activeTab, setActiveTab] = useState<"CAMPAIGNS" | "RECEIPTS">("CAMPAIGNS");

  // Data states
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [masjids, setMasjids] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedFundType, setSelectedFundType] = useState("ALL");

  // Modals
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    category: "GENERAL_FUND",
    goalAmount: "",
    description: "",
    coverImage: "",
  });

  // Direct Receipt Form State
  const [receiptForm, setReceiptForm] = useState({
    donorName: "",
    donorPhone: "",
    amount: "",
    fundType: "GENERAL_FUND",
    paymentMethod: "CASH",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCampaignForm((prev) => ({
          ...prev,
          coverImage: data.url,
        }));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload image file.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load User Scope & Masjids
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
            // Masjid Admin: lock to assigned scope
            if (meData.user?.masjidScope) {
              setSelectedMasjidId(meData.user.masjidScope);
            }
          }
        }
      } catch (err) {
        console.error("Error loading auth scope:", err);
      }
    }
    loadAuthAndMasjids();
  }, []);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Campaigns
      const campUrl = selectedMasjidId
        ? `/api/masjid-admin/donations?masjidId=${selectedMasjidId}`
        : `/api/masjid-admin/donations`;
      const campRes = await fetch(campUrl);
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }

      // 2. Fetch Receipts / Individual Donations
      const recUrl = selectedMasjidId
        ? `/api/finance/donations?masjidId=${selectedMasjidId}`
        : `/api/finance/donations`;
      const recRes = await fetch(recUrl);
      if (recRes.ok) {
        const recData = await recRes.json();
        setReceipts(recData.donations || []);
      }
    } catch (err) {
      console.error("Error loading donations data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMasjidId]);

  // Handle Save Campaign
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.goalAmount) {
      alert("Please provide Campaign Title and Goal Amount");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/masjid-admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId: selectedMasjidId,
          ...campaignForm,
        }),
      });

      if (res.ok) {
        setShowCampaignModal(false);
        setCampaignForm({
          title: "",
          category: "GENERAL_FUND",
          goalAmount: "",
          description: "",
          coverImage: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save campaign");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving campaign");
    } finally {
      setSaving(false);
    }
  };

  // Handle Create Receipt
  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptForm.donorName || !receiptForm.amount) {
      alert("Please fill in Donor Name and Amount");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/finance/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId: selectedMasjidId,
          ...receiptForm,
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        }),
      });

      if (res.ok) {
        setShowReceiptModal(false);
        setReceiptForm({
          donorName: "",
          donorPhone: "",
          amount: "",
          fundType: "GENERAL_FUND",
          paymentMethod: "CASH",
          description: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record receipt");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving receipt");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Campaign
  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${title}"?`)) return;
    try {
      const res = await fetch(`/api/masjid-admin/donations?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Lists
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "ALL" || c.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [campaigns, searchQuery, selectedCategory]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        r.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.donorPhone?.includes(searchQuery);
      const matchesFund = selectedFundType === "ALL" || r.fundType === selectedFundType;
      return matchesSearch && matchesFund;
    });
  }, [receipts, searchQuery, selectedFundType]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalCampaignRaised = 0;
    campaigns.forEach((c) => {
      totalCampaignRaised += Number(c.raisedAmount || 0);
    });

    let totalDirectReceipts = 0;
    let zakatTotal = 0;
    let sadaqahTotal = 0;

    receipts.forEach((r) => {
      const amt = Number(r.amount || 0);
      totalDirectReceipts += amt;
      if (r.fundType === "ZAKAT") zakatTotal += amt;
      if (r.fundType === "SADAQAH") sadaqahTotal += amt;
    });

    const grandTotal = totalCampaignRaised + totalDirectReceipts;

    return {
      grandTotal,
      activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE" || c.status === "PENDING").length,
      zakatTotal,
      sadaqahTotal,
      totalReceiptsCount: receipts.length,
    };
  }, [campaigns, receipts]);

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        {/* ========================================================================= */}
        {/* HEADER & TOP ACTIONS */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
              <Heart className="w-8 h-8 text-[#BF8B36]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">
                  Donations & Fund Campaigns
                </h1>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Verified Financial Module
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Track public cause campaigns, record verified donation receipts, and manage restricted Zakat & Sadaqah funds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
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
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 bg-[#194331] hover:bg-[#123325] text-white font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#BF8B36]" />
              <span>Create Campaign</span>
            </button>

            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-2 bg-[#BF8B36] hover:bg-[#a6772a] text-[#194331] font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-[#194331]" />
              <span>Record Direct Receipt</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS OVERVIEW CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Total Raised Funds
              </span>
              <div className="p-2 bg-emerald-50 text-[#194331] rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">
              ₹ {stats.grandTotal.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-700 font-mono mt-1">Combined Campaigns & Receipts</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Active Public Causes
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.activeCampaigns}</p>
            <p className="text-[11px] text-amber-600 font-mono mt-1">Live Fundraising Projects</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Zakat & Sadaqah Pool
              </span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">
              ₹ {(stats.zakatTotal + stats.sadaqahTotal).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-purple-600 font-mono mt-1">Restricted Relief Allocation</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Issued Receipts
              </span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.totalReceiptsCount}</p>
            <p className="text-[11px] text-blue-600 font-mono mt-1">Verified Audit Entries</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW NAVIGATION TABS & SEARCH */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 bg-[#F8F6F0] p-1 rounded-xl border border-[#E5DFD3] w-full md:w-auto">
              <button
                onClick={() => setActiveTab("CAMPAIGNS")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === "CAMPAIGNS"
                    ? "bg-[#194331] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Public Causes ({campaigns.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("RECEIPTS")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === "RECEIPTS"
                    ? "bg-[#194331] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Donation Receipts ({receipts.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === "CAMPAIGNS"
                    ? "Search campaign causes..."
                    : "Search receipt # or donor..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#194331]"
              />
            </div>
          </div>

          {/* Category Filter Pills for Public Causes */}
          {activeTab === "CAMPAIGNS" && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E5DFD3]/60">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mr-1">
                CATEGORY:
              </span>
              {[
                { id: "ALL", label: "All Categories" },
                { id: "GENERAL_FUND", label: "General Fund" },
                { id: "CONSTRUCTION", label: "Construction & Expansion" },
                { id: "MAINTENANCE", label: "Mosque Maintenance" },
                { id: "EDUCATION", label: "Madrasa & Education" },
                { id: "ZAKAT", label: "Zakat Assistance" },
                { id: "COMMUNITY_WELFARE", label: "Community Welfare" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#194331] text-[#BF8B36] shadow-xs"
                      : "bg-[#F8F6F0] text-slate-600 border border-[#E5DFD3] hover:border-[#194331] hover:text-[#194331]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Fund Type Filter Pills for Donation Receipts */}
          {activeTab === "RECEIPTS" && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E5DFD3]/60">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mr-1">
                FUND TYPE:
              </span>
              {[
                { id: "ALL", label: "All Fund Types" },
                { id: "GENERAL_FUND", label: "General Fund" },
                { id: "ZAKAT", label: "Zakat" },
                { id: "SADAQAH", label: "Sadaqah" },
                { id: "CONSTRUCTION", label: "Construction" },
                { id: "EDUCATION", label: "Madrasa / Education" },
              ].map((fund) => (
                <button
                  key={fund.id}
                  onClick={() => setSelectedFundType(fund.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold transition cursor-pointer ${
                    selectedFundType === fund.id
                      ? "bg-[#194331] text-[#BF8B36] shadow-xs"
                      : "bg-[#F8F6F0] text-slate-600 border border-[#E5DFD3] hover:border-[#194331] hover:text-[#194331]"
                  }`}
                >
                  {fund.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PUBLIC CAMPAIGNS GRID */}
        {/* ========================================================================= */}
        {activeTab === "CAMPAIGNS" && (
          <div>
            {loading ? (
              <div className="bg-white border border-[#E5DFD3] p-12 text-center rounded-2xl text-xs font-mono text-slate-500">
                Loading fundraising campaigns...
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="bg-white border border-[#E5DFD3] p-12 text-center rounded-2xl space-y-2">
                <Target className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Campaigns Found</p>
                <p className="text-xs font-mono text-slate-400">
                  Click "Create Campaign" to launch a new public cause for this mosque.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((camp) => {
                  const goal = Number(camp.goalAmount) || 1;
                  const raised = Number(camp.raisedAmount) || 0;
                  const percent = Math.min(100, Math.round((raised / goal) * 100));

                  return (
                    <div
                      key={camp.id}
                      className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      {/* Image Banner */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={
                            camp.coverImage ||
                            "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80"
                          }
                          alt={camp.title}
                          className="w-full h-full object-cover opacity-90"
                        />
                        <span className="absolute top-3 left-3 bg-[#194331] text-[#BF8B36] font-mono text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase">
                          {camp.category.replace("_", " ")}
                        </span>
                        <span className="absolute top-3 right-3 bg-emerald-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                          {camp.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-slate-800 leading-snug">
                            {camp.title}
                          </h3>
                          {camp.purpose && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {camp.purpose}
                            </p>
                          )}
                        </div>

                        {/* Progress Bar & Amounts */}
                        <div className="space-y-2 bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-500">Raised Progress</span>
                            <span className="font-bold text-[#194331]">{percent}%</span>
                          </div>

                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#194331] to-[#BF8B36] rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Raised</span>
                              <span className="font-bold text-emerald-800">
                                ₹ {raised.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Target Goal</span>
                              <span className="font-bold text-slate-800">
                                ₹ {goal.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 text-xs font-mono">
                          <a
                            href={`/donations`}
                            target="_blank"
                            className="flex items-center gap-1 text-[#194331] font-bold hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#BF8B36]" />
                            <span>Public Page</span>
                          </a>

                          <button
                            onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VERIFIED DONATION RECEIPTS TABLE */}
        {/* ========================================================================= */}
        {activeTab === "RECEIPTS" && (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-500">
                Loading donation receipts...
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Receipts Found</p>
                <p className="text-xs font-mono text-slate-400">
                  Click "Record Direct Receipt" to add a new physical or online donation entry.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-slate-600 font-mono uppercase text-[11px]">
                      <th className="p-4 font-bold">Receipt #</th>
                      <th className="p-4 font-bold">Date & Time</th>
                      <th className="p-4 font-bold">Donor Info</th>
                      <th className="p-4 font-bold">Fund Category</th>
                      <th className="p-4 font-bold">Payment Method</th>
                      <th className="p-4 font-bold text-right">Amount (₹)</th>
                      <th className="p-4 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredReceipts.map((rec) => (
                      <tr key={rec.id} className="hover:bg-amber-50/30 transition">
                        <td className="p-4 font-bold text-[#194331]">{rec.receiptNumber}</td>
                        <td className="p-4 text-slate-500">
                          {new Date(rec.donationDate || rec.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 font-sans">
                          <p className="font-bold text-slate-800">{rec.donorName}</p>
                          {rec.donorPhone && (
                            <span className="font-mono text-[10px] text-slate-400">
                              {rec.donorPhone}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              rec.fundType === "ZAKAT"
                                ? "bg-purple-100 text-purple-800"
                                : rec.fundType === "SADAQAH"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {rec.fundType.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{rec.paymentMethod}</td>
                        <td className="p-4 text-right font-bold text-slate-900 text-sm">
                          ₹ {Number(rec.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE CAMPAIGN */}
      {/* ========================================================================= */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5DFD3] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#194331]" />
                <h3 className="font-serif text-lg font-bold text-slate-800">
                  Create Fund Campaign
                </h3>
              </div>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Panel & Green Roof Installation"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Fund Category</label>
                  <select
                    value={campaignForm.category}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, category: e.target.value })
                    }
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  >
                    <option value="GENERAL_FUND">General Fund</option>
                    <option value="CONSTRUCTION">Construction / Expansion</option>
                    <option value="MAINTENANCE">Mosque Maintenance</option>
                    <option value="EDUCATION">Madrasa & Education</option>
                    <option value="ZAKAT">Zakat Assistance</option>
                    <option value="COMMUNITY_WELFARE">Community Welfare</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Goal Target (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={campaignForm.goalAmount}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, goalAmount: e.target.value })
                    }
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Campaign Cover Image (URL or File Upload)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL (https://...) or upload file"
                      value={campaignForm.coverImage}
                      onChange={(e) =>
                        setCampaignForm({ ...campaignForm, coverImage: e.target.value })
                      }
                      className="flex-1 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                    />
                    <label className="relative flex items-center justify-center gap-1.5 bg-[#194331] hover:bg-[#123325] text-white font-bold px-3.5 py-2 rounded-xl text-xs font-mono transition cursor-pointer shadow-xs whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 text-[#BF8B36]" />
                      <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {campaignForm.coverImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#E5DFD3] bg-slate-100 group">
                      <img
                        src={campaignForm.coverImage}
                        alt="Campaign Cover Preview"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setCampaignForm({ ...campaignForm, coverImage: "" })}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs opacity-90 hover:opacity-100 transition shadow"
                        title="Remove cover image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Purpose & Appeal Details</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of what this fundraising campaign will accomplish..."
                  value={campaignForm.description}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, description: e.target.value })
                  }
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold font-mono px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#194331] hover:bg-[#123325] text-white font-bold font-mono px-5 py-2 rounded-xl shadow"
                >
                  {saving ? "Publishing..." : "Publish Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD DIRECT RECEIPT */}
      {/* ========================================================================= */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5DFD3] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#BF8B36]" />
                <h3 className="font-serif text-lg font-bold text-slate-800">
                  Record Direct Donation Receipt
                </h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReceipt} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Donor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brother Imran Qureshi"
                  value={receiptForm.donorName}
                  onChange={(e) => setReceiptForm({ ...receiptForm, donorName: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={receiptForm.donorPhone}
                    onChange={(e) =>
                      setReceiptForm({ ...receiptForm, donorPhone: e.target.value })
                    }
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={receiptForm.amount}
                    onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Fund Allocation</label>
                  <select
                    value={receiptForm.fundType}
                    onChange={(e) => setReceiptForm({ ...receiptForm, fundType: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  >
                    <option value="GENERAL_FUND">General Fund</option>
                    <option value="ZAKAT">Zakat Fund</option>
                    <option value="SADAQAH">Sadaqah / Charity</option>
                    <option value="GENERAL_CHARITY">General Charity</option>
                    <option value="INTEREST_FUND">Interest Clearing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={receiptForm.paymentMethod}
                    onChange={(e) =>
                      setReceiptForm({ ...receiptForm, paymentMethod: e.target.value })
                    }
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  >
                    <option value="CASH">Cash Collection</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="NEFT_RTGS">Bank Transfer (NEFT/IMPS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Notes / Reference #</label>
                <textarea
                  rows={2}
                  placeholder="e.g. UTR #10928374928 or Friday Cash Box collection"
                  value={receiptForm.description}
                  onChange={(e) => setReceiptForm({ ...receiptForm, description: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold font-mono px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#BF8B36] hover:bg-[#a6772a] text-[#194331] font-bold font-mono px-5 py-2 rounded-xl shadow"
                >
                  {saving ? "Generating..." : "Generate Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
