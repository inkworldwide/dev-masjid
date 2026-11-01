"use client";
import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../admin/layout";
import {
  Image as ImageIcon,
  Plus,
  Play,
  Star,
  Trash2,
  Eye,
  Search,
  Filter,
  X,
  Upload,
  Video,
  Sparkles,
  ExternalLink,
  Layers,
  Building,
} from "lucide-react";

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [masjids, setMasjids] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("");

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLightboxModal, setShowLightboxModal] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "EXTERIOR",
    type: "IMAGE", // IMAGE | VIDEO
    url: "",
    description: "",
    isFeatured: false,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          url: data.url,
        }));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload file.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    } finally {
      setUploadingFile(false);
    }
  };

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

  // Fetch Media
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const url = selectedMasjidId
        ? `/api/masjid-admin/media?masjidId=${selectedMasjidId}`
        : `/api/masjid-admin/media`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.media || []);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedMasjidId]);

  // Handle Add / Upload Media
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      alert("Please provide Title and Media URL");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/masjid-admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId: selectedMasjidId,
          ...formData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.media);
        setShowUploadModal(false);
        setFormData({
          title: "",
          category: "EXTERIOR",
          type: "IMAGE",
          url: "",
          description: "",
          isFeatured: false,
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add media");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving media item");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Media
  const handleDeleteMedia = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from gallery?`)) return;
    try {
      const res = await fetch(`/api/masjid-admin/media?id=${id}&masjidId=${selectedMasjidId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.media);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Media Items
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategoryFilter === "ALL" || item.category === selectedCategoryFilter;
      const matchesType =
        selectedTypeFilter === "ALL" || item.type === selectedTypeFilter;

      return matchesSearch && matchesCat && matchesType;
    });
  }, [mediaItems, searchQuery, selectedCategoryFilter, selectedTypeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = mediaItems.length;
    const photos = mediaItems.filter((m) => m.type === "IMAGE").length;
    const videos = mediaItems.filter((m) => m.type === "VIDEO").length;
    const featured = mediaItems.filter((m) => m.isFeatured).length;

    return { total, photos, videos, featured };
  }, [mediaItems]);

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        {/* ========================================================================= */}
        {/* HEADER & ACTION BUTTON */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
              <ImageIcon className="w-8 h-8 text-[#BF8B36]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">
                  Media Gallery & Video Tours
                </h1>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Verified Assets
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Upload and showcase high-resolution photos, event albums, and virtual video tours.
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
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-[#194331] hover:bg-[#123325] text-white font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#BF8B36]" />
              <span>Upload New Media</span>
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
                Total Gallery Items
              </span>
              <div className="p-2 bg-emerald-50 text-[#194331] rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.total}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Photos & Video Clips</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                HD Photos
              </span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.photos}</p>
            <p className="text-[11px] text-blue-600 font-mono mt-1">Architecture & Facilities</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Video Tours & Khutbahs
              </span>
              <div className="p-2 bg-red-50 text-red-700 rounded-xl">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.videos}</p>
            <p className="text-[11px] text-red-600 font-mono mt-1">Virtual Stream Embeds</p>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Featured Highlights
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#181E1A]">{stats.featured}</p>
            <p className="text-[11px] text-amber-600 font-mono mt-1">Displayed on Main Portal</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH AND CATEGORY FILTER TABS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search photos & video titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#194331]"
              />
            </div>

            {/* Type Filter (Photos / Videos) */}
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              {[
                { id: "ALL", label: "All Media" },
                { id: "IMAGE", label: "Photos Only" },
                { id: "VIDEO", label: "Videos Only" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                    selectedTypeFilter === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-[#F8F6F0] text-slate-600 hover:bg-[#E5DFD3]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E5DFD3]/60">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase mr-1">
              Category:
            </span>
            {[
              { id: "ALL", label: "All Categories" },
              { id: "EXTERIOR", label: "Exterior & Minarets" },
              { id: "PRAYER_HALL", label: "Prayer Hall" },
              { id: "EVENTS", label: "Events & Classes" },
              { id: "RAMADAN", label: "Ramadan & Festivals" },
              { id: "CONSTRUCTION", label: "Construction & Wudu" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition ${
                  selectedCategoryFilter === cat.id
                    ? "bg-[#194331] text-[#BF8B36]"
                    : "bg-[#F8F6F0] text-slate-600 hover:bg-[#E5DFD3]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MEDIA GALLERY GRID */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="bg-white border border-[#E5DFD3] p-12 text-center rounded-2xl text-xs font-mono text-slate-500">
            Loading media gallery assets...
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] p-12 text-center rounded-2xl space-y-2">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Media Found</p>
            <p className="text-xs font-mono text-slate-400">
              Try adjusting search terms or upload new photos for this mosque.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col justify-between"
              >
                {/* Media Image / Video Preview Box */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer">
                  <img
                    src={item.type === "VIDEO" ? item.thumbnail || item.url : item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                  />

                  {/* Video Play Icon Overlay */}
                  {item.type === "VIDEO" && (
                    <div
                      onClick={() => setShowLightboxModal(item)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-6 h-6 ml-1 fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {item.isFeatured && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-bold font-mono text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>FEATURED</span>
                    </span>
                  )}

                  {/* Type Badge */}
                  <span className="absolute top-3 right-3 bg-black/60 text-white font-mono text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {item.type}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#194331] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                        {item.category.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.dateAdded}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-slate-800 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-mono">
                    <button
                      onClick={() => setShowLightboxModal(item)}
                      className="flex items-center gap-1.5 text-[#194331] font-bold hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#BF8B36]" />
                      <span>View Full Resolution</span>
                    </button>

                    <button
                      onClick={() => handleDeleteMedia(item.id, item.title)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Delete Media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD NEW MEDIA */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#E5DFD3] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#194331]" />
                <h3 className="font-serif text-lg font-bold text-slate-800">
                  Upload Media Asset
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Media Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mosque Courtyard & Minarets View"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Media Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  >
                    <option value="IMAGE">Photo / Image</option>
                    <option value="VIDEO">Video Embed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  >
                    <option value="EXTERIOR">Exterior & Minarets</option>
                    <option value="PRAYER_HALL">Prayer Hall</option>
                    <option value="EVENTS">Events & Classes</option>
                    <option value="RAMADAN">Ramadan & Festivals</option>
                    <option value="CONSTRUCTION">Construction & Wudu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  {formData.type === "VIDEO" ? "Video Embed URL (YouTube/Vimeo)" : "Image File / URL *"}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder={
                        formData.type === "VIDEO"
                          ? "https://www.youtube.com/embed/..."
                          : "Paste image URL or upload file"
                      }
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="flex-1 bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                    />
                    {formData.type === "IMAGE" && (
                      <label className="relative flex items-center justify-center gap-1.5 bg-[#194331] hover:bg-[#123325] text-white font-bold px-3.5 py-2 rounded-xl text-xs font-mono transition cursor-pointer shadow-xs whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5 text-[#BF8B36]" />
                        <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingFile}
                          onChange={handleMediaFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {formData.type === "IMAGE" && formData.url && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#E5DFD3] bg-slate-100 group">
                      <img
                        src={formData.url}
                        alt="Media Preview"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, url: "" })}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs opacity-90 hover:opacity-100 transition shadow"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the photo or video content..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:border-[#194331]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#194331] rounded"
                />
                <label htmlFor="isFeatured" className="font-mono text-xs text-slate-700">
                  Feature this on public Mosque Landing Page
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold font-mono px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#194331] hover:bg-[#123325] text-white font-bold font-mono px-5 py-2 rounded-xl shadow"
                >
                  {saving ? "Uploading..." : "Save to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL RESOLUTION LIGHTBOX PREVIEW */}
      {/* ========================================================================= */}
      {showLightboxModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full space-y-4 relative">
            <button
              onClick={() => setShowLightboxModal(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 font-mono text-xs"
            >
              <X className="w-6 h-6" />
              <span>Close</span>
            </button>

            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {showLightboxModal.type === "VIDEO" ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={showLightboxModal.url}
                    title={showLightboxModal.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={showLightboxModal.url}
                  alt={showLightboxModal.title}
                  className="w-full max-h-[75vh] object-contain mx-auto"
                />
              )}

              <div className="p-6 bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold">
                    {showLightboxModal.title}
                  </h3>
                  <span className="text-xs font-mono text-[#BF8B36] uppercase bg-white/10 px-3 py-1 rounded-full">
                    {showLightboxModal.category.replace("_", " ")}
                  </span>
                </div>
                {showLightboxModal.description && (
                  <p className="text-xs text-slate-300 font-sans">
                    {showLightboxModal.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
