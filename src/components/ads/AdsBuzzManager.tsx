"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, Plus, Trash2, Edit3, ExternalLink, Eye, CheckCircle2, XCircle, 
  Sparkles, Layers, Image as ImageIcon, MousePointerClick, RefreshCw, LayoutGrid, X, Search,
  FlaskConical, Monitor, Smartphone, Tablet, AlertTriangle, ShieldCheck, Building2, Lock
} from "lucide-react";

interface Advertisement {
  id: string;
  masjidId?: string | null;
  masjid?: { id: string; name: string; location: string } | null;
  name: string;
  description?: string | null;
  imageUrl: string;
  targetUrl: string;
  placement: "HOME_ONLY" | "INNER_ONLY" | "BOTH";
  format: "FULL_WIDTH" | "HALF_WIDTH" | "QUAD_GRID";
  isExclusive: boolean;
  isActive: boolean;
  isTest: boolean;
  displayOrder: number;
  clickCount: number;
  createdAt: string;
  isPlatformWide?: boolean;
  canEdit?: boolean;
}

const getPlacementLabel = (p: string) => {
  switch (p) {
    case "HOME_ONLY": return "Home Page Only";
    case "INNER_ONLY":
    case "PROPERTIES_ONLY":
    case "PROPERTY_DETAIL_ONLY":
      return "All Inner Pages";
    case "BOTH": default: return "All Pages (Home & Inner)";
  }
};

const PRESET_SAMPLE_ADS = [
  {
    name: "Al-Haramain Hajj & Umrah Travel Packages 2026",
    description: "Executive 5-star packages with direct flights, luxury hotels near Haram, and scholar-guided ziyarah.",
    imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/hajj-umrah",
    placement: "BOTH" as const,
    format: "FULL_WIDTH" as const,
  },
  {
    name: "Darussalam Islamic Book Store & Quran Publications",
    description: "Authentic Quran prints with Tajweed, Sahih Hadith collections, and children's Islamic learning literature.",
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/islamic-books",
    placement: "HOME_ONLY" as const,
    format: "FULL_WIDTH" as const,
  },
  {
    name: "Sultan Mosque Carpets & Acoustic Sound Engineering",
    description: "High-density Turkish prayer carpets, mihrab acoustic panelling, and interference-free wireless prayer audio systems.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/mosque-supplies",
    placement: "BOTH" as const,
    format: "HALF_WIDTH" as const,
  },
  {
    name: "Al-Madina Halal Catering & Community Kitchens",
    description: "Hygienic Nikah catering, Walima dining setups, Ramadan Iftar arrangements, and charity food drives.",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/halal-catering",
    placement: "BOTH" as const,
    format: "HALF_WIDTH" as const,
  },
  {
    name: "Noor Educational Madrasa & Arabic Academy",
    description: "Online & campus Quran memorization (Hifz), Tajweed certification, and modern Islamic Arabic language diplomas.",
    imageUrl: "https://images.unsplash.com/photo-1584281722572-8a96435c2b03?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/madrasa-academy",
    placement: "INNER_ONLY" as const,
    format: "QUAD_GRID" as const,
  },
];

