"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLayout from "../../admin/layout";
import { 
  Landmark, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Receipt, 
  FileText, 
  Printer, 
  X,
  Plus,
  FolderTree,
  Coins,
  ShieldCheck,
  Building,
  DollarSign,
  Tag,
  AlertCircle,
  HelpCircle
} from "lucide-react";

// Types
type PaymentMode = "Cash" | "Cheque" | "DD" | "UPI" | "NEFT/RTGS";

interface InflowRecord {
  id: string;
  donorName: string;
  collectorName: string;
  fundType: "General Funds" | "Zakat" | "Sadaqah" | "Charity" | "Interest" | "Rental Income" | "Other Sources";
  subPurpose?: string;
  amount: number;
  modeOfPay: PaymentMode;
  receiptNo: string;
  date: string;
  time: string;
  masjidId: string | number;
  masjidName: string;
}

interface ExpenseRecord {
  id: string;
  mainCategory: "General Administration" | "Festival Expense" | "Charitable Expense" | "Miscellaneous Expense";
  subHead: string; // e.g. "Salary of Imam", "Electricity Bill", "Water Bill", "Masjid Maintenance"
  recipientName: string;
  amount: number;
  billOrReceiptNo: string;
  reasonOrDescription: string;
  modeOfPay: PaymentMode;
  date: string;
  time: string;
  masjidId: string | number;
  masjidName: string;
}

interface OpeningBalance {
  generalFunds: number;
  zakat: number;
  sadaqah: number;
  charity: number;
  interest: number;
}

interface MonthFolderData {
  monthKey: string; // e.g. "Aug 2026"
  prevMonthName: string; // e.g. "July 2026"
  fiscalYear: string; // "2026-2027"
  openingBalance: Record<string | number, OpeningBalance>; // masjidId -> OpeningBalance
}

const downloadCSV = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Initial Mock Masjids
const MASJIDS = [
  { id: 1, name: "Enam Masjid", location: "Nagwara, Bangalore" },
  { id: 2, name: "Jama Masjid", location: "Old Delhi" },
  { id: 3, name: "Masjid-e-Umer", location: "Mumbai" },
  { id: 4, name: "Al-Falah Mosque", location: "Hyderabad" },
];

