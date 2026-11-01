"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../layout";
import { User, CheckCircle2, Save, Camera, Mail, Phone, Lock } from "lucide-react";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // Email is read-only
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
          setAvatar(data.user.avatar || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setAvatar(data.url);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while uploading.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { name, phone, avatar };
      if (password) payload.password = password;

      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✓ Profile updated successfully.");
        setPassword("");
        fetchProfile();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[13px] text-slate-400 font-mono flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-[#BF8B36] border-t-transparent rounded-full animate-spin mb-4"></div>
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm text-left mb-6 max-w-5xl mx-auto p-8 sm:p-10 w-full">
      
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#181E1A] mb-2">My Profile</h1>
        <p className="text-xs text-[#525E56]">Update your account details and professional info.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Account Information */}
        <div className="space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
            <User className="w-5 h-5 text-[#BF8B36]" /> Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#525E56]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Haji Maulana..."
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-4 py-2.5 text-sm font-medium text-[#181E1A] focus:outline-none focus:border-[#BF8B36] transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#525E56]">Email Address (Read-only)</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-4 py-2.5 text-sm font-medium text-[#525E56] opacity-70 cursor-not-allowed"
                />
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#525E56]">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-4 py-2.5 text-sm font-medium text-[#181E1A] focus:outline-none focus:border-[#BF8B36] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#525E56]">Update Password (Optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-4 py-2.5 text-sm font-medium text-[#181E1A] focus:outline-none focus:border-[#BF8B36] transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#181E1A] hover:bg-black text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
