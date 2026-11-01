"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { Megaphone, Building2, Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  masjid?: {
    name: string;
    city: string;
  } | null;
}

export default function SuperAdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/super-admin/data");
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        
        <div className="border-b border-[#E5DFD3] pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
            <Megaphone className="w-7 h-7 text-[#194331]" /> Announcements Audit
          </h1>
          <p className="text-xs text-[#525E56] mt-1">
            Global governance view of all published notices, prayer schedules, and updates across registered Masjids.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No public announcements posted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-[#BF8B36] uppercase bg-[#FBF4E4] border border-[#E5D2B0] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#BF8B36]" /> {ann.masjid?.name || "Global Notice"} ({ann.masjid?.city || "Pan-India"})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#181E1A]">{ann.title}</h3>
                <p className="text-xs text-[#525E56] line-clamp-3 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
