"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../admin/layout";
import { 
  Users, UserCheck, FileText, Landmark, Edit, Bell, 
  Megaphone, Calendar, UploadCloud, Building, UserPlus, HeartHandshake,
  ArrowRight, Activity
} from "lucide-react";

export default function MasjidOperationalEnvironment() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/masjid-admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-12 flex flex-col items-center justify-center text-[#194331] h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#BF8B36] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#BF8B36]">Loading Operational Data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data || !data.masjid) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-xs text-slate-400 font-mono">
          No assigned Masjid found for your account. Please complete registration or wait for Super Admin assignment.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col h-full space-y-6">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-[22px] font-bold text-[#181E1A] leading-tight">Masjid Operational Environment</h1>
            <p className="text-xs text-[#525E56]">Assigned Masjid Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/masjids/${data.masjid.id}`} 
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E5DFD3] rounded-xl text-xs font-bold text-[#194331] hover:bg-[#F8F6F0] transition shadow-sm"
            >
              <Activity className="w-3.5 h-3.5 text-[#BF8B36]" />
              View Public Directory
            </Link>
            <Link href="/masjid-admin/announcements" className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5DFD3] rounded-xl text-slate-500 hover:text-[#194331] hover:bg-[#F8F6F0] transition shadow-sm relative cursor-pointer" title="View Announcements">
              <Bell className="w-4 h-4" />
              {data.recentAnnouncements?.length > 0 && (
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              )}
            </Link>
          </div>
        </div>

        {/* Hero Context Banner */}
        <div className="w-full bg-[#194331] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-center shadow-lg border border-[#113224]">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 22h20L12 2z"/>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[10px] font-mono font-bold tracking-widest text-[#E5DFD3]/80 uppercase">
                  Tenant Isolation Active • {data.masjid.tenantId}
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                {data.masjid.name}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {data.masjid.address}{data.masjid.pincode ? `, ${data.masjid.pincode}` : ''}
              </p>
            </div>
            <Link
              href="/masjid-admin/masjid-details"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#BF8B36] text-[#BF8B36] font-bold text-xs hover:bg-[#BF8B36] hover:text-[#194331] transition shrink-0 bg-[#194331]/50 backdrop-blur-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/masjid-admin/roles" className="bg-white rounded-2xl p-5 border-y border-r border-[#E5DFD3] border-l-4 border-l-[#194331] shadow-sm flex flex-col justify-between h-[110px] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-[#194331] transition-colors">Committee Members</p>
              <Users className="w-4 h-4 text-[#194331]/60 group-hover:text-[#194331] transition-colors" />
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-[#194331]">{data.kpis.communityMembers}</p>
              <p className="text-[10px] text-slate-500 font-medium">Registered Worshippers</p>
            </div>
          </Link>

          <Link href="/masjid-admin/staff" className="bg-white rounded-2xl p-5 border-y border-r border-[#E5DFD3] border-l-4 border-l-[#BF8B36] shadow-sm flex flex-col justify-between h-[110px] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-[#BF8B36] transition-colors">Active Staff & Roles</p>
              <UserCheck className="w-4 h-4 text-[#BF8B36]" />
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-[#BF8B36]">{data.kpis.activeStaff}</p>
              <p className="text-[10px] text-slate-500 font-medium">Imam, Muezzin, Staff</p>
            </div>
          </Link>

          <Link href="/masjid-admin/documents" className="bg-white rounded-2xl p-5 border-y border-r border-[#E5DFD3] border-l-4 border-l-[#194331] shadow-sm flex flex-col justify-between h-[110px] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-[#194331] transition-colors">Document Vault</p>
              <FileText className="w-4 h-4 text-[#194331]/60 group-hover:text-[#194331] transition-colors" />
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-[#194331]">{data.kpis.documents}</p>
              <p className="text-[10px] text-slate-500 font-medium">Public & Restricted Title Deeds</p>
            </div>
          </Link>

          <Link href="/masjid-admin/properties" className="bg-white rounded-2xl p-5 border-y border-r border-[#E5DFD3] border-l-4 border-l-[#BF8B36] shadow-sm flex flex-col justify-between h-[110px] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-[#BF8B36] transition-colors">Commercial Properties</p>
              <Landmark className="w-4 h-4 text-[#BF8B36]" />
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-[#BF8B36]">{data.kpis.properties}</p>
              <p className="text-[10px] text-slate-500 font-medium">Waqf Revenue Generating Units</p>
            </div>
          </Link>
        </div>

        {/* Quick Actions Strip */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD3] shadow-sm">
          <h3 className="font-serif text-[15px] font-bold text-[#181E1A] mb-4">Masjid Administration Quick Actions</h3>
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-1">
            <Link href="/masjid-admin/announcements" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E5DFD3] bg-white hover:bg-[#F8F6F0] hover:border-[#BF8B36] transition text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">
              <Megaphone className="w-3.5 h-3.5 text-[#BF8B36]" /> Post Notice
            </Link>
            <Link href="/masjid-admin/events" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E5DFD3] bg-white hover:bg-[#F8F6F0] hover:border-[#BF8B36] transition text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#BF8B36]" /> Create Event
            </Link>
            <Link href="/masjid-admin/documents" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E5DFD3] bg-white hover:bg-[#F8F6F0] hover:border-[#BF8B36] transition text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">
              <UploadCloud className="w-3.5 h-3.5 text-[#BF8B36]" /> Upload Doc
            </Link>
            <Link href="/masjid-admin/properties" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E5DFD3] bg-white hover:bg-[#F8F6F0] hover:border-[#BF8B36] transition text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">
              <Building className="w-3.5 h-3.5 text-[#BF8B36]" /> Add Property
            </Link>
            <Link href="/masjid-admin/roles" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E5DFD3] bg-white hover:bg-[#F8F6F0] hover:border-[#BF8B36] transition text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">
              <UserPlus className="w-3.5 h-3.5 text-[#BF8B36]" /> Add Member
            </Link>
            <Link href="/masjid-admin/donations" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E5DFD3] bg-white hover:bg-[#F8F6F0] hover:border-[#BF8B36] transition text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">
              <HeartHandshake className="w-3.5 h-3.5 text-[#BF8B36]" /> New Campaign
            </Link>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Announcements Widget */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5DFD3] shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-[#E5DFD3] pb-3">
              <h3 className="font-serif text-[15px] font-bold text-[#181E1A] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#BF8B36]" /> Masjid Announcements ({data.recentAnnouncements?.length || 0})
              </h3>
              <Link href="/masjid-admin/announcements" className="text-[10px] font-bold text-slate-500 hover:text-[#194331] flex items-center gap-1 transition">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3 flex-1">
              {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                data.recentAnnouncements.map((announcement: any) => (
                  <div key={announcement.id} className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E5DFD3] hover:shadow-sm transition group cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-[12px] text-[#181E1A] group-hover:text-[#194331] transition line-clamp-1 flex-1 pr-4">{announcement.title}</p>
                      <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap pt-0.5">
                        {new Date(announcement.createdAt).toISOString().split('T')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {announcement.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                  <Megaphone className="w-6 h-6 text-slate-200 mb-2" />
                  <p className="text-[11px] text-slate-400">No recent announcements</p>
                </div>
              )}
            </div>
          </div>

          {/* Events Widget */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5DFD3] shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-[#E5DFD3] pb-3">
              <h3 className="font-serif text-[15px] font-bold text-[#181E1A] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#BF8B36]" /> Upcoming Programs ({data.upcomingEvents?.length || 0})
              </h3>
              <Link href="/masjid-admin/events" className="text-[10px] font-bold text-slate-500 hover:text-[#194331] flex items-center gap-1 transition">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3 flex-1">
              {data.upcomingEvents && data.upcomingEvents.length > 0 ? (
                data.upcomingEvents.map((evt: any) => (
                  <div key={evt.id} className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E5DFD3] hover:shadow-sm transition group cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-[12px] text-[#181E1A] group-hover:text-[#194331] transition line-clamp-1 flex-1 pr-4">{evt.title}</p>
                      <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap pt-0.5">
                        {new Date(evt.eventDate).toISOString().split('T')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5">
                      {evt.eventTime} • {evt.location}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                  <Calendar className="w-6 h-6 text-slate-200 mb-2" />
                  <p className="text-[11px] text-slate-400">No upcoming programs</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
