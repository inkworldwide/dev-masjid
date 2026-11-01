"use client";
import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/app/admin/layout";
import {
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  TrendingUp,
  Coins,
  DollarSign,
  HeartHandshake,
  Key,
  X,
  Paperclip,
} from "lucide-react";

interface InflowItem {
  id: string;
  date: string;
  sourceType: "DONATION" | "RENTAL" | "OTHER_INCOME";
  contributorName: string;
  collectorName?: string;
  category: string;
  donationType?: string;
  fundType: "GENERAL_FUND" | "ZAKAT" | "SADAQAH" | "GENERAL_CHARITY" | "INTEREST_FUND";
  amount: number;
  paymentMethod: "CASH" | "CHEQUE" | "DEMAND_DRAFT" | "UPI" | "NEFT_RTGS" | "OTHER";
  receiptOrRefNo: string;
  description?: string;
  status: "VERIFIED" | "VOID";
  masjid?: { id: string; name: string; location: string };
  details?: any;
}

export default function InflowLedgerPage() {
  const [masjids, setMasjids] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState("2026-2027");

  const [inflows, setInflows] = useState<InflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [assignedMasjidName, setAssignedMasjidName] = useState<string>("");

  // Filters
  const [search, setSearch] = useState("");
  const [fundFilter, setFundFilter] = useState("ALL");
  const [streamFilter, setStreamFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Modals
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showOtherInflowModal, setShowOtherInflowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Donation Form State
  const [donForm, setDonForm] = useState({
    masjidId: "",
    donationDate: new Date().toISOString().split("T")[0],
    amount: "",
    donationType: "General Masjid Fund",
    otherDonationType: "",
    fundType: "GENERAL_FUND" as InflowItem["fundType"],
    paymentMethod: "CASH" as InflowItem["paymentMethod"],
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    donorAddress: "",
    description: "",
    chequeNumber: "",
    bankName: "",
    chequeDate: "",
    ddNumber: "",
    upiTransactionId: "",
    utrNumber: "",
  });

  // Other Inflow Form State
  const [otherForm, setOtherForm] = useState({
    masjidId: "",
    sourceName: "",
    description: "",
    amount: "",
    incomeDate: new Date().toISOString().split("T")[0],
    paymentMethod: "CASH",
    referenceNumber: "",
    fundType: "GENERAL_FUND",
    collectorName: "",
  });

  // Load Masjids & Auth Scope
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
          if (mData.masjids?.length > 0) {
            const defaultM = scopeMasjid !== "ALL" ? scopeMasjid : mData.masjids[0].id;
            setDonForm((prev) => ({ ...prev, masjidId: defaultM }));
            setOtherForm((prev) => ({ ...prev, masjidId: defaultM }));
          }
        }
        await loadInflows();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch Inflow Records (combining Donations, Live Rentals, and Other Incomes)
  async function loadInflows() {
    try {
      const params = new URLSearchParams();
      if (selectedMasjidId && selectedMasjidId !== "ALL") params.set("masjidId", selectedMasjidId);

      const [donRes, overRes] = await Promise.all([
        fetch(`/api/finance/donations?${params.toString()}`),
        fetch(`/api/finance/overview?${params.toString()}`),
      ]);

      const items: InflowItem[] = [];

      // 1. Process Donations
      if (donRes.ok) {
        const dData = await donRes.json();
        (dData.donations || []).forEach((d: any) => {
          let donationType = d.donationType;
          if (!donationType) {
            const match = d.description?.match(/\[Donation Type:\s*([^\]]+)\]/i);
            donationType = match ? match[1].trim() : (d.fundType === "ZAKAT" ? "Zakat" : d.fundType === "SADAQAH" ? "Sadaqah" : "General Masjid Fund");
          }

          items.push({
            id: d.id,
            date: d.donationDate,
            sourceType: "DONATION",
            contributorName: d.donorName,
            collectorName: d.createdBy,
            category: `Donation • ${donationType}`,
            donationType,
            fundType: d.fundType,
            amount: Number(d.amount),
            paymentMethod: d.paymentMethod,
            receiptOrRefNo: d.receiptNumber,
            description: d.description,
            status: d.status,
            masjid: d.masjid,
            details: {
              ...d,
              donationType,
            },
          });
        });
      }

      // 2. Process Rentals & Other Incomes from Overview
      if (overRes.ok) {
        const oData = await overRes.json();
        
        // Rentals
        (oData.income?.rentalIncome?.breakdown || []).forEach((r: any) => {
          items.push({
            id: r.id,
            date: r.date || new Date().toISOString(),
            sourceType: "RENTAL",
            contributorName: r.tenantName,
            category: `Shop / Rental (${r.propertyCustomId})`,
            fundType: "GENERAL_FUND",
            amount: Number(r.amount),
            paymentMethod: "CASH",
            receiptOrRefNo: `RNT-${r.tenantCustomId}`,
            description: `Monthly Rental Lease - Unit ${r.location}`,
            status: "VERIFIED",
          });
        });

        // Other Incomes
        (oData.income?.otherIncome?.entries || []).forEach((oi: any) => {
          items.push({
            id: oi.id,
            date: oi.incomeDate,
            sourceType: "OTHER_INCOME",
            contributorName: oi.sourceName,
            collectorName: oi.collectorName,
            category: "Sponsorship / Special Drive",
            fundType: oi.fundType,
            amount: Number(oi.amount),
            paymentMethod: oi.paymentMethod,
            receiptOrRefNo: oi.referenceNumber,
            description: oi.description,
            status: oi.status,
          });
        });
      }

      // Sort by date descending
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setInflows(items);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadInflows();
  }, [selectedMasjidId]);

  // Filtered List
  const filteredInflows = useMemo(() => {
    return inflows.filter((item) => {
      if (fundFilter !== "ALL" && item.fundType !== fundFilter) return false;
      if (streamFilter !== "ALL" && item.sourceType !== streamFilter) return false;
      if (paymentFilter !== "ALL" && item.paymentMethod !== paymentFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const matchName = item.contributorName?.toLowerCase().includes(s);
        const matchRef = item.receiptOrRefNo?.toLowerCase().includes(s);
        const matchDesc = item.description?.toLowerCase().includes(s);
        if (!matchName && !matchRef && !matchDesc) return false;
      }
      return true;
    });
  }, [inflows, fundFilter, streamFilter, paymentFilter, search]);

  // Summary Metrics
  const summary = useMemo(() => {
    let total = 0;
    let generalFund = 0;
    let zakat = 0;
    let sadaqah = 0;
    let charity = 0;
    let rentals = 0;
    let other = 0;
    let interest = 0;

    inflows.forEach((item) => {
      if (item.status === "VERIFIED") {
        const amt = Number(item.amount);
        total += amt;
        if (item.sourceType === "RENTAL") rentals += amt;
        else if (item.sourceType === "OTHER_INCOME") other += amt;

        if (item.fundType === "GENERAL_FUND") generalFund += amt;
        else if (item.fundType === "ZAKAT") zakat += amt;
        else if (item.fundType === "SADAQAH") sadaqah += amt;
        else if (item.fundType === "GENERAL_CHARITY") charity += amt;
        else if (item.fundType === "INTEREST_FUND") interest += amt;
      }
    });

    return { total, generalFund, zakat, sadaqah, charity, rentals, other, interest };
  }, [inflows]);

  // Handle Donation Submit
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donForm.amount || Number(donForm.amount) <= 0) return alert("Please enter a valid amount");

    const effectiveType = donForm.donationType === "Other"
      ? (donForm.otherDonationType.trim() || "Other Purpose")
      : donForm.donationType;

    let computedFundType = donForm.fundType;
    const dUpper = effectiveType.toUpperCase();
    if (dUpper.includes("ZAKAT")) computedFundType = "ZAKAT";
    else if (dUpper.includes("SADAQAH")) computedFundType = "SADAQAH";
    else if (dUpper.includes("CHARITY") || dUpper.includes("EDUCATION") || dUpper.includes("WELFARE") || dUpper.includes("EMERGENCY")) computedFundType = "GENERAL_CHARITY";
    else if (dUpper.includes("INTEREST")) computedFundType = "INTEREST_FUND";

    try {
      const res = await fetch("/api/finance/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...donForm,
          donationType: effectiveType,
          fundType: computedFundType,
        }),
      });

      if (res.ok) {
        setShowDonationModal(false);
        setDonForm({
          masjidId: masjids[0]?.id || "",
          donationDate: new Date().toISOString().split("T")[0],
          amount: "",
          donationType: "General Masjid Fund",
          otherDonationType: "",
          fundType: "GENERAL_FUND",
          paymentMethod: "CASH",
          donorName: "",
          donorPhone: "",
          donorEmail: "",
          donorAddress: "",
          description: "",
          chequeNumber: "",
          bankName: "",
          chequeDate: "",
          ddNumber: "",
          upiTransactionId: "",
          utrNumber: "",
        });
        await loadInflows();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record donation");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving donation");
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
            <div className="p-3.5 bg-emerald-900 text-white rounded-2xl shadow-sm">
              <ArrowDownRight className="w-8 h-8 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">Inflow & Collection Ledger</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Inflow Management
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Track all mosque receipts: Public donations, rental collections, Zakat, Sadaqah, and sponsorship funds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDonationModal(true)}
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold shadow transition"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              + Record Donation
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUMMARY METRICS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-md border border-emerald-900">
            <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider block">
              Total Inflows
            </span>
            <span className="font-serif text-2xl font-bold text-[#BF8B36] block mt-1">
              ₹{summary.total.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-emerald-300 mt-1 block">Live Collections & Rentals</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              General Fund
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 block mt-1">
              ₹{summary.generalFund.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Mosque operations & general</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
              Zakat Collections
            </span>
            <span className="font-serif text-xl font-bold text-purple-900 block mt-1">
              ₹{summary.zakat.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Restricted charity fund</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider block">
              Sadaqah Collections
            </span>
            <span className="font-serif text-xl font-bold text-blue-900 block mt-1">
              ₹{summary.sadaqah.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Voluntary charity & aid</span>
          </div>

          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
              Rental & Property
            </span>
            <span className="font-serif text-xl font-bold text-amber-900 block mt-1">
              ₹{summary.rentals.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">Live tenant lease revenue</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTERS & TOOLBAR */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Masjid Scope */}
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

            {/* Inflow Stream Filter */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Inflow Stream</label>
              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="ALL">All Inflow Streams</option>
                <option value="DONATION">Public Donations</option>
                <option value="RENTAL">Property / Shop Rentals</option>
                <option value="OTHER_INCOME">Other Sources / Sponsorships</option>
              </select>
            </div>

            {/* Fund Source Filter */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Fund Head</label>
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
                <option value="INTEREST_FUND">Interest Fund (Disposal)</option>
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
                  placeholder="Donor, tenant, receipt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INFLOW LEDGER TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Receipt / Ref No</th>
                  <th className="p-4">Donor / Tenant / Source</th>
                  <th className="p-4">Stream & Category</th>
                  <th className="p-4">Fund Head</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInflows.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-800">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#194331]">
                      {item.receiptOrRefNo}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {item.contributorName}
                      {item.collectorName && (
                        <span className="block text-[10px] text-slate-400 font-normal">Via: {item.collectorName}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs">{item.category}</span>
                        {item.donationType && (
                          <span className="text-[10px] font-semibold bg-[#FBF4E4] text-[#BF8B36] px-2 py-0.5 rounded-full border border-[#E5D2B0] font-mono">
                            {item.donationType}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.description}</span>
                    </td>
                    <td className="p-4 font-mono text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.fundType === "ZAKAT" ? "bg-purple-100 text-purple-800" :
                        item.fundType === "SADAQAH" ? "bg-blue-100 text-blue-800" :
                        item.fundType === "INTEREST_FUND" ? "bg-amber-100 text-amber-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.fundType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">{item.paymentMethod}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                      +₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {item.sourceType === "DONATION" ? (
                        <button
                          onClick={() => setSelectedReceipt(item.details || item)}
                          className="inline-flex items-center gap-1 text-[#194331] hover:text-[#123325] bg-[#F8F6F0] hover:bg-[#E5DFD3] border border-[#E5DFD3] px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#BF8B36]" />
                          Receipt
                        </button>
                      ) : (
                        <span className="text-slate-300 font-mono text-[10px]">Voucher</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredInflows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No inflow records found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECORD DONATION MODAL (PROGRESSIVE DISCLOSURE) */}
        {/* ========================================================================= */}
        {showDonationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                    Official Inflow Receipt
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-1">Record Mosque Donation</h3>
                </div>
                <button onClick={() => setShowDonationModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDonationSubmit} className="space-y-4 text-xs">
                {/* Masjid Account */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Masjid Account</label>
                  {isSuperAdmin ? (
                    <select
                      value={donForm.masjidId}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, masjidId: e.target.value }))}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      required
                    >
                      {masjids.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#194331] font-mono">
                      🕌 {masjids.find(m => String(m.id) === String(donForm.masjidId || selectedMasjidId))?.name || assignedMasjidName || "Enam Masjid"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Donation Date</label>
                    <input
                      type="date"
                      value={donForm.donationDate}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, donationDate: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Donation Amount (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="₹0"
                      min={1}
                      value={donForm.amount}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Donation Type Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-[11px]">Donation Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "General Masjid Fund",
                      "Construction",
                      "Maintenance",
                      "Education",
                      "Zakat",
                      "Charity",
                      "Community Welfare",
                      "Emergency",
                      "Other",
                    ].map((type) => {
                      const isSelected = donForm.donationType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDonForm((prev) => ({ ...prev, donationType: type }))}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition border cursor-pointer ${
                            isSelected
                              ? "bg-[#BF8B36] text-white border-[#BF8B36] shadow-xs"
                              : "bg-[#F8F6F0] text-[#194331] border-[#E5DFD3] hover:border-[#BF8B36]"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  {donForm.donationType === "Other" && (
                    <input
                      type="text"
                      placeholder="Specify custom donation purpose..."
                      value={donForm.otherDonationType}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, otherDonationType: e.target.value }))}
                      className="w-full bg-white border border-[#BF8B36] rounded-xl px-3 py-1.5 text-xs outline-none mt-1"
                      required
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fund Head Classification</label>
                    <select
                      value={donForm.fundType}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, fundType: e.target.value as any }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                    >
                      <option value="GENERAL_FUND">General Fund (Mosque Operations)</option>
                      <option value="ZAKAT">Zakat (Restricted Destitute Aid)</option>
                      <option value="SADAQAH">Sadaqah (Voluntary Charity)</option>
                      <option value="GENERAL_CHARITY">General Charity & Food</option>
                      <option value="INTEREST_FUND">Interest Fund (Disposal Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Donor Name / Contributor</label>
                    <input
                      type="text"
                      placeholder="e.g. Mohammed Imran / Anonymous"
                      value={donForm.donorName}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, donorName: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Donor Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98450 XXXXX"
                      value={donForm.donorPhone}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, donorPhone: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Donor Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="donor@example.com"
                      value={donForm.donorEmail}
                      onChange={(e) => setDonForm((prev) => ({ ...prev, donorEmail: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Purpose / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Zakat, Ramadan Iftar support, Jummah Sadaqah..."
                    value={donForm.description}
                    onChange={(e) => setDonForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {/* PROGRESSIVE DISCLOSURE PAYMENT METHOD */}
                <div className="border border-[#E5DFD3] p-4 rounded-xl bg-[#F8F6F0]/50 space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Payment Method</label>
                    <div className="flex gap-2 flex-wrap">
                      {(["CASH", "CHEQUE", "DEMAND_DRAFT", "UPI", "NEFT_RTGS"] as InflowItem["paymentMethod"][]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setDonForm((prev) => ({ ...prev, paymentMethod: mode }))}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition ${
                            donForm.paymentMethod === mode
                              ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                              : "bg-white text-slate-700 border-[#E5DFD3]"
                          }`}
                        >
                          {mode === "NEFT_RTGS" ? "NEFT / Bank" : mode === "DEMAND_DRAFT" ? "DD" : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cheque Fields */}
                  {donForm.paymentMethod === "CHEQUE" && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Cheque Number</label>
                        <input
                          type="text"
                          placeholder="CHQ-882109"
                          value={donForm.chequeNumber}
                          onChange={(e) => setDonForm((prev) => ({ ...prev, chequeNumber: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="SBI / HDFC"
                          value={donForm.bankName}
                          onChange={(e) => setDonForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Cheque Date</label>
                        <input
                          type="date"
                          value={donForm.chequeDate}
                          onChange={(e) => setDonForm((prev) => ({ ...prev, chequeDate: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* DD Fields */}
                  {donForm.paymentMethod === "DEMAND_DRAFT" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">DD Number</label>
                        <input
                          type="text"
                          placeholder="DD-992109"
                          value={donForm.ddNumber}
                          onChange={(e) => setDonForm((prev) => ({ ...prev, ddNumber: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Issuing Bank"
                          value={donForm.bankName}
                          onChange={(e) => setDonForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI Fields */}
                  {donForm.paymentMethod === "UPI" && (
                    <div className="pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">UPI Transaction Reference ID</label>
                      <input
                        type="text"
                        placeholder="UPI/20260818/..."
                        value={donForm.upiTransactionId}
                        onChange={(e) => setDonForm((prev) => ({ ...prev, upiTransactionId: e.target.value }))}
                        className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                        required
                      />
                    </div>
                  )}

                  {/* NEFT Fields */}
                  {donForm.paymentMethod === "NEFT_RTGS" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5DFD3] animate-in slide-in-from-top-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">UTR / Bank Ref Number</label>
                        <input
                          type="text"
                          placeholder="SBIN992810488"
                          value={donForm.utrNumber}
                          onChange={(e) => setDonForm((prev) => ({ ...prev, utrNumber: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Transfer Bank"
                          value={donForm.bankName}
                          onChange={(e) => setDonForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E5DFD3] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDonationModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded-xl text-xs font-mono font-bold shadow"
                  >
                    Save & Generate Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW RECEIPT MODAL */}
        {/* ========================================================================= */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase tracking-widest block">
                    OFFICIAL MOSQUE RECEIPT
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-0.5">
                    {selectedReceipt.masjid?.name || "Enam Masjid Trust"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {selectedReceipt.masjid?.location || "Nagwara, Bangalore"}
                  </p>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#E5DFD3] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-mono font-bold text-[#194331]">{selectedReceipt.receiptNumber || selectedReceipt.receiptOrRefNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {new Date(selectedReceipt.donationDate || selectedReceipt.date).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Donor Name:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.donorName || selectedReceipt.contributorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Donation Type:</span>
                  <span className="font-mono font-bold text-[#BF8B36] bg-[#FBF4E4] px-2.5 py-0.5 rounded-full border border-[#E5D2B0]">
                    {selectedReceipt.donationType || (selectedReceipt.description?.match(/\[Donation Type:\s*([^\]]+)\]/i)?.[1]) || selectedReceipt.fundType?.replace("_", " ") || "General Masjid Fund"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fund Head:</span>
                  <span className="font-mono font-bold text-emerald-800">{selectedReceipt.fundType?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t border-[#E5DFD3] pt-2 mt-2">
                  <span className="font-bold text-slate-800">Amount Paid:</span>
                  <span className="font-serif font-bold text-emerald-700 text-base">
                    ₹{Number(selectedReceipt.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-[#E5DFD3]">
                <span>Authorized Signatory: Committee</span>
                <span>Status: VERIFIED ✓</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-[#194331] text-white px-4 py-2 rounded-xl font-mono font-bold shadow hover:bg-[#123325]"
                >
                  <Printer className="w-3.5 h-3.5 text-[#BF8B36]" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
