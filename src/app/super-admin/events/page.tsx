"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { Calendar, Building2, Clock, MapPin } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  speaker: string | null;
  date: string;
  time: string | null;
  description: string;
  masjid?: {
    name: string;
    city: string;
  } | null;
}

export default function SuperAdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/super-admin/data");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
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
            <Calendar className="w-7 h-7 text-[#194331]" /> Global Events Schedule
          </h1>
          <p className="text-xs text-[#525E56] mt-1">
            Global governance view of upcoming lectures, Quranic circles, and youth workshops across all Masjids.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading events schedule...</div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No events scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-[#194331] bg-[#E6F0EB] border border-[#B7D4C5] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#194331]" /> {ev.masjid?.name || "Masjid Event"} ({ev.masjid?.city || "Pan-India"})
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#BF8B36] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#BF8B36]" /> {ev.date} {ev.time && `• ${ev.time}`}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#181E1A]">{ev.title}</h3>
                {ev.speaker && <p className="text-xs font-bold text-[#194331]">By {ev.speaker}</p>}
                <p className="text-xs text-[#525E56] line-clamp-3 leading-relaxed">{ev.description}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
