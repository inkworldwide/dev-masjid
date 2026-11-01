"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { LayoutGrid, Plus, Phone, MapPin, FileText, UserCheck, Edit, CheckCircle2, X } from "lucide-react";

interface Tenant {
  id: string;
  tenantCustomId: string;
  tenantName: string;
  contactPhone: string;
  tenantDocUrl: string | null;
  monthlyRent: number;
}

interface Property {
  id: string;
  propertyCustomId: string;
  contactPhone: string;
  location: string;
  documentUrl: string | null;
  monthlyRent: number;
  revenueTotal: number;
  status: string;
  tenants: Tenant[];
}

export default function MasjidAdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Property Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [propertyCustomId, setPropertyCustomId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [location, setLocation] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [tenantName, setTenantName] = useState("");
  const [tenantCustomId, setTenantCustomId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Update Tenant ID Modal State
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editTenantCustomId, setEditTenantCustomId] = useState("");
  const [editTenantName, setEditTenantName] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/masjid-admin/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !contactPhone) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/masjid-admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyCustomId,
          contactPhone,
          location,
          monthlyRent,
          tenantName,
          tenantCustomId,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setPropertyCustomId("");
        setLocation("");
        setTenantName("");
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTenantId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !editTenantCustomId) return;

    try {
      const res = await fetch("/api/masjid-admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          tenantCustomId: editTenantCustomId,
          tenantName: editTenantName,
        }),
      });

      if (res.ok) {
        setShowTenantModal(false);
        setSelectedTenant(null);
        fetchProperties();
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
              <LayoutGrid className="w-7 h-7 text-[#BF8B36]" /> Waqf Property & Tenant Management
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Manage commercial Waqf real estate, lease agreements, monthly rent collection, tenant documents, and update Tenant IDs.
            </p>
          </div>

          <button
            onClick={() => {
              setPropertyCustomId(`PROP-${Math.floor(1000 + Math.random() * 9000)}`);
              setTenantCustomId(`TNT-${Math.floor(1000 + Math.random() * 9000)}`);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>

        {/* Property & Tenants Table (Handwritten Module Requirement) */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading property records...</div>
        ) : properties.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No Waqf properties listed for this Masjid yet.
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                  <tr>
                    <th className="px-5 py-4">Property ID</th>
                    <th className="px-5 py-4">Phone / Contact</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4 text-[#BF8B36]">Monthly Rent</th>
                    <th className="px-5 py-4 text-[#194331]">Revenue Total</th>
                    <th className="px-5 py-4">Tenant Name</th>
                    <th className="px-5 py-4">Tenant ID</th>
                    <th className="px-5 py-4 text-center">Tenant Doc</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {properties.map((p) => {
                    const tenant = p.tenants?.[0];
                    return (
                      <tr key={p.id} className="hover:bg-[#F8F6F0]/80 transition">
                        <td className="px-5 py-4 font-mono font-bold text-[#194331]">
                          {p.propertyCustomId}
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{p.contactPhone}</td>
                        <td className="px-5 py-4 font-semibold text-[#181E1A]">{p.location}</td>
                        <td className="px-5 py-4 font-mono font-bold text-[#BF8B36]">
                          ₹{Number(p.monthlyRent).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-[#194331]">
                          ₹{Number(p.revenueTotal).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4">
                          {tenant ? (
                            <span className="font-bold text-[#181E1A]">{tenant.tenantName}</span>
                          ) : (
                            <span className="text-amber-600 font-bold italic">VACANT</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 font-bold">
                          {tenant ? tenant.tenantCustomId : "-"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {tenant?.tenantDocUrl ? (
                            <a
                              href={tenant.tenantDocUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono font-bold text-[#194331] bg-[#E6F0EB] px-2 py-0.5 rounded border border-[#B7D4C5]"
                            >
                              PDF Doc
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {tenant && (
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setEditTenantCustomId(tenant.tenantCustomId);
                                setEditTenantName(tenant.tenantName);
                                setShowTenantModal(true);
                              }}
                              className="text-xs font-bold text-[#BF8B36] hover:underline cursor-pointer"
                            >
                              Update Tenant ID
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Property */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowAddModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Add Waqf Property Record</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Property Custom ID</label>
                  <input
                    type="text"
                    required
                    value={propertyCustomId}
                    onChange={(e) => setPropertyCustomId(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono font-bold text-[#194331]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98111 22334"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Property Location / Address</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Shop No 4, Waqf Commercial Complex"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Monthly Rent (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono font-bold"
                  />
                </div>

                <div className="p-4 bg-[#F8F6F0] border border-[#E5DFD3] rounded-2xl space-y-3">
                  <p className="font-bold text-[#BF8B36] uppercase tracking-wider text-[10px] font-mono">
                    Initial Tenant Assignment (Optional)
                  </p>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Tenant Name</label>
                    <input
                      type="text"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. Al-Barakah Bookshop"
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Tenant ID</label>
                    <input
                      type="text"
                      value={tenantCustomId}
                      onChange={(e) => setTenantCustomId(e.target.value)}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Property"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Update Tenant ID */}
        {showTenantModal && selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowTenantModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 max-w-sm w-full z-10 text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-base font-bold text-[#181E1A]">Update Tenant ID Action</h3>
                <button onClick={() => setShowTenantModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTenantId} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tenant Name</label>
                  <input
                    type="text"
                    required
                    value={editTenantName}
                    onChange={(e) => setEditTenantName(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Update Tenant ID</label>
                  <input
                    type="text"
                    required
                    value={editTenantCustomId}
                    onChange={(e) => setEditTenantCustomId(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-mono font-bold text-[#194331]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTenantModal(false)}
                    className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#194331] text-white font-bold rounded-xl"
                  >
                    Update Tenant ID
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
