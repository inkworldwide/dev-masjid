"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { Megaphone, Plus, Trash2, X, AlertTriangle } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  category: string;
  description: string;
  isImportant: boolean;
  createdAt: string;
}

export default function MasjidAdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General Notice");
  const [description, setDescription] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/masjid-admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please provide both Title and Description.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/masjid-admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          isImportant,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        setTitle("");
        setDescription("");
        setIsImportant(false);
        fetchAnnouncements();
      } else {
        alert(data.error || "Failed to publish announcement.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while publishing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`/api/masjid-admin/announcements?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <Megaphone className="w-7 h-7 text-[#BF8B36]" /> Public Notices & Announcements
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Broadcast Jummah notices, medical camps, and urgent committee alerts.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No announcements published yet. Click "Create Announcement" to post one.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((anc) => (
              <div key={anc.id} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase bg-[#FBF4E4] px-2.5 py-0.5 rounded border border-[#E5D2B0]">
                      {anc.category}
                    </span>
                    {anc.isImportant && (
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" /> URGENT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(anc.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#181E1A]">{anc.title}</h3>
                <p className="text-xs text-[#525E56] leading-relaxed whitespace-pre-line">{anc.description}</p>

                <div className="border-t border-[#E5DFD3] pt-3 flex justify-end">
                  <button
                    onClick={() => handleDeleteAnnouncement(anc.id)}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Notice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Announcement */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Create Announcement Notice</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Notice Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Special Jummah Prayer Timing Update & Khutbah Schedule"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Notice Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#194331]"
                  >
                    <option value="General Notice">General Notice</option>
                    <option value="Jummah Schedule">Jummah Schedule</option>
                    <option value="Ramadan & Iftar">Ramadan & Iftar</option>
                    <option value="Medical Camp">Medical Camp</option>
                    <option value="Committee Alert">Committee Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Notice Description / Details</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write announcement details for the committee..."
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div className="flex items-center gap-2 bg-[#FBF4E4] border border-[#E5D2B0] p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="w-4 h-4 text-[#194331] border-[#E5DFD3] rounded focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isImportant" className="text-xs font-bold text-[#181E1A] cursor-pointer">
                    Mark as Urgent / Important Alert
                  </label>
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
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Publishing..." : "Publish Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
