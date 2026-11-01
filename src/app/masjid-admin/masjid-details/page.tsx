"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import {
  Building2,
  Save,
  MapPin,
  Phone,
  Video,
  Bus,
  Train,
  Navigation,
  Plane,
  CheckCircle2,
  Landmark,
  Plus,
  CreditCard,
  QrCode,
  X,
  Copy,
  Check,
  Pencil,
  Trash2,
  Upload,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  Clock,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface PrayerEntry {
  id: string;
  name: string;
  time: string;
  startTime?: string;
  endTime?: string | null;
  endTimeMode?: "TIME" | "NA";
  isActive: boolean;
  order: number;
}

interface ExternalLinkConfig {
  url: string;
  label: string;
  isActive: boolean;
}

interface LandmarkEntry {
  id: string;
  name: string;
  distance: string;
  unit: string;
  isActive: boolean;
  order: number;
}

interface SurroundingConfig {
  heading: string;
  overviewLabel: string;
  overviewDesc: string;
  landmarksLabel: string;
  landmarks: LandmarkEntry[];
  link: ExternalLinkConfig;
}

interface FacilityEntry {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export default function MasjidAdminDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masjid, setMasjid] = useState<any>(null);

  // Form fields
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pictures, setPictures] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [videoTourUrl, setVideoTourUrl] = useState("");
  const [surroundingAreaDesc, setSurroundingAreaDesc] = useState("");
  const [nearbyLandmarks, setNearbyLandmarks] = useState("");
  const [busDistance, setBusDistance] = useState("");
  const [trainDistance, setTrainDistance] = useState("");
  const [metroDistance, setMetroDistance] = useState("");
  const [airportDistance, setAirportDistance] = useState("");

  // Priority 1: Dynamic Daily Iqamah Schedule
  const [dailyPrayers, setDailyPrayers] = useState<PrayerEntry[]>([]);
  const [prayerTimingLink, setPrayerTimingLink] = useState<ExternalLinkConfig>({
    url: "",
    label: "View Complete Prayer Timings",
    isActive: false,
  });

  // Priority 2: Dynamic Surrounding Area & Landmarks
  const [surroundingDetails, setSurroundingDetails] = useState<SurroundingConfig>({
    heading: "Surrounding Area & Landmarks",
    overviewLabel: "NEIGHBORHOOD OVERVIEW",
    overviewDesc: "",
    landmarksLabel: "NEARBY LANDMARKS",
    landmarks: [],
    link: {
      url: "",
      label: "Explore Area & Heritage",
      isActive: false,
    },
  });

  // Priority 3: Dynamic Masjid Facilities
  const [customFacilities, setCustomFacilities] = useState<FacilityEntry[]>([]);

  // Bank Accounts state
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Bank Account Form State
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    accountType: "SAVINGS",
    ifscCode: "",
    upiId: "",
    openingBalance: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  // Edit Bank Account Form State
  const [editForm, setEditForm] = useState({
    id: "",
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    accountType: "SAVINGS",
    ifscCode: "",
    upiId: "",
    balance: "",
  });
  const [updatingBank, setUpdatingBank] = useState(false);

  const fetchMasjidDetails = async () => {
    try {
      const res = await fetch("/api/masjid-admin/details");
      if (res.ok) {
        const data = await res.json();
        if (data.masjid) {
          const m = data.masjid;
          setMasjid(m);
          setName(m.name || "");
          setContactNumber(m.contactNumber || "");
          setPlotSize(m.plotSize || "");
          setRegistrationNo(m.registrationNo || "");
          setDescription(m.description || "");
          setCoverImage(m.coverImage || "");
          setPictures(m.pictures || []);
          setVideoTourUrl(m.videoTourUrl || "");
          setSurroundingAreaDesc(m.surroundingAreaDesc || "");
          setNearbyLandmarks(m.nearbyLandmarks || "");
          setBusDistance(m.busDistance || "");
          setTrainDistance(m.trainDistance || "");
          setMetroDistance(m.metroDistance || "");
          setAirportDistance(m.airportDistance || "");

          // 1. Initialize Daily Prayers
          if (Array.isArray(m.dailyPrayers) && m.dailyPrayers.length > 0) {
            setDailyPrayers(
              m.dailyPrayers.map((p: any, idx: number) => {
                const sTime = p.startTime || p.time || "";
                const eMode = p.endTimeMode || (p.endTime && p.endTime !== "NA" ? "TIME" : "NA");
                const eTime = eMode === "TIME" ? (p.endTime || "") : null;
                return {
                  id: p.id || `prayer-${idx}`,
                  name: p.name || "",
                  time: sTime,
                  startTime: sTime,
                  endTime: eTime,
                  endTimeMode: eMode,
                  isActive: p.isActive !== false,
                  order: p.order ?? idx,
                };
              })
            );
          } else {
            setDailyPrayers([
              { id: "p1", name: "Fajr", time: m.fajrTime || "05:15 AM", startTime: m.fajrTime || "05:15 AM", endTime: null, endTimeMode: "NA", isActive: true, order: 0 },
              { id: "p2", name: "Dhuhr", time: m.dhuhrTime || "01:30 PM", startTime: m.dhuhrTime || "01:30 PM", endTime: null, endTimeMode: "NA", isActive: true, order: 1 },
              { id: "p3", name: "Asr", time: m.asrTime || "05:00 PM", startTime: m.asrTime || "05:00 PM", endTime: null, endTimeMode: "NA", isActive: true, order: 2 },
              { id: "p4", name: "Maghrib", time: m.maghribTime || "07:15 PM", startTime: m.maghribTime || "07:15 PM", endTime: null, endTimeMode: "NA", isActive: true, order: 3 },
              { id: "p5", name: "Isha", time: m.ishaTime || "08:45 PM", startTime: m.ishaTime || "08:45 PM", endTime: null, endTimeMode: "NA", isActive: true, order: 4 },
              { id: "p6", name: "Jummah", time: m.jummahTime || "01:45 PM", startTime: m.jummahTime || "01:45 PM", endTime: null, endTimeMode: "NA", isActive: true, order: 5 },
            ]);
          }

          if (m.prayerTimingLink) {
            setPrayerTimingLink({
              url: m.prayerTimingLink.url || "",
              label: m.prayerTimingLink.label || "View Complete Prayer Timings",
              isActive: Boolean(m.prayerTimingLink.isActive),
            });
          } else {
            setPrayerTimingLink({
              url: "",
              label: "View Complete Prayer Timings",
              isActive: false,
            });
          }

          // 2. Initialize Surrounding Details
          if (m.surroundingDetails) {
            setSurroundingDetails({
              heading: m.surroundingDetails.heading || "Surrounding Area & Landmarks",
              overviewLabel: m.surroundingDetails.overviewLabel || "NEIGHBORHOOD OVERVIEW",
              overviewDesc: m.surroundingDetails.overviewDesc || m.surroundingAreaDesc || "Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.",
              landmarksLabel: m.surroundingDetails.landmarksLabel || "NEARBY LANDMARKS",
              landmarks: Array.isArray(m.surroundingDetails.landmarks) && m.surroundingDetails.landmarks.length > 0
                ? m.surroundingDetails.landmarks.map((l: any, idx: number) => ({
                    id: l.id || `lm-${idx}`,
                    name: l.name || "",
                    distance: l.distance || "",
                    unit: l.unit || "m",
                    isActive: l.isActive !== false,
                    order: l.order ?? idx,
                  }))
                : [
                    { id: "lm1", name: "Charminar", distance: "100", unit: "m", isActive: true, order: 0 },
                    { id: "lm2", name: "Chowmahalla Palace", distance: "400", unit: "m", isActive: true, order: 1 },
                    { id: "lm3", name: "Laad Bazaar", distance: "150", unit: "m", isActive: true, order: 2 },
                  ],
              link: m.surroundingDetails.link || {
                url: "",
                label: "Explore Area & Heritage",
                isActive: false,
              },
            });
          } else {
            setSurroundingDetails({
              heading: "Surrounding Area & Landmarks",
              overviewLabel: "NEIGHBORHOOD OVERVIEW",
              overviewDesc: m.surroundingAreaDesc || "Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.",
              landmarksLabel: "NEARBY LANDMARKS",
              landmarks: [
                { id: "lm1", name: "Charminar", distance: "100", unit: "m", isActive: true, order: 0 },
                { id: "lm2", name: "Chowmahalla Palace", distance: "400", unit: "m", isActive: true, order: 1 },
                { id: "lm3", name: "Laad Bazaar", distance: "150", unit: "m", isActive: true, order: 2 },
              ],
              link: {
                url: "",
                label: "Explore Area & Heritage",
                isActive: false,
              },
            });
          }

          // 3. Initialize Custom Facilities
          if (Array.isArray(m.customFacilities) && m.customFacilities.length > 0) {
            setCustomFacilities(
              m.customFacilities.map((f: any, idx: number) => ({
                id: f.id || `fac-${idx}`,
                name: typeof f === "string" ? f : (f.name || ""),
                isActive: typeof f === "string" ? true : (f.isActive !== false),
                order: typeof f === "string" ? idx : (f.order ?? idx),
              }))
            );
          } else if (Array.isArray(m.facilities) && m.facilities.length > 0) {
            setCustomFacilities(
              m.facilities.map((name: string, idx: number) => ({
                id: `fac-${idx}`,
                name,
                isActive: true,
                order: idx,
              }))
            );
          } else {
            setCustomFacilities([
              { id: "f1", name: "Women's Prayer Area", isActive: true, order: 0 },
              { id: "f2", name: "Wudu Area", isActive: true, order: 1 },
              { id: "f3", name: "Parking", isActive: true, order: 2 },
              { id: "f4", name: "Quran Classes", isActive: true, order: 3 },
              { id: "f5", name: "Library", isActive: true, order: 4 },
              { id: "f6", name: "Wheelchair Access", isActive: true, order: 5 },
              { id: "f7", name: "Funeral Facilities", isActive: true, order: 6 },
            ]);
          }
        }
      }

      // Fetch Bank accounts
      const bankRes = await fetch("/api/masjid-admin/bank-accounts");
      if (bankRes.ok) {
        const bankData = await bankRes.json();
        setBankAccounts(bankData.bankAccounts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasjidDetails();
  }, []);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
      } else {
        alert(data.error || "Failed to upload cover photo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
        }
      }

      if (newUrls.length > 0) {
        setPictures((prev) => [...prev, ...newUrls]);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading gallery photos.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setPictures((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput("");
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================================================================
  // PRIORITY 1: DAILY IQAMAH SCHEDULE HANDLERS
  // =========================================================================
  const handleAddPrayer = () => {
    const newPrayer: PrayerEntry = {
      id: `prayer-${Date.now()}`,
      name: "",
      time: "12:00 PM",
      startTime: "12:00 PM",
      endTime: null,
      endTimeMode: "NA",
      isActive: true,
      order: dailyPrayers.length,
    };
    setDailyPrayers((prev) => [...prev, newPrayer]);
  };

  const handlePrayerChange = (id: string, field: keyof PrayerEntry, value: any) => {
    setDailyPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemovePrayer = (id: string, prayerName: string) => {
    if (dailyPrayers.length <= 1) {
      alert("At least one prayer entry must remain in the schedule.");
      return;
    }
    if (confirm(`Are you sure you want to remove "${prayerName || "this prayer"}" from the schedule?`)) {
      setDailyPrayers((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleMovePrayer = (index: number, direction: number) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= dailyPrayers.length) return;
    const updated = [...dailyPrayers];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    const reordered = updated.map((p, idx) => ({ ...p, order: idx }));
    setDailyPrayers(reordered);
  };

  // =========================================================================
  // PRIORITY 2: SURROUNDING AREA & LANDMARKS HANDLERS
  // =========================================================================
  const handleAddLandmark = () => {
    const newLm: LandmarkEntry = {
      id: `lm-${Date.now()}`,
      name: "",
      distance: "",
      unit: "m",
      isActive: true,
      order: surroundingDetails.landmarks.length,
    };
    setSurroundingDetails((prev) => ({
      ...prev,
      landmarks: [...prev.landmarks, newLm],
    }));
  };

  const handleLandmarkChange = (id: string, field: keyof LandmarkEntry, value: any) => {
    setSurroundingDetails((prev) => ({
      ...prev,
      landmarks: prev.landmarks.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const handleRemoveLandmark = (id: string, landmarkName: string) => {
    if (confirm(`Are you sure you want to remove "${landmarkName || "this landmark"}"?`)) {
      setSurroundingDetails((prev) => ({
        ...prev,
        landmarks: prev.landmarks.filter((l) => l.id !== id),
      }));
    }
  };

  const handleMoveLandmark = (index: number, direction: number) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= surroundingDetails.landmarks.length) return;
    const updated = [...surroundingDetails.landmarks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    const reordered = updated.map((l, idx) => ({ ...l, order: idx }));
    setSurroundingDetails((prev) => ({
      ...prev,
      landmarks: reordered,
    }));
  };

  // =========================================================================
  // PRIORITY 3: MASJID FACILITIES HANDLERS
  // =========================================================================
  const handleAddFacility = () => {
    const newFac: FacilityEntry = {
      id: `fac-${Date.now()}`,
      name: "",
      isActive: true,
      order: customFacilities.length,
    };
    setCustomFacilities((prev) => [...prev, newFac]);
  };

  const handleFacilityChange = (id: string, field: keyof FacilityEntry, value: any) => {
    setCustomFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleRemoveFacility = (id: string, facilityName: string) => {
    if (confirm(`Are you sure you want to remove "${facilityName || "this facility"}"?`)) {
      setCustomFacilities((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleMoveFacility = (index: number, direction: number) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= customFacilities.length) return;
    const updated = [...customFacilities];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    const reordered = updated.map((f, idx) => ({ ...f, order: idx }));
    setCustomFacilities(reordered);
  };

  // =========================================================================
  // SAVE & CANCEL HANDLERS
  // =========================================================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. URL validation if enabled
    if (prayerTimingLink.isActive && prayerTimingLink.url?.trim()) {
      const u = prayerTimingLink.url.trim();
      if (!/^https?:\/\//i.test(u)) {
        alert("Prayer Timing Link URL must begin with http:// or https://");
        return;
      }
    }

    if (surroundingDetails.link?.isActive && surroundingDetails.link?.url?.trim()) {
      const u = surroundingDetails.link.url.trim();
      if (!/^https?:\/\//i.test(u)) {
        alert("Surrounding Area Link URL must begin with http:// or https://");
        return;
      }
    }

    // 2. Validate Prayers
    for (const p of dailyPrayers) {
      if (!p.name?.trim()) {
        alert("Every prayer in the schedule must have a name.");
        return;
      }
      const sTime = p.startTime || p.time;
      if (!sTime?.trim()) {
        alert(`Please specify a Start/Iqamah time for prayer: ${p.name}`);
        return;
      }
      if (p.endTimeMode === "TIME" && !p.endTime?.trim()) {
        alert(`Please specify an End time or click "Set NA" for prayer: ${p.name}`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/masjid-admin/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contactNumber,
          plotSize,
          registrationNo,
          description,
          coverImage,
          pictures,
          videoTourUrl,
          surroundingAreaDesc: surroundingDetails.overviewDesc || surroundingAreaDesc,
          nearbyLandmarks,
          busDistance,
          trainDistance,
          metroDistance,
          airportDistance,
          dailyPrayers: dailyPrayers.map((p) => ({
            ...p,
            time: p.startTime || p.time,
            startTime: p.startTime || p.time,
            endTime: p.endTimeMode === "NA" ? null : p.endTime,
            endTimeMode: p.endTimeMode || "NA",
          })),
          prayerTimingLink,
          surroundingDetails,
          customFacilities,
        }),
      });

      if (res.ok) {
        alert("Mosque profile and settings saved successfully!");
        await fetchMasjidDetails();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update details.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = async () => {
    if (confirm("Discard all unsaved changes and reset to last saved data?")) {
      await fetchMasjidDetails();
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber) {
      return alert("Bank Name and Account Number are required.");
    }

    setSavingBank(true);
    try {
      const res = await fetch("/api/masjid-admin/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm),
      });

      if (res.ok) {
        setShowAddBankModal(false);
        setBankForm({
          bankName: "",
          accountTitle: "",
          accountNumber: "",
          accountType: "SAVINGS",
          ifscCode: "",
          upiId: "",
          openingBalance: "",
        });
        const bankRes = await fetch("/api/masjid-admin/bank-accounts");
        if (bankRes.ok) {
          const bankData = await bankRes.json();
          setBankAccounts(bankData.bankAccounts || []);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add bank account.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving bank account.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleEditClick = (acc: any) => {
    setEditForm({
      id: acc.id,
      bankName: acc.bankName || "",
      accountTitle: acc.accountTitle || "",
      accountNumber: acc.accountNumberLast4 || "",
      accountType: acc.accountType || "SAVINGS",
      ifscCode: acc.ifscCode || "",
      upiId: acc.upiId || "",
      balance: acc.currentBalance ? String(acc.currentBalance) : "",
    });
    setShowEditBankModal(true);
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingBank(true);
    try {
      const res = await fetch("/api/masjid-admin/bank-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setShowEditBankModal(false);
        const bankRes = await fetch("/api/masjid-admin/bank-accounts");
        if (bankRes.ok) {
          const bankData = await bankRes.json();
          setBankAccounts(bankData.bankAccounts || []);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update bank account.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating bank account.");
    } finally {
      setUpdatingBank(false);
    }
  };

  const handleDeleteBank = async (accId: string) => {
    if (!confirm("Are you sure you want to delete this bank account record?")) return;

    try {
      const res = await fetch(`/api/masjid-admin/bank-accounts?id=${accId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBankAccounts((prev) => prev.filter((a) => a.id !== accId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete bank account.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting bank account.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-slate-500 font-mono">
          Loading Mosque Profile & Account Details...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
              <Building2 className="w-8 h-8 text-[#BF8B36]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">
                  Mosque Profile & Details
                </h1>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  Verified Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Manage mosque identity, daily Iqamah schedule, surrounding landmarks, facilities, and official bank accounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelChanges}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#E5DFD3] hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel Changes</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-[#194331] hover:bg-[#123325] text-white font-bold px-6 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#BF8B36]" />
              <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: BANK & DONATION ACCOUNT DETAILS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD3] pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-[#181E1A] text-[#BF8B36] flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#BF8B36]" /> Official Donation Bank Accounts & UPI Details
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Bank accounts listed here are displayed on public donation receipts and used for audit reconciliation.
              </p>
            </div>

            <button
              onClick={() => setShowAddBankModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#a6772a] text-[#194331] font-bold px-4 py-2 rounded-xl text-xs font-mono transition shadow cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#194331]" />
              <span>Add Bank Account</span>
            </button>
          </div>

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-2xl p-4 space-y-3 relative group hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                  <span className="text-xs font-bold font-mono text-[#194331] flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-[#BF8B36]" /> {acc.bankName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {acc.accountType}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditClick(acc)}
                      className="p-1 text-slate-500 hover:text-[#194331] hover:bg-white rounded transition"
                      title="Edit Bank Account"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBank(acc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition"
                      title="Delete Bank Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account Title:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{acc.accountTitle}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">A/C Number:</span>
                    <span className="font-bold font-mono text-slate-900">•••• •••• {acc.accountNumberLast4}</span>
                  </div>

                  {acc.ifscCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-bold font-mono text-slate-800">{acc.ifscCode}</span>
                    </div>
                  )}

                  {acc.upiId && (
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-[#E5DFD3] mt-2">
                      <span className="text-slate-500 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-[#194331]" /> UPI ID:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold font-mono text-[#194331] text-[11px]">{acc.upiId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(acc.upiId, acc.id)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title="Copy UPI ID"
                        >
                          {copiedId === acc.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {bankAccounts.length === 0 && (
              <div className="col-span-full p-6 text-center bg-[#F8F6F0] rounded-2xl border border-dashed border-[#E5DFD3] text-slate-500 text-xs font-mono">
                No bank accounts registered yet. Click <strong>"+ Add Bank Account"</strong> to add donation bank details.
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN MOSQUE DETAILS FORM */}
        {/* ========================================================================= */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* OFFICIAL MOSQUE IMAGES & MEDIA UPLOAD SECTION */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#181E1A] text-[#BF8B36] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#BF8B36]" />
                  Official Mosque Media & Images
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Upload official cover photo and gallery pictures for public directory display.
                </p>
              </div>
            </div>

            {/* Official Cover Image Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold text-[#194331] uppercase tracking-wider">
                1. Official Mosque Cover Photo
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-xs">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Mosque Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-xs font-mono">No Cover Photo Set</span>
                    </div>
                  )}
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 bg-[#194331] hover:bg-[#123325] text-white font-bold px-4 py-2.5 rounded-xl text-xs font-mono cursor-pointer transition shadow-xs">
                      <Upload className="w-4 h-4 text-[#BF8B36]" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Cover Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400 font-mono">or paste direct image URL below</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#BF8B36]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mosque Gallery Pictures */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-mono font-bold text-[#194331] uppercase tracking-wider">
                  2. Mosque Gallery Pictures ({pictures.length})
                </label>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 bg-[#BF8B36] hover:bg-[#a6772b] text-[#194331] font-bold px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uploadingGallery ? "Uploading..." : "Upload Photos"}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryFileUpload}
                      disabled={uploadingGallery}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder="Paste photo URL (e.g. Prayer Hall, Exterior)..."
                  className="flex-1 px-3.5 py-2 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#BF8B36]"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-4 py-2 bg-[#194331] text-white rounded-xl text-xs font-mono font-bold hover:bg-[#123325] transition cursor-pointer"
                >
                  Add URL
                </button>
              </div>

              {pictures.length === 0 ? (
                <div className="p-6 bg-[#F8F6F0] border border-dashed border-[#E5DFD3] rounded-2xl text-center">
                  <p className="text-xs text-slate-500 font-mono">No gallery photos added yet. Upload files or paste image URLs above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                  {pictures.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-xs">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPhoto(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PRIMARY MOSQUE IDENTITY */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#181E1A] border-b border-[#E5DFD3] pb-2 text-[#BF8B36] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#BF8B36]" /> Primary Mosque Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1">Masjid Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#181E1A]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#181E1A]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1">Plot Size (e.g. 25,000 Sq Yards)</label>
                <input
                  type="text"
                  required
                  value={plotSize}
                  onChange={(e) => setPlotSize(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1">Waqf / Govt Registration Number</label>
                <input
                  type="text"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold text-xs mb-1">Description / History</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: DAILY IQAMAH SCHEDULE (Priority 1) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#181E1A] text-[#BF8B36] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#BF8B36]" /> Daily Iqamah Schedule
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Manage congregational prayer times, add custom prayers, reorder entries, or configure an external timing link.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPrayer}
                className="inline-flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#a6772b] text-[#194331] font-bold px-4 py-2 rounded-xl text-xs font-mono transition shadow cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#194331]" />
                <span>+ Add Prayer</span>
              </button>
            </div>

            {/* Prayer Grid - 3 entries per row on desktop, 2 on tablet, 1 on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyPrayers.map((prayer, index) => (
                <div
                  key={prayer.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    prayer.isActive ? "bg-[#F8F6F0] border-[#E5DFD3]" : "bg-slate-50/70 border-slate-200 opacity-60"
                  }`}
                >
                  {/* Order & Action Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD3]/60 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMovePrayer(index, -1)}
                          className="p-1 rounded hover:bg-white text-slate-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === dailyPrayers.length - 1}
                          onClick={() => handleMovePrayer(index, 1)}
                          className="p-1 rounded hover:bg-white text-slate-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="w-6 h-6 rounded-lg bg-white border border-[#E5DFD3] flex items-center justify-center text-[10px] font-mono font-bold text-[#BF8B36]">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrayerChange(prayer.id, "isActive", !prayer.isActive)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                          prayer.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300 border border-slate-300"
                        }`}
                      >
                        {prayer.isActive ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" /> Active
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 text-slate-500" /> Hidden
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemovePrayer(prayer.id, prayer.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove Prayer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Prayer Name, Start Time & End Time */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Prayer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={prayer.name}
                        onChange={(e) => handlePrayerChange(prayer.id, "name", e.target.value)}
                        placeholder="e.g. Fajr, Jummah"
                        className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-serif font-bold text-[#181E1A] focus:outline-none focus:border-[#BF8B36]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                          Start Time
                        </label>
                        <input
                          type="text"
                          required
                          value={prayer.startTime || prayer.time || ""}
                          onChange={(e) => {
                            handlePrayerChange(prayer.id, "startTime", e.target.value);
                            handlePrayerChange(prayer.id, "time", e.target.value);
                          }}
                          placeholder="05:15 AM"
                          className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-extrabold text-[#194331] focus:outline-none focus:border-[#BF8B36]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            End Time
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const isCurrentlyNA = prayer.endTimeMode === "NA";
                              handlePrayerChange(prayer.id, "endTimeMode", isCurrentlyNA ? "TIME" : "NA");
                              if (isCurrentlyNA) {
                                handlePrayerChange(prayer.id, "endTime", prayer.endTime || "06:00 AM");
                              } else {
                                handlePrayerChange(prayer.id, "endTime", null);
                              }
                            }}
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition cursor-pointer ${
                              prayer.endTimeMode === "NA"
                                ? "bg-[#BF8B36] text-white hover:bg-[#a6772b]"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                            }`}
                            title={prayer.endTimeMode === "NA" ? "Click to set a specific end time" : "Click to mark as NA (Not Applicable)"}
                          >
                            {prayer.endTimeMode === "NA" ? "NA Active" : "Set NA"}
                          </button>
                        </div>
                        {prayer.endTimeMode === "NA" ? (
                          <div className="w-full bg-slate-100/80 border border-dashed border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-400 flex items-center justify-between">
                            <span>NA (Not Applicable)</span>
                            <span className="text-[9px] text-[#BF8B36] font-semibold">No End Time</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={prayer.endTime || ""}
                            onChange={(e) => handlePrayerChange(prayer.id, "endTime", e.target.value)}
                            placeholder="06:00 AM"
                            className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-extrabold text-[#194331] focus:outline-none focus:border-[#BF8B36]"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {dailyPrayers.length === 0 && (
                <div className="col-span-full p-6 bg-[#F8F6F0] rounded-2xl border border-dashed border-[#E5DFD3] text-center text-xs font-mono text-slate-500">
                  No prayer timings configured. Click <strong>"+ Add Prayer"</strong> to add one.
                </div>
              )}
            </div>

            {/* External Prayer Timing Link Configuration */}
            <div className="mt-4 p-4.5 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD3]/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#BF8B36]" />
                  <span className="text-xs font-mono font-bold text-[#194331] uppercase">
                    Prayer Timing Information Link
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                  <span className="text-slate-600 font-bold">
                    {prayerTimingLink.isActive ? "Link Enabled" : "Link Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={prayerTimingLink.isActive}
                    onChange={(e) =>
                      setPrayerTimingLink((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#194331] rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    Link Label (Display Text)
                  </label>
                  <input
                    type="text"
                    value={prayerTimingLink.label}
                    onChange={(e) =>
                      setPrayerTimingLink((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder="e.g. View Complete Prayer Timings"
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    External URL (Safe HTTP / HTTPS)
                  </label>
                  <input
                    type="url"
                    value={prayerTimingLink.url}
                    onChange={(e) =>
                      setPrayerTimingLink((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="https://example.com/masjid-prayer-times.pdf"
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TRANSPORT DISTANCES */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#181E1A] border-b border-[#E5DFD3] pb-2 text-[#BF8B36] flex items-center gap-2">
              <Bus className="w-4 h-4 text-[#BF8B36]" /> Transport & Location Distances
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-[#194331]" /> Bus Station Distance
                </label>
                <input
                  type="text"
                  value={busDistance}
                  onChange={(e) => setBusDistance(e.target.value)}
                  placeholder="e.g. 100 meters from Charminar Bus Station"
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-[#194331]" /> Railway Station Distance
                </label>
                <input
                  type="text"
                  value={trainDistance}
                  onChange={(e) => setTrainDistance(e.target.value)}
                  placeholder="e.g. 3.2 km from Hyderabad Deccan Station (Nampally)"
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#194331]" /> Metro Station Distance
                </label>
                <input
                  type="text"
                  value={metroDistance}
                  onChange={(e) => setMetroDistance(e.target.value)}
                  placeholder="e.g. 1.8 km from MGBS Metro Station (Green Line)"
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-[#194331]" /> Airport Distance
                </label>
                <input
                  type="text"
                  value={airportDistance}
                  onChange={(e) => setAirportDistance(e.target.value)}
                  placeholder="e.g. 21 km from Rajiv Gandhi International Airport (HYD)"
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: SURROUNDING AREA & LANDMARKS (Priority 2) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="border-b border-[#E5DFD3] pb-3">
              <h3 className="font-serif text-base font-bold text-[#181E1A] text-[#BF8B36] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#BF8B36]" /> Surrounding Area & Landmarks
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Configure the neighborhood overview, manage nearby landmarks with distance, and optional external tourist link.
              </p>
            </div>

            {/* Section Headings & Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#194331] uppercase mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  required
                  value={surroundingDetails.heading}
                  onChange={(e) =>
                    setSurroundingDetails((prev) => ({ ...prev, heading: e.target.value }))
                  }
                  placeholder="Surrounding Area & Landmarks"
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#181E1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#194331] uppercase mb-1">
                  Neighborhood Overview Label
                </label>
                <input
                  type="text"
                  required
                  value={surroundingDetails.overviewLabel}
                  onChange={(e) =>
                    setSurroundingDetails((prev) => ({ ...prev, overviewLabel: e.target.value }))
                  }
                  placeholder="NEIGHBORHOOD OVERVIEW"
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono text-[#BF8B36] font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono font-bold text-[#194331] uppercase mb-1">
                  Neighborhood Overview Description
                </label>
                <textarea
                  rows={3}
                  value={surroundingDetails.overviewDesc}
                  onChange={(e) =>
                    setSurroundingDetails((prev) => ({ ...prev, overviewDesc: e.target.value }))
                  }
                  placeholder="Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries."
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] text-[#525E56] leading-relaxed"
                />
              </div>
            </div>

            {/* Nearby Landmarks Management */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono font-bold text-[#194331] uppercase tracking-wider">
                    Nearby Landmarks List
                  </label>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {surroundingDetails.landmarks.filter((l) => l.isActive).length} Active
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddLandmark}
                  className="inline-flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#a6772b] text-[#194331] font-bold px-3 py-1.5 rounded-xl text-xs font-mono transition shadow cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-[#194331]" />
                  <span>+ Add Landmark</span>
                </button>
              </div>

              {/* Landmarks Subheading Label */}
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  Landmarks Subheading Label
                </label>
                <input
                  type="text"
                  value={surroundingDetails.landmarksLabel}
                  onChange={(e) =>
                    setSurroundingDetails((prev) => ({ ...prev, landmarksLabel: e.target.value }))
                  }
                  placeholder="NEARBY LANDMARKS"
                  className="w-full sm:w-72 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#BF8B36] focus:outline-none focus:border-[#BF8B36]"
                />
              </div>

              {/* Landmarks Grid - 2 entries per row on desktop and tablet, 1 on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {surroundingDetails.landmarks.map((landmark, index) => (
                  <div
                    key={landmark.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                      landmark.isActive ? "bg-[#F8F6F0] border-[#E5DFD3]" : "bg-slate-50/70 border-slate-200 opacity-60"
                    }`}
                  >
                    {/* Order & Action Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD3]/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveLandmark(index, -1)}
                            className="p-1 rounded hover:bg-white text-slate-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === surroundingDetails.landmarks.length - 1}
                            onClick={() => handleMoveLandmark(index, 1)}
                            className="p-1 rounded hover:bg-white text-slate-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-white border border-[#E5DFD3] flex items-center justify-center text-[10px] font-mono font-bold text-[#BF8B36]">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleLandmarkChange(landmark.id, "isActive", !landmark.isActive)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                            landmark.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300 border border-slate-300"
                          }`}
                        >
                          {landmark.isActive ? "Active" : "Hidden"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveLandmark(landmark.id, landmark.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove Landmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Landmark Name & Distance Inputs */}
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                          Landmark Name
                        </label>
                        <input
                          type="text"
                          required
                          value={landmark.name}
                          onChange={(e) => handleLandmarkChange(landmark.id, "name", e.target.value)}
                          placeholder="e.g. Charminar, Chowmahalla Palace"
                          className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-[#181E1A] focus:outline-none focus:border-[#BF8B36]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                            Distance
                          </label>
                          <input
                            type="text"
                            value={landmark.distance}
                            onChange={(e) => handleLandmarkChange(landmark.id, "distance", e.target.value)}
                            placeholder="100"
                            className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#194331] focus:outline-none focus:border-[#BF8B36]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                            Unit
                          </label>
                          <select
                            value={landmark.unit}
                            onChange={(e) => handleLandmarkChange(landmark.id, "unit", e.target.value)}
                            className="w-full bg-white border border-[#E5DFD3] rounded-xl px-2.5 py-2 text-xs font-mono focus:outline-none focus:border-[#BF8B36]"
                          >
                            <option value="m">m (Metres)</option>
                            <option value="km">km (Kilometres)</option>
                            <option value="ft">ft (Feet)</option>
                            <option value="mi">mi (Miles)</option>
                            <option value="min walk">min walk</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {surroundingDetails.landmarks.length === 0 && (
                  <div className="col-span-full p-5 bg-[#F8F6F0] rounded-2xl border border-dashed border-[#E5DFD3] text-center text-xs font-mono text-slate-500">
                    No landmarks configured yet. Click <strong>"+ Add Landmark"</strong> to add one.
                  </div>
                )}
              </div>
            </div>

            {/* External Surrounding Information Link */}
            <div className="mt-4 p-4.5 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD3]/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#BF8B36]" />
                  <span className="text-xs font-mono font-bold text-[#194331] uppercase">
                    Surrounding Area Information Link
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                  <span className="text-slate-600 font-bold">
                    {surroundingDetails.link?.isActive ? "Link Enabled" : "Link Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={surroundingDetails.link?.isActive || false}
                    onChange={(e) =>
                      setSurroundingDetails((prev) => ({
                        ...prev,
                        link: { ...(prev.link || {}), isActive: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#194331] rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    Link Label (Display Text)
                  </label>
                  <input
                    type="text"
                    value={surroundingDetails.link?.label || ""}
                    onChange={(e) =>
                      setSurroundingDetails((prev) => ({
                        ...prev,
                        link: { ...(prev.link || {}), label: e.target.value },
                      }))
                    }
                    placeholder="e.g. Area Tourism & Guide"
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    External URL (Safe HTTP / HTTPS)
                  </label>
                  <input
                    type="url"
                    value={surroundingDetails.link?.url || ""}
                    onChange={(e) =>
                      setSurroundingDetails((prev) => ({
                        ...prev,
                        link: { ...(prev.link || {}), url: e.target.value },
                      }))
                    }
                    placeholder="https://telanganatourism.gov.in"
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: MASJID FACILITIES (Priority 3) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#181E1A] text-[#BF8B36] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#BF8B36]" /> Masjid Facilities
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Manage facilities displayed in green pill cards on the public page. Add, reorder, or toggle facility visibility.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddFacility}
                className="inline-flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#a6772b] text-[#194331] font-bold px-4 py-2 rounded-xl text-xs font-mono transition shadow cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#194331]" />
                <span>+ Add Facility</span>
              </button>
            </div>

            {/* Facilities Grid - 3 entries per row on desktop, 2 on tablet, 1 on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customFacilities.map((facility, index) => (
                <div
                  key={facility.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                    facility.isActive ? "bg-[#F8F6F0] border-[#E5DFD3]" : "bg-slate-50/70 border-slate-200 opacity-60"
                  }`}
                >
                  {/* Order & Action Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD3]/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveFacility(index, -1)}
                          className="p-1 rounded hover:bg-white text-slate-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === customFacilities.length - 1}
                          onClick={() => handleMoveFacility(index, 1)}
                          className="p-1 rounded hover:bg-white text-slate-500 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="w-5 h-5 rounded bg-white border border-[#E5DFD3] flex items-center justify-center text-[10px] font-mono font-bold text-[#BF8B36]">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFacilityChange(facility.id, "isActive", !facility.isActive)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                          facility.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300 border border-slate-300"
                        }`}
                      >
                        {facility.isActive ? "Active" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(facility.id, facility.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove Facility"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Facility Name Input */}
                  <div>
                    <input
                      type="text"
                      required
                      value={facility.name}
                      onChange={(e) => handleFacilityChange(facility.id, "name", e.target.value)}
                      placeholder="e.g. Women's Prayer Area"
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-[#181E1A] focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>
              ))}

              {customFacilities.length === 0 && (
                <div className="col-span-full p-5 bg-[#F8F6F0] rounded-2xl border border-dashed border-[#E5DFD3] text-center text-xs font-mono text-slate-500">
                  No facilities added. Click <strong>"+ Add Facility"</strong> to add one.
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FORM ACTION BUTTONS (BOTTOM) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-mono text-slate-600">
                All changes are securely saved to PostgreSQL and instantly updated on the public Masjid profile page.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancelChanges}
                disabled={saving}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50"
              >
                Cancel Changes
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#194331] hover:bg-[#123325] text-white font-bold px-6 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#BF8B36]" />
                <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* ADD BANK ACCOUNT MODAL */}
      {/* ========================================================================= */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                  Donation Bank Entry
                </span>
                <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-1">Add Mosque Bank Account</h3>
              </div>
              <button onClick={() => setShowAddBankModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4 text-xs font-mono">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India / HDFC Bank"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm((prev) => ({ ...prev, bankName: e.target.value }))}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Title / Beneficiary Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jama Masjid Managing Trust"
                  value={bankForm.accountTitle}
                  onChange={(e) => setBankForm((prev) => ({ ...prev, accountTitle: e.target.value }))}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 39201948201"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm((prev) => ({ ...prev, accountType: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                    <option value="TRUST">Trust Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">IFSC Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm((prev) => ({ ...prev, ifscCode: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">UPI ID / VPA (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. jamamasjid@sbi"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm((prev) => ({ ...prev, upiId: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Opening Balance (₹ INR)</label>
                <input
                  type="number"
                  placeholder="₹0"
                  value={bankForm.openingBalance}
                  onChange={(e) => setBankForm((prev) => ({ ...prev, openingBalance: e.target.value }))}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank}
                  className="bg-[#194331] hover:bg-[#123325] text-white font-bold px-5 py-2 rounded-xl transition shadow"
                >
                  {savingBank ? "Saving..." : "Save Bank Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT BANK ACCOUNT MODAL */}
      {/* ========================================================================= */}
      {showEditBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                  Edit Details
                </span>
                <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-1">Edit Bank Account</h3>
              </div>
              <button onClick={() => setShowEditBankModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBank} className="space-y-4 text-xs font-mono">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={editForm.bankName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bankName: e.target.value }))}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Title / Beneficiary Name</label>
                <input
                  type="text"
                  required
                  value={editForm.accountTitle}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, accountTitle: e.target.value }))}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Number (Last 4)</label>
                  <input
                    type="text"
                    required
                    value={editForm.accountNumber}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={editForm.accountType}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, accountType: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                    <option value="TRUST">Trust Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={editForm.ifscCode}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, ifscCode: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={editForm.upiId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, upiId: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => setShowEditBankModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingBank}
                  className="bg-[#194331] hover:bg-[#123325] text-white font-bold px-5 py-2 rounded-xl transition shadow"
                >
                  {updatingBank ? "Updating..." : "Update Bank Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
