"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { ShieldAlert, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function SuperAdminRolesMatrixPage() {
  const rolePermissions = [
    { role: "View Dashboard", access: "Access to the main dashboard and platform overview" },
    { role: "Manage Profile", access: "Update personal and masjid profile settings" },
    { role: "Manage Members", access: "Add, edit, or remove community members and congregants" },
    { role: "Manage Announcements", access: "Create and broadcast announcements to the community" },
    { role: "Manage Events", access: "Schedule and manage upcoming events and gatherings" },
    { role: "Manage Media", access: "Upload and organize photos, videos, and audio files" },
    { role: "Manage Donations", access: "Track campaigns, Zakat, and Sadaqah collections" },
    { role: "Manage Finances", access: "Full access to financial audits, income, and expenses" },
    { role: "Manage Documents", access: "Upload and verify legal documents, Waqf deeds, and IDs" },
    { role: "Manage Staff", access: "Assign roles and permissions to mosque staff and workers" },
    { role: "Manage Property", access: "Oversee Waqf land, properties, and tenant agreements" },
    { role: "View Reports", access: "Generate and download administrative and financial reports" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        
        <div className="border-b border-[#E5DFD3] pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-[#194331]" /> Role-Based Access Control (RBAC) Governance
          </h1>
          <p className="text-xs text-[#525E56] mt-1">
            Master matrix of all platform roles, staff designations, and granular security boundaries.
          </p>
        </div>

        <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
              <tr>
                <th className="px-5 py-4">Permission Module</th>
                <th className="px-5 py-4">Access Scope & Description</th>
                <th className="px-5 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD3]">
              {rolePermissions.map((rp) => (
                <tr key={rp.role} className="hover:bg-[#F8F6F0]/80 transition">
                  <td className="px-5 py-4 font-bold text-[#181E1A] font-serif text-sm">
                    {rp.role}
                  </td>
                  <td className="px-5 py-4 text-[#525E56] font-medium leading-relaxed">
                    {rp.access}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
