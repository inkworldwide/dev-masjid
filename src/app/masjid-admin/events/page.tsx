"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { Calendar, Plus, Clock, MapPin, Trash2, X, User, Tag } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  category: string;
  eventDate: string;
  eventTime: string | null;
  location: string;
  speakerName: string | null;
  description: string;
}

export default function MasjidAdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Lecture");
  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventTime, setEventTime] = useState("7:30 PM");
  const [location, setLocation] = useState("Main Prayer Hall");
  const [speakerName, setSpeakerName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/masjid-admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      alert("Please provide both Event Title and Event Date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/masjid-admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          eventDate,
          eventEndDate: eventEndDate || eventDate,
          eventTime: eventTime.trim(),
          location: location.trim(),
          speakerName: speakerName.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        setTitle("");
        setSpeakerName("");
        setDescription("");
        setEventEndDate("");
        fetchEvents();
      } else {
        alert(data.error || "Failed to publish event.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while publishing event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/masjid-admin/events?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
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
              <Calendar className="w-7 h-7 text-[#BF8B36]" /> Events & Quranic Circles
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Publish and schedule committee lectures, Tafseer circles, and youth workshops.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading events schedule...</div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No events scheduled. Click "Create New Event" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-[#194331] uppercase bg-[#E6F0EB] px-2.5 py-0.5 rounded-full border border-[#B7D4C5]">
                      {ev.category}
                    </span>
                    <span className="text-xs font-bold font-mono text-[#BF8B36]">
                      {new Date(ev.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#181E1A]">{ev.title}</h3>
                  {ev.speakerName && (
                    <p className="text-xs font-bold text-[#194331] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#BF8B36]" /> {ev.speakerName}
                    </p>
                  )}
                  <p className="text-xs text-[#525E56] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#BF8B36]" /> {ev.eventTime} ({ev.location})
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{ev.description}</p>
                </div>

                <div className="border-t border-[#E5DFD3] pt-3 flex justify-end">
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Event */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Create New Event</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Tafseer & Hadith Circle"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Event Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#194331]"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Tafseer Circle">Tafseer Circle</option>
                      <option value="Youth Workshop">Youth Workshop</option>
                      <option value="Medical Camp">Medical Camp</option>
                      <option value="Nikkah Ceremony">Nikkah Ceremony</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Speaker Name</label>
                    <input
                      type="text"
                      value={speakerName}
                      onChange={(e) => setSpeakerName(e.target.value)}
                      placeholder="e.g. Maulana Tariq"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Event Start Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        if (!eventEndDate) setEventEndDate(e.target.value);
                      }}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Event End Date (Auto-Delete)</label>
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      placeholder="Auto-deletes after event"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Time</label>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="7:30 PM (After Maghrib)"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Location / Venue</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Main Prayer Hall"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Event Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about the lecture, topic, or agenda..."
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
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
                    {submitting ? "Publishing..." : "Publish Event"}
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
