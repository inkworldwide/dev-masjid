"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      const role = data.user?.role;
      if (redirectTo) {
        router.push(redirectTo);
      } else if (role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else if (role === "MASJID_ADMIN") {
        router.push("/masjid-admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center mb-6 flex flex-col items-center">
        <Logo />
        <p className="text-xs text-[#525E56] mt-2 font-mono">Masjid Management & Committee Platform</p>
      </div>

      <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm p-8 space-y-6 text-left">
        <div>
          <h1 className="font-serif text-xl font-bold text-[#181E1A]">Welcome back</h1>
          <p className="text-xs text-[#525E56] mt-1">Sign in to access your MOsQuE portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@mosque.org"
                className="w-full pl-9 pr-4 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-[#E5DFD3] rounded-xl text-xs bg-[#F8F6F0] focus:outline-none focus:border-[#BF8B36]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-[#194331] hover:bg-[#113224] text-white py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#BF8B36]" /> : null}
            {loading ? "Signing in…" : "Sign In to Portal"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-[#BF8B36] font-bold hover:underline">
            Create one
          </Link>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-5 space-y-3 text-left">
        <p className="text-[10px] font-bold font-mono text-[#BF8B36] uppercase tracking-wider">Demo Credentials</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: "Super Admin", email: "superadmin@mosque.org", password: "admin123" },
            { label: "Masjid Admin", email: "admin.jama@mosque.org", password: "admin123" },
            { label: "Committee User", email: "user.tariq@gmail.com", password: "user123" },
          ].map(({ label, email, password }) => (
            <button
              key={label}
              type="button"
              onClick={() => setForm({ email, password })}
              className="text-left bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl p-2.5 hover:border-[#BF8B36] transition cursor-pointer"
            >
              <p className="text-[10px] font-bold text-[#194331] font-mono">{label}</p>
              <p className="text-[9px] text-slate-400 truncate mt-0.5">{email}</p>
            </button>
          ))}
        </div>
        <p className="text-[9.5px] text-slate-400 text-center font-mono">Click a card to auto-fill demo credentials</p>
      </div>

      <p className="text-center text-[11px] text-slate-500 font-bold">
        <Link href="/" className="hover:text-[#BF8B36] transition">← Back to Homepage</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs font-mono text-slate-400">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
