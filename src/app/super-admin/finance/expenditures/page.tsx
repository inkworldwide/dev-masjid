"use client";
import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/app/admin/layout";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  CreditCard,
  Building2,
  DollarSign,
  Download,
  Eye,
  AlertTriangle,
  X,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

interface ExpenditureItem {
  id: string;
  expenseDate: string;
  category: "GENERAL_ADMINISTRATION" | "FESTIVAL_EXPENSE" | "CHARITABLE_EXPENSE" | "MISCELLANEOUS_EXPENSE";
  subcategory: string;
  fundType: "GENERAL_FUND" | "ZAKAT" | "SADAQAH" | "GENERAL_CHARITY" | "INTEREST_FUND" | "OTHER_SOURCES";
  description: string;
  amount: number;
  paymentMethod: "CASH" | "CHEQUE" | "DEMAND_DRAFT" | "UPI" | "NEFT_RTGS" | "OTHER";
  payeeName: string;
  billInvoiceNumber: string;
  referenceNumber?: string;
  billDocumentUrl?: string;
  chequeNumber?: string;
  bankName?: string;
  upiTransactionId?: string;
  utrNumber?: string;
  notes?: string;
  disbursedBy?: string;
  status: "ACTIVE" | "VOID";
  createdBy: string;
  masjid?: { id: string; name: string; location: string };
}

