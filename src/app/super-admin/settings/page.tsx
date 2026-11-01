"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { Settings, Save, Server, Globe, Shield, Bell, CreditCard, Check } from "lucide-react";

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [config, setConfig] = useState({
    platformName: "MOsQuE Platform",
    supportEmail: "support@mosque-platform.com",
    maintenanceMode: false,
    twoFactorAuth: true,
    sessionTimeout: "60",
    notifyNewRegistration: true,
    notifySystemErrors: false,
    notifyGoalCompletion: true,
    notifyWeeklyDigest: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("superAdminSettings");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  const handleChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call and save to localStorage
    setTimeout(() => {
      localStorage.setItem("superAdminSettings", JSON.stringify(config));
      setIsSaving(false);
      setLastSaved("Settings successfully updated!");
      setTimeout(() => setLastSaved(null), 3000);
    }, 800);
  };

  if (!isLoaded) return null;

  const tabs = [
    { id: "general", label: "General Config", icon: Globe },
    { id: "security", label: "Security & Auth", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Payment Gateways", icon: CreditCard },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-10 font-sans bg-[#FBFBFB] min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-5 px-4 sm:px-6 pt-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-[#194331]" /> System Settings
            </h1>
            <p className="text-xs text-[#525E56] mt-1 font-mono">
              Manage global platform configurations, security, and integrations.
            </p>
          </div>
          {lastSaved && (
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl animate-fadeIn flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> {lastSaved}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 sm:px-6">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-64 shrink-0 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r from-[#194331] to-[#113224] text-white shadow-md border border-[#194331] scale-[1.02]" 
                      : "bg-transparent text-[#525E56] hover:bg-[#F8F6F0] hover:text-[#181E1A] border border-transparent"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#BF8B36]" : "text-slate-400"}`} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white border border-[#E5DFD3] rounded-[24px] p-6 sm:p-8 shadow-sm">
              
              <form onSubmit={handleSave} className="space-y-8">
                
                {activeTab === "general" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#181E1A] flex items-center gap-2">Global Platform Settings</h3>
                      <p className="text-xs text-[#525E56] mt-1">Basic identification and access controls for the entire platform.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">Platform Name</label>
                        <input type="text" value={config.platformName} onChange={(e) => handleChange("platformName", e.target.value)} className="w-full bg-white border border-[#E5DFD3] rounded-xl px-4 py-3 text-sm font-bold text-[#181E1A] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#BF8B36]/30 focus:border-[#BF8B36] transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">Support Email</label>
                        <input type="email" value={config.supportEmail} onChange={(e) => handleChange("supportEmail", e.target.value)} className="w-full bg-white border border-[#E5DFD3] rounded-xl px-4 py-3 text-sm font-bold text-[#181E1A] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#BF8B36]/30 focus:border-[#BF8B36] transition-all" />
                      </div>
                    </div>

                    <div className="mt-8 p-5 rounded-2xl border border-[#E5DFD3] bg-[#F8F6F0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#181E1A] mb-1">Platform Maintenance Mode</label>
                        <span className="text-xs text-[#525E56] font-medium block">Temporarily disable public access during system updates or migrations.</span>
                      </div>
                      <button type="button" onClick={() => handleChange("maintenanceMode", !config.maintenanceMode)} className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF8B36] ${config.maintenanceMode ? 'bg-red-600' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${config.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#181E1A] flex items-center gap-2">Security & Authentication</h3>
                      <p className="text-xs text-[#525E56] mt-1">Manage global security policies for administrative accounts.</p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div className="p-5 rounded-2xl border border-[#E5DFD3] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs transition-all hover:border-[#BF8B36]/50">
                        <div>
                          <label className="block text-sm font-bold text-[#181E1A] mb-1">Enforce Two-Factor Authentication (2FA)</label>
                          <span className="text-xs text-[#525E56] font-medium block">Require 2FA for all Super Admin and Masjid Admin logins.</span>
                        </div>
                        <button type="button" onClick={() => handleChange("twoFactorAuth", !config.twoFactorAuth)} className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#194331] ${config.twoFactorAuth ? 'bg-[#194331]' : 'bg-slate-300'}`}>
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${config.twoFactorAuth ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>

                      <div className="p-5 rounded-2xl border border-[#E5DFD3] bg-white shadow-2xs">
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Session Timeout (Minutes)</label>
                        <input type="number" value={config.sessionTimeout} onChange={(e) => handleChange("sessionTimeout", e.target.value)} className="w-full sm:w-[200px] bg-white border border-[#E5DFD3] rounded-xl px-4 py-3 text-sm font-bold text-[#181E1A] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#BF8B36]/30 focus:border-[#BF8B36] transition-all" />
                        <p className="text-[10px] text-slate-400 mt-2">Administrators will be automatically logged out after this period of inactivity.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#181E1A] flex items-center gap-2">Email & Notifications</h3>
                      <p className="text-xs text-[#525E56] mt-1">Configure global alerts for platform activity and milestones.</p>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      {[
                        { key: "notifyNewRegistration", label: "Notify Super Admins on new Masjid Registrations", desc: "Receive an email when a new Masjid applies for verification." },
                        { key: "notifySystemErrors", label: "Send daily summary of System Errors", desc: "A consolidated digest of platform errors sent to developers." },
                        { key: "notifyGoalCompletion", label: "Email users on Campaign Goal completion", desc: "Automatically notify donors when a campaign hits its target." },
                        { key: "notifyWeeklyDigest", label: "Weekly digest of total platform Donations", desc: "Receive a high-level summary of financial activity every Friday." }
                      ].map((item) => (
                        <label key={item.key} className="flex items-start gap-4 p-4 rounded-2xl border border-[#E5DFD3] bg-white shadow-2xs cursor-pointer hover:border-[#BF8B36]/50 transition-colors group">
                          <div className="pt-0.5">
                            <input 
                              type="checkbox" 
                              checked={config[item.key as keyof typeof config] as boolean} 
                              onChange={(e) => handleChange(item.key, e.target.checked)} 
                              className="w-5 h-5 text-[#194331] rounded-md border-slate-300 focus:ring-[#194331] focus:ring-offset-0 cursor-pointer" 
                            />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#181E1A] group-hover:text-[#194331] transition-colors">{item.label}</span>
                            <span className="block text-xs text-[#525E56] mt-0.5">{item.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "billing" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#181E1A] flex items-center gap-2">Payment Gateways</h3>
                      <p className="text-xs text-[#525E56] mt-1">Manage global payment processors for Masjid donations.</p>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="p-5 border border-[#194331]/20 bg-[#E6F0EB]/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-[#194331]/10 flex items-center justify-center shrink-0">
                            <CreditCard className="w-6 h-6 text-[#194331]" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-[#181E1A]">Stripe Integration</p>
                            <p className="text-xs text-[#525E56] mt-0.5">Connected and processing payments globally.</p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 bg-[#194331] text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-sm">Active</span>
                      </div>

                      <div className="p-5 border border-[#E5DFD3] bg-[#F8F6F0]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs opacity-80">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-[#E5DFD3] flex items-center justify-center shrink-0">
                            <Server className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-600">Razorpay Integration</p>
                            <p className="text-xs text-slate-500 mt-0.5">Not configured yet.</p>
                          </div>
                        </div>
                        <button type="button" className="px-4 py-2 bg-white border border-[#E5DFD3] text-[#181E1A] text-xs font-bold rounded-xl hover:border-[#BF8B36] hover:text-[#BF8B36] transition-all shadow-2xs">Configure</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8 mt-8 border-t border-[#E5DFD3] flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#194331] border-t-transparent rounded-full animate-spin"></div> Saving...</span>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Configuration</>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
