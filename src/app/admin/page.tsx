"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkRoleAndRedirect() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "SUPER_ADMIN") {
            router.replace("/super-admin");
            return;
          } else if (data.user?.role === "MASJID_ADMIN") {
            router.replace("/masjid-admin/masjid-details");
            return;
          }
        }
        router.replace("/auth/login");
      } catch {
        router.replace("/auth/login");
      }
    }
    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-3 py-16 justify-center flex-1 min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-[#BF8B36] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-[#194331] font-mono font-bold">Redirecting to Governance Portal...</p>
    </div>
  );
}
