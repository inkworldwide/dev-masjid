"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { FileText, Search, FileCheck2, Clock, XCircle, FileOutput, ExternalLink, Globe, Lock, Download, Eye, Building2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function DocumentsAndAssetsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [masjidFilter, setMasjidFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setStats(data.stats || { total: 0, verified: 0, pending: 0, rejected: 0 });
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;
    
    setActionLoading(`delete-${docId}`);
    try {
      const res = await fetch(`/api/super-admin/documents/${docId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        setStats((prev) => ({ ...prev, total: prev.total - 1 })); // optimistic local update for total
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete document.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const uniqueMasjids = Array.from(new Set(documents.map(d => d.masjid?.name).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(documents.map(d => d.type).filter(Boolean)));

  const filteredDocuments = documents.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.masjid?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    const matchesType = typeFilter === "ALL" || d.type === typeFilter;
    const matchesMasjid = masjidFilter === "ALL" || d.masjid?.name === masjidFilter;

    return matchesSearch && matchesStatus && matchesType && matchesMasjid;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-[#194331]" /> Documents & Assets
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              All masjid documents, certificates, and legal assets across the platform
            </p>
          </div>
          <Link 
            href="/documents" 
            target="_blank"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 border border-[#E5DFD3] bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Directory
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <FileOutput className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xl font-mono font-bold text-slate-700 leading-tight">{stats.total}</p>
              <p className="text-[10px] font-bold text-slate-500 tracking-wide uppercase mt-0.5">Total Documents</p>
            </div>
          </div>
          
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-mono font-bold text-emerald-700 leading-tight">{stats.verified}</p>
              <p className="text-[10px] font-bold text-emerald-600 tracking-wide uppercase mt-0.5">Verified</p>
            </div>
          </div>

          <div className="bg-white border border-amber-100 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-mono font-bold text-amber-700 leading-tight">{stats.pending}</p>
              <p className="text-[10px] font-bold text-amber-600 tracking-wide uppercase mt-0.5">Pending Review</p>
            </div>
          </div>

          <div className="bg-white border border-red-100 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-mono font-bold text-red-700 leading-tight">{stats.rejected}</p>
              <p className="text-[10px] font-bold text-red-600 tracking-wide uppercase mt-0.5">Rejected</p>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, type, or masjid..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5DFD3] rounded-xl text-xs focus:outline-none focus:border-[#BF8B36] shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={masjidFilter}
              onChange={(e) => setMasjidFilter(e.target.value)}
              className="bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-[#BF8B36] shadow-xs"
            >
              <option value="ALL">All Masjids</option>
              {uniqueMasjids.map((m: any) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-[#BF8B36] shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-[#BF8B36] shadow-xs"
            >
              <option value="ALL">All Types</option>
              {uniqueTypes.map((t: any) => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider ml-2">{filteredDocuments.length} of {documents.length} documents</span>
          </div>
        </div>

        {/* Documents Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No documents found matching your criteria.
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="w-full">
              <table className="w-full text-xs text-left table-fixed">
                <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold tracking-wider uppercase text-[9px] sm:text-[10px]">
                  <tr>
                    <th className="px-2 sm:px-3 py-3 w-[25%]">Document</th>
                    <th className="px-2 sm:px-3 py-3 w-[15%]">Masjid</th>
                    <th className="px-2 sm:px-3 py-3 w-[15%]">Type</th>
                    <th className="px-1 sm:px-2 py-3 text-center w-[12%]">Status</th>
                    <th className="px-1 sm:px-2 py-3 text-center w-[10%]">Visibility</th>
                    <th className="px-2 sm:px-3 py-3 w-[13%]">Uploaded</th>
                    <th className="px-1 sm:px-2 py-3 text-center w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {filteredDocuments.map(doc => (
                    <tr key={doc.id} className="hover:bg-[#F8F6F0]/50 transition">
                      <td className="px-2 sm:px-3 py-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#194331] text-[11px] sm:text-xs truncate" title={doc.title}>{doc.title}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5 uppercase truncate">DOC-{doc.id.substring(0, 5)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-3">
                        <p className="font-bold text-slate-600 flex items-center gap-1.5 text-[11px] sm:text-xs truncate"><Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{doc.masjid?.name}</span></p>
                      </td>
                      <td className="px-2 sm:px-3 py-3">
                        <span className="px-1.5 sm:px-2.5 py-1 bg-slate-50 text-slate-600 font-bold border border-slate-200 rounded-md truncate max-w-full inline-block text-[10px] sm:text-[11px]">{doc.type}</span>
                      </td>
                      <td className="px-1 sm:px-2 py-3 text-center">
                        {doc.status === "VERIFIED" && <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 border border-emerald-500 text-emerald-600 font-bold text-[8px] sm:text-[9px] tracking-widest rounded-full uppercase"><FileCheck2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xl:inline">Verified</span></span>}
                        {doc.status === "PENDING" && <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 border border-amber-500 text-amber-600 font-bold text-[8px] sm:text-[9px] tracking-widest rounded-full uppercase"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xl:inline">Pending</span></span>}
                        {doc.status === "REJECTED" && <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 border border-red-500 text-red-600 font-bold text-[8px] sm:text-[9px] tracking-widest rounded-full uppercase"><XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xl:inline">Rejected</span></span>}
                      </td>
                      <td className="px-1 sm:px-2 py-3 text-center">
                        {doc.visibility === "PUBLIC" ? (
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 text-blue-600 font-bold text-[10px] sm:text-[11px]"><Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden lg:inline">Public</span></span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 text-slate-400 font-medium text-[10px] sm:text-[11px]"><Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden lg:inline">Private</span></span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-3">
                        <p className="font-bold text-slate-700 text-[10px] sm:text-[11px] truncate">{new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">{doc.uploadedBy || "Unknown"}</p>
                      </td>
                      <td className="px-1 sm:px-2 py-3 text-center">
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-slate-400">
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-1 sm:p-1.5 hover:text-[#BF8B36] hover:bg-[#FBF4E4] rounded-lg transition border border-transparent hover:border-[#E5DFD3]" title="View Document"><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></a>
                          <a href={doc.fileUrl} download className="p-1 sm:p-1.5 hover:text-[#194331] hover:bg-[#E6F0EB] rounded-lg transition border border-transparent hover:border-[#B7D4C5]" title="Download Document"><Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></a>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            disabled={actionLoading === `delete-${doc.id}`}
                            className="p-1 sm:p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 cursor-pointer disabled:opacity-50"
                            title="Delete Document"
                          >
                            {actionLoading === `delete-${doc.id}` ? (
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