export default function ExpenditurePage() {
  const [masjids, setMasjids] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("ALL");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [assignedMasjidName, setAssignedMasjidName] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("2026-2027");
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const [expenditures, setExpenditures] = useState<ExpenditureItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [fundFilter, setFundFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenditureItem | null>(null);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidExpenseId, setVoidExpenseId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");

  // Add Form State
  const [form, setForm] = useState({
    masjidId: "",
    expenseDate: new Date().toISOString().split("T")[0],
    category: "GENERAL_ADMINISTRATION" as ExpenditureItem["category"],
    subcategory: "Staff Salary",
    fundType: "GENERAL_FUND" as ExpenditureItem["fundType"],
    description: "",
    amount: "",
    paymentMethod: "CASH" as ExpenditureItem["paymentMethod"],
    payeeName: "",
    billInvoiceNumber: "",
    referenceNumber: "",
    billDocumentUrl: "",
    chequeNumber: "",
    bankName: "",
    chequeDate: "",
    ddNumber: "",
    upiTransactionId: "",
    utrNumber: "",
    notes: "",
    disbursedBy: "",
  });

  // Fetch Masjids & Expenditures
  useEffect(() => {
    async function loadInitial() {
      try {
        const [mRes, meRes] = await Promise.all([
          fetch("/api/super-admin/masjids"),
          fetch("/api/auth/me"),
        ]);
        let scopeMasjid = "ALL";
        if (meRes.ok) {
          const meData = await meRes.json();
          const superUser = meData.user?.role === "SUPER_ADMIN";
          setIsSuperAdmin(superUser);
          if (meData.user?.masjidName) {
            setAssignedMasjidName(meData.user.masjidName);
          }
          if (!superUser && meData.user?.masjidScope) {
            scopeMasjid = meData.user.masjidScope;
            setSelectedMasjidId(scopeMasjid);
          }
        }
        if (mRes.ok) {
          const mData = await mRes.json();
          setMasjids(mData.masjids || []);
          if (mData.masjids?.length > 0 && !form.masjidId) {
            const defaultM = scopeMasjid !== "ALL" ? scopeMasjid : mData.masjids[0].id;
            setForm((prev) => ({ ...prev, masjidId: defaultM }));
          }
        }
        await loadExpenditures();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  async function loadExpenditures() {
    try {
      const params = new URLSearchParams();
      if (selectedMasjidId && selectedMasjidId !== "ALL") params.set("masjidId", selectedMasjidId);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (fundFilter !== "ALL") params.set("fundType", fundFilter);
      if (paymentFilter !== "ALL") params.set("paymentMethod", paymentFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/finance/expenditures?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenditures(data.expenditures || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadExpenditures();
  }, [selectedMasjidId, categoryFilter, fundFilter, paymentFilter, search]);

  const [customSubcategory, setCustomSubcategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customFundSource, setCustomFundSource] = useState("");

  // Subcategory options based on category
  const subcategoryOptions = useMemo(() => {
    let opts: string[] = [];
    switch (form.category) {
      case "GENERAL_ADMINISTRATION":
        opts = [
          "Staff Salary",
          "Office Expenses",
          "Stationery",
          "Printing & Xerox",
          "Electricity",
          "Water",
          "Gas",
          "Internet & Telephone",
          "Maintenance",
          "Conveyance",
          "Other Admin Expenses",
        ];
        break;
      case "FESTIVAL_EXPENSE":
        opts = [
          "Muharram Expenses",
          "Ramadan Expenses",
          "Eid Expenses",
          "Milad & Program Expenses",
          "Other Religious Events",
        ];
        break;
      case "CHARITABLE_EXPENSE":
        opts = [
          "Monthly Destitute Allowance",
          "Needy Person Assistance",
          "Food Distribution",
          "Medical Assistance",
          "Education Assistance",
          "Emergency Assistance",
          "Other Charity Expenses",
        ];
        break;
      case "MISCELLANEOUS_EXPENSE":
        opts = ["Purchases", "Repairs", "Consumables", "Other Miscellaneous"];
        break;
      default:
        opts = [];
    }
    return [...opts, "Other (Specify Custom Reason)"];
  }, [form.category]);

  // Summary Metrics
  const summary = useMemo(() => {
    let total = 0;
    let generalAdmin = 0;
    let festival = 0;
    let charitable = 0;
    let misc = 0;

    expenditures.forEach((e) => {
      if (e.status === "ACTIVE") {
        const amt = Number(e.amount);
        total += amt;
        if (e.category === "GENERAL_ADMINISTRATION") generalAdmin += amt;
        else if (e.category === "FESTIVAL_EXPENSE") festival += amt;
        else if (e.category === "CHARITABLE_EXPENSE") charitable += amt;
        else if (e.category === "MISCELLANEOUS_EXPENSE") misc += amt;
      }
    });

    return { total, generalAdmin, festival, charitable, misc };
  }, [expenditures]);

  // Handle Add Expenditure
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return alert("Please enter a valid amount");

    const vNo = (form.billInvoiceNumber || "").trim();
    if (!vNo) return alert("Bill / Voucher Number is compulsory.");

    const isDuplicate = expenditures.some(
      (exp) => (exp.billInvoiceNumber || "").toLowerCase() === vNo.toLowerCase()
    );
    if (isDuplicate) {
      return alert(`Bill/Voucher number "${vNo}" already exists! Each expenditure voucher number must be unique.`);
    }

    const finalSubcategory = form.subcategory === "Other (Specify Custom Reason)"
      ? (customSubcategory.trim() || "Other Expense")
      : form.subcategory;

    const finalCategory = (form.category as string) === "OTHER_CUSTOM_CAT"
      ? "MISCELLANEOUS_EXPENSE"
      : form.category;

    const finalFundType = (form.fundType as string) === "OTHER_CUSTOM_FUND"
      ? "OTHER_SOURCES"
      : form.fundType;

    const finalDescription = (form.category as string) === "OTHER_CUSTOM_CAT" && customCategory.trim()
      ? `[Category: ${customCategory.trim()}] ${form.description || ""}`
      : form.description;

    const finalNotes = (form.fundType as string) === "OTHER_CUSTOM_FUND" && customFundSource.trim()
      ? `[Fund Source: ${customFundSource.trim()}] ${form.notes || ""}`
      : form.notes;

    try {
      const res = await fetch("/api/finance/expenditures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: finalCategory,
          subcategory: finalSubcategory,
          fundType: finalFundType,
          description: finalDescription,
          notes: finalNotes,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setCustomSubcategory("");
        setCustomCategory("");
        setCustomFundSource("");
        setForm({
          masjidId: masjids[0]?.id || "",
          expenseDate: new Date().toISOString().split("T")[0],
          category: "GENERAL_ADMINISTRATION",
          subcategory: "Staff Salary",
          fundType: "GENERAL_FUND",
          description: "",
          amount: "",
          paymentMethod: "CASH",
          payeeName: "",
          billInvoiceNumber: "",
          referenceNumber: "",
          billDocumentUrl: "",
          chequeNumber: "",
          bankName: "",
          chequeDate: "",
          ddNumber: "",
          upiTransactionId: "",
          utrNumber: "",
          notes: "",
          disbursedBy: "",
        });
        await loadExpenditures();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create expenditure");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving expenditure");
    }
  };

  // Handle Void
  const handleVoidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidExpenseId || !voidReason) return alert("Please provide a void reason");

    try {
      const res = await fetch("/api/finance/expenditures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: voidExpenseId, action: "VOID", voidReason }),
      });

      if (res.ok) {
        setShowVoidModal(false);
        setVoidExpenseId(null);
        setVoidReason("");
        await loadExpenditures();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to void expenditure");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format Helper
  const formatCategory = (cat: string) => {
    switch (cat) {
      case "GENERAL_ADMINISTRATION":
        return "1. General Administration";
      case "FESTIVAL_EXPENSE":
        return "2. Festival Expenses";
      case "CHARITABLE_EXPENSE":
        return "3. Charitable Expenses";
      case "MISCELLANEOUS_EXPENSE":
        return "4. Miscellaneous Expenses";
      default:
        return cat;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* ========================================================================= */}
        {/* HEADER */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-rose-900 text-white rounded-2xl shadow-sm">
              <Receipt className="w-8 h-8 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">Expenditure</h1>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Outflow Management
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Manage and track mosque expenses across all financial categories.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-rose-800 hover:bg-rose-900 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold shadow transition"
            >
              <Plus className="w-4 h-4 text-rose-200" />
              + Add Expenditure
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUMMARY CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-rose-950 text-white p-5 rounded-2xl shadow-md border border-rose-900">
            <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider block">
              Total Expenditure
            </span>
            <span className="font-serif text-2xl font-bold text-[#BF8B36] block mt-1">
              ₹{summary.total.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-rose-300 mt-1 block">Active recorded vouchers</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              1. General Admin
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 block mt-1">
              ₹{summary.generalAdmin.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Salaries, utilities & upkeep</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              2. Festival Expenses
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 block mt-1">
              ₹{summary.festival.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Ramadan, Eid & events</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              3. Charitable Expenses
            </span>
            <span className="font-serif text-xl font-bold text-emerald-800 block mt-1">
              ₹{summary.charitable.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Zakat & destitute payouts</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              4. Miscellaneous
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 block mt-1">
              ₹{summary.misc.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Stationery & consumables</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTERS & TOOLBAR */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Masjid Filter */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Masjid Scope</label>
              {isSuperAdmin ? (
                <select
                  value={selectedMasjidId}
                  onChange={(e) => setSelectedMasjidId(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="ALL">🏛️ All Masjids (Global)</option>
                  {masjids.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-[#194331] font-mono truncate">
                  🕌 {masjids.find(m => String(m.id) === String(selectedMasjidId))?.name || assignedMasjidName || "Enam Masjid"}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="GENERAL_ADMINISTRATION">1. General Administration</option>
                <option value="FESTIVAL_EXPENSE">2. Festival Expenses</option>
                <option value="CHARITABLE_EXPENSE">3. Charitable Expenses</option>
                <option value="MISCELLANEOUS_EXPENSE">4. Miscellaneous Expenses</option>
              </select>
            </div>

            {/* Fund Type Filter */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Fund Source</label>
              <select
                value={fundFilter}
                onChange={(e) => setFundFilter(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Funds</option>
                <option value="GENERAL_FUND">General Fund</option>
                <option value="ZAKAT">Zakat</option>
                <option value="SADAQAH">Sadaqah</option>
                <option value="GENERAL_CHARITY">General Charity</option>
                <option value="INTEREST_FUND">Interest Fund</option>
                <option value="OTHER_SOURCES">Other Sources / Specific Funds</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Payment Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DEMAND_DRAFT">Demand Draft (DD)</option>
                <option value="UPI">UPI</option>
                <option value="NEFT_RTGS">NEFT / RTGS</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Payee, bill no, desc..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXPENDITURE TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Bill / Voucher No</th>
                  <th className="p-4">Payee / Vendor</th>
                  <th className="p-4">Category & Subcategory</th>
                  <th className="p-4">Fund Type</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Bill Doc</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenditures.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-800">
                      {new Date(item.expenseDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#194331]">
                      {item.billInvoiceNumber}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {item.payeeName}
                      {item.disbursedBy && (
                        <span className="block text-[10px] text-emerald-700 font-medium">Given by: {item.disbursedBy}</span>
                      )}
                      {item.masjid && (
                        <span className="block text-[10px] text-slate-400 font-normal">{item.masjid.name}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block text-xs">
                        {formatCategory(item.category)}
                      </span>
                      <span className="text-[11px] text-slate-500 italic block">{item.subcategory}</span>
                    </td>
                    <td className="p-4 font-mono text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.fundType === "ZAKAT" ? "bg-purple-100 text-purple-800" :
                        item.fundType === "SADAQAH" ? "bg-blue-100 text-blue-800" :
                        item.fundType === "INTEREST_FUND" ? "bg-amber-100 text-amber-800" :
                        item.fundType === "OTHER_SOURCES" ? "bg-teal-100 text-teal-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.fundType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">{item.paymentMethod}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-rose-700 text-sm">
                      -₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      {item.billDocumentUrl ? (
                        <a
                          href={item.billDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-mono text-[11px]"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-300 font-mono text-[10px]">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedExpense(item)}
                          className="p-1.5 rounded-lg border border-[#E5DFD3] hover:bg-slate-100 text-slate-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {item.status === "ACTIVE" && (
                          <button
                            onClick={() => {
                              setVoidExpenseId(item.id);
                              setShowVoidModal(true);
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                            title="Void / Reverse Transaction"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {expenditures.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No expenditure records found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ADD EXPENDITURE MODAL (WITH PROGRESSIVE DISCLOSURE) */}
        {/* ========================================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] font-bold font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">
                    New Expenditure Voucher
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-1">Record Mosque Expense</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
                {/* Masjid Account */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Masjid Account</label>
                  {isSuperAdmin ? (
                    <select
                      value={form.masjidId}
                      onChange={(e) => setForm((prev) => ({ ...prev, masjidId: e.target.value }))}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      required
                    >
                      {masjids.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#194331] font-mono">
                      🕌 {masjids.find(m => String(m.id) === String(form.masjidId || selectedMasjidId))?.name || assignedMasjidName || "Enam Masjid"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expense Date</label>
                    <input
                      type="date"
                      value={form.expenseDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, expenseDate: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="₹0"
                      min={1}
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-rose-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => {
                        const cat = e.target.value as ExpenditureItem["category"];
                        setForm((prev) => ({
                          ...prev,
                          category: cat,
                          subcategory: cat === "GENERAL_ADMINISTRATION" ? "Staff Salary" : "General",
                        }));
                      }}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                    >
                      <option value="GENERAL_ADMINISTRATION">1. General Administration</option>
                      <option value="FESTIVAL_EXPENSE">2. Festival Expenses</option>
                      <option value="CHARITABLE_EXPENSE">3. Charitable Expenses</option>
                      <option value="MISCELLANEOUS_EXPENSE">4. Miscellaneous Expenses</option>
                      <option value="OTHER_CUSTOM_CAT">5. Other (Specify Custom Category)</option>
                    </select>

                    {(form.category as string) === "OTHER_CUSTOM_CAT" && (
                      <input
                        type="text"
                        placeholder="Type custom category (e.g. Construction & Expansion)..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full bg-[#F8F6F0] border border-rose-400 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-rose-200 font-medium text-slate-800 mt-2"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subcategory</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => setForm((prev) => ({ ...prev, subcategory: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                    >
                      {subcategoryOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {form.subcategory === "Other (Specify Custom Reason)" && (
                      <input
                        type="text"
                        placeholder="Type specific expense reason..."
                        value={customSubcategory}
                        onChange={(e) => setCustomSubcategory(e.target.value)}
                        className="w-full bg-[#F8F6F0] border border-rose-400 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-rose-200 font-medium text-slate-800 mt-2"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fund Source</label>
                    <select
                      value={form.fundType}
                      onChange={(e) => setForm((prev) => ({ ...prev, fundType: e.target.value as any }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                    >
                      <option value="GENERAL_FUND">General Fund</option>
                      <option value="ZAKAT">Zakat</option>
                      <option value="SADAQAH">Sadaqah</option>
                      <option value="GENERAL_CHARITY">General Charity</option>
                      <option value="INTEREST_FUND">Interest Fund</option>
                      <option value="OTHER_SOURCES">Other Sources / Specific Funds</option>
                      <option value="OTHER_CUSTOM_FUND">Other (Specify Custom Fund Source)</option>
                    </select>

                    {(form.fundType as string) === "OTHER_CUSTOM_FUND" && (
                      <input
                        type="text"
                        placeholder="Type custom fund source (e.g. Special Waqf Grant)..."
                        value={customFundSource}
                        onChange={(e) => setCustomFundSource(e.target.value)}
                        className="w-full bg-[#F8F6F0] border border-rose-400 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-rose-200 font-medium text-slate-800 mt-2"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount Given By / Disbursed By</label>
                    <input
                      type="text"
                      placeholder="e.g. Hafiz Zubair (Trustee) / Sponsor Name"
                      value={form.disbursedBy}
                      onChange={(e) => setForm((prev) => ({ ...prev, disbursedBy: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payee / Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maulana Hafiz / Power Utility"
                    value={form.payeeName}
                    onChange={(e) => setForm((prev) => ({ ...prev, payeeName: e.target.value }))}
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bill / Invoice Number (Compulsory)</label>
                    <input
                      type="text"
                      placeholder="BILL-XXXX / INV-XXXX"
                      value={form.billInvoiceNumber}
                      onChange={(e) => setForm((prev) => ({ ...prev, billInvoiceNumber: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-rose-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bill Document / Attachment URL</label>
                    <input
                      type="url"
                      placeholder="https://... (Optional bill scan)"
                      value={form.billDocumentUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, billDocumentUrl: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description / Purpose</label>
                  <input
                    type="text"
                    placeholder="Detailed purpose of the expenditure..."
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                    required
                  />
                </div>

                {/* PROGRESSIVE DISCLOSURE PAYMENT METHOD FIELDS */}
                <div className="border border-[#E5DFD3] p-4 rounded-xl bg-[#F8F6F0]/50 space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Payment Method</label>
                    <div className="flex gap-2 flex-wrap">
                      {(["CASH", "CHEQUE", "DEMAND_DRAFT", "UPI", "NEFT_RTGS"] as ExpenditureItem["paymentMethod"][]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, paymentMethod: mode }))}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition ${
                            form.paymentMethod === mode
                              ? "bg-rose-800 text-white border-rose-800 shadow-xs"
                              : "bg-white text-slate-700 border-[#E5DFD3]"
                          }`}
                        >
                          {mode === "NEFT_RTGS" ? "NEFT / Bank" : mode === "DEMAND_DRAFT" ? "DD" : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Cheque fields */}
                  {form.paymentMethod === "CHEQUE" && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Cheque Number</label>
                        <input
                          type="text"
                          placeholder="CHQ-00129"
                          value={form.chequeNumber}
                          onChange={(e) => setForm((prev) => ({ ...prev, chequeNumber: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="SBI / HDFC"
                          value={form.bankName}
                          onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Cheque Date</label>
                        <input
                          type="date"
                          value={form.chequeDate}
                          onChange={(e) => setForm((prev) => ({ ...prev, chequeDate: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic DD fields */}
                  {form.paymentMethod === "DEMAND_DRAFT" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">DD Number</label>
                        <input
                          type="text"
                          placeholder="DD-881920"
                          value={form.ddNumber}
                          onChange={(e) => setForm((prev) => ({ ...prev, ddNumber: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Issuing Bank"
                          value={form.bankName}
                          onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic UPI fields */}
                  {form.paymentMethod === "UPI" && (
                    <div className="pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">UPI Transaction ID / Ref</label>
                      <input
                        type="text"
                        placeholder="UPI/20260818/..."
                        value={form.upiTransactionId}
                        onChange={(e) => setForm((prev) => ({ ...prev, upiTransactionId: e.target.value }))}
                        className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                        required
                      />
                    </div>
                  )}

                  {/* Dynamic NEFT / RTGS fields */}
                  {form.paymentMethod === "NEFT_RTGS" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">UTR / Transaction Ref</label>
                        <input
                          type="text"
                          placeholder="SBIN992810488"
                          value={form.utrNumber}
                          onChange={(e) => setForm((prev) => ({ ...prev, utrNumber: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Recipient / Mosque Bank"
                          value={form.bankName}
                          onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E5DFD3] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-800 hover:bg-rose-900 text-white px-5 py-2 rounded-xl text-xs font-mono font-bold shadow"
                  >
                    Save Expenditure
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VOID EXPENDITURE MODAL (WITH AUDIT TRAIL REASON) */}
        {/* ========================================================================= */}
        {showVoidModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-700">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-serif text-lg font-bold text-slate-900">Void / Reverse Expenditure</h3>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Financial records cannot be deleted. This transaction will be marked as <strong>VOID</strong> and permanently preserved in the audit log.
              </p>
              <form onSubmit={handleVoidSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Reversal / Void (Compulsory)</label>
                  <textarea
                    placeholder="e.g. Duplicate entry, incorrect amount recorded..."
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl p-3 text-xs outline-none focus:border-rose-400 h-24"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD3]">
                  <button
                    type="button"
                    onClick={() => setShowVoidModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow"
                  >
                    Confirm Void
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW EXPENDITURE VOUCHER DETAILS MODAL */}
        {/* ========================================================================= */}
        {selectedExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
              <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-3">
                <div>
                  <span className="text-[10px] font-bold font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">
                    Bill #{selectedExpense.billInvoiceNumber}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mt-1">Expenditure Voucher</h3>
                </div>
                <button onClick={() => setSelectedExpense(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-[#F8F6F0] p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-mono text-rose-700 text-base font-bold">-₹{Number(selectedExpense.amount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Payee / Vendor:</span>
                    <span className="font-bold text-slate-900">{selectedExpense.payeeName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Amount Given By / Disbursed By:</span>
                    <span className="font-bold text-emerald-800">{selectedExpense.disbursedBy || selectedExpense.createdBy || "Authorized Trustee"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Fund Source:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedExpense.fundType.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-bold text-slate-800">{formatCategory(selectedExpense.category)} ({selectedExpense.subcategory})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedExpense.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-mono text-slate-700">{new Date(selectedExpense.expenseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                {selectedExpense.description && (
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Description / Reason:</span>
                    <p className="text-slate-600 bg-white border border-[#E5DFD3] p-2.5 rounded-xl">{selectedExpense.description}</p>
                  </div>
                )}

                {selectedExpense.billDocumentUrl && (
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Attachment / Bill Scan:</span>
                    <a
                      href={selectedExpense.billDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
                    >
                      <Paperclip className="w-4 h-4" /> View Original Attached Document
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => setSelectedExpense(null)}
                  className="bg-[#194331] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold hover:bg-[#123325] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
