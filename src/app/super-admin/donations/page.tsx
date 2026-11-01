"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { Heart, Search, TrendingUp, Users, Target, Link as LinkIcon, Building2, Lock, Edit2, Trash2, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDonationsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [allMasjids, setAllMasjids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [masjidFilter, setMasjidFilter] = useState("All Masjids");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', purpose: '', category: 'GENERAL_FUND', goalAmount: '', masjidId: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "raised" | "donors" | "progress">("default");

  const openModal = (campaign: any = null) => {
    setEditingCampaign(campaign);
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        purpose: campaign.purpose || '',
        category: campaign.category || 'GENERAL_FUND',
        goalAmount: campaign.goalAmount || '',
        masjidId: campaign.masjidId || ''
      });
    } else {
      setFormData({ title: '', purpose: '', category: 'GENERAL_FUND', goalAmount: '', masjidId: allMasjids[0]?.id || '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.goalAmount || !formData.masjidId) return alert("Please fill required fields");
    
    setIsSaving(true);
    try {
      const url = editingCampaign ? `/api/super-admin/donations/${editingCampaign.id}` : `/api/super-admin/donations`;
      const method = editingCampaign ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const { data } = await res.json();
        if (editingCampaign) {
          setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...data } : c));
        } else {
          setCampaigns([data, ...campaigns]);
        }
        setIsModalOpen(false);
      } else {
        alert("Failed to save campaign");
      }
    } catch (e) {
      alert("Error saving campaign");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/super-admin/data");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.donations || []);
          setAllMasjids(data.masjids || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/super-admin/donations/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCampaigns(campaigns.filter(c => c.id !== id));
        } else {
          alert("Failed to delete campaign.");
        }
      } catch (e) {
        alert("Error deleting campaign.");
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "CLOSED" ? "ACTIVE" : "CLOSED";
    if (confirm(`Are you sure you want to mark this campaign as ${newStatus}?`)) {
      try {
        const res = await fetch(`/api/super-admin/donations/${id}`, { 
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } else {
          alert("Failed to update status.");
        }
      } catch (e) {
        alert("Error updating campaign status.");
      }
    }
  };

  const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.raisedAmount || 0), 0);
  const totalDonors = campaigns.reduce((acc, c) => acc + Number(c.donations?.length || 0), 0);
  const activeCount = campaigns.filter(c => c.status !== "CLOSED").length;
  
  const avgProgress = campaigns.length > 0 
    ? Math.round(campaigns.reduce((acc, c) => acc + Math.min(100, (Number(c.raisedAmount) / Number(c.goalAmount)) * 100), 0) / campaigns.length) 
    : 0;

  // Format currency in Lakhs/Crores for large numbers (mocking ₹57.3L format)
  const formatLargeAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const categories = ["All", ...Array.from(new Set(campaigns.map(c => c.category).filter(Boolean)))];
  // If the fetched categories are empty, fallback to the ones in the image so the UI looks right
  const displayCategories = categories.length > 1 ? categories : ["All", "General Masjid Fund", "Construction", "Maintenance", "Education", "Zakat", "Charity", "Community Welfare", "Emergency"];

  const uniqueMasjids = Array.from(new Set(allMasjids.map(m => m.name).filter(Boolean)));

  let filteredCampaigns = campaigns.filter(c => {
    const matchesMasjid = masjidFilter === "All Masjids" || c.masjid?.name === masjidFilter;
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    const matchesActive = !activeOnly || c.status !== "CLOSED";
    return matchesMasjid && matchesCategory && matchesActive;
  });

  if (sortBy === "raised") {
    filteredCampaigns.sort((a, b) => Number(b.raisedAmount) - Number(a.raisedAmount));
  } else if (sortBy === "donors") {
    filteredCampaigns.sort((a, b) => (b.donations?.length || 0) - (a.donations?.length || 0));
  } else if (sortBy === "progress") {
    filteredCampaigns.sort((a, b) => {
      const progA = Number(a.goalAmount) ? Number(a.raisedAmount) / Number(a.goalAmount) : 0;
      const progB = Number(b.goalAmount) ? Number(b.raisedAmount) / Number(b.goalAmount) : 0;
      return progB - progA;
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-10 font-sans bg-[#FBFBFB] min-h-screen px-2 sm:px-6">
        
        {/* Top Header Text */}
        <div className="flex justify-between items-start pt-4">
          <div>
            <h4 className="text-sm font-bold text-[#181E1A]">Global Campaigns Governance</h4>
            <p className="text-xs text-slate-500">Fundraising Projects</p>
          </div>
          <Link 
            href="/donations" 
            target="_blank"
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 border border-[#E5DFD3] bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition shadow-xs"
          >
            <ExternalLink className="w-3 h-3" /> View Public Directory
          </Link>
        </div>

        {/* Main Heading Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <span className="text-red-500">❤️</span> Fundraising Campaigns
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Manage community collections, goals and donor records.
            </p>
          </div>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#194331] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#113224] transition shadow-md"
          >
            <Plus className="w-4 h-4" /> Launch Campaign
          </button>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setSortBy(sortBy === "raised" ? "default" : "raised")}
            className={`bg-white border rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 ${sortBy === "raised" ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-[#E5DFD3]'}`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <LinkIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-[#181E1A] font-mono leading-none mb-1">{formatLargeAmount(totalRaised)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Raised {sortBy === "raised" && <span className="text-emerald-500 ml-1">(Sorting)</span>}</p>
          </div>
          
          <div 
            onClick={() => setActiveOnly(!activeOnly)}
            className={`bg-white border rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-amber-300 ${activeOnly ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-[#E5DFD3]'}`}
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-[#181E1A] font-mono leading-none mb-1">{activeCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Campaigns {activeOnly && <span className="text-amber-500 ml-1">(Filtered)</span>}</p>
          </div>

          <div 
            onClick={() => setSortBy(sortBy === "donors" ? "default" : "donors")}
            className={`bg-white border rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${sortBy === "donors" ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#E5DFD3]'}`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-[#181E1A] font-mono leading-none mb-1">{totalDonors.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Donors {sortBy === "donors" && <span className="text-blue-500 ml-1">(Sorting)</span>}</p>
          </div>

          <div 
            onClick={() => setSortBy(sortBy === "progress" ? "default" : "progress")}
            className={`bg-white border rounded-2xl p-5 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-red-300 ${sortBy === "progress" ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#E5DFD3]'}`}
          >
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-[#181E1A] font-mono leading-none mb-1">{avgProgress}%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Progress {sortBy === "progress" && <span className="text-red-500 ml-1">(Sorting)</span>}</p>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
              <div className="h-full bg-red-500" style={{ width: `${avgProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-4">
          <div className="relative w-full xl:w-72 shrink-0">
            <select
              value={masjidFilter}
              onChange={(e) => setMasjidFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5DFD3] rounded-full text-xs font-bold text-slate-600 focus:outline-none focus:border-[#BF8B36] shadow-xs cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
            >
              <option value="All Masjids">All Masjids</option>
              {uniqueMasjids.map((m: any) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-2 min-w-max">
              {displayCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                    categoryFilter === cat 
                      ? "bg-[#194331] text-white shadow-md" 
                      : "bg-white border border-[#E5DFD3] text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{filteredCampaigns.length} campaigns</span>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading campaigns...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No campaigns found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredCampaigns.map((c) => {
              const progressPct = Math.min(100, Math.round((Number(c.raisedAmount || 0) / Number(c.goalAmount || 1)) * 100));
              const donorCount = c.donations?.length || 0;
              
              return (
                <div key={c.id} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                  
                  <div className="space-y-4">
                    {/* Top Row: ID & Badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md tracking-wider">
                        DON-{c.id.substring(0, 3).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {c.category || "General"}
                        </span>
                        {c.status === "CLOSED" ? (
                          <span className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Closed
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 
                        onClick={() => openModal(c)}
                        className="font-bold text-[#181E1A] text-sm leading-snug line-clamp-2 hover:text-[#BF8B36] cursor-pointer transition-colors"
                      >
                        {c.title}
                      </h3>
                      <p className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-2">
                        <Building2 className="w-3 h-3 text-slate-400" /> {c.masjid?.name || "Mosque"}
                      </p>
                    </div>

                    {/* Progress Section */}
                    <div className="pt-2">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Raised</span>
                        <span className="text-[10px] font-bold text-[#181E1A]">{progressPct}% of goal</span>
                      </div>
                      
                      <div className="w-full bg-[#F8F6F0] rounded-full h-1.5 overflow-hidden mb-2">
                        <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm font-extrabold text-[#194331]">₹{Number(c.raisedAmount).toLocaleString("en-IN")}</span>
                        <span className="font-mono text-[10px] font-bold text-slate-400">of ₹{Number(c.goalAmount).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between border-t border-[#E5DFD3] pt-4 mt-4">
                    <div className="flex items-center gap-1 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      <span className="text-[10px] font-bold text-red-700">{donorCount} Donors</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-2 mr-2 cursor-pointer" onClick={() => handleToggleStatus(c.id, c.status)} title={c.status === "CLOSED" ? "Enable Campaign" : "Disable Campaign"}>
                        <button
                          type="button"
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${c.status === "CLOSED" ? 'bg-slate-300' : 'bg-emerald-500'}`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${c.status === "CLOSED" ? 'translate-x-0.5' : 'translate-x-3.5'}`}
                          />
                        </button>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${c.status === "CLOSED" ? 'text-slate-400' : 'text-emerald-600'}`}>
                          {c.status === "CLOSED" ? "Inactive" : "Active"}
                        </span>
                      </div>
                      <button 
                        onClick={() => openModal(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-[#181E1A] text-lg font-serif">
                {editingCampaign ? 'Edit Campaign' : 'Launch New Campaign'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Campaign Title *</label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#BF8B36]"
                  placeholder="e.g. Roof Repair Fund"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Purpose / Description *</label>
                <textarea 
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#BF8B36] min-h-[80px]"
                  placeholder="Briefly describe the campaign's purpose..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#BF8B36]"
                  >
                    <option value="GENERAL_FUND">General Fund</option>
                    <option value="ZAKAT">Zakat</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="EDUCATION">Education</option>
                    <option value="CHARITY">Charity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Goal Amount (₹) *</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#BF8B36]"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Target Masjid *</label>
                <select 
                  required
                  value={formData.masjidId}
                  onChange={(e) => setFormData({...formData, masjidId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#BF8B36]"
                >
                  <option value="" disabled>Select a Masjid...</option>
                  {allMasjids.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold bg-[#194331] text-white hover:bg-[#113224] rounded-lg transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : (editingCampaign ? 'Save Changes' : 'Launch Campaign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
