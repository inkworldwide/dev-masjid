"use client";
import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/app/admin/layout";
import {
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  FileSpreadsheet,
  Download,
  Printer,
  Plus,
  Paperclip,
  Clock,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Coins,
  CreditCard,
  Building,
  X,
} from "lucide-react";

export default function ManualAuditPage() {
  const [masjids, setMasjids] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("2026-2027");
  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // System Data fetched from API
  const [systemData, setSystemData] = useState<any>(null);
  const [existingAudit, setExistingAudit] = useState<any>(null);

  // Auditor Actual Values Form State
  const [actualValues, setActualValues] = useState({
    // Opening Balance
    openGeneral: "",
    openZakat: "",
    openSadaqah: "",
    openCharity: "",
    openInterest: "",
    openOther: "",
    openOtherLabel: "",
    openOtherSys: "0",
    
    // Income
    rentIncome: "",
    otherIncome: "",
    donGeneral: "",
    donZakat: "",
    donSadaqah: "",
    donCharity: "",
    donInterest: "",
    incomeOtherCustom: "",
    incomeOtherCustomLabel: "",
    incomeOtherCustomSys: "0",

    // Expenditure
    expGeneralAdmin: "",
    expFestival: "",
    expCharitable: "",
    expMisc: "",
    expOther: "",
    expOtherLabel: "",
    expOtherSys: "0",

    // Cash & Bank
    actualCashCounted: "",
    actualBankBalances: {} as Record<string, string>, // bankAccountId -> amount string

    // Remarks & Status
    auditRemarks: "",
    status: "DRAFT" as "DRAFT" | "IN_REVIEW" | "RECONCILED" | "DIFFERENCE_FOUND" | "APPROVED" | "LOCKED",
  });

  // Adjustments Modal State
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [adjustmentsList, setAdjustmentsList] = useState<any[]>([]);
  const [adjForm, setAdjForm] = useState({
    amount: "",
    type: "INCOME_ADJUSTMENT",
    reason: "",
    remarks: "",
  });

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load Auth & Masjids
  useEffect(() => {
    async function loadAuthAndMasjids() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          const superAdmin = meData.user?.role === "SUPER_ADMIN";
          setIsSuperAdmin(superAdmin);

          if (superAdmin) {
            const res = await fetch("/api/super-admin/masjids");
            if (res.ok) {
              const data = await res.json();
              setMasjids(data.masjids || []);
              if (data.masjids?.length > 0 && !selectedMasjidId) {
                setSelectedMasjidId(data.masjids[0].id);
              }
            }
          } else {
            if (meData.user?.masjidScope) {
              setSelectedMasjidId(meData.user.masjidScope);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAuthAndMasjids();
  }, []);

  // Fetch Manual Audit Data for Selected Masjid & Month
  useEffect(() => {
    if (!selectedMasjidId) return;

    async function loadAuditData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/finance/manual-audit?masjidId=${selectedMasjidId}&year=${selectedYear}&month=${encodeURIComponent(selectedMonth)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSystemData(data.systemData);
          setExistingAudit(data.auditRecord);

          if (data.auditRecord) {
            const comp = data.auditRecord.comparisonData || {};
            setActualValues({
              openGeneral: comp.openGeneral ?? String(data.systemData.openingBalance.generalFund),
              openZakat: comp.openZakat ?? String(data.systemData.openingBalance.zakat),
              openSadaqah: comp.openSadaqah ?? String(data.systemData.openingBalance.sadaqah),
              openCharity: comp.openCharity ?? String(data.systemData.openingBalance.generalCharity),
              openInterest: comp.openInterest ?? String(data.systemData.openingBalance.interestFund),
              openOther: comp.openOther ?? "",
              openOtherLabel: comp.openOtherLabel ?? "",
              openOtherSys: comp.openOtherSys ?? "0",

              rentIncome: comp.rentIncome ?? String(data.systemData.income.rent),
              otherIncome: comp.otherIncome ?? String(data.systemData.income.other),
              donGeneral: comp.donGeneral ?? String(data.systemData.income.generalDonations),
              donZakat: comp.donZakat ?? String(data.systemData.income.zakat),
              donSadaqah: comp.donSadaqah ?? String(data.systemData.income.sadaqah),
              donCharity: comp.donCharity ?? String(data.systemData.income.generalCharity),
              donInterest: comp.donInterest ?? String(data.systemData.income.interest),
              incomeOtherCustom: comp.incomeOtherCustom ?? "",
              incomeOtherCustomLabel: comp.incomeOtherCustomLabel ?? "",
              incomeOtherCustomSys: comp.incomeOtherCustomSys ?? "0",

              expGeneralAdmin: comp.expGeneralAdmin ?? String(data.systemData.expenditure.generalAdmin),
              expFestival: comp.expFestival ?? String(data.systemData.expenditure.festival),
              expCharitable: comp.expCharitable ?? String(data.systemData.expenditure.charitable),
              expMisc: comp.expMisc ?? String(data.systemData.expenditure.misc),
              expOther: comp.expOther ?? "",
              expOtherLabel: comp.expOtherLabel ?? "",
              expOtherSys: comp.expOtherSys ?? "0",

              actualCashCounted: String(data.auditRecord.actualCashCounted ?? data.systemData.cashBalance),
              actualBankBalances: comp.actualBankBalances || {},
              auditRemarks: data.auditRecord.auditRemarks || "",
              status: data.auditRecord.status || "DRAFT",
            });
            setAdjustmentsList(data.auditRecord.adjustments || []);
          } else if (data.systemData) {
            // Default actual values match system until auditor alters them
            const bMap: Record<string, string> = {};
            data.systemData.bankAccounts?.forEach((b: any) => {
              bMap[b.id] = String(b.currentBalance);
            });

            setActualValues({
              openGeneral: String(data.systemData.openingBalance.generalFund),
              openZakat: String(data.systemData.openingBalance.zakat),
              openSadaqah: String(data.systemData.openingBalance.sadaqah),
              openCharity: String(data.systemData.openingBalance.generalCharity),
              openInterest: String(data.systemData.openingBalance.interestFund),
              openOther: "",
              openOtherLabel: "",
              openOtherSys: "0",

              rentIncome: String(data.systemData.income.rent),
              otherIncome: String(data.systemData.income.other),
              donGeneral: String(data.systemData.income.generalDonations),
              donZakat: String(data.systemData.income.zakat),
              donSadaqah: String(data.systemData.income.sadaqah),
              donCharity: String(data.systemData.income.generalCharity),
              donInterest: String(data.systemData.income.interest),
              incomeOtherCustom: "",
              incomeOtherCustomLabel: "",
              incomeOtherCustomSys: "0",

              expGeneralAdmin: String(data.systemData.expenditure.generalAdmin),
              expFestival: String(data.systemData.expenditure.festival),
              expCharitable: String(data.systemData.expenditure.charitable),
              expMisc: String(data.systemData.expenditure.misc),
              expOther: "",
              expOtherLabel: "",
              expOtherSys: "0",

              actualCashCounted: String(data.systemData.cashBalance),
              actualBankBalances: bMap,
              auditRemarks: "",
              status: "DRAFT",
            });
            setAdjustmentsList([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAuditData();
  }, [selectedMasjidId, selectedYear, selectedMonth]);

  // Calculations for Live Comparison & Differences
  const comparison = useMemo(() => {
    if (!systemData) return null;

    // Actual Opening Balance
    const actOpenGen = Number(actualValues.openGeneral) || 0;
    const actOpenZakat = Number(actualValues.openZakat) || 0;
    const actOpenSad = Number(actualValues.openSadaqah) || 0;
    const actOpenChar = Number(actualValues.openCharity) || 0;
    const actOpenInt = Number(actualValues.openInterest) || 0;
    const actOpenOther = Number(actualValues.openOther) || 0;
    const verifiedOpening = actOpenGen + actOpenZakat + actOpenSad + actOpenChar + actOpenInt + actOpenOther;
    const openingDiff = verifiedOpening - (Number(systemData.openingBalance.total) + (Number(actualValues.openOtherSys) || 0));

    // Actual Inflows
    const actRent = Number(actualValues.rentIncome) || 0;
    const actOther = Number(actualValues.otherIncome) || 0;
    const actDonGen = Number(actualValues.donGeneral) || 0;
    const actDonZakat = Number(actualValues.donZakat) || 0;
    const actDonSad = Number(actualValues.donSadaqah) || 0;
    const actDonChar = Number(actualValues.donCharity) || 0;
    const actDonInt = Number(actualValues.donInterest) || 0;
    const actIncomeOther = Number(actualValues.incomeOtherCustom) || 0;

    const verifiedNewInflow = actRent + actOther + actDonGen + actDonZakat + actDonSad + actDonChar + actDonInt + actIncomeOther;
    const verifiedTotalIncome = verifiedOpening + verifiedNewInflow;
    const incomeDiff = verifiedTotalIncome - (Number(systemData.income.total) + (Number(actualValues.openOtherSys) || 0) + (Number(actualValues.incomeOtherCustomSys) || 0));

    // Actual Expenditures
    const actExpGen = Number(actualValues.expGeneralAdmin) || 0;
    const actExpFest = Number(actualValues.expFestival) || 0;
    const actExpChar = Number(actualValues.expCharitable) || 0;
    const actExpMisc = Number(actualValues.expMisc) || 0;
    const actExpOther = Number(actualValues.expOther) || 0;

    const verifiedTotalExp = actExpGen + actExpFest + actExpChar + actExpMisc + actExpOther;
    const expDiff = verifiedTotalExp - (Number(systemData.expenditure.total) + (Number(actualValues.expOtherSys) || 0));

    // Closing Balance
    const verifiedClosing = verifiedTotalIncome - verifiedTotalExp;
    const closingDiff = verifiedClosing - Number(systemData.closingBalance);

    // Cash & Bank Differences
    const actCash = Number(actualValues.actualCashCounted) || 0;
    const cashDiff = actCash - Number(systemData.cashBalance);

    let totalVerifiedBank = 0;
    systemData.bankAccounts?.forEach((b: any) => {
      totalVerifiedBank += Number(actualValues.actualBankBalances[b.id] ?? b.currentBalance);
    });
    const bankDiff = totalVerifiedBank - Number(systemData.bankBalance);

    const isFullyReconciled =
      openingDiff === 0 &&
      incomeDiff === 0 &&
      expDiff === 0 &&
      cashDiff === 0 &&
      bankDiff === 0;

    return {
      verifiedOpening,
      openingDiff,
      verifiedTotalIncome,
      incomeDiff,
      verifiedTotalExp,
      expDiff,
      verifiedClosing,
      closingDiff,
      actCash,
      cashDiff,
      totalVerifiedBank,
      bankDiff,
      isFullyReconciled,
    };
  }, [systemData, actualValues]);

  // Handle Save Audit
  const handleSaveAudit = async (targetStatus?: typeof actualValues.status) => {
    if (!selectedMasjidId || !comparison) return;
    setSaving(true);

    try {
      const payload = {
        masjidId: selectedMasjidId,
        yearName: selectedYear,
        month: selectedMonth,
        actualOpeningBalance: comparison.verifiedOpening,
        actualTotalIncome: comparison.verifiedTotalIncome,
        actualTotalExpenditure: comparison.verifiedTotalExp,
        actualCashCounted: comparison.actCash,
        actualBankBalance: comparison.totalVerifiedBank,
        auditRemarks: actualValues.auditRemarks,
        comparisonData: {
          ...actualValues,
          verifiedOpening: comparison.verifiedOpening,
          verifiedTotalIncome: comparison.verifiedTotalIncome,
          verifiedTotalExp: comparison.verifiedTotalExp,
          verifiedClosing: comparison.verifiedClosing,
        },
        status: targetStatus || (comparison.isFullyReconciled ? "RECONCILED" : "DIFFERENCE_FOUND"),
        adjustments: adjustmentsList,
      };

      const res = await fetch("/api/finance/manual-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const d = await res.json();
        setExistingAudit(d.audit);
        setActualValues((prev) => ({ ...prev, status: d.audit.status }));
        alert(`Audit saved successfully with status: ${d.audit.status}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save audit");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving audit");
    } finally {
      setSaving(false);
    }
  };

  const isLocked = existingAudit?.status === "LOCKED";

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 print:hidden">
        
        {/* ========================================================================= */}
        {/* HEADER */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
              <ShieldCheck className="w-8 h-8 text-[#BF8B36]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">Manual Audit & Reconciliation</h1>
                <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isLocked ? "bg-slate-900 text-white" :
                  comparison?.isFullyReconciled ? "bg-emerald-100 text-emerald-800" :
                  "bg-amber-100 text-amber-900"
                }`}>
                  Status: {actualValues.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Auditor physical reconciliation comparing system-generated records against physical mosque cash, bank statements, and receipt books.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 bg-[#BF8B36] hover:bg-[#a6772a] text-[#194331] font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#194331]" />
              <span>Print Audit Report</span>
            </button>

            {!isLocked && (
              <>
                <button
                  onClick={() => handleSaveAudit("DRAFT")}
                  disabled={saving}
                  className="bg-[#F8F6F0] hover:bg-[#E5DFD3] text-slate-800 border border-[#E5DFD3] px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition shadow-xs"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSaveAudit("RECONCILED")}
                  disabled={saving}
                  className="bg-[#194331] hover:bg-[#123325] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition shadow"
                >
                  Mark as Reconciled
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to permanently Lock & Approve this monthly audit?")) {
                      handleSaveAudit("LOCKED");
                    }
                  }}
                  disabled={saving}
                  className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition shadow flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#BF8B36]" />
                  Lock & Approve Audit
                </button>
              </>
            )}
            {isLocked && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-mono font-bold border border-slate-300">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  Audit Sealed & Locked
                </div>
                <button
                  onClick={() => {
                    if (confirm("Unlock this audit statement to allow edits and adjustments?")) {
                      handleSaveAudit("DRAFT");
                    }
                  }}
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold transition shadow flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Unlock for Editing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCOPE SELECTION (MASJID, YEAR, MONTH, DATE) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold font-mono text-slate-500 uppercase block mb-1">Masjid Scope</label>
              {isSuperAdmin ? (
                <select
                  value={selectedMasjidId}
                  onChange={(e) => setSelectedMasjidId(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#194331]"
                >
                  {masjids.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-[#194331] font-mono truncate">
                  {systemData?.masjidName || "Assigned Mosque Portal"}
                </div>
              )}
            </div>

            <div>
              <label className="font-bold font-mono text-slate-500 uppercase block mb-1">Financial Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#194331]"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>

            <div>
              <label className="font-bold font-mono text-slate-500 uppercase block mb-1">Audit Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#194331]"
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="September 2026">September 2026</option>
              </select>
            </div>

            <div>
              <label className="font-bold font-mono text-slate-500 uppercase block mb-1">Physical Audit Date</label>
              <input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                disabled={isLocked}
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#194331]"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOP AUDIT SUMMARY METRICS (SECTION 27) */}
        {/* ========================================================================= */}
        {comparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income Reconcile */}
            <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">1. Total Income</span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  comparison.incomeDiff === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {comparison.incomeDiff === 0 ? "✓ Matched" : `Diff: ₹${comparison.incomeDiff.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">System:</span>
                  <span className="font-mono font-bold text-slate-800">₹{Number(systemData?.income?.total).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Verified:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{comparison.verifiedTotalIncome.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Total Expenditure Reconcile */}
            <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">2. Total Expenditure</span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  comparison.expDiff === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {comparison.expDiff === 0 ? "✓ Matched" : `Diff: ₹${comparison.expDiff.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">System:</span>
                  <span className="font-mono font-bold text-slate-800">₹{Number(systemData?.expenditure?.total).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Verified:</span>
                  <span className="font-mono font-bold text-rose-700">₹{comparison.verifiedTotalExp.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Closing Balance Reconcile */}
            <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">3. Closing Balance</span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  comparison.closingDiff === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {comparison.closingDiff === 0 ? "✓ Matched" : `Diff: ₹${comparison.closingDiff.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">System:</span>
                  <span className="font-mono font-bold text-slate-800">₹{Number(systemData?.closingBalance).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Verified:</span>
                  <span className="font-mono font-bold text-[#BF8B36]">₹{comparison.verifiedClosing.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Cash & Bank Reconciliation Status */}
            <div className="bg-[#194331] text-white p-5 rounded-2xl shadow-md border border-[#113224]">
              <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase block">4. Audit Verdict</span>
              <p className="font-serif text-lg font-bold text-[#BF8B36] mt-1 flex items-center gap-1.5">
                {comparison.isFullyReconciled ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    100% Reconciled
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    Discrepancy Found
                  </>
                )}
              </p>
              <div className="mt-2 text-[10px] font-mono text-emerald-200 space-y-0.5">
                <p>Cash Difference: ₹{comparison.cashDiff.toLocaleString("en-IN")}</p>
                <p>Bank Difference: ₹{comparison.bankDiff.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 20: AUDIT OPENING BALANCE COMPARISON */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#194331]" />
              1. Opening Balance Audit (Carried from Previous Month)
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              Verified Total: ₹{comparison?.verifiedOpening.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[10px] font-mono text-slate-500 uppercase">
                  <th className="p-3 pl-4">Fund Head</th>
                  <th className="p-3">System Calculated</th>
                  <th className="p-3">Actual / Verified in Records</th>
                  <th className="p-3">Difference</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: "openGeneral", label: "General Fund", sys: systemData?.openingBalance?.generalFund },
                  { key: "openZakat", label: "Charity — Zakat", sys: systemData?.openingBalance?.zakat },
                  { key: "openSadaqah", label: "Charity — Sadaqah", sys: systemData?.openingBalance?.sadaqah },
                  { key: "openCharity", label: "Charity — General Charity", sys: systemData?.openingBalance?.generalCharity },
                  { key: "openInterest", label: "Interest Fund (Disposal)", sys: systemData?.openingBalance?.interestFund },
                ].map((item) => {
                  const sysVal = Number(item.sys) || 0;
                  const actVal = Number((actualValues as any)[item.key]) || 0;
                  const diff = actVal - sysVal;
                  return (
                    <tr key={item.key} className="hover:bg-slate-50">
                      <td className="p-3 pl-4 font-bold text-slate-800">{item.label}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">₹{sysVal.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={(actualValues as any)[item.key]}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          disabled={isLocked}
                          className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-3 py-1 text-xs font-mono font-bold outline-none focus:border-[#194331] w-36"
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold ${diff === 0 ? "text-slate-500" : diff > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString("en-IN")}` : "₹0"}
                      </td>
                      <td className="p-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          diff === 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {diff === 0 ? "Matched" : diff > 0 ? "Excess" : "Shortage"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Custom Other Opening Fund Option */}
                {(() => {
                  const sysVal = Number(actualValues.openOtherSys) || 0;
                  const actVal = Number(actualValues.openOther) || 0;
                  const diff = actVal - sysVal;
                  return (
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 pl-4">
                        <input
                          type="text"
                          value={actualValues.openOtherLabel}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, openOtherLabel: e.target.value }))}
                          disabled={isLocked}
                          placeholder="Specify other purpose..."
                          className="w-full max-w-[260px] bg-transparent border-b border-[#194331] text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:italic outline-none focus:border-[#194331] pb-1"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">₹{sysVal.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={actualValues.openOther}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, openOther: e.target.value }))}
                          disabled={isLocked}
                          placeholder="0"
                          className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-3 py-1 text-xs font-mono font-bold outline-none focus:border-[#194331] w-36"
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold ${diff === 0 ? "text-slate-500" : diff > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString("en-IN")}` : "₹0"}
                      </td>
                      <td className="p-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          diff === 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {diff === 0 ? "Matched" : diff > 0 ? "Excess" : "Shortage"}
                        </span>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 21: AUDIT INCOME COMPARISON TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              2. Income Streams Audit ({selectedMonth})
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700">
              Verified Inflow: ₹{comparison?.verifiedTotalIncome.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[10px] font-mono text-slate-500 uppercase">
                  <th className="p-3 pl-4">Income Category</th>
                  <th className="p-3">System Calculated</th>
                  <th className="p-3">Actual Verified in Records</th>
                  <th className="p-3">Difference</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: "rentIncome", label: "Rental Income (Properties & Tenants)", sys: systemData?.income?.rent },
                  { key: "otherIncome", label: "Income from Other Sources (Sponsorships)", sys: systemData?.income?.other },
                  { key: "donGeneral", label: "Public Donations — General Fund", sys: systemData?.income?.generalDonations },
                  { key: "donZakat", label: "Charity Collections — Zakat", sys: systemData?.income?.zakat },
                  { key: "donSadaqah", label: "Charity Collections — Sadaqah", sys: systemData?.income?.sadaqah },
                  { key: "donCharity", label: "Charity Collections — General Charity", sys: systemData?.income?.generalCharity },
                  { key: "donInterest", label: "Interest Fund Disposal", sys: systemData?.income?.interest },
                ].map((item) => {
                  const sysVal = Number(item.sys) || 0;
                  const actVal = Number((actualValues as any)[item.key]) || 0;
                  const diff = actVal - sysVal;
                  return (
                    <tr key={item.key} className="hover:bg-slate-50">
                      <td className="p-3 pl-4 font-bold text-slate-800">{item.label}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">₹{sysVal.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={(actualValues as any)[item.key]}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          disabled={isLocked}
                          className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-3 py-1 text-xs font-mono font-bold outline-none focus:border-emerald-600 w-36"
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold ${diff === 0 ? "text-slate-500" : diff > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString("en-IN")}` : "₹0"}
                      </td>
                      <td className="p-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          diff === 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {diff === 0 ? "Matched" : diff > 0 ? "Excess Inflow" : "Shortage"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Custom Other Income Stream Option */}
                {(() => {
                  const sysVal = Number(actualValues.incomeOtherCustomSys) || 0;
                  const actVal = Number(actualValues.incomeOtherCustom) || 0;
                  const diff = actVal - sysVal;
                  return (
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 pl-4">
                        <input
                          type="text"
                          value={actualValues.incomeOtherCustomLabel}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, incomeOtherCustomLabel: e.target.value }))}
                          disabled={isLocked}
                          placeholder="Specify other purpose..."
                          className="w-full max-w-[260px] bg-transparent border-b border-[#194331] text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:italic outline-none focus:border-[#194331] pb-1"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">₹{sysVal.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={actualValues.incomeOtherCustom}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, incomeOtherCustom: e.target.value }))}
                          disabled={isLocked}
                          placeholder="0"
                          className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-3 py-1 text-xs font-mono font-bold outline-none focus:border-emerald-600 w-36"
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold ${diff === 0 ? "text-slate-500" : diff > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString("en-IN")}` : "₹0"}
                      </td>
                      <td className="p-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          diff === 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {diff === 0 ? "Matched" : diff > 0 ? "Excess Inflow" : "Shortage"}
                        </span>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 22: AUDIT EXPENDITURE COMPARISON TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-700" />
              3. Expenditure Categories Audit ({selectedMonth})
            </h3>
            <span className="text-xs font-mono font-bold text-rose-700">
              Verified Outflow: ₹{comparison?.verifiedTotalExp.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[10px] font-mono text-slate-500 uppercase">
                  <th className="p-3 pl-4">Expenditure Category</th>
                  <th className="p-3">System Vouchers Total</th>
                  <th className="p-3">Actual Verified in Physical Bills</th>
                  <th className="p-3">Difference</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: "expGeneralAdmin", label: "1. General Administration (Salaries, Power, Water, Repairs)", sys: systemData?.expenditure?.generalAdmin },
                  { key: "expFestival", label: "2. Festival Expenses (Ramadan, Eid, Events)", sys: systemData?.expenditure?.festival },
                  { key: "expCharitable", label: "3. Charitable Expenses (Zakat & Needy Aid)", sys: systemData?.expenditure?.charitable },
                  { key: "expMisc", label: "4. Miscellaneous Expenses", sys: systemData?.expenditure?.misc },
                ].map((item) => {
                  const sysVal = Number(item.sys) || 0;
                  const actVal = Number((actualValues as any)[item.key]) || 0;
                  const diff = actVal - sysVal;
                  return (
                    <tr key={item.key} className="hover:bg-slate-50">
                      <td className="p-3 pl-4 font-bold text-slate-800">{item.label}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">₹{sysVal.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={(actualValues as any)[item.key]}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          disabled={isLocked}
                          className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-3 py-1 text-xs font-mono font-bold outline-none focus:border-rose-600 w-36"
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold ${diff === 0 ? "text-slate-500" : "text-rose-700"}`}>
                        {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString("en-IN")}` : "₹0"}
                      </td>
                      <td className="p-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          diff === 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {diff === 0 ? "Vouchers Matched" : "Discrepancy in Bills"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Custom Other Expenditure Category Option */}
                {(() => {
                  const sysVal = Number(actualValues.expOtherSys) || 0;
                  const actVal = Number(actualValues.expOther) || 0;
                  const diff = actVal - sysVal;
                  return (
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 pl-4">
                        <input
                          type="text"
                          value={actualValues.expOtherLabel}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, expOtherLabel: e.target.value }))}
                          disabled={isLocked}
                          placeholder="Specify other purpose..."
                          className="w-full max-w-[260px] bg-transparent border-b border-[#194331] text-xs font-medium text-slate-800 placeholder:text-slate-400 placeholder:italic outline-none focus:border-[#194331] pb-1"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">₹{sysVal.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={actualValues.expOther}
                          onChange={(e) => setActualValues((prev) => ({ ...prev, expOther: e.target.value }))}
                          disabled={isLocked}
                          placeholder="0"
                          className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-3 py-1 text-xs font-mono font-bold outline-none focus:border-rose-600 w-36"
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold ${diff === 0 ? "text-slate-500" : "text-rose-700"}`}>
                        {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : diff < 0 ? `-₹${Math.abs(diff).toLocaleString("en-IN")}` : "₹0"}
                      </td>
                      <td className="p-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          diff === 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {diff === 0 ? "Vouchers Matched" : "Discrepancy in Bills"}
                        </span>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 23: CASH & BANK RECONCILIATION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Cash Reconciliation */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
              <Coins className="w-5 h-5 text-amber-700" />
              Cash in Hand Physical Count
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-[#F8F6F0] p-3 rounded-xl">
                <span className="font-bold text-slate-600">System Cash Balance:</span>
                <span className="font-mono font-bold text-slate-900">₹{Number(systemData?.cashBalance).toLocaleString("en-IN")}</span>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Actual Physical Cash Counted in Safe (₹)</label>
                <input
                  type="number"
                  value={actualValues.actualCashCounted}
                  onChange={(e) => setActualValues((prev) => ({ ...prev, actualCashCounted: e.target.value }))}
                  disabled={isLocked}
                  className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-[#194331]"
                />
              </div>
              <div className={`p-3 rounded-xl font-mono font-bold flex justify-between ${
                comparison?.cashDiff === 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
              }`}>
                <span>Cash Difference:</span>
                <span>{comparison?.cashDiff === 0 ? "✓ ₹0 (Balanced)" : `₹${comparison?.cashDiff.toLocaleString("en-IN")}`}</span>
              </div>
            </div>
          </div>

          {/* Bank Accounts Reconciliation */}
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
              <CreditCard className="w-5 h-5 text-[#194331]" />
              Bank Accounts Statement Verification
            </h3>
            <div className="space-y-3 text-xs">
              {systemData?.bankAccounts?.map((acc: any) => {
                const actBankVal = actualValues.actualBankBalances[acc.id] ?? String(acc.currentBalance);
                const diff = Number(actBankVal) - Number(acc.currentBalance);
                return (
                  <div key={acc.id} className="border border-[#E5DFD3] p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900 block">{acc.bankName} (A/C: •••• {acc.accountNumberLast4})</span>
                        <span className="text-[10px] text-slate-400 font-mono">{acc.accountTitle}</span>
                      </div>
                      <span className="font-mono text-slate-600 text-xs">System: ₹{Number(acc.currentBalance).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Statement Balance"
                        value={actBankVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActualValues((prev) => ({
                            ...prev,
                            actualBankBalances: { ...prev.actualBankBalances, [acc.id]: val },
                          }));
                        }}
                        disabled={isLocked}
                        className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-lg px-3 py-1.5 text-xs font-mono font-bold outline-none focus:border-[#194331]"
                      />
                      <span className={`text-[11px] font-mono font-bold shrink-0 ${diff === 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {diff === 0 ? "✓ Matched" : `Diff: ₹${diff.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!systemData?.bankAccounts || systemData.bankAccounts.length === 0) && (
                <p className="text-slate-400 text-center py-4 italic">No bank accounts configured.</p>
              )}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* AUDITOR REMARKS & ADJUSTMENTS (SECTION 24) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#181E1A]">
              Auditor Remarks & Discrepancy Adjustments
            </h3>
            {!isLocked && (
              <button
                type="button"
                onClick={() => setShowAdjModal(true)}
                className="flex items-center gap-1.5 bg-[#194331] text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold hover:bg-[#123325] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                + Create Audited Adjustment
              </button>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Official Auditor Remarks / Audit Notes</label>
            <textarea
              placeholder="e.g. Physical cash counted in presence of Mutawalli. Electricity bill voucher verified against BESCOM portal..."
              value={actualValues.auditRemarks}
              onChange={(e) => setActualValues((prev) => ({ ...prev, auditRemarks: e.target.value }))}
              disabled={isLocked}
              className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl p-3.5 text-xs outline-none focus:border-[#194331] h-24"
            />
          </div>

          {adjustmentsList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#E5DFD3]">
              <span className="text-xs font-bold text-slate-700">Recorded Adjustments for this Audit:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adjustmentsList.map((adj, idx) => (
                  <div key={idx} className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-900">{adj.type}</span>
                      <span className="font-mono text-amber-800">₹{Number(adj.amount).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{adj.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CREATE ADJUSTMENT MODAL */}
        {/* ========================================================================= */}
        {showAdjModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-md w-full p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-slate-900">Create Audited Adjustment</h3>
              <p className="text-xs text-slate-500 font-mono">
                Log a verified financial adjustment without altering original transactions.
              </p>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Adjustment Type</label>
                  <select
                    value={adjForm.type}
                    onChange={(e) => setAdjForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    <option value="INCOME_ADJUSTMENT">Income Adjustment</option>
                    <option value="EXPENSE_ADJUSTMENT">Expense Adjustment</option>
                    <option value="CASH_ADJUSTMENT">Cash Count Adjustment</option>
                    <option value="BANK_ADJUSTMENT">Bank Statement Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Adjustment Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={adjForm.amount}
                    onChange={(e) => setAdjForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason / Justification</label>
                  <textarea
                    placeholder="Audit reason..."
                    value={adjForm.reason}
                    onChange={(e) => setAdjForm((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl p-3 text-xs outline-none h-20"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD3]">
                  <button
                    type="button"
                    onClick={() => setShowAdjModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!adjForm.amount || !adjForm.reason) return alert("Amount and reason required");
                      setAdjustmentsList((prev) => [...prev, adjForm]);
                      setAdjForm({ amount: "", type: "INCOME_ADJUSTMENT", reason: "", remarks: "" });
                      setShowAdjModal(false);
                    }}
                    className="bg-[#194331] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow"
                  >
                    Add Adjustment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL MANUAL AUDIT PRINTABLE STATEMENT MODAL (PROFESSIONAL PDF EXPORT) */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          
          {/* Scoped CSS for Clean Professional A4 PDF Printing */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Hide all web chrome, sidebars, interactive panels */
              header, nav, aside, footer, #admin-sidebar, [role="navigation"], .print\\:hidden, .print-hidden {
                display: none !important;
              }
              .print-modal-overlay {
                position: static !important;
                background: transparent !important;
                backdrop-filter: none !important;
                padding: 0 !important;
                margin: 0 !important;
                inset: auto !important;
                width: 100% !important;
                height: auto !important;
                display: block !important;
                overflow: visible !important;
              }
              .print-modal-content {
                position: static !important;
                max-width: 100% !important;
                width: 100% !important;
                max-height: none !important;
                overflow: visible !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
              }
              .print-sheet {
                border: 1.5px solid #194331 !important;
                border-radius: 8px !important;
                padding: 16px !important;
                background: #ffffff !important;
                width: 100% !important;
                box-shadow: none !important;
                margin: 0 auto !important;
              }
              .print-avoid-break {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          `}} />

          <div className="print-modal-content bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 space-y-6">
            
            {/* Top Interactive Controls (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  Official Audit Statement
                </span>
                <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isLocked ? "bg-slate-900 text-white" : "bg-amber-100 text-amber-900"
                }`}>
                  {actualValues.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-[#194331] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold hover:bg-[#123325] transition shadow"
                >
                  <Printer className="w-3.5 h-3.5 text-[#BF8B36]" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Professional Printable Document Body */}
            <div className="print-sheet space-y-6 text-[#181E1A] font-sans border border-[#E5DFD3] p-8 rounded-2xl bg-white">
              
              {/* Header with Mosque Logo & Scope */}
              <div className="print-avoid-break flex justify-between items-start border-b-2 border-[#194331] pb-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#194331] tracking-tight">MOSQUE PLATFORM</h2>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-slate-600 mt-0.5 font-bold">Physical Audit & Financial Reconciliation Statement</p>
                  <p className="text-xs text-slate-900 mt-2 font-mono">
                    Masjid: <strong>{masjids.find((m) => m.id === selectedMasjidId)?.name || "Central Mosque"}</strong> ({masjids.find((m) => m.id === selectedMasjidId)?.location || "Nagwara"})
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">Audit Period: {selectedMonth} (FY {selectedYear})</p>
                  <p className="text-[11px] text-slate-600 font-mono">Physical Verification Date: {auditDate}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-white text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase tracking-widest ${
                    isLocked ? "bg-slate-900" : "bg-[#194331]"
                  }`}>
                    {isLocked ? "SEALED & LOCKED AUDIT" : "VERIFIED AUDIT RECORD"}
                  </span>
                  <p className="text-[11px] font-mono text-slate-600 mt-2">
                    Printed on: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">Ref: AUDIT-{selectedYear.split("-")[0]}-{selectedMonth.slice(0, 3).toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}</p>
                </div>
              </div>

              {/* 4 Core Summary Metric Cards */}
              <div className="print-avoid-break grid grid-cols-4 gap-3 border border-[#E5DFD3] bg-[#F8F6F0]/40 p-4 rounded-xl text-center">
                <div className="border-r border-[#E5DFD3]/80 pr-2">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Verified Opening</span>
                  <span className="font-serif text-sm font-bold text-slate-900 mt-0.5 block">
                    ₹{(comparison?.verifiedOpening || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-r border-[#E5DFD3]/80 pr-2">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Verified Total Inflow</span>
                  <span className="font-serif text-sm font-bold text-emerald-800 mt-0.5 block">
                    +₹{(comparison?.verifiedTotalIncome || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-r border-[#E5DFD3]/80 pr-2">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Verified Total Outflow</span>
                  <span className="font-serif text-sm font-bold text-rose-800 mt-0.5 block">
                    -₹{(comparison?.verifiedTotalExp || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Closing Surplus</span>
                  <span className="font-serif text-sm font-bold text-[#BF8B36] mt-0.5 block">
                    ₹{(comparison?.verifiedClosing || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Detailed Reconciliation Tables */}
              <div className="space-y-4 text-xs">
                {/* 1. Opening Balance Table */}
                <div className="print-avoid-break border border-[#E5DFD3] rounded-xl overflow-hidden">
                  <div className="bg-[#E5DFD3]/40 px-4 py-2 font-bold font-mono text-[#194331] flex justify-between border-b border-[#E5DFD3]">
                    <span>1. Opening Balance Audit (Carried from Previous Month)</span>
                    <span>Verified: ₹{(comparison?.verifiedOpening || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-3.5 space-y-1.5 bg-white">
                    <div className="flex justify-between"><span>General Fund</span><span className="font-mono font-bold">₹{Number(actualValues.openGeneral || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Charity — Zakat</span><span className="font-mono font-bold">₹{Number(actualValues.openZakat || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Charity — Sadaqah</span><span className="font-mono font-bold">₹{Number(actualValues.openSadaqah || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Charity — General Charity</span><span className="font-mono font-bold">₹{Number(actualValues.openCharity || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Interest Fund (Disposal)</span><span className="font-mono font-bold">₹{Number(actualValues.openInterest || 0).toLocaleString("en-IN")}</span></div>
                    {Number(actualValues.openOther || 0) > 0 && (
                      <div className="flex justify-between text-amber-900 bg-amber-50/60 px-2 py-0.5 rounded">
                        <span>{actualValues.openOtherLabel || "Other Opening Fund"}</span>
                        <span className="font-mono font-bold">₹{Number(actualValues.openOther || 0).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5 text-slate-900">
                      <span>TOTAL OPENING BALANCE</span>
                      <span className="font-mono text-sm">₹{(comparison?.verifiedOpening || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Income Table */}
                <div className="print-avoid-break border border-[#E5DFD3] rounded-xl overflow-hidden">
                  <div className="bg-[#E5DFD3]/40 px-4 py-2 font-bold font-mono text-emerald-800 flex justify-between border-b border-[#E5DFD3]">
                    <span>2. Income Streams Audit ({selectedMonth})</span>
                    <span>Verified: +₹{(comparison?.verifiedTotalIncome || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-3.5 space-y-1.5 bg-white">
                    <div className="flex justify-between"><span>Rental Income (Properties & Tenants)</span><span className="font-mono font-bold">₹{Number(actualValues.rentIncome || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Income from Other Sources (Sponsorships)</span><span className="font-mono font-bold">₹{Number(actualValues.otherIncome || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Public Donations — General Fund</span><span className="font-mono font-bold">₹{Number(actualValues.donGeneral || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Charity Collections — Zakat</span><span className="font-mono font-bold">₹{Number(actualValues.donZakat || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Charity Collections — Sadaqah</span><span className="font-mono font-bold">₹{Number(actualValues.donSadaqah || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Charity Collections — General Charity</span><span className="font-mono font-bold">₹{Number(actualValues.donCharity || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Interest Fund Disposal</span><span className="font-mono font-bold">₹{Number(actualValues.donInterest || 0).toLocaleString("en-IN")}</span></div>
                    {Number(actualValues.incomeOtherCustom || 0) > 0 && (
                      <div className="flex justify-between text-emerald-900 bg-emerald-50/60 px-2 py-0.5 rounded">
                        <span>{actualValues.incomeOtherCustomLabel || "Other Income Stream"}</span>
                        <span className="font-mono font-bold">₹{Number(actualValues.incomeOtherCustom || 0).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5 text-emerald-900">
                      <span>TOTAL NEW MONTHLY INFLOW</span>
                      <span className="font-mono text-sm">+₹{(comparison?.verifiedTotalIncome || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Expenditure Table */}
                <div className="print-avoid-break border border-[#E5DFD3] rounded-xl overflow-hidden">
                  <div className="bg-[#E5DFD3]/40 px-4 py-2 font-bold font-mono text-rose-800 flex justify-between border-b border-[#E5DFD3]">
                    <span>3. Expenditure Categories Audit ({selectedMonth})</span>
                    <span>Verified: -₹{(comparison?.verifiedTotalExp || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-3.5 space-y-1.5 bg-white">
                    <div className="flex justify-between"><span>1. General Administration (Salaries, Power, Water, Repairs)</span><span className="font-mono font-bold">₹{Number(actualValues.expGeneralAdmin || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>2. Festival Expenses (Ramadan, Eid, Events)</span><span className="font-mono font-bold">₹{Number(actualValues.expFestival || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>3. Charitable Expenses (Zakat & Needy Aid)</span><span className="font-mono font-bold">₹{Number(actualValues.expCharitable || 0).toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>4. Miscellaneous Expenses</span><span className="font-mono font-bold">₹{Number(actualValues.expMisc || 0).toLocaleString("en-IN")}</span></div>
                    {Number(actualValues.expOther || 0) > 0 && (
                      <div className="flex justify-between text-rose-900 bg-rose-50/60 px-2 py-0.5 rounded">
                        <span>{actualValues.expOtherLabel || "5. Other Expenses"}</span>
                        <span className="font-mono font-bold">₹{Number(actualValues.expOther || 0).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5 text-rose-900">
                      <span>TOTAL EXPENDITURE OUTFLOW</span>
                      <span className="font-mono text-sm">-₹{(comparison?.verifiedTotalExp || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Cash & Bank Verification Summary */}
                <div className="print-avoid-break border border-[#E5DFD3] rounded-xl overflow-hidden">
                  <div className="bg-[#E5DFD3]/40 px-4 py-2 font-bold font-mono text-slate-800 flex justify-between border-b border-[#E5DFD3]">
                    <span>4. Cash & Bank Balances Physical Verification</span>
                    <span>Combined Balance: ₹{((comparison?.actCash || 0) + (comparison?.totalVerifiedBank || 0)).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-3.5 space-y-1.5 bg-white">
                    <div className="flex justify-between">
                      <span>Physical Cash in Hand Counted</span>
                      <span className="font-mono font-bold">₹{(comparison?.actCash || 0).toLocaleString("en-IN")} ({comparison?.cashDiff === 0 ? "Matched" : `Diff ₹${comparison?.cashDiff || 0}`})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bank Accounts Verified Statement Total</span>
                      <span className="font-mono font-bold">₹{(comparison?.totalVerifiedBank || 0).toLocaleString("en-IN")} ({comparison?.bankDiff === 0 ? "Matched" : `Diff ₹${comparison?.bankDiff || 0}`})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auditor Remarks */}
              {actualValues.auditRemarks && (
                <div className="print-avoid-break p-3.5 bg-[#F8F6F0]/40 border border-[#E5DFD3] rounded-xl text-xs space-y-1">
                  <span className="font-mono font-bold text-slate-600 uppercase tracking-widest text-[10px] block">Auditor Remarks & Notes</span>
                  <p className="text-slate-800 italic">"{actualValues.auditRemarks}"</p>
                </div>
              )}

              {/* Audit Signatory Seal */}
              <div className="print-avoid-break pt-4 border-t border-[#E5DFD3] flex justify-between items-end text-[10px] text-slate-600 font-mono">
                <div>
                  <p>Auditor Authority: <strong>Central Mosque Super Admin Audit Board</strong></p>
                  <p>Status: {isLocked ? "Permanently Sealed & Certified" : "Verified Electronic Record"}</p>
                </div>
                <div className="text-right border-t border-slate-400 pt-2 w-52">
                  <p className="text-slate-900 font-bold">Authorized Audit Signatory</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}