// Initial Inflows Data (Image 1 & 2)
const INITIAL_INFLOWS: InflowRecord[] = [
  // Enam Masjid (Aug 2026)
  { id: "INF-101", donorName: "Mohammed Imran", collectorName: "Hafiz Zubair (Trustee)", fundType: "Zakat", subPurpose: "Annual Zakat Contribution", amount: 250000, modeOfPay: "UPI", receiptNo: "REC-2026-081", date: "18 Aug 2026", time: "05:42 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "INF-102", donorName: "Syed Zaid Khan", collectorName: "Hafiz Zubair (Trustee)", fundType: "General Funds", subPurpose: "Masjid Work & Maintenance", amount: 150000, modeOfPay: "NEFT/RTGS", receiptNo: "REC-2026-082", date: "18 Aug 2026", time: "02:15 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "INF-103", donorName: "Noor Complex Shop #4 (Tenant)", collectorName: "Farooq Ahmed (Manager)", fundType: "Rental Income", subPurpose: "Commercial Shop Monthly Rent - Aug", amount: 45000, modeOfPay: "Cheque", receiptNo: "RNT-2026-088", date: "05 Aug 2026", time: "11:30 AM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "INF-104", donorName: "Noor Complex Shop #5 (Tenant)", collectorName: "Farooq Ahmed (Manager)", fundType: "Rental Income", subPurpose: "Commercial Shop Monthly Rent - Aug", amount: 45000, modeOfPay: "NEFT/RTGS", receiptNo: "RNT-2026-089", date: "06 Aug 2026", time: "01:15 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "INF-105", donorName: "Anonymous Well-Wisher", collectorName: "Imam Sahab", fundType: "Other Sources", subPurpose: "Water Cooler & Purifier Sponsorship", amount: 35000, modeOfPay: "Cash", receiptNo: "OTH-2026-012", date: "12 Aug 2026", time: "08:20 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "INF-106", donorName: "Abdul Rahman", collectorName: "Hafiz Zubair (Trustee)", fundType: "Sadaqah", subPurpose: "Friday Sadaqah Collection", amount: 50000, modeOfPay: "Cash", receiptNo: "REC-2026-095", date: "14 Aug 2026", time: "02:00 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "INF-107", donorName: "Khurram Parvez", collectorName: "Central Office", fundType: "Interest", subPurpose: "Bank Account Interest (For Disposal)", amount: 20000, modeOfPay: "NEFT/RTGS", receiptNo: "INT-2026-041", date: "01 Aug 2026", time: "10:00 AM", masjidId: 1, masjidName: "Enam Masjid" },

  // Jama Masjid
  { id: "INF-201", donorName: "Delhi Heritage Trust", collectorName: "Secretary Sahab", fundType: "General Funds", subPurpose: "Courtyard Renovation Grant", amount: 500000, modeOfPay: "NEFT/RTGS", receiptNo: "JM-REC-011", date: "15 Aug 2026", time: "04:00 PM", masjidId: 2, masjidName: "Jama Masjid" },
  { id: "INF-202", donorName: "Waqf Board Commercial Market", collectorName: "Accounts Clerk", fundType: "Rental Income", subPurpose: "Market Shophouse Rents - Aug", amount: 220000, modeOfPay: "Cheque", receiptNo: "JM-RNT-004", date: "08 Aug 2026", time: "12:30 PM", masjidId: 2, masjidName: "Jama Masjid" },
];

// Initial Expenses Data (Image 4)
const INITIAL_EXPENSES: ExpenseRecord[] = [
  // Enam Masjid (Aug 2026)
  { id: "EXP-101", mainCategory: "General Administration", subHead: "Salary of Imam", recipientName: "Maulana Hafiz Tariq", amount: 35000, billOrReceiptNo: "VOUCH-SAL-01", reasonOrDescription: "Monthly Imam Honorarium / Salary - Aug 2026", modeOfPay: "NEFT/RTGS", date: "10 Aug 2026", time: "10:30 AM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "EXP-102", mainCategory: "General Administration", subHead: "Salary of Moazzin & Staff", recipientName: "Bilal Moazzin & 2 Cleaning Staff", amount: 45000, billOrReceiptNo: "VOUCH-SAL-02", reasonOrDescription: "Staff Salaries & Cleaners Honorarium", modeOfPay: "Cash", date: "10 Aug 2026", time: "11:00 AM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "EXP-103", mainCategory: "General Administration", subHead: "Electricity Bill", recipientName: "BESCOM Power Utility", amount: 14200, billOrReceiptNo: "BILL-EB-882109", reasonOrDescription: "Main Prayer Hall & Wudu Khana Electricity", modeOfPay: "UPI", date: "12 Aug 2026", time: "03:15 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "EXP-104", mainCategory: "General Administration", subHead: "Water Bill", recipientName: "BWSSB Water Board", amount: 4800, billOrReceiptNo: "BILL-WB-4410", reasonOrDescription: "Monthly Water Supply & Tanker", modeOfPay: "UPI", date: "13 Aug 2026", time: "02:45 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "EXP-105", mainCategory: "General Administration", subHead: "Masjid Maintenance / Repairs", recipientName: "Al-Noor Electricals & AC Service", amount: 18500, billOrReceiptNo: "INV-ALN-781", reasonOrDescription: "4 Central AC Unit Deep Servicing & Filter Replacement", modeOfPay: "Cheque", date: "15 Aug 2026", time: "04:30 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "EXP-106", mainCategory: "Festival Expense", subHead: "Independence Day & Community Gathering", recipientName: "Madrasa Sweets & Audio Setup", amount: 12000, billOrReceiptNo: "FEST-2026-08", reasonOrDescription: "15th August Student Program & Light Refreshments", modeOfPay: "Cash", date: "15 Aug 2026", time: "09:00 AM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "EXP-107", mainCategory: "Charitable Expense", subHead: "Zakat / Sadaqah Needy Aid", recipientName: "50 Poor & Orphan Families", amount: 65000, billOrReceiptNo: "AID-DIST-08", reasonOrDescription: "Direct Monthly Ration Kits & Medical Assistance", modeOfPay: "Cash", date: "16 Aug 2026", time: "05:00 PM", masjidId: 1, masjidName: "Enam Masjid" },
  { id: "EXP-108", mainCategory: "Miscellaneous Expense", subHead: "Admin Stationery & Cleaning Consumables", recipientName: "City Mart Wholesale", amount: 5500, billOrReceiptNo: "MISC-0912", reasonOrDescription: "Phenyl, Floor Cleaners, Wudu Mats & Register Books", modeOfPay: "Cash", date: "17 Aug 2026", time: "01:30 PM", masjidId: 1, masjidName: "Enam Masjid" },
];

// Month Folder Configs & Opening Balances (Image 1 & 3)
const MONTH_FOLDERS: MonthFolderData[] = [
  {
    monthKey: "Aug 2026",
    prevMonthName: "July 2026",
    fiscalYear: "2026-2027",
    openingBalance: {
      1: { generalFunds: 350000, zakat: 200000, sadaqah: 120000, charity: 80000, interest: 25000 },
      2: { generalFunds: 850000, zakat: 400000, sadaqah: 250000, charity: 150000, interest: 80000 },
      3: { generalFunds: 180000, zakat: 90000, sadaqah: 60000, charity: 40000, interest: 10000 },
      4: { generalFunds: 420000, zakat: 300000, sadaqah: 180000, charity: 100000, interest: 35000 },
    }
  },
  {
    monthKey: "Jul 2026",
    prevMonthName: "June 2026",
    fiscalYear: "2026-2027",
    openingBalance: {
      1: { generalFunds: 310000, zakat: 180000, sadaqah: 110000, charity: 70000, interest: 20000 },
      2: { generalFunds: 780000, zakat: 350000, sadaqah: 220000, charity: 130000, interest: 70000 },
      3: { generalFunds: 160000, zakat: 80000, sadaqah: 50000, charity: 35000, interest: 8000 },
      4: { generalFunds: 390000, zakat: 270000, sadaqah: 160000, charity: 90000, interest: 30000 },
    }
  }
];

export default function SuperAdminFinancePage() {
  const pathname = usePathname();
  const isMasjidAdminRoute = pathname?.startsWith("/masjid-admin");
  const basePath = isMasjidAdminRoute ? "/masjid-admin/finance" : "/super-admin/finance";

  // Navigation & Scope
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("2026-2027");
  const [selectedMonthKey, setSelectedMonthKey] = useState("Aug 2026");
  const [selectedMasjidId, setSelectedMasjidId] = useState<string | number | "ALL">("ALL");
  const [dynamicMasjids, setDynamicMasjids] = useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [assignedMasjidName, setAssignedMasjidName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"audit" | "inflow" | "expenses" | "masjids">("audit");
  const [inflowFundFilter, setInflowFundFilter] = useState<string>("ALL");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("ALL");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "General Administration": true,
    "Festival Expense": true,
    "Charitable Expense": true,
    "Miscellaneous Expense": true
  });

  // Auth & Role check to lock scope for Masjid Admin
  useEffect(() => {
    async function checkAuthScope() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          const superUser = meData.user?.role === "SUPER_ADMIN";
          setIsSuperAdmin(superUser);

          if (meData.user?.masjidName) {
            setAssignedMasjidName(meData.user.masjidName);
          }

          if (!superUser && meData.user?.masjidScope) {
            setSelectedMasjidId(meData.user.masjidScope);
          }
        }
      } catch (err) {
        console.error("Failed checking auth scope:", err);
      }
    }
    checkAuthScope();
  }, []);

  // Load all dynamic masjids and live donations from database
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [mRes, donRes, expRes] = await Promise.all([
          fetch("/api/super-admin/masjids"),
          fetch("/api/finance/donations"),
          fetch("/api/finance/expenditures"),
        ]);
        if (mRes.ok) {
          const data = await mRes.json();
          if (data.masjids && data.masjids.length > 0) {
            setDynamicMasjids(data.masjids);
          }
        }
        if (donRes.ok) {
          const donData = await donRes.json();
          if (donData.donations && donData.donations.length > 0) {
            const liveInflows: InflowRecord[] = donData.donations.map((d: any) => {
              let ft: InflowRecord["fundType"] = "General Funds";
              if (d.fundType === "ZAKAT") ft = "Zakat";
              else if (d.fundType === "SADAQAH") ft = "Sadaqah";
              else if (d.fundType === "GENERAL_CHARITY") ft = "Charity";
              else if (d.fundType === "INTEREST_FUND") ft = "Interest";

              const dt = new Date(d.donationDate);
              return {
                id: d.id,
                donorName: d.donorName || "Online Contributor",
                collectorName: d.createdBy || "Online Portal",
                fundType: ft,
                subPurpose: d.description || "Public Donation",
                amount: Number(d.amount),
                modeOfPay: d.paymentMethod === "NEFT_RTGS" ? "NEFT/RTGS" : d.paymentMethod === "CHEQUE" ? "Cheque" : d.paymentMethod === "UPI" ? "UPI" : "Cash",
                receiptNo: d.receiptNumber,
                date: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                time: dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                masjidId: d.masjidId,
                masjidName: d.masjid?.name || "Masjid",
              };
            });

            setInflowRecords((prev) => {
              const existingReceipts = new Set(prev.map(p => p.receiptNo));
              const fresh = liveInflows.filter(li => !existingReceipts.has(li.receiptNo));
              return [...fresh, ...prev];
            });
          }
        }

        if (expRes.ok) {
          const expData = await expRes.json();
          if (expData.expenditures && expData.expenditures.length > 0) {
            const liveExpenses: ExpenseRecord[] = expData.expenditures.map((e: any) => {
              let mainCat: ExpenseRecord["mainCategory"] = "General Administration";
              if (e.category === "FESTIVAL_EXPENSE") mainCat = "Festival Expense";
              else if (e.category === "CHARITABLE_EXPENSE") mainCat = "Charitable Expense";
              else if (e.category === "MISCELLANEOUS_EXPENSE") mainCat = "Miscellaneous Expense";

              const dt = new Date(e.expenseDate);
              return {
                id: e.id,
                mainCategory: mainCat,
                subHead: e.subcategory || "General",
                recipientName: e.payeeName || "Vendor / Staff",
                amount: Number(e.amount),
                billOrReceiptNo: e.billInvoiceNumber || `BILL-${e.id.slice(-4)}`,
                reasonOrDescription: e.description || "Approved expenditure",
                modeOfPay: e.paymentMethod === "NEFT_RTGS" ? "NEFT/RTGS" : e.paymentMethod === "CHEQUE" ? "Cheque" : e.paymentMethod === "UPI" ? "UPI" : "Cash",
                date: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                time: dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                masjidId: e.masjidId,
                masjidName: e.masjid?.name || "Masjid",
              };
            });

            setExpenseRecords((prev) => {
              const existingBills = new Set(prev.map(p => p.billOrReceiptNo));
              const fresh = liveExpenses.filter(le => !existingBills.has(le.billOrReceiptNo));
              return [...fresh, ...prev];
            });
          }
        }
      } catch (err) {
        console.error("Failed to load initial financial data:", err);
      }
    }
    loadInitialData();
  }, []);

  const effectiveMasjids = useMemo(() => {
    return dynamicMasjids.length > 0 ? dynamicMasjids : MASJIDS;
  }, [dynamicMasjids]);

  // Inflow & Expense Records State
  const [inflowRecords, setInflowRecords] = useState<InflowRecord[]>(INITIAL_INFLOWS);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals (Popups from user diagrams)
  const [showInflowModal, setShowInflowModal] = useState(false); // Image 2: "Other funds Popup"
  const [showExpenseModal, setShowExpenseModal] = useState(false); // Image 4: "Expenditure Popup"
  const [showStatementModal, setShowStatementModal] = useState(false); // Official Audit Statement

  // Inflow Modal Form State
  const [inflowForm, setInflowForm] = useState({
    donorName: "",
    collectorName: "",
    fundType: "Other Sources" as InflowRecord["fundType"],
    subPurpose: "",
    amount: "",
    modeOfPay: "Cash" as PaymentMode,
    receiptNo: `REC-${Date.now().toString().slice(-4)}`,
    masjidId: 1
  });

  // Expense Modal Form State
  const [expenseForm, setExpenseForm] = useState({
    mainCategory: "General Administration" as ExpenseRecord["mainCategory"],
    subHead: "Salary of Imam",
    recipientName: "",
    amount: "",
    billOrReceiptNo: `BILL-${Date.now().toString().slice(-4)}`,
    reasonOrDescription: "",
    modeOfPay: "Cash" as PaymentMode,
    masjidId: 1
  });
  const [customSubHead, setCustomSubHead] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customFundSource, setCustomFundSource] = useState("");

  // Active Month Data
  const currentMonthData = useMemo(() => {
    return MONTH_FOLDERS.find(m => m.monthKey === selectedMonthKey) || MONTH_FOLDERS[0];
  }, [selectedMonthKey]);

  // Sync tab and category from URL query parameters (e.g. from sidebar links)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const catParam = params.get("cat");
      if (tabParam === "audit" || tabParam === "inflow" || tabParam === "expenses" || tabParam === "masjids") {
        setActiveTab(tabParam);
      }
      if (catParam) {
        setExpenseCategoryFilter(catParam);
      }
    }
  }, []);

  // Filtered Records based on Masjid Scope & Fund Type
  const scopedInflows = useMemo(() => {
    return inflowRecords.filter(item => {
      const matchMasjid = selectedMasjidId === "ALL" || String(item.masjidId) === String(selectedMasjidId);
      const matchFund = inflowFundFilter === "ALL" || item.fundType === inflowFundFilter;
      const matchSearch = 
        item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.collectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subPurpose && item.subPurpose.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchMasjid && matchFund && matchSearch;
    });
  }, [inflowRecords, selectedMasjidId, inflowFundFilter, searchQuery]);

  const scopedExpenses = useMemo(() => {
    return expenseRecords.filter(item => {
      const matchMasjid = selectedMasjidId === "ALL" || String(item.masjidId) === String(selectedMasjidId);
      const matchCategory = expenseCategoryFilter === "ALL" || item.mainCategory === expenseCategoryFilter;
      const matchSearch = 
        item.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.billOrReceiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reasonOrDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMasjid && matchCategory && matchSearch;
    });
  }, [expenseRecords, selectedMasjidId, expenseCategoryFilter, searchQuery]);

  // =========================================================================
  // IMAGE 3: MANUAL AUDIT RECONCILIATION CALCULATIONS
  // =========================================================================
  const auditCalculation = useMemo(() => {
    // 1. Calculate Opening Balance (Total 1)
    let openGeneral = 0;
    let openZakat = 0;
    let openSadaqah = 0;
    let openCharity = 0;
    let openInterest = 0;

    if (selectedMasjidId === "ALL") {
      Object.values(currentMonthData.openingBalance).forEach(ob => {
        openGeneral += ob.generalFunds;
        openZakat += ob.zakat;
        openSadaqah += ob.sadaqah;
        openCharity += ob.charity;
        openInterest += ob.interest;
      });
    } else {
      const obMap = currentMonthData.openingBalance as Record<string, OpeningBalance>;
      const ob = obMap[String(selectedMasjidId)] || { generalFunds: 0, zakat: 0, sadaqah: 0, charity: 0, interest: 0 };
      openGeneral = ob.generalFunds;
      openZakat = ob.zakat;
      openSadaqah = ob.sadaqah;
      openCharity = ob.charity;
      openInterest = ob.interest;
    }

    const totalOpeningBalance = openGeneral + openZakat + openSadaqah + openCharity + openInterest; // Total 1

    // 2. Inflow Streams (Aug)
    const rawScopedInflows = inflowRecords.filter(i => selectedMasjidId === "ALL" || String(i.masjidId) === String(selectedMasjidId));
    
    // Income from Rents (Value from Rental-Aug file)
    const rentInflows = rawScopedInflows.filter(i => i.fundType === "Rental Income");
    const totalRentIncome = rentInflows.reduce((sum, i) => sum + i.amount, 0);

    // Income from Other Sources (Value from "Other funds-Aug" file)
    const otherInflows = rawScopedInflows.filter(i => i.fundType === "Other Sources");
    const totalOtherIncome = otherInflows.reduce((sum, i) => sum + i.amount, 0);

    // Donation Funds (General, Zakat, Sadaqah, Charity, Interest)
    const donGeneral = rawScopedInflows.filter(i => i.fundType === "General Funds").reduce((sum, i) => sum + i.amount, 0);
    const donZakat = rawScopedInflows.filter(i => i.fundType === "Zakat").reduce((sum, i) => sum + i.amount, 0);
    const donSadaqah = rawScopedInflows.filter(i => i.fundType === "Sadaqah").reduce((sum, i) => sum + i.amount, 0);
    const donCharity = rawScopedInflows.filter(i => i.fundType === "Charity").reduce((sum, i) => sum + i.amount, 0);
    const donInterest = rawScopedInflows.filter(i => i.fundType === "Interest").reduce((sum, i) => sum + i.amount, 0);
    const totalDonations = donGeneral + donZakat + donSadaqah + donCharity + donInterest;

    // Total 2 = New Inflows (Rent + Other + Donations)
    const totalNewInflow = totalRentIncome + totalOtherIncome + totalDonations; // Total 2

    // Total 3 = Total Available Funds = Total 1 (Opening Balance) + Total 2 (New Inflow)
    const totalAvailableFunds = totalOpeningBalance + totalNewInflow; // Total 3

    // 3. Outflow / Expenditures (Image 4)
    const rawScopedExpenses = expenseRecords.filter(e => selectedMasjidId === "ALL" || String(e.masjidId) === String(selectedMasjidId));
    const generalAdminExp = rawScopedExpenses.filter(e => e.mainCategory === "General Administration").reduce((sum, e) => sum + e.amount, 0);
    const festivalExp = rawScopedExpenses.filter(e => e.mainCategory === "Festival Expense").reduce((sum, e) => sum + e.amount, 0);
    const charitableExp = rawScopedExpenses.filter(e => e.mainCategory === "Charitable Expense").reduce((sum, e) => sum + e.amount, 0);
    const miscExp = rawScopedExpenses.filter(e => e.mainCategory === "Miscellaneous Expense").reduce((sum, e) => sum + e.amount, 0);

    const totalExpenditures = generalAdminExp + festivalExp + charitableExp + miscExp; // Total Exp

    // 4. Net Closing Balance = Total 3 - Total Exp
    const netClosingBalance = totalAvailableFunds - totalExpenditures;

    // Combined Available by Fund Head (Opening Balance + Current Inflow)
    const availableGeneral = openGeneral + totalRentIncome + totalOtherIncome + donGeneral;
    const availableZakat = openZakat + donZakat;
    const availableSadaqah = openSadaqah + donSadaqah;
    const availableCharity = openCharity + donCharity;
    const availableInterest = openInterest + donInterest;

    return {
      openGeneral,
      openZakat,
      openSadaqah,
      openCharity,
      openInterest,
      totalOpeningBalance, // Total 1
      rentInflows,
      totalRentIncome,
      otherInflows,
      totalOtherIncome,
      donGeneral,
      donZakat,
      donSadaqah,
      donCharity,
      donInterest,
      totalDonations,
      totalNewInflow, // Total 2
      totalAvailableFunds, // Total 3 = Total 1 + Total 2
      availableGeneral,
      availableZakat,
      availableSadaqah,
      availableCharity,
      availableInterest,
      generalAdminExp,
      festivalExp,
      charitableExp,
      miscExp,
      totalExpenditures,
      netClosingBalance
    };
  }, [inflowRecords, expenseRecords, selectedMasjidId, currentMonthData]);

  // Handlers for adding Inflows (Image 2)
  const handleSaveInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inflowForm.amount || Number(inflowForm.amount) <= 0) return alert("Please enter a valid amount");

    const finalFundType = (inflowForm.fundType as string) === "Other (Specify Custom Fund Source)"
      ? (customFundSource.trim() || "Other Sources")
      : inflowForm.fundType;

    const targetMasjid = MASJIDS.find(m => m.id === Number(inflowForm.masjidId)) || MASJIDS[0];
    const newRecord: InflowRecord = {
      id: `INF-${Date.now().toString().slice(-4)}`,
      donorName: inflowForm.donorName || "Anonymous Donor",
      collectorName: inflowForm.collectorName || "Central Office",
      fundType: finalFundType as any,
      subPurpose: inflowForm.subPurpose || "Regular Collection",
      amount: Number(inflowForm.amount),
      modeOfPay: inflowForm.modeOfPay,
      receiptNo: inflowForm.receiptNo || `REC-${Date.now().toString().slice(-4)}`,
      date: "20 Aug 2026",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      masjidId: targetMasjid.id,
      masjidName: targetMasjid.name
    };

    setInflowRecords(prev => [newRecord, ...prev]);
    setShowInflowModal(false);
    setCustomFundSource("");
    setInflowForm({
      donorName: "",
      collectorName: "",
      fundType: "Other Sources",
      subPurpose: "",
      amount: "",
      modeOfPay: "Cash",
      receiptNo: `REC-${Date.now().toString().slice(-4)}`,
      masjidId: 1
    });
  };

  // Handlers for adding Expenses (Image 4)
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) return alert("Please enter a valid expense amount");
    
    const voucherNo = (expenseForm.billOrReceiptNo || "").trim();
    if (!voucherNo) return alert("Bill / Voucher Number is compulsory.");

    const isDuplicate = expenseRecords.some(
      (exp) => exp.billOrReceiptNo.toLowerCase() === voucherNo.toLowerCase()
    );
    if (isDuplicate) {
      return alert(`Bill/Voucher number "${voucherNo}" already exists! Each expenditure voucher number must be unique.`);
    }

    const targetMasjid = MASJIDS.find(m => m.id === Number(expenseForm.masjidId)) || MASJIDS[0];
    const finalSubHead = expenseForm.subHead === "Other (Specify Custom Reason)"
      ? (customSubHead.trim() || "Other Admin Upkeep")
      : expenseForm.subHead;

    const finalMainCat = (expenseForm.mainCategory as string) === "Other (Specify Custom Category)"
      ? (customCategory.trim() || "Miscellaneous Expense")
      : expenseForm.mainCategory;

    const newExpense: ExpenseRecord = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      mainCategory: finalMainCat as any,
      subHead: finalSubHead,
      recipientName: expenseForm.recipientName || "Vendor / Staff",
      amount: Number(expenseForm.amount),
      billOrReceiptNo: expenseForm.billOrReceiptNo,
      reasonOrDescription: expenseForm.reasonOrDescription || "Approved mosque expenditure",
      modeOfPay: expenseForm.modeOfPay,
      date: "20 Aug 2026",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      masjidId: targetMasjid.id,
      masjidName: targetMasjid.name
    };

    setExpenseRecords(prev => [newExpense, ...prev]);
    setShowExpenseModal(false);
    setCustomSubHead("");
    setCustomCategory("");
    setExpenseForm({
      mainCategory: "General Administration",
      subHead: "Salary of Imam",
      recipientName: "",
      amount: "",
      billOrReceiptNo: `BILL-${Date.now().toString().slice(-4)}`,
      reasonOrDescription: "",
      modeOfPay: "Cash",
      masjidId: 1
    });
  };

  // CSV Export
  const handleExportAuditCSV = () => {
    const calc = auditCalculation;
    const scopeName = selectedMasjidId === "ALL" ? "All Masjids (Global Network)" : MASJIDS.find(m => m.id === selectedMasjidId)?.name;
    let csv = `MOSQUE PLATFORM - MONTHLY FINANCIAL AUDIT RECONCILIATION STATEMENT\n`;
    csv += `Fiscal Year,${selectedFiscalYear}\n`;
    csv += `Statement Month,${selectedMonthKey}\n`;
    csv += `Masjid Scope,${scopeName}\n`;
    csv += `Audit Date,${new Date().toLocaleDateString()}\n\n`;

    csv += `1. OPENING BALANCE (Carried from ${currentMonthData.prevMonthName})\n`;
    csv += `General Funds,Rs. ${calc.openGeneral}\n`;
    csv += `Charity - Zakat,Rs. ${calc.openZakat}\n`;
    csv += `Charity - Sadaqah,Rs. ${calc.openSadaqah}\n`;
    csv += `Charity - General,Rs. ${calc.openCharity}\n`;
    csv += `Interest Funds,Rs. ${calc.openInterest}\n`;
    csv += `TOTAL OPENING BALANCE (Total 1),Rs. ${calc.totalOpeningBalance}\n\n`;

    csv += `2. INCOME FROM RENTS (Rental-${selectedMonthKey.split(" ")[0]})\n`;
    calc.rentInflows.forEach(r => {
      csv += `"${r.subPurpose}","${r.donorName}",Rs. ${r.amount},${r.modeOfPay},${r.receiptNo}\n`;
    });
    csv += `TOTAL RENTAL INCOME,Rs. ${calc.totalRentIncome}\n\n`;

    csv += `3. INCOME FROM OTHER SOURCES (Other funds-${selectedMonthKey.split(" ")[0]})\n`;
    calc.otherInflows.forEach(o => {
      csv += `"${o.subPurpose}","${o.donorName}","Collector: ${o.collectorName}",Rs. ${o.amount},${o.modeOfPay},${o.receiptNo}\n`;
    });
    csv += `TOTAL OTHER SOURCES INCOME,Rs. ${calc.totalOtherIncome}\n\n`;

    csv += `4. PUBLIC DONATION FUNDS (${selectedMonthKey})\n`;
    csv += `General Funds,Rs. ${calc.donGeneral}\n`;
    csv += `Zakat Collections,Rs. ${calc.donZakat}\n`;
    csv += `Sadaqah Collections,Rs. ${calc.donSadaqah}\n`;
    csv += `Charity Collections,Rs. ${calc.donCharity}\n`;
    csv += `Interest Donations,Rs. ${calc.donInterest}\n`;
    csv += `TOTAL NEW DONATIONS,Rs. ${calc.totalDonations}\n\n`;

    csv += `SUMMARY METRICS\n`;
    csv += `TOTAL NEW INFLOW (Total 2),Rs. ${calc.totalNewInflow}\n`;
    csv += `TOTAL AVAILABLE FUNDS (Total 3 = Total 1 + Total 2),Rs. ${calc.totalAvailableFunds}\n\n`;

    csv += `5. EXPENDITURE SUMMARY (${selectedMonthKey})\n`;
    csv += `General Administration (Salaries/Bills/Repairs),Rs. ${calc.generalAdminExp}\n`;
    csv += `Festival Expenses (Events/Programs),Rs. ${calc.festivalExp}\n`;
    csv += `Charitable Disbursements (Needy Aid/Rations),Rs. ${calc.charitableExp}\n`;
    csv += `Miscellaneous Expenses,Rs. ${calc.miscExp}\n`;
    csv += `TOTAL EXPENDITURE,Rs. ${calc.totalExpenditures}\n\n`;

    csv += `FINAL CLOSING BALANCE (Carried Forward to Next Month),Rs. ${calc.netClosingBalance}\n`;

    downloadCSV(`Mosque_Audit_Statement_${selectedMonthKey.replace(/\s+/g, "_")}.csv`, csv);
  };

  const selectedMasjidName = selectedMasjidId === "ALL" ? "All Masjids (Global Network)" : effectiveMasjids.find((m: any) => String(m.id) === String(selectedMasjidId))?.name;

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* ========================================================================= */}
        {/* TOP COMMAND BAR & FOLDER HIERARCHY NAVIGATION (Image 1) */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
              <FolderTree className="w-8 h-8 text-[#BF8B36]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">Financial Ledger & Audit Folders</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  FY {selectedFiscalYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Month-by-month accounting, rental ledgers, other funds popups, and expenditure vouchers.
              </p>
            </div>
          </div>

          {/* Action Popups Trigger Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowInflowModal(true)}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono shadow transition"
              title="Record Rental Income, Sponsorships, or Other Funds"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              + Other Funds / Rental (Popup)
            </button>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono shadow transition"
              title="Record Salary, Utility Bill, Festival or Charity Disbursement"
            >
              <Plus className="w-4 h-4 text-rose-200" />
              + Expenditure (Popup)
            </button>

            <button
              onClick={() => setShowStatementModal(true)}
              className="flex items-center gap-2 bg-[#194331] text-white px-4 py-2.5 rounded-xl text-xs font-bold font-mono shadow hover:bg-[#123325] transition"
            >
              <Printer className="w-4 h-4 text-[#BF8B36]" />
              Print Audit Statement
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPACT SUB-NAVIGATION: 1. INFLOW LEDGER, 2. EXPENDITURE, 3. MANUAL AUDIT */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Inflow & Collection Ledger */}
          <Link
            href={`${basePath}/inflow`}
            className="group bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-3.5 rounded-2xl border border-emerald-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-800/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ArrowDownRight className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-wider block leading-none">
                  Inflow Sub-Module
                </span>
                <h3 className="font-serif text-sm font-bold text-white truncate mt-0.5">1. Inflow & Collection Ledger</h3>
                <p className="text-[10px] text-emerald-200/90 font-mono truncate mt-0.5">
                  Rent collections, donations, zakat & other income
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-300 shrink-0 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          {/* Card 2: Expenditure Management */}
          <Link
            href={`${basePath}/expenditures`}
            className="group bg-gradient-to-r from-rose-950 to-rose-900 text-white p-3.5 rounded-2xl border border-rose-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-800/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5 text-rose-200" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold text-rose-300 uppercase tracking-wider block leading-none">
                  Outflow Sub-Module
                </span>
                <h3 className="font-serif text-sm font-bold text-white truncate mt-0.5">2. Expenditure Management</h3>
                <p className="text-[10px] text-rose-200/90 font-mono truncate mt-0.5">
                  Staff salary, bills, festival & charity vouchers
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-rose-300 shrink-0 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          {/* Card 3: Manual Audit & Reconciliation */}
          <Link
            href={`${basePath}/manual-audit`}
            className="group bg-gradient-to-r from-[#194331] to-[#123325] text-white p-3.5 rounded-2xl border border-[#113224] shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#113224] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-[#BF8B36]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold text-[#BF8B36] uppercase tracking-wider block leading-none">
                  Auditor Sub-Module
                </span>
                <h3 className="font-serif text-sm font-bold text-white truncate mt-0.5">3. Manual Audit & Reconciliation</h3>
                <p className="text-[10px] text-emerald-200/90 font-mono truncate mt-0.5">
                  Reconcile system vs physical cash & bank statements
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#BF8B36] shrink-0 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* FOLDER LEVEL SELECTION: FISCAL YEAR -> MONTHS -> MASJID SCOPE (Image 1) */}
        {/* ========================================================================= */}
        <div className="bg-[#F8F6F0] border border-[#E5DFD3] p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-[#E5DFD3] px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Fiscal Year:</span>
              <select
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                className="text-xs font-bold font-mono text-slate-800 outline-none bg-transparent cursor-pointer"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase mr-1">Month Folder:</span>
              {MONTH_FOLDERS.map((m) => (
                <button
                  key={m.monthKey}
                  onClick={() => setSelectedMonthKey(m.monthKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    selectedMonthKey === m.monthKey
                      ? "bg-[#194331] text-white shadow-sm"
                      : "bg-white border border-[#E5DFD3] text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  📁 {m.monthKey}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">Masjid Scope:</span>
            {isSuperAdmin ? (
              <select
                value={selectedMasjidId}
                onChange={(e) => setSelectedMasjidId(e.target.value)}
                className="bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#194331] cursor-pointer shadow-sm min-w-[200px]"
              >
                <option value="ALL">🏛️ All Masjids (Global)</option>
                {effectiveMasjids.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.location ? m.location.split(",")[0] : "India"})</option>
                ))}
              </select>
            ) : (
              <div className="bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#194331] font-mono shadow-sm">
                🕌 {effectiveMasjids.find(m => String(m.id) === String(selectedMasjidId))?.name || assignedMasjidName || "Enam Masjid"}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3 CORE AUDIT SUMMARY PILLARS (Calculated from Image 3 formula) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total 1: Opening Balance */}
          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-sm">
            <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">
              1. Opening Balance (Total 1)
            </p>
            <p className="font-serif text-2xl font-bold text-[#181E1A]">
              ₹{auditCalculation.totalOpeningBalance.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5">
              Carried from {currentMonthData.prevMonthName}
            </p>
          </div>

          {/* Total 2: New Inflow */}
          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-sm">
            <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">
              2. Month Inflow (Total 2)
            </p>
            <p className="font-serif text-2xl font-bold text-emerald-700">
              +₹{auditCalculation.totalNewInflow.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5">
              Rents + Other Funds + Donations
            </p>
          </div>

          {/* Total Exp: Expenditures */}
          <div className="bg-white border border-[#E5DFD3] p-5 rounded-2xl shadow-sm">
            <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">
              3. Month Outflow (Total Exp)
            </p>
            <p className="font-serif text-2xl font-bold text-rose-700">
              -₹{auditCalculation.totalExpenditures.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5">
              Admin + Salaries + Aid + Bills
            </p>
          </div>

          {/* Net Closing Balance: Total 3 - Total Exp */}
          <div className="bg-[#194331] text-white p-5 rounded-2xl shadow-md border border-[#113224]">
            <p className="text-[9px] font-bold font-mono text-emerald-300 uppercase tracking-widest mb-1">
              4. Closing Balance (Surplus)
            </p>
            <p className="font-serif text-2xl font-bold text-[#BF8B36]">
              ₹{auditCalculation.netClosingBalance.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-emerald-200 font-mono mt-1.5">
              (Total 1 + Total 2) − Total Exp
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NAVIGATION TABS FOR DETAILED AUDIT VIEWS */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-1 gap-4 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "audit"
                  ? "bg-[#194331] text-white shadow-sm"
                  : "bg-white border border-[#E5DFD3] text-slate-600 hover:bg-[#F8F6F0]"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#BF8B36]" />
              Manual Audit & Reconciliation Statement (Image 3)
            </button>

            <button
              onClick={() => setActiveTab("inflow")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "inflow"
                  ? "bg-[#194331] text-white shadow-sm"
                  : "bg-white border border-[#E5DFD3] text-slate-600 hover:bg-[#F8F6F0]"
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              Inflow & Collections Ledger ({scopedInflows.length})
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "expenses"
                  ? "bg-[#194331] text-white shadow-sm"
                  : "bg-white border border-[#E5DFD3] text-slate-600 hover:bg-[#F8F6F0]"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              Expenditure & Vouchers Ledger ({scopedExpenses.length})
            </button>

            <button
              onClick={() => setActiveTab("masjids")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "masjids"
                  ? "bg-[#194331] text-white shadow-sm"
                  : "bg-white border border-[#E5DFD3] text-slate-600 hover:bg-[#F8F6F0]"
              }`}
            >
              <Building2 className="w-4 h-4 text-[#BF8B36]" />
              All Masjids Breakdown
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EXACT IMPLEMENTATION OF IMAGE 3 (MANUAL AUDIT RECONCILIATION) */}
        {/* ========================================================================= */}
        {activeTab === "audit" && (
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Audit Format Reference: 33/51
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#181E1A] mt-2">
                  Monthly Financial Reconciliation & Audit Statement
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Scope: <strong className="text-[#194331]">{selectedMasjidName}</strong> • Month: <strong>{selectedMonthKey}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStatementModal(true)}
                  className="flex items-center gap-2 bg-[#194331] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow hover:bg-[#123325] transition"
                >
                  <Printer className="w-3.5 h-3.5 text-[#BF8B36]" />
                  Print Statement (PDF)
                </button>
                <button
                  onClick={handleExportAuditCSV}
                  className="flex items-center gap-2 bg-[#F8F6F0] border border-[#E5DFD3] text-slate-800 px-4 py-2 rounded-xl text-xs font-mono font-bold hover:bg-[#E5DFD3]/60 transition"
                >
                  <Download className="w-3.5 h-3.5 text-[#194331]" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* STAGE 1: OPENING BALANCE (Image 3: Point 1) */}
            <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-inner">
              <div className="bg-[#F8F6F0] px-5 py-3 border-b border-[#E5DFD3] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#194331] text-white flex items-center justify-center font-mono font-bold text-xs">1</span>
                  <h4 className="font-serif font-bold text-sm text-[#181E1A]">
                    Opening Balance (Value from {currentMonthData.prevMonthName} Balance)
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">Total 1</span>
              </div>
              <div className="p-5 space-y-2 text-xs bg-white">
                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                  <span className="text-slate-600 pl-4">↳ General Funds</span>
                  <span className="font-mono font-bold text-slate-900">₹{auditCalculation.openGeneral.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                  <span className="text-slate-600 pl-4">↳ Charity Funds &rarr; Zakat</span>
                  <span className="font-mono font-bold text-slate-900">₹{auditCalculation.openZakat.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                  <span className="text-slate-600 pl-4">↳ Charity Funds &rarr; Sadaqah</span>
                  <span className="font-mono font-bold text-slate-900">₹{auditCalculation.openSadaqah.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                  <span className="text-slate-600 pl-4">↳ Charity Funds &rarr; General Charity</span>
                  <span className="font-mono font-bold text-slate-900">₹{auditCalculation.openCharity.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                  <span className="text-slate-600 pl-4">↳ Interest Funds</span>
                  <span className="font-mono font-bold text-slate-900">₹{auditCalculation.openInterest.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-sm bg-slate-50/60 p-3 rounded-xl text-[#194331]">
                  <span>SUBTOTAL 1 (OPENING BALANCE):</span>
                  <span className="font-mono text-base">₹{auditCalculation.totalOpeningBalance.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* STAGE 2: INCOMES (Image 3: Points 2, 3, 4) */}
            <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-inner">
              <div className="bg-[#F8F6F0] px-5 py-3 border-b border-[#E5DFD3] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-mono font-bold text-xs">2</span>
                  <h4 className="font-serif font-bold text-sm text-[#181E1A]">
                    Current Month Inflows & Revenues ({selectedMonthKey})
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">Total 2</span>
              </div>
              <div className="p-5 space-y-6 text-xs bg-white">
                
                {/* 2. Income from Rents */}
                <div>
                  <div className="flex justify-between items-center font-bold text-[#181E1A] border-b border-slate-200 pb-1.5">
                    <span>2. Income from Rents (Value from Rental-{selectedMonthKey.split(" ")[0]} file)</span>
                    <span className="font-mono text-emerald-700 text-sm">₹{auditCalculation.totalRentIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pl-4 pt-2 space-y-1.5 text-slate-600">
                    {auditCalculation.rentInflows.map(r => (
                      <div key={r.id} className="flex justify-between items-center text-[11px]">
                        <span>• {r.donorName} ({r.subPurpose}) - Receipt: {r.receiptNo}</span>
                        <span className="font-mono font-medium text-slate-800">₹{r.amount.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    {auditCalculation.rentInflows.length === 0 && (
                      <p className="text-slate-400 italic text-[11px]">No rental records logged for this scope.</p>
                    )}
                  </div>
                </div>

                {/* 3. Income from Other Sources */}
                <div>
                  <div className="flex justify-between items-center font-bold text-[#181E1A] border-b border-slate-200 pb-1.5">
                    <span>3. Income from Other Sources (Value from &apos;Other funds-{selectedMonthKey.split(" ")[0]}&apos;)</span>
                    <span className="font-mono text-emerald-700 text-sm">₹{auditCalculation.totalOtherIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pl-4 pt-2 space-y-1.5 text-slate-600">
                    {auditCalculation.otherInflows.map((o, idx) => (
                      <div key={o.id} className="flex justify-between items-center text-[11px]">
                        <span>{idx + 1}) {o.subPurpose} (Donor: {o.donorName} | Collector: {o.collectorName}) - Ref: {o.receiptNo}</span>
                        <span className="font-mono font-medium text-slate-800">₹{o.amount.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    {auditCalculation.otherInflows.length === 0 && (
                      <p className="text-slate-400 italic text-[11px]">No other funds logged for this month.</p>
                    )}
                  </div>
                </div>

                {/* 4. Public Donation Funds */}
                <div>
                  <div className="flex justify-between items-center font-bold text-[#181E1A] border-b border-slate-200 pb-1.5">
                    <span>4. Donation Funds ({selectedMonthKey} Collections)</span>
                    <span className="font-mono text-emerald-700 text-sm">₹{auditCalculation.totalDonations.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pl-4 pt-2 space-y-1 text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>↳ General Funds Collections</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.donGeneral.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Charity Funds &rarr; Zakat</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.donZakat.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Charity Funds &rarr; Sadaqah</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.donSadaqah.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Charity Funds &rarr; General Charity</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.donCharity.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Interest Funds (For Welfare)</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.donInterest.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Total Cumulative Available Funds Breakdown (Last Month Balance + Current Month Inflows) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center font-bold text-[#181E1A] border-b border-slate-200 pb-1.5">
                    <span>5. Total Available Funds (Last Month Remaining Balance + Current Month Collections)</span>
                    <span className="font-mono text-emerald-700 text-sm">₹{auditCalculation.totalAvailableFunds.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pl-4 pt-1 space-y-1 text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>↳ General Funds</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.availableGeneral.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Charity Funds &rarr; Zakat</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.availableZakat.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Charity Funds &rarr; Sadaqah</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.availableSadaqah.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Charity Funds &rarr; General Charity</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.availableCharity.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>↳ Interest Funds (For Welfare)</span>
                      <span className="font-mono text-slate-800">₹{auditCalculation.availableInterest.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Final Total Available Funds Banner matching Image 2 */}
                  <div className="flex justify-between items-center font-bold text-base bg-emerald-900 text-white p-5 rounded-2xl shadow-lg border-2 border-emerald-500/40 mt-3">
                    <div>
                      <span className="block text-xs uppercase font-mono text-emerald-300">TOTAL AVAILABLE FUNDS (TOTAL 3 = TOTAL 1 + TOTAL 2)</span>
                      <span className="text-sm font-normal text-slate-200">Gross liquid funds available for all operational & charitable distributions</span>
                    </div>
                    <span className="font-mono text-2xl text-[#BF8B36] font-bold">
                      ₹{auditCalculation.totalAvailableFunds.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* STAGE 3: EXPENDITURES (Image 4) - INTERACTIVE ACCORDION WITH BILL NUMBERS & WHERE MONEY WAS USED */}
            <div className="border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-inner">
              <div className="bg-[#F8F6F0] px-5 py-3.5 border-b border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center font-mono font-bold text-xs">3</span>
                  <h4 className="font-serif font-bold text-sm text-[#181E1A]">
                    Monthly Expenditures & Bill Vouchers ({selectedMonthKey})
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500">
                    Click any category to view individual bills & where funds were used
                  </span>
                  <button
                    onClick={() => {
                      const allOpen = Object.values(expandedCategories).every(Boolean);
                      setExpandedCategories({
                        "General Administration": !allOpen,
                        "Festival Expense": !allOpen,
                        "Charitable Expense": !allOpen,
                        "Miscellaneous Expense": !allOpen
                      });
                    }}
                    className="text-[10px] font-mono font-bold text-[#194331] bg-white border border-[#E5DFD3] px-2.5 py-1 rounded-lg hover:bg-slate-50"
                  >
                    {Object.values(expandedCategories).every(Boolean) ? "Collapse All" : "Expand All"}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs bg-white">
                {[
                  {
                    key: "General Administration",
                    num: "1.",
                    title: "General Administration",
                    subtitle: "Staff & Imam Salaries, Electricity Bills, Water Bills, Repairs",
                    amount: auditCalculation.generalAdminExp,
                  },
                  {
                    key: "Festival Expense",
                    num: "2.",
                    title: "Festival Expenses",
                    subtitle: "Ramadan, Eid, Milad & Community Programs",
                    amount: auditCalculation.festivalExp,
                  },
                  {
                    key: "Charitable Expense",
                    num: "3.",
                    title: "Charitable Expenses",
                    subtitle: "Direct Zakat distribution, Food ration kits & Medical aid",
                    amount: auditCalculation.charitableExp,
                  },
                  {
                    key: "Miscellaneous Expense",
                    num: "4.",
                    title: "Miscellaneous Expenses",
                    subtitle: "Stationery, cleaning consumables, municipal charges",
                    amount: auditCalculation.miscExp,
                  },
                ].map((cat) => {
                  const isOpen = !!expandedCategories[cat.key];
                  const categoryRecords = expenseRecords.filter(
                    (e) => (selectedMasjidId === "ALL" || String(e.masjidId) === String(selectedMasjidId)) && e.mainCategory === cat.key
                  );

                  return (
                    <div key={cat.key} className="border border-[#E5DFD3] rounded-xl overflow-hidden transition-all duration-200">
                      {/* Accordion Category Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.key]: !isOpen }))}
                        className={`w-full flex items-center justify-between p-4 text-left transition ${
                          isOpen ? "bg-[#F8F6F0]/80 border-b border-[#E5DFD3]" : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#194331] text-xs w-4">{cat.num}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{cat.title}</span>
                              <span className="bg-rose-50 text-rose-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                {categoryRecords.length} {categoryRecords.length === 1 ? "Bill logged" : "Bills logged"}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{cat.subtitle}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-rose-700">
                            -₹{cat.amount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-slate-400 font-mono text-xs">
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {/* Expanded Bill Vouchers & Where Money Was Used */}
                      {isOpen && (
                        <div className="p-3.5 bg-slate-50/50 space-y-2 animate-in slide-in-from-top-1">
                          {categoryRecords.length > 0 ? (
                            <div className="space-y-2">
                              {categoryRecords.map((exp) => (
                                <div
                                  key={exp.id}
                                  className="bg-white p-3.5 rounded-xl border border-[#E5DFD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-300 transition"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="bg-[#194331] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                                        Bill #{exp.billOrReceiptNo}
                                      </span>
                                      <span className="font-bold text-slate-900 text-xs">
                                        Paid to: {exp.recipientName}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ({exp.masjidName})
                                      </span>
                                    </div>

                                    {/* Where Money was used */}
                                    <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5 pt-0.5">
                                      <span className="text-slate-400 font-mono font-bold">Purpose:</span>
                                      <span className="text-slate-800">{exp.subHead}</span>
                                      {exp.reasonOrDescription && (
                                        <span className="text-slate-500 italic">({exp.reasonOrDescription})</span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                                      <span>Date: {exp.date} at {exp.time}</span>
                                      <span>•</span>
                                      <span>Mode: <strong className="text-slate-600 font-bold">{exp.modeOfPay}</strong></span>
                                    </div>
                                  </div>

                                  <div className="text-right sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-mono block">Amount Spent</span>
                                    <span className="font-mono font-bold text-rose-700 text-sm">
                                      -₹{exp.amount.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-slate-400 text-[11px] italic bg-white rounded-xl border border-dashed border-[#E5DFD3]">
                              No bills logged for this category in {selectedMonthKey}.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Total Expenditure */}
                <div className="flex justify-between items-center pt-2 font-bold text-sm bg-rose-50/70 p-4 rounded-xl text-rose-900 border border-rose-100">
                  <span>TOTAL EXPENDITURE (TOTAL EXP):</span>
                  <span className="font-mono text-base">-₹{auditCalculation.totalExpenditures.toLocaleString("en-IN")}</span>
                </div>

                {/* FINAL CLOSING SURPLUS */}
                <div className="flex justify-between items-center font-bold text-base bg-emerald-900 text-white p-5 rounded-2xl shadow-lg border-2 border-emerald-500/40">
                  <div>
                    <span className="block text-xs uppercase font-mono text-emerald-300">Final Closing Balance</span>
                    <span className="text-sm font-normal text-slate-200">Carried Forward to Next Month&apos;s Opening Reserves</span>
                  </div>
                  <span className="font-mono text-2xl text-[#BF8B36] font-bold">
                    ₹{auditCalculation.netClosingBalance.toLocaleString("en-IN")}
                  </span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INFLOW & COLLECTIONS LEDGER (Image 1 & 2) */}
        {/* ========================================================================= */}
        {activeTab === "inflow" && (
          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F6F0]/60">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search donor, collector, receipt no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-[#E5DFD3] rounded-xl px-4 py-2 text-xs outline-none focus:border-[#BF8B36] w-64 shadow-xs"
                  />
                </div>

                {/* Particular Funds Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Fund Type:</span>
                  <select
                    value={inflowFundFilter}
                    onChange={(e) => setInflowFundFilter(e.target.value)}
                    className="bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#194331] shadow-xs cursor-pointer min-w-[190px]"
                  >
                    <option value="ALL">🪙 All Funds & Sources</option>
                    <option value="General Funds">🟢 General Funds</option>
                    <option value="Zakat">🟣 Zakat</option>
                    <option value="Sadaqah">🔵 Sadaqah</option>
                    <option value="Charity">🟠 General Charity</option>
                    <option value="Rental Income">🏢 Rental Income</option>
                    <option value="Other Sources">📦 Other Sources / Sponsorships</option>
                    <option value="Interest">🔴 Interest (Disposal)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowInflowModal(true)}
                className="flex items-center gap-1.5 bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow hover:bg-emerald-800 transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                + Record Other Funds / Rental
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F6F0] text-slate-500 font-mono uppercase tracking-wider border-b border-[#E5DFD3]">
                    <th className="p-3.5 pl-6">Date & Time</th>
                    <th className="p-3.5">Name of Fundor / Donor</th>
                    <th className="p-3.5">Name of Collector</th>
                    <th className="p-3.5">Fund Type & Purpose</th>
                    <th className="p-3.5">Mode of Pay</th>
                    <th className="p-3.5 font-mono">Receipt No</th>
                    <th className="p-3.5 pr-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedInflows.map((inf) => (
                    <tr key={inf.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{inf.date}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{inf.time}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-[#194331]">
                        {inf.donorName}
                        <span className="block text-[10px] text-slate-400 font-normal">{inf.masjidName}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {inf.collectorName}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase">
                          {inf.fundType}
                        </span>
                        {inf.subPurpose && (
                          <span className="block text-[11px] text-slate-500 mt-0.5">{inf.subPurpose}</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">{inf.modeOfPay}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {inf.receiptNo}
                      </td>
                      <td className="p-3.5 pr-6 text-right font-mono font-bold text-emerald-700 text-sm">
                        +₹{inf.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {scopedInflows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No inflow records logged for this criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXPENDITURE & VOUCHERS LEDGER (Image 4) */}
        {/* ========================================================================= */}
        {activeTab === "expenses" && (
          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E5DFD3] flex flex-col gap-4 bg-[#F8F6F0]/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recipient, head, bill no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-[#E5DFD3] rounded-xl px-4 py-2 text-xs outline-none focus:border-[#BF8B36] w-72"
                  />
                </div>

                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="flex items-center gap-1.5 bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow hover:bg-rose-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  + Record Expenditure
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#E5DFD3]/60">
                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase mr-1">Category Filter:</span>
                {[
                  { label: "All Expenditures", value: "ALL" },
                  { label: "1. General Administration", value: "General Administration" },
                  { label: "2. Festival Expenses", value: "Festival Expense" },
                  { label: "3. Charitable Disbursements", value: "Charitable Expense" },
                  { label: "4. Miscellaneous Expenses", value: "Miscellaneous Expense" },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setExpenseCategoryFilter(cat.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      expenseCategoryFilter === cat.value
                        ? "bg-rose-700 text-white shadow-xs"
                        : "bg-white border border-[#E5DFD3] text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F6F0] text-slate-500 font-mono uppercase tracking-wider border-b border-[#E5DFD3]">
                    <th className="p-3.5 pl-6">Date & Time</th>
                    <th className="p-3.5">Paid To / Recipient</th>
                    <th className="p-3.5">Main Category</th>
                    <th className="p-3.5">Specific Head / Reason</th>
                    <th className="p-3.5 font-mono">Bill / Voucher No</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5 pr-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{exp.date}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{exp.time}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {exp.recipientName}
                        <span className="block text-[10px] text-slate-400 font-normal">{exp.masjidName}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                          {exp.mainCategory}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <span className="font-bold text-[#181E1A] block">{exp.subHead}</span>
                        <span className="text-[11px] text-slate-500 italic">{exp.reasonOrDescription}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        {exp.billOrReceiptNo}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">{exp.modeOfPay}</span>
                      </td>
                      <td className="p-3.5 pr-6 text-right font-mono font-bold text-rose-700 text-sm">
                        -₹{exp.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {scopedExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No expense records logged for this criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ALL MASJIDS BREAKDOWN DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === "masjids" && (
          <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F6F0] border-b border-[#E5DFD3] text-[10px] uppercase tracking-widest font-mono text-slate-500">
                    <th className="p-4 pl-6 font-bold">Masjid & Location</th>
                    <th className="p-4 font-bold">Opening Balance (Total 1)</th>
                    <th className="p-4 font-bold">Month Inflows (Total 2)</th>
                    <th className="p-4 font-bold">Total Expenditures</th>
                    <th className="p-4 font-bold">Net Closing Balance</th>
                    <th className="p-4 pr-6 font-bold text-right">Quick Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {MASJIDS.map(m => {
                    const ob = currentMonthData.openingBalance[m.id] || { generalFunds: 0, zakat: 0, sadaqah: 0, charity: 0, interest: 0 };
                    const openTot = ob.generalFunds + ob.zakat + ob.sadaqah + ob.charity + ob.interest;
                    const mInflows = inflowRecords.filter(i => i.masjidId === m.id).reduce((s, i) => s + i.amount, 0);
                    const mExpenses = expenseRecords.filter(e => e.masjidId === m.id).reduce((s, e) => s + e.amount, 0);
                    const closing = (openTot + mInflows) - mExpenses;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-sm text-[#181E1A]">{m.name}</p>
                          <p className="text-slate-500 font-mono">{m.location}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">
                          ₹{openTot.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-700">
                          +₹{mInflows.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 font-mono font-bold text-rose-700">
                          -₹{mExpenses.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4">
                          <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${closing >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                            ₹{closing.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => {
                              setSelectedMasjidId(m.id);
                              setActiveTab("audit");
                            }}
                            className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-[#194331] text-white px-3 py-1.5 rounded-lg hover:bg-[#123325] transition"
                          >
                            Inspect Audit Statement
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: OTHER FUNDS / RENTAL INFLOW POPUP (Image 2) */}
        {/* ========================================================================= */}
        {showInflowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                    Inflow Entry Form (Image 2)
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-1">Other Funds & Rental Popup</h3>
                </div>
                <button onClick={() => setShowInflowModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveInflow} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Masjid Account</label>
                  {isSuperAdmin ? (
                    <select
                      value={inflowForm.masjidId}
                      onChange={(e) => setInflowForm(prev => ({ ...prev, masjidId: e.target.value as any }))}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      {effectiveMasjids.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.location ? m.location.split(",")[0] : "India"})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#194331] font-mono">
                      🕌 {effectiveMasjids.find(m => String(m.id) === String(inflowForm.masjidId || selectedMasjidId))?.name || assignedMasjidName || "Enam Masjid"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Name of Fundor / Donor</label>
                    <input
                      type="text"
                      placeholder="e.g. Brother Imran"
                      value={inflowForm.donorName}
                      onChange={(e) => setInflowForm(prev => ({ ...prev, donorName: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Name of Collector</label>
                    <input
                      type="text"
                      placeholder="e.g. Hafiz Zubair"
                      value={inflowForm.collectorName}
                      onChange={(e) => setInflowForm(prev => ({ ...prev, collectorName: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fund Type</label>
                    <select
                      value={inflowForm.fundType}
                      onChange={(e) => setInflowForm(prev => ({ ...prev, fundType: e.target.value as any }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                    >
                      <option value="Other Sources">Other Sources</option>
                      <option value="Rental Income">Rental Income (Rental-Aug)</option>
                      <option value="General Funds">General Funds</option>
                      <option value="Zakat">Zakat Collection</option>
                      <option value="Sadaqah">Sadaqah Funds</option>
                      <option value="Charity">General Charity</option>
                      <option value="Interest">Interest Funds</option>
                      <option value="Other (Specify Custom Fund Source)">Other (Specify Custom Fund Source)</option>
                    </select>
                    {(inflowForm.fundType as string) === "Other (Specify Custom Fund Source)" && (
                      <input
                        type="text"
                        placeholder="Type custom fund source..."
                        value={customFundSource}
                        onChange={(e) => setCustomFundSource(e.target.value)}
                        className="w-full bg-[#F8F6F0] border border-[#BF8B36] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#BF8B36]/20 font-medium text-slate-800 mt-2"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="₹0"
                      min={1}
                      value={inflowForm.amount}
                      onChange={(e) => setInflowForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-[#BF8B36]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Specific Purpose / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop #4 Monthly Rental / Water Cooler Sponsorship"
                    value={inflowForm.subPurpose}
                    onChange={(e) => setInflowForm(prev => ({ ...prev, subPurpose: e.target.value }))}
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                  />
                </div>

                {/* Mode of Pay & Receipt No (Image 2) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Mode of Pay</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["Cash", "Cheque", "DD", "UPI", "NEFT/RTGS"] as PaymentMode[]).map((mode) => (
                      <label
                        key={mode}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition ${
                          inflowForm.modeOfPay === mode
                            ? "bg-[#194331] text-white border-[#194331]"
                            : "bg-[#F8F6F0] text-slate-700 border-[#E5DFD3]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="modeOfPay"
                          checked={inflowForm.modeOfPay === mode}
                          onChange={() => setInflowForm(prev => ({ ...prev, modeOfPay: mode }))}
                          className="hidden"
                        />
                        {mode}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Receipt No</label>
                  <input
                    type="text"
                    placeholder="REC-XXXX"
                    value={inflowForm.receiptNo}
                    onChange={(e) => setInflowForm(prev => ({ ...prev, receiptNo: e.target.value }))}
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#BF8B36]"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-[#E5DFD3] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInflowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#194331] hover:bg-[#123325] text-white px-5 py-2 rounded-xl text-xs font-mono font-bold shadow"
                  >
                    Save Inflow Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: EXPENDITURE POPUP (Image 4) */}
        {/* ========================================================================= */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] font-bold font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">
                    Expenditure Entry Form (Image 4)
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-1">Expenditure & Voucher Popup</h3>
                </div>
                <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Masjid Account</label>
                  {isSuperAdmin ? (
                    <select
                      value={expenseForm.masjidId}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, masjidId: e.target.value as any }))}
                      className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      {effectiveMasjids.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.location ? m.location.split(",")[0] : "India"})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#194331] font-mono">
                      🕌 {effectiveMasjids.find(m => String(m.id) === String(expenseForm.masjidId || selectedMasjidId))?.name || assignedMasjidName || "Enam Masjid"}
                    </div>
                  )}
                </div>

                {/* Main Category Dropdown (Image 4) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Main Category</label>
                    <select
                      value={expenseForm.mainCategory}
                      onChange={(e) => {
                        const cat = e.target.value as ExpenseRecord["mainCategory"];
                        let defaultSub = "Salary of Imam";
                        if (cat === "Festival Expense") defaultSub = "Ramadan / Eid Program";
                        if (cat === "Charitable Expense") defaultSub = "Zakat / Sadaqah Needy Aid";
                        if (cat === "Miscellaneous Expense") defaultSub = "Stationery & Cleaning";
                        setExpenseForm(prev => ({ ...prev, mainCategory: cat, subHead: defaultSub }));
                      }}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                    >
                      <option value="General Administration">1. General Administration</option>
                      <option value="Festival Expense">2. Festival Expense</option>
                      <option value="Charitable Expense">3. Charitable Expense</option>
                      <option value="Miscellaneous Expense">4. Miscellaneous Expense</option>
                      <option value="Other (Specify Custom Category)">5. Other (Specify Custom Category)</option>
                    </select>
                    {(expenseForm.mainCategory as string) === "Other (Specify Custom Category)" && (
                      <input
                        type="text"
                        placeholder="Type custom category..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full bg-[#F8F6F0] border border-[#BF8B36] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#BF8B36]/20 font-medium text-slate-800 mt-2"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sub-Head (Expense Head)</label>
                    {expenseForm.mainCategory === "General Administration" ? (
                      <div className="space-y-2">
                        <select
                          value={expenseForm.subHead}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, subHead: e.target.value }))}
                          className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                        >
                          <option value="Salary of Imam">Salary of Imam</option>
                          <option value="Salary of Moazzin & Staff">Salary of Moazzin & Staff</option>
                          <option value="Electricity Bill">Electricity Bill</option>
                          <option value="Water Bill">Water Bill</option>
                          <option value="Masjid Maintenance / Repairs">Masjid Maintenance / Repairs</option>
                          <option value="Other Admin Upkeep">Other Admin Upkeep</option>
                          <option value="Other (Specify Custom Reason)">Other (Specify Custom Reason)</option>
                        </select>
                        {expenseForm.subHead === "Other (Specify Custom Reason)" && (
                          <input
                            type="text"
                            placeholder="Type specific expense reason..."
                            value={customSubHead}
                            onChange={(e) => setCustomSubHead(e.target.value)}
                            className="w-full bg-[#F8F6F0] border border-[#BF8B36] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#BF8B36]/20 font-medium text-slate-800"
                            required
                          />
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Ramadan Iftar / Food Kits"
                        value={expenseForm.subHead}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, subHead: e.target.value }))}
                        className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Paid To / Recipient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Maulana Hafiz / Vendor"
                      value={expenseForm.recipientName}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="₹0"
                      min={1}
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-[#BF8B36]"
                      required
                    />
                  </div>
                </div>

                {/* Reason & Bill No. (Compulsory per Image 4) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bill / Voucher Number (Compulsory)</label>
                    <input
                      type="text"
                      placeholder="BILL-XXXX / REC-XXXX"
                      value={expenseForm.billOrReceiptNo}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, billOrReceiptNo: e.target.value }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#BF8B36]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Payment Mode</label>
                    <select
                      value={expenseForm.modeOfPay}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, modeOfPay: e.target.value as any }))}
                      className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="UPI">UPI</option>
                      <option value="NEFT/RTGS">NEFT/RTGS (Bank)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason / Purpose Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 AC Units Gas Refill & Servicing with Bill"
                    value={expenseForm.reasonOrDescription}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, reasonOrDescription: e.target.value }))}
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#BF8B36]"
                  />
                </div>

                <div className="pt-4 border-t border-[#E5DFD3] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-700 hover:bg-rose-800 text-white px-5 py-2 rounded-xl text-xs font-mono font-bold shadow"
                  >
                    Save Expenditure Voucher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OFFICIAL AUDIT STATEMENT PRINT MODAL (Image 3) */}
        {/* ========================================================================= */}
        {showStatementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 space-y-6">
              
              {/* Top Controls */}
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4 print:hidden">
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Audit Statement (Image 3 Format)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-[#194331] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold hover:bg-[#123325] transition shadow"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#BF8B36]" />
                    Print / Save PDF
                  </button>
                  <button
                    onClick={handleExportAuditCSV}
                    className="flex items-center gap-1.5 bg-[#F8F6F0] border border-[#E5DFD3] text-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono font-bold hover:bg-[#E5DFD3]/60 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-[#194331]" />
                    Download CSV
                  </button>
                  <button
                    onClick={() => setShowStatementModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="space-y-6 text-[#181E1A] font-sans border border-[#E5DFD3] p-8 rounded-2xl bg-[#F8F6F0]/30">
                {/* Header with Mosque Logo */}
                <div className="flex justify-between items-start border-b-2 border-[#194331] pb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#194331] tracking-tight">MOSQUE PLATFORM</h2>
                    <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-0.5">Centralized Financial Governance & Audit Ledger</p>
                    <p className="text-xs text-slate-700 mt-2 font-mono">
                      Masjid Scope: <strong>{selectedMasjidName}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">Statement Period: {selectedMonthKey} (FY {selectedFiscalYear})</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-[#194331] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase tracking-widest">
                      SEALED AUDIT
                    </span>
                    <p className="text-[11px] font-mono text-slate-500 mt-2">
                      Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">Ref: AUD-33/51-{Math.floor(1000 + Math.random() * 9000)}</p>
                  </div>
                </div>

                {/* 4 Core Summary Cards */}
                <div className="grid grid-cols-4 gap-3 border border-[#E5DFD3] bg-white p-4 rounded-xl text-center">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Opening Balance</span>
                    <span className="font-serif text-sm font-bold text-slate-900">
                      ₹{auditCalculation.totalOpeningBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">New Inflows</span>
                    <span className="font-serif text-sm font-bold text-emerald-800">
                      +₹{auditCalculation.totalNewInflow.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Expenditures</span>
                    <span className="font-serif text-sm font-bold text-rose-800">
                      -₹{auditCalculation.totalExpenditures.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Closing Surplus</span>
                    <span className="font-serif text-sm font-bold text-[#BF8B36]">
                      ₹{auditCalculation.netClosingBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Statement Tables */}
                <div className="space-y-4 text-xs">
                  <div className="border border-[#E5DFD3] rounded-xl overflow-hidden">
                    <div className="bg-[#E5DFD3]/40 px-4 py-2 font-bold font-mono text-[#194331]">
                      1. Opening Balance Breakdown (From {currentMonthData.prevMonthName})
                    </div>
                    <div className="p-4 space-y-1 bg-white">
                      <div className="flex justify-between"><span>General Funds</span><span className="font-mono">₹{auditCalculation.openGeneral.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Charity (Zakat, Sadaqah, Charity)</span><span className="font-mono">₹{(auditCalculation.openZakat + auditCalculation.openSadaqah + auditCalculation.openCharity).toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Interest Funds</span><span className="font-mono">₹{auditCalculation.openInterest.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between font-bold border-t pt-1 text-slate-900"><span>TOTAL 1 (OPENING BALANCE)</span><span className="font-mono">₹{auditCalculation.totalOpeningBalance.toLocaleString("en-IN")}</span></div>
                    </div>
                  </div>

                  <div className="border border-[#E5DFD3] rounded-xl overflow-hidden">
                    <div className="bg-[#E5DFD3]/40 px-4 py-2 font-bold font-mono text-emerald-800">
                      2. Inflow Streams & Combined Cumulative Funds
                    </div>
                    <div className="p-4 space-y-2 bg-white">
                      <div className="flex justify-between"><span>2. Income from Rents (Rental-{selectedMonthKey.split(" ")[0]})</span><span className="font-mono">₹{auditCalculation.totalRentIncome.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>3. Income from Other Sources (Other funds-{selectedMonthKey.split(" ")[0]})</span><span className="font-mono">₹{auditCalculation.totalOtherIncome.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>4. Public Donation Funds ({selectedMonthKey})</span><span className="font-mono">₹{auditCalculation.totalDonations.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between font-bold border-t pt-1 text-emerald-900"><span>TOTAL 2 (CURRENT MONTH NEW INFLOWS)</span><span className="font-mono">+₹{auditCalculation.totalNewInflow.toLocaleString("en-IN")}</span></div>
                      
                      {/* Section 5 In Modal */}
                      <div className="border-t border-dashed border-emerald-300 pt-2 mt-2">
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>↳ Remaining Balance from Last Month ({currentMonthData.prevMonthName} Total 1):</span>
                          <span className="font-mono">₹{auditCalculation.totalOpeningBalance.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>↳ Total Collected Inflows of Current Month ({selectedMonthKey} Total 2):</span>
                          <span className="font-mono">+₹{auditCalculation.totalNewInflow.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between font-bold bg-[#194331] text-white p-2.5 rounded-lg mt-1">
                          <span className="text-emerald-100 font-serif">5. TOTAL CUMULATIVE AVAILABLE FUNDS (TOTAL 3 = TOTAL 1 + TOTAL 2)</span>
                          <span className="font-mono text-[#BF8B36] text-sm">₹{auditCalculation.totalAvailableFunds.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#E5DFD3] rounded-xl overflow-hidden">
                    <div className="bg-[#E5DFD3]/40 px-4 py-2 font-bold font-mono text-rose-800">
                      3. Expenditures & Outflow ({selectedMonthKey})
                    </div>
                    <div className="p-4 space-y-1 bg-white">
                      <div className="flex justify-between"><span>General Administration (Salaries, Electricity, Water, Maintenance)</span><span className="font-mono">₹{auditCalculation.generalAdminExp.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Festival Expenses (Ramadan, Eid, Programs)</span><span className="font-mono">₹{auditCalculation.festivalExp.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Charitable Disbursements (Direct Aid & Food Kits)</span><span className="font-mono">₹{auditCalculation.charitableExp.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Miscellaneous Expenses</span><span className="font-mono">₹{auditCalculation.miscExp.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between font-bold border-t pt-1 text-rose-900"><span>TOTAL EXPENDITURE</span><span className="font-mono">-₹{auditCalculation.totalExpenditures.toLocaleString("en-IN")}</span></div>
                    </div>
                  </div>
                </div>

                {/* Audit Signatory Seal */}
                <div className="pt-6 border-t border-[#E5DFD3] flex justify-between items-end text-[10px] text-slate-500 font-mono">
                  <div>
                    <p>Verified by: <strong>Central Masjid Super Admin Audit Board</strong></p>
                    <p>Status: Reconciled & Approved Electronic Record</p>
                  </div>
                  <div className="text-right border-t border-slate-400 pt-2 w-48">
                    <p className="text-slate-800 font-bold">Authorized Signatory</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