export default function AdsBuzzManager({
  forcedMasjidScope,
  isMasjidAdminView = false,
}: {
  forcedMasjidScope?: string | null;
  isMasjidAdminView?: boolean;
}) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlacement, setFilterPlacement] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMasjidFilter, setSelectedMasjidFilter] = useState<string>("ALL");
  const [masjidsList, setMasjidsList] = useState<any[]>([]);

  // Permission & Scope State
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [denialMessage, setDenialMessage] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(!isMasjidAdminView);
  const [assignedMasjidName, setAssignedMasjidName] = useState<string>("");

  // Testing & Preview States
  const [testMode, setTestMode] = useState<boolean>(false);
  const [togglingTestMode, setTogglingTestMode] = useState<boolean>(false);
  const [testActionLoading, setTestActionLoading] = useState<boolean>(false);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState<number>(Date.now());
  const [previewPath, setPreviewPath] = useState<string>("/");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    placement: "BOTH" as "HOME_ONLY" | "INNER_ONLY" | "BOTH",
    format: "FULL_WIDTH" as "FULL_WIDTH" | "HALF_WIDTH" | "QUAD_GRID",
    isExclusive: false,
    displayOrder: "1" as string | number,
    isActive: true,
    isTest: false,
    masjidId: "" as string,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/ads";
      const params = new URLSearchParams();
      if (!isMasjidAdminView && selectedMasjidFilter && selectedMasjidFilter !== "ALL") {
        params.set("masjidId", selectedMasjidFilter);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { credentials: "include" });
      if (res.status === 403) {
        const err = await res.json();
        setAccessDenied(true);
        setDenialMessage(err.error || "Access Denied: Ads Buzz module is not enabled for your Masjid.");
        setLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setAccessDenied(false);
        setAds(data.ads || []);
        if (data.testMode !== undefined) {
          setTestMode(Boolean(data.testMode));
        }
        setIsSuperAdmin(Boolean(data.isSuperAdmin));
        if (data.masjidName) setAssignedMasjidName(data.masjidName);
        if (data.masjidsList) setMasjidsList(data.masjidsList);
      }
    } catch (err) {
      console.error("Fetch ads error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [selectedMasjidFilter]);

  const handleToggleTestMode = async () => {
    setTogglingTestMode(true);
    try {
      const nextState = !testMode;
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "toggleTestMode", enabled: nextState }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestMode(Boolean(data.testMode));
        setPreviewKey(Date.now());
      }
    } catch (err) {
      console.error("Toggle test mode error:", err);
    } finally {
      setTogglingTestMode(false);
    }
  };

  const handleCreateDummyAd = async (presetIndex: number = 0, isTestAd?: boolean) => {
    setTestActionLoading(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          action: "createDummyAd", 
          presetIndex,
          isTest: isTestAd !== undefined ? isTestAd : testMode,
          masjidId: !isMasjidAdminView && selectedMasjidFilter !== "ALL" && selectedMasjidFilter !== "GLOBAL" ? selectedMasjidFilter : undefined
        }),
      });
      if (res.ok) {
        await fetchAds();
        setPreviewKey(Date.now());
      }
    } catch (err) {
      console.error("Create dummy ad error:", err);
    } finally {
      setTestActionLoading(false);
    }
  };

  const handleToggleAllTestAds = async (activate: boolean) => {
    setTestActionLoading(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "toggleAllTestAds", activate }),
      });
      if (res.ok) {
        await fetchAds();
        setPreviewKey(Date.now());
      }
    } catch (err) {
      console.error("Toggle all test ads error:", err);
    } finally {
      setTestActionLoading(false);
    }
  };

  const handleResetTestData = async () => {
    if (!confirm("Are you sure you want to delete all test advertisements? Real advertiser campaigns will be safely preserved.")) {
      return;
    }
    setTestActionLoading(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "resetTestData" }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Test data successfully reset.");
        await fetchAds();
        setPreviewKey(Date.now());
      }
    } catch (err) {
      console.error("Reset test data error:", err);
    } finally {
      setTestActionLoading(false);
    }
  };

  const openCreateModal = (isTestAd: boolean = false) => {
    setEditingAd(null);
    setForm({
      name: "",
      description: "",
      imageUrl: "",
      targetUrl: "",
      placement: "BOTH",
      format: "FULL_WIDTH",
      isExclusive: false,
      displayOrder: String(ads.length + 1),
      isActive: true,
      isTest: isTestAd,
      masjidId: isMasjidAdminView ? "" : (selectedMasjidFilter !== "ALL" && selectedMasjidFilter !== "GLOBAL" ? selectedMasjidFilter : ""),
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload image file");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image file");
    } finally {
      setUploadingImage(false);
    }
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      name: ad.name,
      description: ad.description || "",
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      placement: ad.placement,
      format: ad.format,
      isExclusive: Boolean(ad.isExclusive),
      displayOrder: String(ad.displayOrder || 1),
      isActive: ad.isActive,
      isTest: Boolean(ad.isTest),
      masjidId: ad.masjidId || "",
    });
    setModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.imageUrl || !form.targetUrl) {
      alert("Please fill in Name, Image URL, and Target URL.");
      return;
    }

    let cleanedTargetUrl = form.targetUrl.trim();
    if (!cleanedTargetUrl.startsWith("http://") && !cleanedTargetUrl.startsWith("https://") && !cleanedTargetUrl.startsWith("/")) {
      cleanedTargetUrl = `https://${cleanedTargetUrl}`;
    }

    const parsedOrder = parseInt(String(form.displayOrder).trim(), 10);
    const finalDisplayOrder = isNaN(parsedOrder) || parsedOrder < 1 ? 1 : parsedOrder;

    setSaving(true);
    try {
      const url = "/api/admin/ads";
      const method = editingAd ? "PUT" : "POST";
      const payload: any = {
        ...form,
        isExclusive: Boolean(form.isExclusive),
        isTest: Boolean(form.isTest),
        displayOrder: finalDisplayOrder,
        targetUrl: cleanedTargetUrl,
      };
      if (form.masjidId) {
        payload.masjidId = form.masjidId;
      } else if (!isMasjidAdminView && form.masjidId === "") {
        payload.masjidId = null;
      }

      const body = editingAd ? { ...payload, id: editingAd.id } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchAds();
        setPreviewKey(Date.now());
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save ad");
      }
    } catch (err) {
      console.error("Save ad error:", err);
      alert("Error saving advertisement");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
      });
      if (res.ok) {
        setAds(prev => prev.map(item => item.id === ad.id ? { ...item, isActive: !ad.isActive } : item));
        setPreviewKey(Date.now());
      } else {
        const err = await res.json();
        alert(err.error || "Cannot modify this advertisement.");
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const handleToggleExclusive = async (ad: Advertisement) => {
    try {
      const nextExclusive = !ad.isExclusive;
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: ad.id, isExclusive: nextExclusive }),
      });
      if (res.ok) {
        await fetchAds();
        setPreviewKey(Date.now());
      } else {
        const err = await res.json();
        alert(err.error || "Cannot modify this advertisement.");
      }
    } catch (err) {
      console.error("Toggle exclusive error:", err);
    }
  };

  const handleToggleTest = async (ad: Advertisement) => {
    try {
      const nextTest = !ad.isTest;
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: ad.id, isTest: nextTest }),
      });
      if (res.ok) {
        setAds(prev => prev.map(item => item.id === ad.id ? { ...item, isTest: nextTest } : item));
        setPreviewKey(Date.now());
      } else {
        const err = await res.json();
        alert(err.error || "Cannot modify this advertisement.");
      }
    } catch (err) {
      console.error("Toggle test error:", err);
    }
  };

  const handleSeedDefaultCampaigns = async () => {
    setTestActionLoading(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          action: "seedDefaultCampaigns",
          masjidId: !isMasjidAdminView && selectedMasjidFilter !== "ALL" && selectedMasjidFilter !== "GLOBAL" ? selectedMasjidFilter : undefined
        }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Standard live campaigns successfully seeded!");
        await fetchAds();
        setPreviewKey(Date.now());
      }
    } catch (err) {
      console.error("Seed campaigns error:", err);
    } finally {
      setTestActionLoading(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad banner?")) return;
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setAds(prev => prev.filter(item => item.id !== id));
        setPreviewKey(Date.now());
      } else {
        const err = await res.json();
        alert(err.error || "Cannot delete this advertisement.");
      }
    } catch (err) {
      console.error("Delete ad error:", err);
    }
  };

  if (accessDenied) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-white border border-[#E5DFD3] rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#181E1A]">Access Restricted: Ads Buzz Module Disabled</h2>
        <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-lg mx-auto">
          {denialMessage || "The Ads Buzz module is not currently enabled for your Masjid. Access is governed centrally by the Super Admin in the Masjid Module Access Matrix."}
        </p>
        <div className="pt-4 border-t border-[#E5DFD3]/70 text-[11px] font-mono text-slate-400">
          Governance Policy: Super Admin → Roles &amp; Permissions → Masjid Module Access Matrix (ADMINISTRATION → Ads Buzz).
        </div>
      </div>
    );
  }

  const filteredAds = ads
    .filter(ad => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || ad.name.toLowerCase().includes(q) || ad.targetUrl.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (filterPlacement === "REAL") return !ad.isTest;
      if (filterPlacement === "TEST") return ad.isTest;
      if (filterPlacement === "HOME") return ad.placement === "HOME_ONLY" || ad.placement === "BOTH";
      if (filterPlacement === "INNER") return ad.placement === "INNER_ONLY" || ad.placement === "BOTH";
      if (filterPlacement === "ACTIVE") return ad.isActive;
      if (filterPlacement === "INACTIVE") return !ad.isActive;
      return true;
    })
    .sort((a, b) => {
      if (a.isExclusive !== b.isExclusive) return a.isExclusive ? -1 : 1;
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalClicks = ads.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  const activeCount = ads.filter(a => a.isActive).length;
  const inactiveCount = ads.filter(a => !a.isActive).length;
  const homeCount = ads.filter(a => a.placement === "HOME_ONLY" || a.placement === "BOTH").length;
  const innerCount = ads.filter(a => a.placement === "INNER_ONLY" || a.placement === "BOTH").length;
  const testAdsCount = ads.filter(a => a.isTest).length;
  const realAdsCount = ads.filter(a => !a.isTest).length;
  const activeTestAdsCount = ads.filter(a => a.isTest && a.isActive).length;

  const homeEligibleAds = ads.filter(a => {
    if (!a.isActive) return false;
    if (a.placement !== "HOME_ONLY" && a.placement !== "BOTH") return false;
    if (a.isTest && !testMode) return false;
    return true;
  });
  const homeActiveEligibleCount = homeEligibleAds.length;

  return (
    <div className="space-y-7 font-sans text-left pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-[#E5DFD3] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5]">
              {isMasjidAdminView ? `🕌 ${assignedMasjidName || "Masjid Admin Ops"}` : "👑 Global Ads Governance"}
            </span>
            {isMasjidAdminView && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FBF4E4] text-[#BF8B36] border border-[#E5D2B0]">
                Permission Verified
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#181E1A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#194331] text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5 text-[#BF8B36]" />
            </div>
            <span>Ads Buzz Manager</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Manage right-side ad promotions, home loan offers, partner banners, and target click destinations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Super Admin Masjid Scope Selector */}
          {!isMasjidAdminView && masjidsList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#E5DFD3] px-3 py-2 rounded-2xl shadow-2xs text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#BF8B36]" />
              <select
                value={selectedMasjidFilter}
                onChange={(e) => setSelectedMasjidFilter(e.target.value)}
                className="bg-transparent font-bold text-[#194331] outline-none cursor-pointer"
              >
                <option value="ALL">🌐 All Campaigns (Global &amp; Masjids)</option>
                <option value="GLOBAL">🌐 Platform-Wide Only</option>
                {masjidsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    🕌 {m.name} ({m.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#194331] font-bold text-xs px-4 py-3 rounded-2xl shadow-2xs border border-[#E5DFD3] transition duration-200 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#BF8B36]" />
            <span>Live Display Preview</span>
          </button>

          <button
            onClick={() => openCreateModal(false)}
            className="flex items-center gap-2 bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xs hover:shadow-md transition duration-200 cursor-pointer border border-[#BF8B36]/30"
          >
            <Plus className="w-4 h-4 text-[#BF8B36]" />
            <span>Add New Ad Banner</span>
          </button>
        </div>
      </div>

      {/* ── 🧪 ADMIN TESTING & HOME PAGE ADAPTIVE PREVIEW SECTION ── */}
      <div className="bg-gradient-to-r from-[#FBF4E4] via-[#F8F6F0] to-white border border-[#E5D2B0] rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#BF8B36] text-white flex items-center justify-center font-bold shadow-xs">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2">
                <span>Ads Buzz – Display Preview &amp; Testing</span>
                <span className="text-[10px] font-mono uppercase bg-[#BF8B36] text-white px-2 py-0.5 rounded-full font-bold">
                  Testing Mode
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Verify Home Page layout adaptability when advertisements are active or absent. Create test ads and preview live behavior.
              </p>
            </div>
          </div>

          {/* Test Mode Toggle Switch */}
          <div className="flex items-center gap-3 bg-white border border-[#E5D2B0] px-4 py-2 rounded-2xl shadow-2xs">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">Enable Test Mode</p>
              <p className={`text-[10px] font-mono font-semibold ${testMode ? "text-emerald-600" : "text-slate-400"}`}>
                {testMode ? "ON (Test Ads Active)" : "OFF (Live Campaigns Only)"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleTestMode}
              disabled={togglingTestMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                testMode ? "bg-[#BF8B36]" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  testMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Diagnostic Status Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Home Page Layout State</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${homeActiveEligibleCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`} />
              <p className="font-bold text-slate-900">
                {homeActiveEligibleCount > 0 ? "Two-Column Grid (Ads Displayed)" : "Full-Width Expanded (Ads Collapsed)"}
              </p>
            </div>
            <p className="text-[10.5px] text-slate-500">
              {homeActiveEligibleCount > 0 
                ? `${homeActiveEligibleCount} active ad banner(s) currently rendering alongside main Home content.`
                : "No eligible ads available. Ad column collapsed completely; zero blank space reserved."}
            </p>
          </div>

          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Test Advertisements</span>
            <p className="font-bold text-slate-900 text-sm">
              {testAdsCount} Test Banner(s) <span className="text-slate-400 font-normal">({activeTestAdsCount} active)</span>
            </p>
            <p className="text-[10.5px] text-slate-500">
              {testMode 
                ? "Test ads are active and will display on preview & test-enabled pages." 
                : "Test ads are safely isolated and invisible to normal public visitors."}
            </p>
          </div>

          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Real Campaigns Protected</span>
            <p className="font-bold text-slate-900 text-sm">
              {realAdsCount} Real Campaign(s)
            </p>
            <p className="text-[10.5px] text-slate-500">
              Reset Test Data will safely delete only test ads. Real campaigns are permanently preserved.
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-[#E5D2B0]/60">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Dummy Test Ad */}
            <button
              onClick={() => handleCreateDummyAd(0)}
              disabled={testActionLoading}
              className="flex items-center gap-1.5 bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-[#BF8B36]" />
              <span>Add Dummy Ad</span>
            </button>

            {/* Seed 5 Live Campaigns */}
            <button
              onClick={handleSeedDefaultCampaigns}
              disabled={testActionLoading}
              className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#a6772b] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
              title="Ensure all 5 standard live partner campaigns are loaded"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Load 5 Live Campaigns</span>
            </button>

            {/* Quick Presets */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-mono font-semibold">Presets:</span>
              <button
                onClick={() => handleCreateDummyAd(0)}
                disabled={testActionLoading}
                className="text-[10px] bg-white hover:bg-[#F8F6F0] text-slate-700 hover:text-[#194331] border border-[#E5DFD3] px-2 py-1 rounded-lg font-semibold transition cursor-pointer"
                title="Add Al-Haramain Hajj & Umrah (All Pages - Full Width)"
              >
                + Hajj Travel
              </button>
              <button
                onClick={() => handleCreateDummyAd(1)}
                disabled={testActionLoading}
                className="text-[10px] bg-white hover:bg-[#F8F6F0] text-slate-700 hover:text-[#194331] border border-[#E5DFD3] px-2 py-1 rounded-lg font-semibold transition cursor-pointer"
                title="Add Darussalam Islamic Books (Home Only - Full Width)"
              >
                + Islamic Books
              </button>
              <button
                onClick={() => handleCreateDummyAd(2)}
                disabled={testActionLoading}
                className="text-[10px] bg-white hover:bg-[#F8F6F0] text-slate-700 hover:text-[#194331] border border-[#E5DFD3] px-2 py-1 rounded-lg font-semibold transition cursor-pointer"
                title="Add Sultan Mosque Carpets & Sound (All Pages - Half Width)"
              >
                + Mosque Carpets
              </button>
              <button
                onClick={() => handleCreateDummyAd(4)}
                disabled={testActionLoading}
                className="text-[10px] bg-white hover:bg-[#F8F6F0] text-slate-700 hover:text-[#194331] border border-[#E5DFD3] px-2 py-1 rounded-lg font-semibold transition cursor-pointer"
                title="Add Noor Educational Madrasa (Inner Only - Quad Grid)"
              >
                + Madrasa
              </button>
            </div>

            {/* Bulk Toggle Test Ads */}
            {testAdsCount > 0 && (
              <>
                <button
                  onClick={() => handleToggleAllTestAds(true)}
                  disabled={testActionLoading}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition cursor-pointer"
                  title="Activate all test ads to verify 2-column mode"
                >
                  Activate All Test Ads
                </button>
                <button
                  onClick={() => handleToggleAllTestAds(false)}
                  disabled={testActionLoading}
                  className="text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition cursor-pointer"
                  title="Deactivate all test ads"
                >
                  Deactivate All Test Ads
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Live Preview Button */}
            <button
              onClick={() => {
                setPreviewKey(Date.now());
                setPreviewModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#194331] font-bold text-xs px-3.5 py-2 rounded-xl border border-[#E5DFD3] shadow-2xs transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#BF8B36]" />
              <span>In-App Preview</span>
            </button>

            <a
              href="/?preview=true"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#194331] font-bold text-xs px-3 py-2 rounded-xl border border-[#E5DFD3] shadow-2xs transition"
              title="Open Home Page in New Tab with preview parameter"
            >
              <span>Preview Tab</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {/* Reset Test Data Button */}
            {testAdsCount > 0 && (
              <button
                onClick={handleResetTestData}
                disabled={testActionLoading}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl border border-rose-200 transition cursor-pointer disabled:opacity-50"
                title="Safely remove test ads without affecting real advertiser campaigns"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Test Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Executive Stat Cards Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Ads */}
        <button
          onClick={() => setFilterPlacement("ALL")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "ALL"
              ? "bg-[#194331] text-white border-[#194331] shadow-md ring-2 ring-[#BF8B36]"
              : "bg-white hover:bg-[#F8F6F0] border-[#E5DFD3] text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "ALL" ? "text-[#BF8B36]" : "text-slate-500"}`}>
              Total Ads
            </span>
            <Layers className={`w-4 h-4 ${filterPlacement === "ALL" ? "text-[#BF8B36]" : "text-slate-400"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{ads.length}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "ALL" ? "text-slate-300" : "text-slate-500"}`}>All Campaigns</p>
          </div>
        </button>

        {/* Card 2: Active Ads */}
        <button
          onClick={() => setFilterPlacement("ACTIVE")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "ACTIVE"
              ? "bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-emerald-400"
              : "bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-200/80 text-emerald-950 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "ACTIVE" ? "text-emerald-300" : "text-emerald-700"}`}>
              Active Live
            </span>
            <CheckCircle2 className={`w-4 h-4 ${filterPlacement === "ACTIVE" ? "text-emerald-300" : "text-emerald-600"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{activeCount}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "ACTIVE" ? "text-emerald-200" : "text-emerald-700"}`}>Currently Displayed</p>
          </div>
        </button>

        {/* Card 3: Inactive Ads */}
        <button
          onClick={() => setFilterPlacement("INACTIVE")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "INACTIVE"
              ? "bg-rose-900 text-white border-rose-900 shadow-md ring-2 ring-rose-400"
              : "bg-rose-50/50 hover:bg-rose-100/60 border-rose-200/80 text-rose-950 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "INACTIVE" ? "text-rose-300" : "text-rose-700"}`}>
              Inactive Ads
            </span>
            <XCircle className={`w-4 h-4 ${filterPlacement === "INACTIVE" ? "text-rose-300" : "text-rose-600"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{inactiveCount}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "INACTIVE" ? "text-rose-200" : "text-rose-700"}`}>Paused / Hidden</p>
          </div>
        </button>

        {/* Card 4: Home Page Ads */}
        <button
          onClick={() => setFilterPlacement("HOME")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            filterPlacement === "HOME"
              ? "bg-[#BF8B36] text-white border-[#BF8B36] shadow-md ring-2 ring-[#194331]"
              : "bg-[#FBF4E4] hover:bg-[#F3E5C8] border-[#E5D2B0] text-[#181E1A] shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${filterPlacement === "HOME" ? "text-white" : "text-[#BF8B36]"}`}>
              Home Page
            </span>
            <LayoutGrid className={`w-4 h-4 ${filterPlacement === "HOME" ? "text-white" : "text-[#BF8B36]"}`} />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold">{homeCount}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${filterPlacement === "HOME" ? "text-white/80" : "text-slate-600"}`}>Targeted on Home</p>
          </div>
        </button>

        {/* Card 5: Total Link Clicks */}
        <div className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/50 text-left shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-purple-700">
              Total Clicks
            </span>
            <MousePointerClick className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-serif font-bold text-purple-950">{totalClicks.toLocaleString()}</p>
            <p className="text-[10px] font-medium text-purple-700 mt-0.5">Live Engagement</p>
          </div>
        </div>

      </div>

      {/* Segmented Control Filter Bar & Search Input */}
      <div className="bg-[#F8F6F0] border border-[#E5DFD3] p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Placement Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "ALL", label: "All Ads", count: ads.length },
            { id: "REAL", label: "Real Campaigns", count: realAdsCount },
            { id: "TEST", label: "Test Ads", count: testAdsCount },
            { id: "HOME", label: "Home Page", count: homeCount },
            { id: "INNER", label: "Inner Pages", count: innerCount },
            { id: "ACTIVE", label: "Active", count: activeCount },
            { id: "INACTIVE", label: "Inactive", count: inactiveCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterPlacement(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                filterPlacement === tab.id
                  ? "bg-white text-[#194331] shadow-2xs border border-[#E5DFD3]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                filterPlacement === tab.id ? "bg-[#194331] text-[#BF8B36]" : "bg-slate-200 text-slate-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Actions: Search Bar & Refresh */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-[240px] justify-end">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ad by name or target URL..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E5DFD3] focus:border-[#BF8B36] pl-8 pr-7 py-2 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={fetchAds}
            className="text-xs font-bold text-slate-600 hover:text-[#194331] flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl bg-white border border-[#E5DFD3] hover:bg-slate-50 transition shadow-2xs shrink-0"
            title="Refresh Ad List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#BF8B36]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Ad List Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs">
          Loading Ads Buzz database...
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="border border-dashed border-[#E5DFD3] rounded-3xl p-12 text-center max-w-md mx-auto my-8 bg-white space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FBF4E4] text-[#BF8B36] flex items-center justify-center mx-auto font-bold text-xl">
            📢
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#181E1A]">No Ad Banners Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filterPlacement === "TEST" 
                ? "No test advertisements currently in the database. Use 'Add Dummy Ad' above to create one!" 
                : "Create your first ad banner to display community promotions and sponsor partnerships!"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleCreateDummyAd(0)}
              className="bg-[#BF8B36] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#a6772b] transition cursor-pointer"
            >
              Add Dummy Test Ad
            </button>
            <button
              onClick={() => openCreateModal(false)}
              className="bg-[#194331] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#113224] transition cursor-pointer"
            >
              Create Banner
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className={`bg-white border rounded-2xl p-4 shadow-2xs space-y-3 transition flex flex-col justify-between ${
                ad.isTest 
                  ? "border-[#E5D2B0] bg-[#FBF4E4]/30" 
                  : ad.isActive 
                    ? "border-[#E5DFD3] hover:border-[#BF8B36]" 
                    : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div className="space-y-3">
                {/* Banner Preview Image */}
                <div className="aspect-[3.2/1] rounded-xl overflow-hidden bg-slate-100 relative border border-[#E5DFD3]">
                  <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-[#194331] text-white px-2 py-0.5 rounded shadow-2xs">
                    Order #{ad.displayOrder}
                  </span>
                  
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {ad.isTest && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-2xs bg-[#BF8B36] text-white border border-[#a6772b] flex items-center gap-1">
                        <FlaskConical className="w-2.5 h-2.5" />
                        TEST AD
                      </span>
                    )}
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-2xs border ${
                      ad.isActive 
                        ? "bg-emerald-600 text-white border-emerald-700" 
                        : "bg-slate-700 text-slate-200 border-slate-600"
                    }`}>
                      {ad.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-serif font-bold text-sm text-[#181E1A] truncate" title={ad.name}>
                      {ad.name}
                    </h4>
                  </div>
                  {ad.masjid?.name && (
                    <p className="text-[10px] text-[#BF8B36] font-mono font-bold flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      <span>{ad.masjid.name}</span>
                    </p>
                  )}
                  {ad.isPlatformWide && (
                    <p className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1 mt-0.5">
                      <span>🌐 Platform-Wide Campaign</span>
                    </p>
                  )}
                  {ad.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{ad.description}</p>
                  )}
                  <a
                    href={ad.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#194331] hover:underline flex items-center gap-1 mt-1 font-mono truncate font-medium"
                  >
                    <span>{ad.targetUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-[#BF8B36]" />
                  </a>
                </div>

                {/* Placement & Format Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
                  {ad.isExclusive && (
                    <span className="bg-[#FBF4E4] text-[#BF8B36] px-2.5 py-0.5 rounded-md border border-[#E5D2B0] shadow-2xs flex items-center gap-1 font-bold">
                      👑 EXCLUSIVE SOLO AD
                    </span>
                  )}
                  <span className="bg-[#F8F6F0] text-slate-700 px-2 py-0.5 rounded-md border border-[#E5DFD3]">
                    📍 {getPlacementLabel(ad.placement)}
                  </span>
                  <span className="bg-[#E6F0EB] text-[#194331] px-2 py-0.5 rounded-md border border-[#B7D4C5]">
                    📐 {ad.format === "FULL_WIDTH" ? "Sidebar Banner" : ad.format === "HALF_WIDTH" ? "Dual Half Grid" : "4-Card Combined Grid"}
                  </span>
                </div>

                {/* Warning when ad is tagged as test while testMode is off */}
                {ad.isTest && !testMode && (
                  <div className="bg-[#FBF4E4] border border-[#E5D2B0] text-amber-900 px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#BF8B36] shrink-0" />
                      <span>Hidden on live website (Test Mode is OFF).</span>
                    </div>
                    {ad.canEdit !== false && (
                      <button
                        type="button"
                        onClick={() => handleToggleTest(ad)}
                        className="bg-[#194331] hover:bg-[#113224] text-white font-bold px-2 py-0.5 rounded-md text-[10px] shrink-0 transition cursor-pointer"
                      >
                        Make Live
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#E5DFD3]/70 flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-slate-500 font-mono font-semibold flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3 text-purple-600" />
                  <span>{ad.clickCount} clicks</span>
                </span>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {ad.canEdit !== false ? (
                    <>
                      <button
                        onClick={() => handleToggleTest(ad)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                          ad.isTest
                            ? "bg-purple-100 hover:bg-emerald-50 text-purple-900 hover:text-emerald-800 border border-purple-200"
                            : "bg-emerald-100 hover:bg-purple-50 text-emerald-900 hover:text-purple-800 border border-emerald-200"
                        }`}
                        title={ad.isTest ? "Click to publish as Live Campaign" : "Click to tag as Sandbox Test Ad"}
                      >
                        <FlaskConical className="w-3 h-3" />
                        <span>{ad.isTest ? "Test Ad" : "Live Ad"}</span>
                      </button>
                      <button
                        onClick={() => handleToggleExclusive(ad)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                          ad.isExclusive
                            ? "bg-[#BF8B36] text-white border border-[#a6772b] shadow-2xs font-extrabold"
                            : "bg-white hover:bg-[#F8F6F0] text-slate-700 hover:text-[#194331] border border-[#E5DFD3]"
                        }`}
                        title={ad.isExclusive ? "Remove Solo Exclusive Takeover" : "Make Solo Exclusive Takeover"}
                      >
                        <span>👑</span>
                        <span>{ad.isExclusive ? "Solo Active" : "Set Solo"}</span>
                      </button>
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          ad.isActive
                            ? "bg-[#FBF4E4] hover:bg-[#F3E5C8] text-[#BF8B36] border border-[#E5D2B0]"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {ad.isActive ? "Pause" : "Enable"}
                      </button>
                      <button
                        onClick={() => openEditModal(ad)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                      🔒 Platform Managed (View Only)
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── IN-APP LIVE PREVIEW MODAL ── */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#181E1A]/80 backdrop-blur-xs flex flex-col p-3 md:p-6 items-center justify-center animate-in fade-in">
          <div className="bg-white border border-[#E5DFD3] rounded-3xl w-full max-w-6xl h-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Top Bar */}
            <div className="bg-[#194331] text-white px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#BF8B36] text-white flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                    <span>{previewPath === "/" ? "Home Page" : "Inner Page"} Live Display Preview</span>
                    <span className="text-[10px] font-mono bg-[#BF8B36] text-white px-2 py-0.5 rounded font-bold">
                      {homeActiveEligibleCount > 0 ? "2-Column Mode" : "Full-Width Mode"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/80 font-mono">
                    Showing http://localhost:3002{previewPath}{previewPath.includes("?") ? "&" : "?"}preview=true
                  </p>
                </div>
              </div>

              {/* Page Selector & Viewport switchers */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-[#113224] px-2.5 py-1 rounded-xl border border-emerald-900/50">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold hidden lg:inline">Page:</span>
                  <select
                    value={previewPath}
                    onChange={e => {
                      setPreviewPath(e.target.value);
                      setPreviewKey(Date.now());
                    }}
                    className="bg-transparent border-0 text-[#BF8B36] text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="/" className="bg-[#194331] text-white">🏠 Home Page</option>
                    <option value="/masjids" className="bg-[#194331] text-white">🕌 Masjids Directory</option>
                    <option value="/donations" className="bg-[#194331] text-white">❤️ Donations Page</option>
                    <option value="/ads-buzz" className="bg-[#194331] text-white">📢 Ads Buzz Directory</option>
                    <option value="/events" className="bg-[#194331] text-white">📅 Events &amp; Classes</option>
                    <option value="/announcements" className="bg-[#194331] text-white">📣 Announcements</option>
                    <option value="/about" className="bg-[#194331] text-white">ℹ️ About Us</option>
                    <option value="/contact" className="bg-[#194331] text-white">📞 Contact Us</option>
                  </select>
                </div>

                <div className="hidden sm:flex items-center bg-[#113224] p-1 rounded-xl border border-emerald-900/50 gap-1">
                  <button
                    onClick={() => setPreviewViewport("desktop")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      previewViewport === "desktop" ? "bg-[#BF8B36] text-white font-bold" : "text-emerald-200 hover:text-white"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (1440px)</span>
                  </button>
                  <button
                    onClick={() => setPreviewViewport("tablet")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      previewViewport === "tablet" ? "bg-[#BF8B36] text-white font-bold" : "text-emerald-200 hover:text-white"
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet (768px)</span>
                  </button>
                  <button
                    onClick={() => setPreviewViewport("mobile")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      previewViewport === "mobile" ? "bg-[#BF8B36] text-white font-bold" : "text-emerald-200 hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (375px)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewKey(Date.now())}
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#113224] rounded-lg cursor-pointer"
                  title="Reload preview"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <a
                  href={`${previewPath}${previewPath.includes("?") ? "&" : "?"}preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#113224] rounded-lg cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#113224] rounded-lg cursor-pointer ml-1"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Wrapper */}
            <div className="flex-1 bg-[#F8F6F0] flex items-center justify-center p-2 overflow-auto">
              <div
                className={`h-full transition-all duration-300 bg-white rounded-xl shadow-md overflow-hidden ${
                  previewViewport === "desktop"
                    ? "w-full max-w-full"
                    : previewViewport === "tablet"
                    ? "w-[768px] border-8 border-slate-800 rounded-3xl"
                    : "w-[375px] border-8 border-slate-800 rounded-3xl"
                }`}
              >
                <iframe
                  key={previewKey}
                  src={`${previewPath}${previewPath.includes("?") ? "&" : "?"}preview=true`}
                  className="w-full h-full border-0"
                  title="Display Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Ad Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#181E1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DFD3] rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col overflow-hidden text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DFD3] p-5 shrink-0 bg-[#F8F6F0]">
              <h3 className="font-serif font-bold text-lg text-[#181E1A] flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#BF8B36]" />
                <span>{editingAd ? "Edit Ad Banner" : form.isTest ? "Create Test Ad Banner" : "Create New Ad Banner"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveAd} className="flex flex-col flex-1 min-h-0 text-xs font-sans">
              <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-4 text-xs">
                
                {/* Masjid Association for Super Admin */}
                {!isMasjidAdminView && masjidsList.length > 0 && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Masjid Scope Assignment</label>
                    <select
                      value={form.masjidId}
                      onChange={e => setForm({ ...form, masjidId: e.target.value })}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium text-xs"
                    >
                      <option value="">🌐 Platform-Wide Campaign (All Masjids)</option>
                      {masjidsList.map((m) => (
                        <option key={m.id} value={m.id}>
                          🕌 {m.name} ({m.location})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ad Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Reach Home Loans @ 8.35%"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief partner or promotion subtitle..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Image *</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="https://... or upload image"
                        value={form.imageUrl}
                        onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                        className="flex-1 bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium text-xs"
                      />
                      <label className="bg-[#194331] hover:bg-[#113224] text-white font-bold px-3 py-2.5 rounded-xl transition cursor-pointer text-xs shrink-0 border border-[#BF8B36]/30 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-[#BF8B36]" />
                        <span>{uploadingImage ? "Uploading..." : "Browse"}</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>

                    {form.imageUrl && (
                      <div className="aspect-[3.2/1] rounded-xl overflow-hidden bg-slate-100 border border-[#E5DFD3] relative">
                        <img 
                          src={form.imageUrl} 
                          alt="Ad Preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">Or pick sample template:</span>
                      {PRESET_SAMPLE_ADS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, imageUrl: sample.imageUrl, ...(prev.name ? {} : { name: sample.name, targetUrl: sample.targetUrl }) }))}
                          className="text-[10px] bg-[#F8F6F0] hover:bg-[#FBF4E4] text-slate-700 hover:text-[#194331] border border-[#E5DFD3] px-2 py-0.5 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Sample #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Click Destination URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://example.com/hajj-packages or /donations"
                    value={form.targetUrl}
                    onChange={e => setForm({ ...form, targetUrl: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Page Placement *</label>
                    <select
                      value={form.placement}
                      onChange={e => setForm({ ...form, placement: e.target.value as any })}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium text-xs"
                    >
                      <option value="BOTH">🌐 All Pages (Home &amp; Inner)</option>
                      <option value="HOME_ONLY">🏡 Home Page Only</option>
                      <option value="INNER_ONLY">📄 Only Inner Pages (Masjids, Announcements, Events, Donations)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Inner pages: Masjids, Announcements, Events, Donations, and Masjid profiles.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Banner Layout Format *</label>
                    <select
                      value={form.format}
                      onChange={e => setForm({ ...form, format: e.target.value as any })}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-medium text-xs"
                    >
                      <option value="FULL_WIDTH">🖼️ Full Width Sidebar Banner</option>
                      <option value="HALF_WIDTH">📐 Dual Half Width Sidebar Grid</option>
                      <option value="QUAD_GRID">🧩 4-Card Combined Grid Block</option>
                    </select>
                  </div>
                </div>

                {/* Exclusive Solo Ad Banner Option */}
                <div className="bg-[#FBF4E4] border border-[#E5D2B0] rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isExclusiveCheck"
                      checked={form.isExclusive}
                      onChange={e => setForm({ ...form, isExclusive: e.target.checked })}
                      className="w-4 h-4 accent-[#194331] rounded cursor-pointer"
                    />
                    <label htmlFor="isExclusiveCheck" className="font-bold text-[#181E1A] cursor-pointer text-xs flex items-center gap-1">
                      👑 Exclusive Solo Banner Takeover (Hide All Other Ads)
                    </label>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium pl-6">
                    Check this if the sponsor purchased an exclusive placement. When active, ONLY this single ad will appear in the sidebar.
                  </p>
                </div>

                {/* Tag as Test Advertisement Option */}
                <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isTestCheck"
                      checked={form.isTest}
                      onChange={e => setForm({ ...form, isTest: e.target.checked })}
                      className="w-4 h-4 text-purple-600 accent-purple-600 rounded cursor-pointer"
                    />
                    <label htmlFor="isTestCheck" className="font-bold text-purple-950 cursor-pointer text-xs flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                      <span>Tag as Test Advertisement (Sandbox Isolation)</span>
                    </label>
                  </div>
                  <p className="text-[10.5px] text-purple-800 leading-relaxed font-medium pl-6">
                    Test ads are only shown when Test Mode is turned ON or in preview mode. They can be safely cleared with 1 click using "Reset Test Data".
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sort Display Order (Priority #) *</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      required
                      value={form.displayOrder}
                      onChange={e => setForm({ ...form, displayOrder: e.target.value })}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] focus:bg-white focus:border-[#BF8B36] p-2.5 rounded-xl text-slate-900 focus:outline-none transition font-bold text-xs"
                    />
                  </div>

                  <div className="pt-5 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActiveCheck"
                      checked={form.isActive}
                      onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 accent-[#194331] rounded cursor-pointer"
                    />
                    <label htmlFor="isActiveCheck" className="font-bold text-slate-700 cursor-pointer">
                      Enable Ad Banner
                    </label>
                  </div>
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div className="p-4 border-t border-[#E5DFD3] bg-[#F8F6F0] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#194331] text-white hover:bg-[#113224] font-bold px-5 py-2 rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#BF8B36]" />
                  <span>{saving ? "Saving..." : editingAd ? "Update Banner" : "Create Banner"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
