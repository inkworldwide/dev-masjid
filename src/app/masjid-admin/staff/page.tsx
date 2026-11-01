"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { Users, Plus, Phone, Trash2, CheckCircle2, ShieldCheck, X } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  contact: string;
  salary?: number;
  joiningDate: string;
  status: string;
}

export default function MasjidAdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("IMAM");
  const [contact, setContact] = useState("");
  const [salary, setSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const staffRoleOptions = [
    { value: "IMAM", label: "Imam (Head Leader)" },
    { value: "MUEZZIN", label: "Muezzin (Adhan Reciter)" },
    { value: "MUTAWALLI", label: "Mutawalli (Trustee)" },
    { value: "COMMITTEE_MEMBER", label: "Committee Member" },
    { value: "ACCOUNTANT", label: "Accountant / Treasurer" },
    { value: "LAWYER", label: "Legal Counsel / Lawyer" },
    { value: "ELECTRICIAN", label: "Electrician" },
    { value: "PLUMBER", label: "Plumber" },
    { value: "WORKER", label: "General Worker / Caretaker" },
  ];

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/masjid-admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/masjid-admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, contact, salary }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setContact("");
        setSalary("");
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      const res = await fetch(`/api/masjid-admin/staff?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStaffList((prev) => prev.filter((s) => s.id !== id));
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
              <Users className="w-7 h-7 text-[#BF8B36]" /> Masjid Leadership & Staff Roles
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Manage Imams, Muezzins, Mutawallis, Committee Members, Accountants, Lawyers, Electricians, Plumbers, and Maintenance Workers.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Staff Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading staff directory...</div>
        ) : staffList.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No staff members added for this Masjid yet.
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                  <tr>
                    <th className="px-5 py-4">Staff Name</th>
                    <th className="px-5 py-4">Assigned Role</th>
                    <th className="px-5 py-4">Phone / Contact</th>
                    <th className="px-5 py-4">Monthly Salary / Honorarium</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-[#F8F6F0]/80 transition">
                      <td className="px-5 py-4 font-bold text-[#181E1A]">{st.name}</td>
                      <td className="px-5 py-4 font-mono font-bold text-[#BF8B36] uppercase">
                        {st.role.replace("_", " ")}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{st.contact}</td>
                      <td className="px-5 py-4 font-mono font-bold text-[#194331]">
                        {st.salary ? `₹ ${Number(st.salary).toLocaleString("en-IN")} / mo` : "₹ 0 / mo"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          {st.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleRemoveStaff(st.id)}
                          className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                        >
                          Remove Staff
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Staff Member */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Add Staff Member & Assign Role</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Qari Hafiz Tariq"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Staff Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#194331]"
                  >
                    {staffRoleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Contact Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 98765 44332"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Monthly Salary / Honorarium (₹)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Staff Member"}
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
