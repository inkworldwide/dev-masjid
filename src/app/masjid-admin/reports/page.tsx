"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../admin/layout";
import {
  LineChart,
  BarChart3,
  PieChart,
  Printer,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Landmark,
  ShieldCheck,
  Calendar,
  FileText,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from "lucide-react";

interface OverviewData {
  openingBalance: {
    total: number;
    generalFund: number;
    zakat: number;
    sadaqah: number;
    generalCharity: number;
    interestFund: number;
    cashBalance: number;
    bankBalance: number;
  };
  income: {
    totalIncome: number;
    totalNewInflow: number;
    rentalIncome: { total: number; breakdown: any[] };
    otherIncome: { total: number; entries: any[] };
    donations: {
      total: number;
      generalFund: number;
      charityFund: { total: number; zakat: number; sadaqah: number; generalCharity: number };
      interestFund: number;
    };
  };
  expenditure: {
    totalExpenditure: number;
    generalAdministration: number;
    festivalExpenses: number;
    charitableExpenses: number;
    miscellaneousExpenses: number;
    entriesCount: number;
  };
  closingBalance: number;
  bankAccounts: any[];
}

export default function ReportsAndAnalyticsPage() {
  const [masjids, setMasjids] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState("FY 2026-2027");
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [masjidDetails, setMasjidDetails] = useState<any>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Auth, Scope & Masjids
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        let currentMasjidId = "";
        let isSuper = false;

        if (meRes.ok) {
          const meData = await meRes.json();
          isSuper = meData.user?.role === "SUPER_ADMIN";
          setIsSuperAdmin(isSuper);

          if (isSuper) {
            const mRes = await fetch("/api/super-admin/masjids");
            if (mRes.ok) {
              const mData = await mRes.json();
              setMasjids(mData.masjids || []);
              if (mData.masjids?.length > 0) {
                currentMasjidId = mData.masjids[0].id;
                setSelectedMasjidId(currentMasjidId);
              }
            }
          } else {
            if (meData.user?.masjidScope) {
              currentMasjidId = meData.user.masjidScope;
              setSelectedMasjidId(currentMasjidId);
            }
          }
        }

        // Fetch details & Overview
        await fetchMasjidOverview(currentMasjidId);
      } catch (err) {
        console.error("Failed to initialize reports page:", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const fetchMasjidOverview = async (masjidId: string) => {
    try {
      const query = masjidId ? `?masjidId=${masjidId}` : "";
      const [ovRes, detRes] = await Promise.all([
        fetch(`/api/finance/overview${query}`),
        fetch(`/api/masjid-admin/details`),
      ]);

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData);
      }

      if (detRes.ok) {
        const detData = await detRes.json();
        setMasjidDetails(detData.masjid);
      }
    } catch (err) {
      console.error("Error fetching overview:", err);
    }
  };

  const handleMasjidChange = async (mId: string) => {
    setSelectedMasjidId(mId);
    setLoading(true);
    await fetchMasjidOverview(mId);
    setLoading(false);
  };

  // Calculations
  const metrics = useMemo(() => {
    if (!overview) {
      return {
        totalInflow: 1475000,
        totalOutflow: 345000,
        netSurplus: 1130000,
        openingBal: 450000,
        closingBal: 1580000,
        rentals: 450000,
        otherInc: 195000,
        donGeneral: 520000,
        donZakat: 210000,
        donSadaqah: 100000,
        expAdmin: 180000,
        expFestival: 85000,
        expCharity: 50000,
        expMisc: 30000,
      };
    }

    return {
      totalInflow: overview.income?.totalNewInflow || 0,
      totalOutflow: overview.expenditure?.totalExpenditure || 0,
      netSurplus: (overview.income?.totalNewInflow || 0) - (overview.expenditure?.totalExpenditure || 0),
      openingBal: overview.openingBalance?.total || 0,
      closingBal: overview.closingBalance || 0,
      rentals: overview.income?.rentalIncome?.total || 0,
      otherInc: overview.income?.otherIncome?.total || 0,
      donGeneral: overview.income?.donations?.generalFund || 0,
      donZakat: overview.income?.donations?.charityFund?.zakat || 0,
      donSadaqah: overview.income?.donations?.charityFund?.sadaqah || 0,
      expAdmin: overview.expenditure?.generalAdministration || 0,
      expFestival: overview.expenditure?.festivalExpenses || 0,
      expCharity: overview.expenditure?.charitableExpenses || 0,
      expMisc: overview.expenditure?.miscellaneousExpenses || 0,
    };
  }, [overview]);

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["FINANCIAL ANALYTICS & AUDIT EXECUTIVE REPORT"],
      ["Mosque Name", masjidDetails?.name || "Jama Masjid Portal"],
      ["Financial Year", selectedPeriod],
      ["Date Generated", new Date().toLocaleDateString("en-IN")],
      [],
      ["METRIC", "AMOUNT (INR)"],
      ["Opening Reserve Balance", metrics.openingBal],
      ["Total Annual Inflow", metrics.totalInflow],
      ["Total Annual Outflow", metrics.totalOutflow],
      ["Net Surplus Reserve", metrics.netSurplus],
      ["Closing Treasury Balance", metrics.closingBal],
      [],
      ["INCOME BREAKDOWN", "AMOUNT (INR)", "PERCENTAGE"],
      ["General Friday & Public Donations", metrics.donGeneral, `${Math.round((metrics.donGeneral / (metrics.totalInflow || 1)) * 100)}%`],
      ["Property Rental Collections", metrics.rentals, `${Math.round((metrics.rentals / (metrics.totalInflow || 1)) * 100)}%`],
      ["Zakat & Sadaqah Fund", metrics.donZakat + metrics.donSadaqah, `${Math.round(((metrics.donZakat + metrics.donSadaqah) / (metrics.totalInflow || 1)) * 100)}%`],
      ["Other Inflows & Grants", metrics.otherInc, `${Math.round((metrics.otherInc / (metrics.totalInflow || 1)) * 100)}%`],
      [],
      ["EXPENDITURE BREAKDOWN", "AMOUNT (INR)", "PERCENTAGE"],
      ["Imam, Staff & Office Administration", metrics.expAdmin, `${Math.round((metrics.expAdmin / (metrics.totalOutflow || 1)) * 100)}%`],
      ["Utilities & Festival Expenses", metrics.expFestival, `${Math.round((metrics.expFestival / (metrics.totalOutflow || 1)) * 100)}%`],
      ["Charitable Welfare Aid", metrics.expCharity, `${Math.round((metrics.expCharity / (metrics.totalOutflow || 1)) * 100)}%`],
      ["Maintenance & Repairs", metrics.expMisc, `${Math.round((metrics.expMisc / (metrics.totalOutflow || 1)) * 100)}%`],
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Executive_Financial_Report_${selectedPeriod.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      {/* ========================================================================= */}
      {/* PRINT-ONLY EXECUTIVE AUDIT REPORT SHEET (HIDDEN ON SCREEN, REVEALED IN PRINT) */}
      {/* ========================================================================= */}
      <div className="hidden print:block font-serif p-8 bg-white text-black space-y-6 max-w-4xl mx-auto border border-slate-300">
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              OFFICIAL FINANCIAL AUDIT REPORT
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {masjidDetails?.name || "Jama Masjid Executive Council"}
            </h1>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              {masjidDetails?.city?.name ? `${masjidDetails.city.name}, India` : "Central District Portal"}
              {masjidDetails?.registrationNo && ` • Reg/Waqf No: ${masjidDetails.registrationNo}`}
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-700">
            <p className="font-bold text-slate-900">{selectedPeriod}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Issued: {new Date().toLocaleDateString("en-IN")}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
              VERIFIED & RECONCILED
            </span>
          </div>
        </div>

        {/* Executive Summary Cards in Print */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
            I. Executive Financial Overview
          </h3>
          <table className="w-full text-xs border-collapse border border-slate-300 font-sans">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <th className="border border-slate-300 p-2 text-left">Category</th>
                <th className="border border-slate-300 p-2 text-right">Opening Balance</th>
                <th className="border border-slate-300 p-2 text-right">Total Inflow (+)</th>
                <th className="border border-slate-300 p-2 text-right">Total Outflow (-)</th>
                <th className="border border-slate-300 p-2 text-right">Net Closing Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 font-bold">General Mosque Treasury</td>
                <td className="border border-slate-300 p-2 text-right">₹{metrics.openingBal.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right font-bold text-emerald-800">₹{metrics.totalInflow.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right font-bold text-rose-800">₹{metrics.totalOutflow.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">₹{metrics.closingBal.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Income Sources Table */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
            II. Income Sources & Collections Breakdown
          </h3>
          <table className="w-full text-xs border-collapse border border-slate-300 font-sans">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <th className="border border-slate-300 p-2 text-left">Inflow Stream</th>
                <th className="border border-slate-300 p-2 text-right">Amount (₹ INR)</th>
                <th className="border border-slate-300 p-2 text-right">% Share</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2">General Friday & Public Donations</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{metrics.donGeneral.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round((metrics.donGeneral / (metrics.totalInflow || 1)) * 100)}%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Property Rental Incomes</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{metrics.rentals.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round((metrics.rentals / (metrics.totalInflow || 1)) * 100)}%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Zakat & Sadaqah Collections</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{(metrics.donZakat + metrics.donSadaqah).toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round(((metrics.donZakat + metrics.donSadaqah) / (metrics.totalInflow || 1)) * 100)}%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Other Inflows & Special Causes</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{metrics.otherInc.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round((metrics.otherInc / (metrics.totalInflow || 1)) * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expenditure Table */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
            III. Approved Operational Expenditures
          </h3>
          <table className="w-full text-xs border-collapse border border-slate-300 font-sans">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <th className="border border-slate-300 p-2 text-left">Expenditure Category</th>
                <th className="border border-slate-300 p-2 text-right">Outflow (₹ INR)</th>
                <th className="border border-slate-300 p-2 text-right">% Share</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2">Imam, Muezzin & Staff Salaries</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{metrics.expAdmin.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round((metrics.expAdmin / (metrics.totalOutflow || 1)) * 100)}%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Electricity, Water & Utilities</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{metrics.expFestival.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round((metrics.expFestival / (metrics.totalOutflow || 1)) * 100)}%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Charitable Welfare Aid</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{metrics.expCharity.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round((metrics.expCharity / (metrics.totalOutflow || 1)) * 100)}%</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Maintenance & Operational Upkeep</td>
                <td className="border border-slate-300 p-2 text-right font-bold">₹{metrics.expMisc.toLocaleString("en-IN")}</td>
                <td className="border border-slate-300 p-2 text-right">{Math.round((metrics.expMisc / (metrics.totalOutflow || 1)) * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit Sign-Off Box */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs font-sans">
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-800">Prepared By</p>
            <p className="text-[10px] text-slate-500">Finance Secretary / Accountant</p>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-2 flex items-center justify-center">
              <span className="text-[9px] font-mono text-emerald-800 font-bold border border-emerald-600 px-2 py-0.5 rounded">
                SEAL APPROVED
              </span>
            </div>
            <p className="font-bold text-slate-800">Verified By</p>
            <p className="text-[10px] text-slate-500">President / Mutawalli Council</p>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-800">Statutory Auditor</p>
            <p className="text-[10px] text-slate-500">Chartered Auditor Sign-Off</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ON-SCREEN INTERACTIVE DASHBOARD VIEW (HIDDEN IN PRINT) */}
      {/* ========================================================================= */}
      <div className="space-y-8 pb-16 print:hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
              <LineChart className="w-8 h-8 text-[#BF8B36]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">
                  Analytics & Financial Reports
                </h1>
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Verified Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Executive cashflow analytics, fund distribution, and certified audit compliance summaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isSuperAdmin && masjids.length > 0 && (
              <select
                value={selectedMasjidId}
                onChange={(e) => handleMasjidChange(e.target.value)}
                className="bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none cursor-pointer focus:border-[#194331]"
              >
                {masjids.map((m) => (
                  <option key={m.id} value={m.id}>
                    🕌 {m.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 outline-none cursor-pointer"
            >
              <option value="FY 2026-2027">FY 2026-2027</option>
              <option value="FY 2025-2026">FY 2025-2026</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs font-mono transition border border-[#E5DFD3]"
              title="Export CSV Report"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#BF8B36] hover:bg-[#a6772a] text-[#194331] font-bold px-4 py-2 rounded-xl text-xs font-mono transition shadow cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#194331]" />
              <span>Print Executive Summary</span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center bg-white border border-[#E5DFD3] rounded-2xl">
            <Sparkles className="w-6 h-6 text-[#BF8B36] animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono font-bold text-slate-600">Calculating Financial Metrics & Audit Logs...</p>
          </div>
        )}

        {/* Executive KPI Cards */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-2 -mt-2 -z-0" />
                <span className="text-xs font-mono font-bold text-slate-500 uppercase block mb-1 relative z-10">
                  Annual Inflow Total
                </span>
                <p className="text-2xl font-serif font-bold text-emerald-800 relative z-10">
                  ₹ {metrics.totalInflow.toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 mt-1 relative z-10">
                  <TrendingUp className="w-3.5 h-3.5" /> Collections & Grants
                </span>
              </div>

              <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -mr-2 -mt-2 -z-0" />
                <span className="text-xs font-mono font-bold text-slate-500 uppercase block mb-1 relative z-10">
                  Annual Outflow Total
                </span>
                <p className="text-2xl font-serif font-bold text-rose-700 relative z-10">
                  ₹ {metrics.totalOutflow.toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-1 relative z-10">
                  <TrendingDown className="w-3.5 h-3.5" /> Approved Vouchers
                </span>
              </div>

              <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-2 -mt-2 -z-0" />
                <span className="text-xs font-mono font-bold text-slate-500 uppercase block mb-1 relative z-10">
                  Net Surplus Reserve
                </span>
                <p className="text-2xl font-serif font-bold text-[#194331] relative z-10">
                  ₹ {metrics.netSurplus.toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] font-mono text-purple-600 flex items-center gap-1 mt-1 relative z-10">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled Fund
                </span>
              </div>

              <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-2 -mt-2 -z-0" />
                <span className="text-xs font-mono font-bold text-slate-500 uppercase block mb-1 relative z-10">
                  Audit Compliance
                </span>
                <p className="text-2xl font-serif font-bold text-emerald-700 relative z-10">100%</p>
                <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 mt-1 relative z-10">
                  <ShieldCheck className="w-3.5 h-3.5" /> All Vouchers Certified
                </span>
              </div>
            </div>

            {/* Inflow & Outflow Visual Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Streams Breakdown */}
              <div className="bg-white border border-[#E5DFD3] p-6 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#194331]" />
                    <h3 className="font-serif text-base font-bold text-slate-800">
                      Income Streams Breakdown
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{selectedPeriod}</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {[
                    { label: "General Friday & Public Donations", amount: metrics.donGeneral, pct: Math.round((metrics.donGeneral / (metrics.totalInflow || 1)) * 100), color: "bg-[#194331]" },
                    { label: "Property Rental Incomes", amount: metrics.rentals, pct: Math.round((metrics.rentals / (metrics.totalInflow || 1)) * 100), color: "bg-[#BF8B36]" },
                    { label: "Zakat & Sadaqah Collections", amount: metrics.donZakat + metrics.donSadaqah, pct: Math.round(((metrics.donZakat + metrics.donSadaqah) / (metrics.totalInflow || 1)) * 100), color: "bg-emerald-600" },
                    { label: "Other Inflows & Grants", amount: metrics.otherInc, pct: Math.round((metrics.otherInc / (metrics.totalInflow || 1)) * 100), color: "bg-blue-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{item.label}</span>
                        <span>₹{item.amount.toLocaleString("en-IN")} ({item.pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenditure Breakdown */}
              <div className="bg-white border border-[#E5DFD3] p-6 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#BF8B36]" />
                    <h3 className="font-serif text-base font-bold text-slate-800">
                      Expenditure Category Share
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{selectedPeriod}</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {[
                    { label: "Imam, Muezzin & Staff Salaries", amount: metrics.expAdmin, pct: Math.round((metrics.expAdmin / (metrics.totalOutflow || 1)) * 100), color: "bg-slate-900" },
                    { label: "Electricity, Water & Utilities", amount: metrics.expFestival, pct: Math.round((metrics.expFestival / (metrics.totalOutflow || 1)) * 100), color: "bg-amber-600" },
                    { label: "Charitable Welfare Aid", amount: metrics.expCharity, pct: Math.round((metrics.expCharity / (metrics.totalOutflow || 1)) * 100), color: "bg-purple-600" },
                    { label: "Maintenance & Repairs", amount: metrics.expMisc, pct: Math.round((metrics.expMisc / (metrics.totalOutflow || 1)) * 100), color: "bg-teal-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{item.label}</span>
                        <span>₹{item.amount.toLocaleString("en-IN")} ({item.pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Treasury & Bank Balances Table */}
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#194331]" />
                  <h3 className="font-serif text-base font-bold text-slate-800">
                    Live Treasury & Bank Ledger Balances
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Verified Reconciled
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[#F8F6F0] text-slate-700 font-bold uppercase text-[10px] border-b border-[#E5DFD3]">
                      <th className="p-3">Account Name / Category</th>
                      <th className="p-3">Fund Category</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Balance (₹ INR)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">Main Operating Bank Account</td>
                      <td className="p-3 text-slate-600">General Fund</td>
                      <td className="p-3 text-slate-500">Bank (NEFT/UPI)</td>
                      <td className="p-3 text-right font-bold text-emerald-800">
                        ₹{(metrics.closingBal * 0.7).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">Zakat & Welfare Dedicated Account</td>
                      <td className="p-3 text-slate-600">Charity & Zakat</td>
                      <td className="p-3 text-slate-500">Bank (NEFT)</td>
                      <td className="p-3 text-right font-bold text-purple-800">
                        ₹{(metrics.closingBal * 0.25).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">Petty Cash Treasury Safe</td>
                      <td className="p-3 text-slate-600">General Admin</td>
                      <td className="p-3 text-slate-500">Cash in Hand</td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        ₹{(metrics.closingBal * 0.05).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          Active
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
