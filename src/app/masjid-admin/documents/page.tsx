"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../admin/layout";
import { FileText, Plus, Eye, EyeOff, Upload, CheckCircle2, X, File, AlertCircle, Lock } from "lucide-react";

interface MasjidDocument {
  id: string;
  title: string;
  fileUrl: string;
  type: string;
  visibility: "PUBLIC" | "PRIVATE";
  status: string;
  uploadedBy: string;
  createdAt: string;
  description: string | null;
}

export default function MasjidAdminDocumentsPage() {
  const [documents, setDocuments] = useState<MasjidDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [typePreset, setTypePreset] = useState("Waqf Certificate");
  const [customType, setCustomType] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDocumentsAndUser = async () => {
    setLoading(true);
    try {
      const [docRes, userRes] = await Promise.all([
        fetch("/api/masjid-admin/documents"),
        fetch("/api/auth/me"),
      ]);

      if (docRes.ok) {
        const data = await docRes.json();
        setDocuments(data.documents || []);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserRole(userData.user?.role || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentsAndUser();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFileUrl(data.url);
        setFileName(file.name);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        setErrorMsg(data.error || "File upload failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload file. Please try again.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleToggleVisibility = async (doc: MasjidDocument) => {
    const newVisibility = doc.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    try {
      const res = await fetch("/api/masjid-admin/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, visibility: newVisibility }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, visibility: newVisibility } : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (userRole !== "SUPER_ADMIN") {
      alert("🔒 Deletion Restricted: Only Super Admin is authorized to delete legal documents.");
      return;
    }

    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/masjid-admin/documents?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete document.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title) {
      setErrorMsg("Please enter a document title.");
      return;
    }

    const finalType = typePreset === "OTHER_CUSTOM" ? customType.trim() : typePreset;
    if (!finalType) {
      setErrorMsg("Please select or write a document type.");
      return;
    }

    const finalFileUrl = fileUrl.trim();
    if (!finalFileUrl) {
      setErrorMsg("Please upload a document file or provide a valid document link.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/masjid-admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type: finalType,
          visibility,
          fileUrl: finalFileUrl,
          description,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setTypePreset("Waqf Certificate");
        setCustomType("");
        setFileUrl("");
        setFileName("");
        setDescription("");
        fetchDocumentsAndUser();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to save document.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error saving document.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left pb-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#181E1A] font-extrabold flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-[#BF8B36]" /> Masjid Documents & Assets
            </h1>
            <p className="text-xs text-[#525E56] mt-1">
              Upload, manage, and toggle Public vs Private visibility for Waqf certificates, title deeds, and legal documents.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>

        {/* Governance Notice Banner */}
        <div className="bg-[#FBF4E4] border border-[#E5D2B0] rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-[#BF8B36] font-bold">
          <Lock className="w-4 h-4 text-[#BF8B36] shrink-0" />
          <span>Governance Policy: Once uploaded, legal documents can only be deleted by Super Admin authorization.</span>
        </div>

        {/* Documents Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading document repository...</div>
        ) : documents.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No documents uploaded for this Masjid yet.
          </div>
        ) : (
          <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[#525E56] font-bold">
                  <tr>
                    <th className="px-5 py-4">Document Title</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4 text-center">Visibility</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4">Uploaded By</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F8F6F0]/80 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#181E1A]">{doc.title}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[250px]">{doc.description || "No description."}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#194331]">{doc.type}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(doc)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 cursor-pointer transition ${
                            doc.visibility === "PUBLIC"
                              ? "bg-[#E6F0EB] border border-[#B7D4C5] text-[#194331]"
                              : "bg-[#FBF4E4] border border-[#E5D2B0] text-[#BF8B36]"
                          }`}
                        >
                          {doc.visibility === "PUBLIC" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{doc.visibility}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-700">
                        ✓ {doc.status}
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-medium">{doc.uploadedBy}</td>
                      <td className="px-5 py-4 text-right space-x-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#194331] hover:underline"
                        >
                          View Document
                        </a>

                        {userRole === "SUPER_ADMIN" ? (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                            title="Only Super Admin can delete legal documents"
                          >
                            <Lock className="w-2.5 h-2.5 text-slate-400" /> Super Admin Only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Upload Document */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#181E1A]/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>

            <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#181E1A]">Upload New Document</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleUploadDocument} className="space-y-4">
                
                {/* File Attachment Upload */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Attach Document File (PDF, Image, DOC)</label>
                  <div className="border-2 border-dashed border-[#BF8B36]/50 bg-[#FBF4E4]/40 hover:bg-[#FBF4E4] transition rounded-2xl p-4 text-center relative cursor-pointer group">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                      <Upload className="w-6 h-6 text-[#BF8B36] group-hover:scale-110 transition" />
                      {uploadingFile ? (
                        <p className="font-bold text-[#194331] font-mono animate-pulse">Uploading file to storage...</p>
                      ) : fileName ? (
                        <div className="flex items-center gap-1.5 text-[#194331] font-bold">
                          <File className="w-4 h-4" />
                          <span>{fileName}</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-[#181E1A]">Click or Drag & Drop File to Upload</p>
                          <p className="text-[10px] text-slate-400">PDF, Word Document, or Image up to 25MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Or Manual File Link */}
                  <div className="mt-2">
                    <input
                      type="text"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="Or enter file path / URL directly"
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-4 py-2 text-[10px] focus:outline-none focus:border-[#BF8B36]"
                    />
                  </div>
                </div>

                {/* Document Title */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Official Waqf Board Registration Certificate"
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                {/* Document Type with Preset + Custom Text Option */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Document Type</label>
                  <select
                    value={typePreset}
                    onChange={(e) => setTypePreset(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-semibold text-[#194331]"
                  >
                    <option value="Waqf Certificate">Waqf Certificate</option>
                    <option value="Property Deed">Property Deed</option>
                    <option value="Audit Statement">Audit Statement</option>
                    <option value="Legal Clearance">Legal Clearance</option>
                    <option value="Rent Agreement">Rent Agreement</option>
                    <option value="Utility Bill">Utility Bill</option>
                    <option value="Tax Receipt">Tax Receipt</option>
                    <option value="Committee Minutes">Committee Minutes</option>
                    <option value="OTHER_CUSTOM">✏️ Write Custom Document Type...</option>
                  </select>

                  {/* Custom Type Write-in Input */}
                  {typePreset === "OTHER_CUSTOM" && (
                    <div className="mt-2 animate-fadeIn">
                      <input
                        type="text"
                        required
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="Type custom document type (e.g. Nikkah Ledger, Electricity Bill, Land Survey...)"
                        className="w-full bg-white border border-[#BF8B36] rounded-xl px-3.5 py-2 text-xs focus:outline-none font-bold text-[#194331]"
                      />
                    </div>
                  )}
                </div>

                {/* Visibility Level */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Visibility Level</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36] font-bold text-[#194331]"
                  >
                    <option value="PUBLIC">PUBLIC (Visible on Public Detail Page)</option>
                    <option value="PRIVATE">PRIVATE (Restricted to Admin Committee)</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Document summary or remarks..."
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#BF8B36]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#E5DFD3] rounded-xl font-bold text-slate-600 hover:bg-[#F8F6F0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingFile}
                    className="px-5 py-2 bg-[#194331] hover:bg-[#113224] text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Save Document"}
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
