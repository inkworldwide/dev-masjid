--
-- PostgreSQL database dump
--

\restrict CJQohnBo789GNapuZZcKCOG2WpyCxAjU0Uvx9OGYorQDCQDnNVhrNNW2xNoqPa2

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdCategory" AS ENUM (
    'HAJJ_UMRAH',
    'ISLAMIC_BOOKS',
    'MOSQUE_SUPPLIES',
    'HALAL_FOOD',
    'ISLAMIC_CLOTHING',
    'MADRASA_SUPPLIES',
    'COMMUNITY_SPONSOR'
);


ALTER TYPE public."AdCategory" OWNER TO postgres;

--
-- Name: AdFormat; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdFormat" AS ENUM (
    'FULL_WIDTH',
    'HALF_WIDTH',
    'QUAD_GRID'
);


ALTER TYPE public."AdFormat" OWNER TO postgres;

--
-- Name: AdPlacement; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdPlacement" AS ENUM (
    'HOME_ONLY',
    'INNER_ONLY',
    'BOTH',
    'PROPERTIES_ONLY',
    'PROPERTY_DETAIL_ONLY'
);


ALTER TYPE public."AdPlacement" OWNER TO postgres;

--
-- Name: AdStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public."AdStatus" OWNER TO postgres;

--
-- Name: AnnouncementCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AnnouncementCategory" AS ENUM (
    'GENERAL',
    'COMMUNITY',
    'PRAYER',
    'CHARITY',
    'IMPORTANT_NOTICE',
    'MAINTENANCE',
    'EMERGENCY'
);


ALTER TYPE public."AnnouncementCategory" OWNER TO postgres;

--
-- Name: AuditReconciliationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditReconciliationStatus" AS ENUM (
    'DRAFT',
    'IN_REVIEW',
    'RECONCILED',
    'DIFFERENCE_FOUND',
    'APPROVED',
    'LOCKED'
);


ALTER TYPE public."AuditReconciliationStatus" OWNER TO postgres;

--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."DocumentStatus" OWNER TO postgres;

--
-- Name: DocumentVisibility; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentVisibility" AS ENUM (
    'PUBLIC',
    'PRIVATE'
);


ALTER TYPE public."DocumentVisibility" OWNER TO postgres;

--
-- Name: DonationCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DonationCategory" AS ENUM (
    'GENERAL_FUND',
    'CONSTRUCTION',
    'MAINTENANCE',
    'EDUCATION',
    'ZAKAT',
    'CHARITY',
    'COMMUNITY_WELFARE',
    'EMERGENCY'
);


ALTER TYPE public."DonationCategory" OWNER TO postgres;

--
-- Name: EventCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EventCategory" AS ENUM (
    'LECTURE',
    'QURANIC_CIRCLE',
    'COMMUNITY_GATHERING',
    'YOUTH_PROGRAM',
    'MADRASA_EVENT',
    'CHARITY_DRIVE'
);


ALTER TYPE public."EventCategory" OWNER TO postgres;

--
-- Name: ExpenseCategoryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseCategoryType" AS ENUM (
    'GENERAL_ADMINISTRATION',
    'FESTIVAL_EXPENSE',
    'CHARITABLE_EXPENSE',
    'MISCELLANEOUS_EXPENSE'
);


ALTER TYPE public."ExpenseCategoryType" OWNER TO postgres;

--
-- Name: FinancialPaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialPaymentMethod" AS ENUM (
    'CASH',
    'CHEQUE',
    'DEMAND_DRAFT',
    'UPI',
    'NEFT_RTGS',
    'OTHER'
);


ALTER TYPE public."FinancialPaymentMethod" OWNER TO postgres;

--
-- Name: FundType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FundType" AS ENUM (
    'GENERAL_FUND',
    'ZAKAT',
    'SADAQAH',
    'GENERAL_CHARITY',
    'INTEREST_FUND',
    'OTHER_SOURCES'
);


ALTER TYPE public."FundType" OWNER TO postgres;

--
-- Name: MasjidStaffRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MasjidStaffRole" AS ENUM (
    'IMAM',
    'MUEZZIN',
    'MUTAWALLI',
    'COMMITTEE_MEMBER',
    'ACCOUNTANT',
    'LAWYER',
    'ELECTRICIAN',
    'PLUMBER',
    'WORKER'
);


ALTER TYPE public."MasjidStaffRole" OWNER TO postgres;

--
-- Name: MasjidStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MasjidStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'SUSPENDED'
);


ALTER TYPE public."MasjidStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ANNOUNCEMENT',
    'EVENT_ALERT',
    'DONATION_RECEIPT',
    'ADMIN_ASSIGNMENT',
    'VERIFICATION_UPDATE',
    'DOCUMENT_EXPIRY',
    'GENERAL_SYSTEM'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: PropertyOccupancyStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PropertyOccupancyStatus" AS ENUM (
    'VACANT',
    'OCCUPIED',
    'UNDER_MAINTENANCE'
);


ALTER TYPE public."PropertyOccupancyStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'MASJID_ADMIN',
    'USER'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Advertisement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Advertisement" (
    id text NOT NULL,
    "masjidId" text,
    name text NOT NULL,
    description text,
    "imageUrl" text NOT NULL,
    "targetUrl" text NOT NULL,
    placement public."AdPlacement" DEFAULT 'BOTH'::public."AdPlacement" NOT NULL,
    format public."AdFormat" DEFAULT 'FULL_WIDTH'::public."AdFormat" NOT NULL,
    "isExclusive" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isTest" boolean DEFAULT false NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "clickCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Advertisement" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    details text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: City; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."City" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."City" OWNER TO postgres;

--
-- Name: CommunityAd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommunityAd" (
    id text NOT NULL,
    title text NOT NULL,
    "sponsorName" text NOT NULL,
    category public."AdCategory" DEFAULT 'COMMUNITY_SPONSOR'::public."AdCategory" NOT NULL,
    description text NOT NULL,
    "imageUrl" text NOT NULL,
    "targetUrl" text,
    location text DEFAULT 'Pan-India'::text NOT NULL,
    "contactPhone" text,
    status public."AdStatus" DEFAULT 'APPROVED'::public."AdStatus" NOT NULL,
    "impressionsCount" integer DEFAULT 0 NOT NULL,
    "clicksCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CommunityAd" OWNER TO postgres;

--
-- Name: DonationCampaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DonationCampaign" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    title text NOT NULL,
    purpose text NOT NULL,
    "coverImage" text,
    images text[] DEFAULT ARRAY[]::text[],
    category public."DonationCategory" DEFAULT 'GENERAL_FUND'::public."DonationCategory" NOT NULL,
    "goalAmount" numeric(12,2) NOT NULL,
    "raisedAmount" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DonationCampaign" OWNER TO postgres;

--
-- Name: DonationRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DonationRecord" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "donorId" text,
    "donorName" text NOT NULL,
    "donorEmail" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "paymentMethod" text DEFAULT 'DEMO_PAYMENT'::text NOT NULL,
    "receiptNumber" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DonationRecord" OWNER TO postgres;

--
-- Name: FinancialAuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FinancialAuditLog" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "previousValues" jsonb,
    "newValues" jsonb,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FinancialAuditLog" OWNER TO postgres;

--
-- Name: Masjid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Masjid" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    location text NOT NULL,
    "contactNumber" text NOT NULL,
    "plotSize" text NOT NULL,
    "registrationNo" text,
    status public."MasjidStatus" DEFAULT 'VERIFIED'::public."MasjidStatus" NOT NULL,
    description text NOT NULL,
    "coverImage" text NOT NULL,
    pictures text[],
    "videoTourUrl" text,
    "surroundingAreaDesc" text,
    "nearbyLandmarks" text,
    facilities text[],
    "busDistance" text,
    "trainDistance" text,
    "metroDistance" text,
    "airportDistance" text,
    "fajrTime" text,
    "dhuhrTime" text,
    "asrTime" text,
    "maghribTime" text,
    "ishaTime" text,
    "jummahTime" text,
    address text NOT NULL,
    "cityId" text NOT NULL,
    state text DEFAULT 'Delhi'::text NOT NULL,
    pincode text NOT NULL,
    latitude double precision,
    longitude double precision,
    "enabledModules" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customFacilities" jsonb,
    "dailyPrayers" jsonb,
    "prayerTimingLink" jsonb,
    "surroundingDetails" jsonb
);


ALTER TABLE public."Masjid" OWNER TO postgres;

--
-- Name: MasjidAdditionRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidAdditionRequest" (
    id text NOT NULL,
    "customId" text,
    "masjidName" text NOT NULL,
    location text NOT NULL,
    city text NOT NULL,
    "contactName" text NOT NULL,
    "contactPhone" text NOT NULL,
    "contactEmail" text,
    "additionalInfo" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "requestingUserId" text,
    "reviewedBy" text,
    "rejectionReason" text,
    "approvedMasjidId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidAdditionRequest" OWNER TO postgres;

--
-- Name: MasjidAdminApplication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidAdminApplication" (
    id text NOT NULL,
    "customId" text,
    "userId" text,
    "applicantName" text NOT NULL,
    "applicantEmail" text NOT NULL,
    "applicantPhone" text NOT NULL,
    "masjidName" text NOT NULL,
    location text NOT NULL,
    city text NOT NULL,
    "contactName" text NOT NULL,
    "contactPhone" text NOT NULL,
    "contactEmail" text,
    "additionalInfo" text,
    "existingMasjidId" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "reviewedBy" text,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidAdminApplication" OWNER TO postgres;

--
-- Name: MasjidAdminPermission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidAdminPermission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "masjidId" text NOT NULL,
    "canAccessMainPage" boolean DEFAULT true NOT NULL,
    "canAccessDocuments" boolean DEFAULT true NOT NULL,
    "canAccessDonations" boolean DEFAULT true NOT NULL,
    "canAccessRolesPermissions" boolean DEFAULT true NOT NULL,
    "canAccessProperties" boolean DEFAULT true NOT NULL,
    "canAccessTenants" boolean DEFAULT true NOT NULL,
    "canAccessMembers" boolean DEFAULT true NOT NULL,
    "canAccessStaff" boolean DEFAULT true NOT NULL,
    "canAccessEvents" boolean DEFAULT true NOT NULL,
    "canAccessAnnouncements" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidAdminPermission" OWNER TO postgres;

--
-- Name: MasjidAnnouncement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidAnnouncement" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    title text NOT NULL,
    category public."AnnouncementCategory" DEFAULT 'GENERAL'::public."AnnouncementCategory" NOT NULL,
    description text NOT NULL,
    "imageUrl" text,
    "isImportant" boolean DEFAULT false NOT NULL,
    "verificationStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidAnnouncement" OWNER TO postgres;

--
-- Name: MasjidBankAccount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidBankAccount" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "bankName" text NOT NULL,
    "accountNumberLast4" text NOT NULL,
    "accountTitle" text NOT NULL,
    "accountType" text DEFAULT 'SAVINGS'::text NOT NULL,
    "ifscCode" text,
    "upiId" text,
    "currentBalance" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MasjidBankAccount" OWNER TO postgres;

--
-- Name: MasjidDocument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidDocument" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    title text NOT NULL,
    "fileUrl" text NOT NULL,
    type text NOT NULL,
    visibility public."DocumentVisibility" DEFAULT 'PUBLIC'::public."DocumentVisibility" NOT NULL,
    status public."DocumentStatus" DEFAULT 'PENDING'::public."DocumentStatus" NOT NULL,
    "uploadedBy" text NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidDocument" OWNER TO postgres;

--
-- Name: MasjidDonation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidDonation" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "financialYearId" text NOT NULL,
    "donationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount numeric(12,2) NOT NULL,
    "fundType" public."FundType" DEFAULT 'GENERAL_FUND'::public."FundType" NOT NULL,
    "paymentMethod" public."FinancialPaymentMethod" DEFAULT 'CASH'::public."FinancialPaymentMethod" NOT NULL,
    "receiptNumber" text NOT NULL,
    "donorName" text NOT NULL,
    "donorPhone" text,
    "donorEmail" text,
    "donorAddress" text,
    description text,
    "chequeNumber" text,
    "bankName" text,
    "chequeDate" timestamp(3) without time zone,
    "ddNumber" text,
    "upiTransactionId" text,
    "utrNumber" text,
    status text DEFAULT 'VERIFIED'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidDonation" OWNER TO postgres;

--
-- Name: MasjidEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidEvent" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    title text NOT NULL,
    category public."EventCategory" DEFAULT 'LECTURE'::public."EventCategory" NOT NULL,
    "eventDate" timestamp(3) without time zone NOT NULL,
    "eventEndDate" timestamp(3) without time zone,
    "eventTime" text NOT NULL,
    location text NOT NULL,
    description text NOT NULL,
    "imageUrl" text,
    "speakerName" text,
    "verificationStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidEvent" OWNER TO postgres;

--
-- Name: MasjidExpenditure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidExpenditure" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "financialYearId" text NOT NULL,
    "expenseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category public."ExpenseCategoryType" NOT NULL,
    subcategory text NOT NULL,
    "fundType" public."FundType" DEFAULT 'GENERAL_FUND'::public."FundType" NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "paymentMethod" public."FinancialPaymentMethod" DEFAULT 'CASH'::public."FinancialPaymentMethod" NOT NULL,
    "payeeName" text NOT NULL,
    "billInvoiceNumber" text NOT NULL,
    "referenceNumber" text,
    "billDocumentUrl" text,
    "chequeNumber" text,
    "bankName" text,
    "upiTransactionId" text,
    "utrNumber" text,
    notes text,
    "disbursedBy" text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidExpenditure" OWNER TO postgres;

--
-- Name: MasjidFinancialAdjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidFinancialAdjustment" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "manualAuditId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    type text NOT NULL,
    reason text NOT NULL,
    "documentUrl" text,
    remarks text,
    "approvedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MasjidFinancialAdjustment" OWNER TO postgres;

--
-- Name: MasjidFinancialYear; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidFinancialYear" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "yearName" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isClosed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidFinancialYear" OWNER TO postgres;

--
-- Name: MasjidManualAudit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidManualAudit" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "financialYearId" text NOT NULL,
    month text NOT NULL,
    "auditDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."AuditReconciliationStatus" DEFAULT 'DRAFT'::public."AuditReconciliationStatus" NOT NULL,
    "systemOpeningBalance" numeric(12,2) NOT NULL,
    "actualOpeningBalance" numeric(12,2) NOT NULL,
    "openingDifference" numeric(12,2) NOT NULL,
    "systemTotalIncome" numeric(12,2) NOT NULL,
    "verifiedTotalIncome" numeric(12,2) NOT NULL,
    "incomeDifference" numeric(12,2) NOT NULL,
    "systemTotalExpenditure" numeric(12,2) NOT NULL,
    "verifiedTotalExpenditure" numeric(12,2) NOT NULL,
    "expenditureDifference" numeric(12,2) NOT NULL,
    "systemClosingBalance" numeric(12,2) NOT NULL,
    "verifiedClosingBalance" numeric(12,2) NOT NULL,
    "systemCashBalance" numeric(12,2) NOT NULL,
    "actualCashCounted" numeric(12,2) NOT NULL,
    "cashDifference" numeric(12,2) NOT NULL,
    "systemBankBalance" numeric(12,2) NOT NULL,
    "actualBankBalance" numeric(12,2) NOT NULL,
    "bankDifference" numeric(12,2) NOT NULL,
    "auditRemarks" text,
    "comparisonData" jsonb NOT NULL,
    "auditedBy" text NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidManualAudit" OWNER TO postgres;

--
-- Name: MasjidOpeningBalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidOpeningBalance" (
    id text NOT NULL,
    "financialYearId" text NOT NULL,
    "masjidId" text NOT NULL,
    "cashBalance" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "bankBalance" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "generalFund" numeric(12,2) DEFAULT 0.00 NOT NULL,
    zakat numeric(12,2) DEFAULT 0.00 NOT NULL,
    sadaqah numeric(12,2) DEFAULT 0.00 NOT NULL,
    "generalCharity" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "interestFund" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "isLocked" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidOpeningBalance" OWNER TO postgres;

--
-- Name: MasjidOtherIncome; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidOtherIncome" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "financialYearId" text NOT NULL,
    "sourceName" text NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "incomeDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentMethod" public."FinancialPaymentMethod" DEFAULT 'CASH'::public."FinancialPaymentMethod" NOT NULL,
    "referenceNumber" text NOT NULL,
    "fundType" public."FundType" DEFAULT 'GENERAL_FUND'::public."FundType" NOT NULL,
    "collectorName" text,
    "documentUrl" text,
    status text DEFAULT 'VERIFIED'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidOtherIncome" OWNER TO postgres;

--
-- Name: MasjidProperty; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidProperty" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "propertyCustomId" text NOT NULL,
    "contactPhone" text NOT NULL,
    location text NOT NULL,
    "documentUrl" text,
    "monthlyRent" numeric(12,2) NOT NULL,
    "revenueTotal" numeric(12,2) DEFAULT 0.00 NOT NULL,
    status public."PropertyOccupancyStatus" DEFAULT 'OCCUPIED'::public."PropertyOccupancyStatus" NOT NULL,
    "verificationStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidProperty" OWNER TO postgres;

--
-- Name: MasjidStaff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidStaff" (
    id text NOT NULL,
    "masjidId" text NOT NULL,
    "userId" text,
    name text NOT NULL,
    role public."MasjidStaffRole" NOT NULL,
    contact text NOT NULL,
    salary double precision DEFAULT 0,
    "joiningDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MasjidStaff" OWNER TO postgres;

--
-- Name: MasjidTenant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasjidTenant" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "tenantCustomId" text NOT NULL,
    "tenantName" text NOT NULL,
    "contactPhone" text NOT NULL,
    "tenantDocUrl" text,
    "monthlyRent" numeric(12,2) NOT NULL,
    "leaseStartDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "leaseEndDate" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasjidTenant" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: SavedMasjid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SavedMasjid" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "masjidId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SavedMasjid" OWNER TO postgres;

--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSetting" (
    key text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemSetting" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "customId" text,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "plainPassword" text,
    name text NOT NULL,
    phone text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    avatar text,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT true NOT NULL,
    "isSuspended" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" text,
    "passwordResetToken" text,
    "passwordResetExpires" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "masjidId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Advertisement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Advertisement" (id, "masjidId", name, description, "imageUrl", "targetUrl", placement, format, "isExclusive", "isActive", "isTest", "displayOrder", "clickCount", "createdAt", "updatedAt") FROM stdin;
b89aaace-9eaa-4d3a-98af-3983a84d379d	\N	Noor Educational Madrasa & Arabic Academy	Online & campus Quran memorization (Hifz), Tajweed certification, and modern Islamic Arabic language diplomas.	https://images.unsplash.com/photo-1584281722572-8a96435c2b03?auto=format&fit=crop&w=800&q=80	https://example.com/madrasa-academy	INNER_ONLY	QUAD_GRID	f	f	f	5	0	2026-11-01 14:15:59.09	2026-11-01 14:35:19.972
7e0c470e-892f-426c-ae47-0def1eef7e0a	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Test Community Campaign 2026	Support our local community educational program.	https://images.unsplash.com/photo-1542838132-92c53300491e	https://example.com/community	HOME_ONLY	FULL_WIDTH	f	f	f	1	3	2026-11-01 12:06:34.572	2026-11-01 14:35:04.167
a55bd884-2fa1-4ae3-a014-0b1844cfd239	\N	Al-Haramain Hajj & Umrah Travel Packages 2026	Executive 5-star packages with direct flights, luxury hotels near Haram, and scholar-guided ziyarah.	https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80	https://example.com/hajj-umrah	BOTH	FULL_WIDTH	f	f	f	1	0	2026-11-01 14:24:18.542	2026-11-01 14:35:06.075
67ac74be-e3a1-4850-ac3c-f7eb89f3782f	\N	Darussalam Islamic Book Store & Quran Publications	Authentic Quran prints with Tajweed, Sahih Hadith collections, and children's Islamic learning literature.	https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80	https://example.com/islamic-books	HOME_ONLY	FULL_WIDTH	f	f	f	2	0	2026-11-01 14:24:18.559	2026-11-01 14:35:08.104
838a4d2d-cdd5-418b-a575-0878a11f6837	\N	Al-Madina Halal Catering & Community Kitchens	Hygienic Nikah catering, Walima dining setups, Ramadan Iftar arrangements, and charity food drives.	https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80	https://example.com/halal-catering	BOTH	HALF_WIDTH	f	f	f	4	0	2026-11-01 14:24:18.565	2026-11-01 14:35:14.055
a6e55217-272a-4e99-9d64-8352667972f1	\N	Sultan Mosque Carpets & Acoustic Sound Engineering	High-density Turkish prayer carpets, mihrab acoustic panelling, and interference-free wireless prayer audio systems.	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80	https://example.com/mosque-supplies	BOTH	HALF_WIDTH	f	f	f	3	0	2026-11-01 14:24:18.561	2026-11-01 14:35:15.313
13c58da7-0037-479c-aa64-e56b3aa0de45	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Jama Masjid Annual Quranic Exhibition	Join us for historical Quran manuscripts exhibition and calligraphy workshop.	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80	https://example.com/exhibition	BOTH	FULL_WIDTH	f	f	f	2	0	2026-11-01 12:49:10.73	2026-11-01 14:35:16.622
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, entity, details, "createdAt") FROM stdin;
\.


--
-- Data for Name: City; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."City" (id, name, slug, "createdAt") FROM stdin;
10a8fb48-b8e8-4cfa-994a-88c981bf87a8	New Delhi	new-delhi	2026-10-30 11:15:20.731
28cfd26a-757e-4f85-a6d8-b1731a5ca281	Deoband	deoband	2026-10-30 11:15:20.745
ff5adcf7-e6fc-450d-a494-484e1ad925a6	Srinagar	srinagar	2026-10-30 11:15:20.748
1d230acc-90a9-40bd-be87-d7fbf6c58ffa	Hyderabad	hyderabad	2026-10-30 11:15:20.75
713fe15d-ede3-400f-927b-1458eb8fa528	Kolkata	kolkata	2026-10-30 11:15:20.753
58b0cea6-7791-4ecd-b247-89b3843f4413	Bhopal	bhopal	2026-10-30 11:15:20.755
f0113ae7-77ca-45b2-9628-c19f2521051e	hubli	hubli-184	2026-10-31 05:25:59.652
a9623455-4ef7-416b-908b-551dd71515ba	Lucknow	lucknow-667	2026-10-31 09:05:31.085
547894a0-ee55-4513-82b2-43a55f92466a	Delhi	delhi	2026-10-31 17:55:21.756
\.


--
-- Data for Name: CommunityAd; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommunityAd" (id, title, "sponsorName", category, description, "imageUrl", "targetUrl", location, "contactPhone", status, "impressionsCount", "clicksCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DonationCampaign; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DonationCampaign" (id, "masjidId", title, purpose, "coverImage", images, category, "goalAmount", "raisedAmount", "startDate", "endDate", status, "createdAt", "updatedAt") FROM stdin;
9275c8ec-ff70-470f-880f-08f2f745365b	026f387d-c847-4d81-9e7f-14e5ebce03bf	Masjid-e-Rasheed Deoband General Welfare & Maintenance Fund	Covering monthly electricity utilities, carpet cleaning, wudu area maintenance, and Quranic study supplies.	\N	{}	GENERAL_FUND	250000.00	145000.00	2026-10-30 11:15:20.876	\N	ACTIVE	2026-10-30 11:15:20.876	2026-10-30 11:15:20.876
17dc65ba-6d0b-4683-80b7-b4699d59b1b8	9eb37b65-668d-4f06-bc95-45922daec7cd	Hazratbal Shrine Srinagar General Welfare & Maintenance Fund	Covering monthly electricity utilities, carpet cleaning, wudu area maintenance, and Quranic study supplies.	\N	{}	GENERAL_FUND	250000.00	145000.00	2026-10-30 11:15:20.91	\N	ACTIVE	2026-10-30 11:15:20.91	2026-10-30 11:15:20.91
4b080704-0508-4039-bd75-18664ea61db5	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	New Wing Construction	Building a new prayer hall to accommodate more worshippers.	https://images.unsplash.com/photo-1542617666-b3378b27341a?q=80&w=400	{https://images.unsplash.com/photo-1542617666-b3378b27341a?q=80&w=400}	CONSTRUCTION	500000.00	294384.00	2026-10-30 11:15:32.792	\N	ACTIVE	2026-10-30 11:15:32.792	2026-10-30 11:15:32.792
27e617cd-2388-42a4-aaef-63b054fbd388	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Annual AC Maintenance	Servicing all air conditioning units before summer.	https://images.unsplash.com/photo-1588661601614-239611e3b6eb?q=80&w=400	{https://images.unsplash.com/photo-1588661601614-239611e3b6eb?q=80&w=400}	MAINTENANCE	500000.00	128169.00	2026-10-30 11:15:32.813	\N	ACTIVE	2026-10-30 11:15:32.813	2026-10-30 11:15:32.813
caa2cf5f-cf94-4bdd-9bc9-b831b9dad335	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Madrasa Book Drive	Providing new Quran copies and Islamic literature for students.	https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=400	{https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=400}	EDUCATION	500000.00	344415.00	2026-10-30 11:15:32.817	\N	ACTIVE	2026-10-30 11:15:32.817	2026-10-30 11:15:32.817
9005b9b1-7ce7-4d6c-9a54-d7f3389c97c2	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Ramadan Zakat Distribution	Collecting Zakat al-Fitr for local families in need.	https://images.unsplash.com/photo-1620050853746-8805fdbefeb4?q=80&w=400	{https://images.unsplash.com/photo-1620050853746-8805fdbefeb4?q=80&w=400}	ZAKAT	500000.00	309626.00	2026-10-30 11:15:32.82	\N	ACTIVE	2026-10-30 11:15:32.82	2026-10-30 11:15:32.82
2477b9fa-d3b2-4406-abb5-436b74330b68	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Winter Blanket Charity	Providing warm blankets to the homeless during cold months.	https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=400	{https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=400}	CHARITY	500000.00	180974.00	2026-10-30 11:15:32.823	\N	ACTIVE	2026-10-30 11:15:32.823	2026-10-30 11:15:32.823
dcdcfbe1-1acc-471a-8d19-d8454f432bf7	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Free Medical Camp	A weekend clinic providing free checkups for the community.	https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400	{https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400}	COMMUNITY_WELFARE	500000.00	172281.00	2026-10-30 11:15:32.827	\N	ACTIVE	2026-10-30 11:15:32.827	2026-10-30 11:15:32.827
b32f41dd-a218-4ebe-b2a9-e8e6e1562e18	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Flood Relief Fund	Emergency aid for those affected by recent flooding in the region.	https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=400	{https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=400}	EMERGENCY	500000.00	227266.00	2026-10-30 11:15:32.829	\N	ACTIVE	2026-10-30 11:15:32.829	2026-10-31 18:25:23.866
6d92f459-e089-444a-acc0-a5107297d28d	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Jama Masjid Old Delhi General Welfare & Maintenance Fund	Covering monthly electricity utilities, carpet cleaning, wudu area maintenance, and Quranic study supplies.	\N	{}	GENERAL_FUND	250000.00	148000.00	2026-10-30 11:15:20.826	\N	ACTIVE	2026-10-30 11:15:20.826	2026-11-01 07:41:20.476
36c42153-6e1d-476d-b637-cab1e2d8c0f6	430e8beb-85d0-430e-882d-9690b77fd2f9	Mecca Masjid Hyderabad General Welfare & Maintenance Fund	Covering monthly electricity utilities, carpet cleaning, wudu area maintenance, and Quranic study supplies.	\N	{}	GENERAL_FUND	250000.00	155000.00	2026-10-30 11:15:20.944	\N	ACTIVE	2026-10-30 11:15:20.944	2026-11-01 09:22:24.263
53f86980-8e95-4f79-824c-19bf16ef1656	26c5e07c-4f54-436b-a962-2b67b371d24c	RNM General Welfare & Maintenance Fund	General operational expenses, facility maintenance, and community welfare.	\N	{}	GENERAL_FUND	500000.00	1000.00	2026-11-01 07:40:00.014	\N	ACTIVE	2026-11-01 07:40:00.014	2026-11-01 10:01:00.647
\.


--
-- Data for Name: DonationRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DonationRecord" (id, "campaignId", "donorId", "donorName", "donorEmail", amount, "paymentMethod", "receiptNumber", notes, "createdAt") FROM stdin;
d633f4b0-1eb0-4a62-980a-f6a59a2d3eb1	6d92f459-e089-444a-acc0-a5107297d28d	\N	Brother Zayd Khan	zayd@gmail.com	5000.00	DEMO_PAYMENT	REC-2026-87599	May Allah accept this humble Sadaqah.	2026-10-30 11:15:20.834
bd910d74-8b63-4088-bd9d-c69e2734f016	6d92f459-e089-444a-acc0-a5107297d28d	\N	Sister Aisha Rahman	aisha@gmail.com	10000.00	DEMO_PAYMENT	REC-2026-16548	In memory of late grandparents.	2026-10-30 11:15:20.834
2993e3de-8c2e-4aa7-a0d0-2f6ad72035c0	9275c8ec-ff70-470f-880f-08f2f745365b	\N	Brother Zayd Khan	zayd@gmail.com	5000.00	DEMO_PAYMENT	REC-2026-61141	May Allah accept this humble Sadaqah.	2026-10-30 11:15:20.878
c33236ce-a859-496b-9b0a-11acf6f564c5	9275c8ec-ff70-470f-880f-08f2f745365b	\N	Sister Aisha Rahman	aisha@gmail.com	10000.00	DEMO_PAYMENT	REC-2026-31901	In memory of late grandparents.	2026-10-30 11:15:20.878
071f7759-1ef9-4bd8-ad48-48623c7be0e1	17dc65ba-6d0b-4683-80b7-b4699d59b1b8	\N	Brother Zayd Khan	zayd@gmail.com	5000.00	DEMO_PAYMENT	REC-2026-99168	May Allah accept this humble Sadaqah.	2026-10-30 11:15:20.912
0fa91b4f-ea35-4608-9c7b-19a37d0463b9	17dc65ba-6d0b-4683-80b7-b4699d59b1b8	\N	Sister Aisha Rahman	aisha@gmail.com	10000.00	DEMO_PAYMENT	REC-2026-45659	In memory of late grandparents.	2026-10-30 11:15:20.912
38d4af47-ba59-40bb-993c-0db6fe455b2f	36c42153-6e1d-476d-b637-cab1e2d8c0f6	\N	Brother Zayd Khan	zayd@gmail.com	5000.00	DEMO_PAYMENT	REC-2026-46212	May Allah accept this humble Sadaqah.	2026-10-30 11:15:20.946
fbf265af-372f-43fc-b166-01c7fb63b76e	36c42153-6e1d-476d-b637-cab1e2d8c0f6	\N	Sister Aisha Rahman	aisha@gmail.com	10000.00	DEMO_PAYMENT	REC-2026-70252	In memory of late grandparents.	2026-10-30 11:15:20.946
e13403ed-7590-40cf-aa5e-b5b066aad130	b32f41dd-a218-4ebe-b2a9-e8e6e1562e18	\N	Haji Brother Karim	karim@community.org	2500.00	DEMO_PAYMENT	REC-2026-99557	Monthly sadaqah contribution	2026-10-31 18:24:53.446
8241d763-0965-489e-901f-32fe52c27aa3	b32f41dd-a218-4ebe-b2a9-e8e6e1562e18	\N	Haji Brother Karim	karim@community.org	2500.00	DEMO_PAYMENT	REC-2026-95712	Monthly sadaqah contribution	2026-10-31 18:25:23.866
3027851d-c223-4d12-a268-5f125831c34e	6d92f459-e089-444a-acc0-a5107297d28d	\N	Brother Tariq Al-Mansoor	tariq.mansoor@example.com	1500.00	DEMO_PAYMENT	REC-2026-17194	[Allocations: General Funds - Masjid Work: ₹1000 | Charity Funds - Sadaqah: ₹500] For prayer hall repairs	2026-11-01 07:40:00.914
ccc61bf2-6a29-4091-98eb-d917f3718067	6d92f459-e089-444a-acc0-a5107297d28d	\N	Brother Tariq Al-Mansoor	tariq.mansoor@example.com	1500.00	DEMO_PAYMENT	REC-2026-77463	[Allocations: General Funds - Masjid Work: ₹1000 | Charity Funds - Sadaqah: ₹500] For prayer hall repairs	2026-11-01 07:41:20.476
22ba210a-d0b4-412a-b805-12c48997cb7f	36c42153-6e1d-476d-b637-cab1e2d8c0f6	\N	Sister Amina Begum	amina.begum@example.com	2500.00	DEMO_PAYMENT	REC-2026-30987	[Allocations: Charity Funds - Zakat: ₹2500] Zakat al-Mal	2026-11-01 07:41:20.59
f79ee557-1693-4081-83f6-03b66e7a68c7	36c42153-6e1d-476d-b637-cab1e2d8c0f6	\N	Brother Zayd Testing	zayd.test@example.com	2500.00	DEMO_PAYMENT	REC-2026-72276	[Donation Type: Charity] Sadaqah for the community	2026-11-01 09:22:24.177
fbef5cbe-4fe0-4f6e-957a-6e8884a53276	36c42153-6e1d-476d-b637-cab1e2d8c0f6	\N	Sister Fatima Testing	fatima.test@example.com	5000.00	DEMO_PAYMENT	REC-2026-41991	[Donation Type: Medical Aid for Musallis] Emergency medical assistance	2026-11-01 09:22:24.263
4d977a80-466f-49ac-80a1-76eacc2b59d9	53f86980-8e95-4f79-824c-19bf16ef1656	\N	hhh	hhh!@h.com	1000.00	DEMO_PAYMENT	REC-2026-78554	[Donation Type: Zakat] Demo Sadaqah / Zakat Contribution	2026-11-01 10:01:00.647
\.


--
-- Data for Name: FinancialAuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FinancialAuditLog" (id, "masjidId", "userId", action, "entityType", "entityId", "previousValues", "newValues", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: Masjid; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Masjid" (id, name, slug, location, "contactNumber", "plotSize", "registrationNo", status, description, "coverImage", pictures, "videoTourUrl", "surroundingAreaDesc", "nearbyLandmarks", facilities, "busDistance", "trainDistance", "metroDistance", "airportDistance", "fajrTime", "dhuhrTime", "asrTime", "maghribTime", "ishaTime", "jummahTime", address, "cityId", state, pincode, latitude, longitude, "enabledModules", "createdAt", "updatedAt", "customFacilities", "dailyPrayers", "prayerTimingLink", "surroundingDetails") FROM stdin;
430e8beb-85d0-430e-882d-9690b77fd2f9	Mecca Masjid Hyderabad	mecca-masjid-hyderabad	Charminar Road, Hyderabad	+91 40 2452 3041	25,000 Sq Yards	TSWAQF/HYD/1694/01	VERIFIED	One of India's largest mosques built using bricks made from soil brought directly from Mecca, located adjacent to the iconic Charminar.	https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80	{https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80}	https://youtube.com/watch?v=demo-mecca-masjid	Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.	Charminar (100m), Chowmahalla Palace (400m), Laad Bazaar (150m)	{"Women's Prayer Area","Wudu Area",Parking,"Quran Classes","Wheelchair Access","Funeral Facilities"}	100 meters from Charminar Bus Station	3.2 km from Hyderabad Deccan Station (Nampally)	1.5 km from MGBS Metro Station (Green Line)	21 km from Rajiv Gandhi International Airport (HYD)	05:15 AM	01:30 PM	05:00 PM	07:15 PM	08:45 PM	01:45 PM	Charminar Rd, Ghansi Bazaar, Hyderabad	1d230acc-90a9-40bd-be87-d7fbf6c58ffa	Telangana	500002	17.3616	78.4735	["view_dashboard", "manage_profile", "manage_members", "manage_announcements", "manage_events", "manage_media", "manage_donations", "manage_finances", "manage_documents", "manage_staff", "manage_property", "view_reports", "ads_buzz"]	2026-10-30 11:15:20.926	2026-11-01 12:21:58.561	[{"id": "fac-0", "name": "Women's Prayer Area", "order": 0, "isActive": true}, {"id": "fac-1", "name": "Wudu Area", "order": 1, "isActive": true}, {"id": "fac-2", "name": "Parking", "order": 2, "isActive": true}, {"id": "fac-3", "name": "Quran Classes", "order": 3, "isActive": true}, {"id": "fac-5", "name": "Wheelchair Access", "order": 5, "isActive": true}, {"id": "fac-6", "name": "Funeral Facilities", "order": 6, "isActive": true}]	[{"id": "p1", "name": "Fajr", "time": "05:15 AM", "order": 0, "isActive": true}, {"id": "p2", "name": "Dhuhr", "time": "01:30 PM", "order": 1, "isActive": true}, {"id": "p3", "name": "Asr", "time": "05:00 PM", "order": 2, "isActive": true}, {"id": "p4", "name": "Maghrib", "time": "07:15 PM", "order": 3, "isActive": true}, {"id": "p5", "name": "Isha", "time": "08:45 PM", "order": 4, "isActive": true}, {"id": "p6", "name": "Jummah", "time": "01:45 PM", "order": 5, "isActive": true}]	{"url": "", "label": "View Complete Prayer Timings", "isActive": false}	{"link": {"url": "", "label": "Explore Area & Heritage", "isActive": false}, "heading": "Surrounding Area & Landmarks", "landmarks": [{"id": "lm1", "name": "Charminar", "unit": "m", "order": 0, "distance": "100", "isActive": true}, {"id": "lm2", "name": "Chowmahalla Palace", "unit": "m", "order": 1, "distance": "400", "isActive": true}, {"id": "lm3", "name": "Laad Bazaar", "unit": "m", "order": 2, "distance": "150", "isActive": true}], "overviewDesc": "Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.", "overviewLabel": "NEIGHBORHOOD OVERVIEW", "landmarksLabel": "NEARBY LANDMARKS"}
26c5e07c-4f54-436b-a962-2b67b371d24c	RNM	rnm-710	madani	99999666666	3000	WAQF-HUB-2026-710	VERIFIED	Historic congregational Masjid located in hubli.	https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1000&auto=format&fit=crop	{https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1000&auto=format&fit=crop}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	madani	f0113ae7-77ca-45b2-9628-c19f2521051e	India	110006	\N	\N	["view_dashboard", "manage_profile", "manage_members", "manage_announcements", "manage_events", "manage_media", "manage_donations", "manage_finances", "manage_documents", "manage_staff", "manage_property", "view_reports", "ads_buzz"]	2026-10-31 05:25:59.794	2026-11-01 12:21:58.57	\N	\N	\N	\N
9eb37b65-668d-4f06-bc95-45922daec7cd	Hazratbal Shrine Srinagar	hazratbal-shrine-srinagar	Dal Lake Northern Bank, Srinagar	+91 194 242 0981	18,500 Sq Yards	JKW/SRN/1979/08	VERIFIED	Prism of white marble situated on the left bank of Dal Lake, revered for housing the sacred relic Moi-e-Muqqadas of Prophet Muhammad (PBUH).	https://images.unsplash.com/photo-1590076175571-4b5459efb08c?auto=format&fit=crop&w=1200&q=80	{https://images.unsplash.com/photo-1590076175571-4b5459efb08c?auto=format&fit=crop&w=1200&q=80}	https://youtube.com/watch?v=demo-hazratbal	Lakeside precinct overlooking the serene Dal Lake and Zabarwan Mountain range with traditional Kashmiri wooden Shikaras.	Nishat Bagh (3.5 km), Kashmir University Campus (400m)	{"Women's Prayer Area","Wudu Area",Parking,Library,"Wheelchair Access","Drinking Water"}	300 meters from Hazratbal Bus Stop	14 km from Srinagar Railway Station (SINA)	N/A	22 km from Sheikh ul-Alam International Airport (SXR)	\N	\N	\N	\N	\N	\N	Hazratbal Road, University of Kashmir Campus, Srinagar	ff5adcf7-e6fc-450d-a494-484e1ad925a6	Jammu and Kashmir	190006	34.1287	74.8425	["view_dashboard", "manage_profile", "manage_members", "manage_announcements", "manage_events", "manage_media", "manage_donations", "manage_finances", "manage_documents", "manage_staff", "manage_property", "view_reports", "ads_buzz"]	2026-10-30 11:15:20.89	2026-11-01 12:21:58.568	\N	\N	\N	\N
026f387d-c847-4d81-9e7f-14e5ebce03bf	Masjid-e-Rasheed Deoband	masjid-e-rasheed-deoband	Darul Uloom Campus, Deoband	+91 1336 222 124	22,000 Sq Yards	WAQF/UP/1988/441	VERIFIED	Located within the world-renowned Darul Uloom Deoband campus, featuring grand domes, white marble carvings, and housing thousands of students of Islamic theology.	https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80	{https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80}	https://youtube.com/watch?v=demo-deoband	Peaceful Islamic academic township surrounded by historic madrasas, Islamic libraries, and residential student quarters.	Darul Uloom Main Library (50m), Khanqah-e-Mahmoodia (200m)	{"Wudu Area","Quran Classes",Library,"Community Hall",Madrasa,"Drinking Water"}	600 meters from Deoband Bus Depot	1.8 km from Deoband Railway Station (DBD)	N/A (Inter-city rail transport)	145 km from Dehradun Jolly Grant Airport	\N	\N	\N	\N	\N	\N	Darul Uloom Deoband Campus, Saharanpur District	28cfd26a-757e-4f85-a6d8-b1731a5ca281	Uttar Pradesh	247554	29.6975	77.5855	["view_dashboard", "manage_profile", "manage_members", "manage_announcements", "manage_events", "manage_media", "manage_donations", "manage_finances", "manage_documents", "manage_staff", "manage_property", "view_reports", "ads_buzz"]	2026-10-30 11:15:20.86	2026-11-01 12:21:58.574	\N	\N	\N	\N
d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Jama Masjid Old Delhi	jama-masjid-old-delhi	Chandni Chowk, Old Delhi	+91 11 2326 2154	15,000 Sq Yards (135,000 Sq Ft)	WAQF/DEL/1954/001	VERIFIED	Built by Mughal Emperor Shah Jahan between 1644 and 1656, Jama Masjid is one of the largest and most historic congregational mosques in India.	https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80	{https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80}	https://youtube.com/watch?v=demo-jama-masjid	Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.	Charminar (100m), Chowmahalla Palace (400m), Laad Bazaar (150m)	{"Women's Prayer Area","Wudu Area",Parking,"Quran Classes",Library,"Wheelchair Access","Funeral Facilities"}	150 meters from Daryaganj ISBT Bus Terminal	1.2 km from Old Delhi Railway Station (DLI)	250 meters from Chawri Bazar Metro Station (Yellow Line)	18.5 km from Indira Gandhi International Airport (DEL)	05:15 AM	01:30 PM	05:00 PM	07:15 PM	08:45 PM	01:45 PM	Jama Masjid Road, Daryaganj, Chawri Bazar	10a8fb48-b8e8-4cfa-994a-88c981bf87a8	Delhi	110006	28.6507	77.2334	["view_dashboard", "manage_profile", "manage_members", "manage_announcements", "manage_events", "manage_media", "manage_donations", "manage_finances", "manage_documents", "manage_staff", "manage_property", "view_reports", "ads_buzz"]	2026-10-30 11:15:20.773	2026-11-01 12:06:53.883	[{"id": "f1", "name": "Women's Prayer Area", "order": 0, "isActive": true}, {"id": "f2", "name": "Wudu Area", "order": 1, "isActive": true}, {"id": "f3", "name": "Parking", "order": 2, "isActive": true}, {"id": "f4", "name": "Quran Classes", "order": 3, "isActive": true}, {"id": "f5", "name": "Library", "order": 4, "isActive": true}, {"id": "f6", "name": "Wheelchair Access", "order": 5, "isActive": true}, {"id": "f7", "name": "Funeral Facilities", "order": 6, "isActive": true}]	[{"id": "p1", "name": "Fajr", "time": "05:15 AM", "order": 0, "endTime": "06:00 AM", "isActive": true, "startTime": "05:15 AM", "endTimeMode": "TIME"}, {"id": "p2", "name": "Dhuhr", "time": "01:30 PM", "order": 1, "endTime": null, "isActive": true, "startTime": "01:30 PM", "endTimeMode": "NA"}, {"id": "p3", "name": "Asr", "time": "05:00 PM", "order": 2, "endTime": "05:45 PM", "isActive": true, "startTime": "05:00 PM", "endTimeMode": "TIME"}, {"id": "p4", "name": "Maghrib", "time": "07:15 PM", "order": 3, "endTime": null, "isActive": true, "startTime": "07:15 PM", "endTimeMode": "NA"}, {"id": "p5", "name": "Isha", "time": "08:45 PM", "order": 4, "endTime": "09:30 PM", "isActive": true, "startTime": "08:45 PM", "endTimeMode": "TIME"}, {"id": "p6", "name": "Jummah", "time": "01:45 PM", "order": 5, "endTime": null, "isActive": true, "startTime": "01:45 PM", "endTimeMode": "NA"}]	{"url": "https://example.com/mecca-masjid-prayer-times", "label": "View Complete Prayer Timings", "isActive": true}	{"link": {"url": "https://telanganatourism.gov.in", "label": "Explore Heritage Quarter", "isActive": true}, "heading": "Surrounding Area & Landmarks", "landmarks": [{"id": "lm1", "name": "Charminar", "unit": "m", "order": 0, "distance": "100", "isActive": true}, {"id": "lm2", "name": "Chowmahalla Palace", "unit": "m", "order": 1, "distance": "400", "isActive": true}, {"id": "lm3", "name": "Laad Bazaar", "unit": "m", "order": 2, "distance": "150", "isActive": true}], "overviewDesc": "Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.", "overviewLabel": "NEIGHBORHOOD OVERVIEW", "landmarksLabel": "NEARBY LANDMARKS"}
\.


--
-- Data for Name: MasjidAdditionRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidAdditionRequest" (id, "customId", "masjidName", location, city, "contactName", "contactPhone", "contactEmail", "additionalInfo", status, "requestingUserId", "reviewedBy", "rejectionReason", "approvedMasjidId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MasjidAdminApplication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidAdminApplication" (id, "customId", "userId", "applicantName", "applicantEmail", "applicantPhone", "masjidName", location, city, "contactName", "contactPhone", "contactEmail", "additionalInfo", "existingMasjidId", status, "reviewedBy", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MasjidAdminPermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidAdminPermission" (id, "userId", "masjidId", "canAccessMainPage", "canAccessDocuments", "canAccessDonations", "canAccessRolesPermissions", "canAccessProperties", "canAccessTenants", "canAccessMembers", "canAccessStaff", "canAccessEvents", "canAccessAnnouncements", "createdAt", "updatedAt") FROM stdin;
ef5b04ee-d8e7-45a5-87da-959f29ee2959	a1ff1efb-851f-482c-adf3-fb3d55ae245b	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	t	t	t	t	t	t	t	t	t	t	2026-10-30 11:15:20.788	2026-10-30 11:15:20.788
b65a1b9b-e410-455d-b2c5-2c7f2dbe8d04	2a07ad4d-3f03-4b6f-97ab-5646fb010397	026f387d-c847-4d81-9e7f-14e5ebce03bf	t	t	t	t	t	t	t	t	t	t	2026-10-30 11:15:20.864	2026-10-30 11:15:20.864
0adf9752-92b7-4b74-803d-53716b7e5b04	7950e646-9005-4435-8868-4e7b1082140f	9eb37b65-668d-4f06-bc95-45922daec7cd	t	t	t	t	t	t	t	t	t	t	2026-10-30 11:15:20.895	2026-10-30 11:15:20.895
cb9f2b48-0ba0-466e-9624-23b4298b4e95	55e3f350-64dd-4e2a-8823-ef28b5fa2caf	430e8beb-85d0-430e-882d-9690b77fd2f9	t	t	t	t	t	t	t	t	t	t	2026-10-30 11:15:20.93	2026-10-30 11:15:20.93
293f70f1-b017-4deb-bb8f-9019fb73d40b	9f6a80de-7938-41b4-bcda-9ee02e682687	26c5e07c-4f54-436b-a962-2b67b371d24c	t	t	t	t	t	t	t	t	t	t	2026-10-31 05:25:59.805	2026-10-31 05:25:59.805
\.


--
-- Data for Name: MasjidAnnouncement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidAnnouncement" (id, "masjidId", title, category, description, "imageUrl", "isImportant", "verificationStatus", "createdAt", "updatedAt") FROM stdin;
e431d32f-ece9-46b4-949c-10ce6eaa2090	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Special Jummah Bayan & Prayer Timings Update	PRAYER	Jummah Khutbah will commence at 01:15 PM sharp followed by Jama'at at 01:45 PM. All congregants are requested to perform Wudu at home.	\N	t	PENDING	2026-10-30 11:15:20.841	2026-10-30 11:15:20.841
f641817f-7db8-4245-a721-1b2184142fb6	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Free Community Medical Checkup & Blood Donation Camp	COMMUNITY	Organized by the Mosque Committee this Sunday from 09:00 AM to 02:00 PM in the annex hall. Qualified doctors will be present.	\N	f	PENDING	2026-10-30 11:15:20.841	2026-10-30 11:15:20.841
4010085d-d475-49a0-bae2-7f23f3686adc	026f387d-c847-4d81-9e7f-14e5ebce03bf	Special Jummah Bayan & Prayer Timings Update	PRAYER	Jummah Khutbah will commence at 01:15 PM sharp followed by Jama'at at 01:45 PM. All congregants are requested to perform Wudu at home.	\N	t	PENDING	2026-10-30 11:15:20.881	2026-10-30 11:15:20.881
33b11dbc-0555-4746-8c4e-01926a8857a4	026f387d-c847-4d81-9e7f-14e5ebce03bf	Free Community Medical Checkup & Blood Donation Camp	COMMUNITY	Organized by the Mosque Committee this Sunday from 09:00 AM to 02:00 PM in the annex hall. Qualified doctors will be present.	\N	f	PENDING	2026-10-30 11:15:20.881	2026-10-30 11:15:20.881
500322af-e8c1-4af0-a7d3-6dca940908a0	9eb37b65-668d-4f06-bc95-45922daec7cd	Special Jummah Bayan & Prayer Timings Update	PRAYER	Jummah Khutbah will commence at 01:15 PM sharp followed by Jama'at at 01:45 PM. All congregants are requested to perform Wudu at home.	\N	t	PENDING	2026-10-30 11:15:20.916	2026-10-30 11:15:20.916
4d73140c-218b-4653-8e59-3a61a9a066c6	9eb37b65-668d-4f06-bc95-45922daec7cd	Free Community Medical Checkup & Blood Donation Camp	COMMUNITY	Organized by the Mosque Committee this Sunday from 09:00 AM to 02:00 PM in the annex hall. Qualified doctors will be present.	\N	f	PENDING	2026-10-30 11:15:20.916	2026-10-30 11:15:20.916
168b9b7a-4d73-4a7e-b80d-d3cfc9bba262	430e8beb-85d0-430e-882d-9690b77fd2f9	Special Jummah Bayan & Prayer Timings Update	PRAYER	Jummah Khutbah will commence at 01:15 PM sharp followed by Jama'at at 01:45 PM. All congregants are requested to perform Wudu at home.	\N	t	PENDING	2026-10-30 11:15:20.948	2026-10-30 11:15:20.948
c994d815-eff0-401a-9b21-ba517f313fb4	430e8beb-85d0-430e-882d-9690b77fd2f9	Free Community Medical Checkup & Blood Donation Camp	COMMUNITY	Organized by the Mosque Committee this Sunday from 09:00 AM to 02:00 PM in the annex hall. Qualified doctors will be present.	\N	f	PENDING	2026-10-30 11:15:20.948	2026-10-30 11:15:20.948
\.


--
-- Data for Name: MasjidBankAccount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidBankAccount" (id, "masjidId", "bankName", "accountNumberLast4", "accountTitle", "accountType", "ifscCode", "upiId", "currentBalance", "isActive", "createdAt") FROM stdin;
91a420f5-13d7-4f69-9e53-6c8c3cbae79c	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	State Bank of India	4912	Jama Masjid Old Delhi Trust General A/C	CURRENT	\N	\N	520000.00	t	2026-10-30 11:20:30.926
bd14370d-124d-4bef-aaac-92610664bf20	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	HDFC Bank	8821	Jama Masjid Old Delhi Zakat & Charity A/C	SAVINGS	\N	\N	250000.00	t	2026-10-30 11:20:30.926
\.


--
-- Data for Name: MasjidDocument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidDocument" (id, "masjidId", title, "fileUrl", type, visibility, status, "uploadedBy", "expiryDate", description, "createdAt", "updatedAt") FROM stdin;
444ae7b5-9489-4de4-afa0-b7b094d46bda	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Official Waqf Board Registration Certificate	https://pdfobject.com/pdf/sample.pdf	Waqf Certificate	PUBLIC	VERIFIED	Haji Maulana Mufti Mukarram	\N	Certified registration document issued by the Central Waqf Council of India.	2026-10-30 11:15:20.806	2026-10-30 11:15:20.806
704c8d78-5a0e-47c0-8203-cac4a6575cfd	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Annual Financial Audit Report 2025-2026	https://pdfobject.com/pdf/sample.pdf	Audit Statement	PRIVATE	VERIFIED	Haji Maulana Mufti Mukarram	\N	Internal financial compliance and audit details reserved for committee members.	2026-10-30 11:15:20.806	2026-10-30 11:15:20.806
9b541751-6bda-4f95-ad89-5b8259ae1c00	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Property & Land Title Deed	https://pdfobject.com/pdf/sample.pdf	Property Deed	PRIVATE	VERIFIED	Haji Maulana Mufti Mukarram	\N	Original land ownership title deed and boundary mapping.	2026-10-30 11:15:20.806	2026-10-30 11:15:20.806
25218874-3f90-4a73-b6e0-12f05b38b0ac	026f387d-c847-4d81-9e7f-14e5ebce03bf	Official Waqf Board Registration Certificate	https://pdfobject.com/pdf/sample.pdf	Waqf Certificate	PUBLIC	VERIFIED	Maulana Qari Abul Qasim	\N	Certified registration document issued by the Central Waqf Council of India.	2026-10-30 11:15:20.87	2026-10-30 11:15:20.87
0cb5e42a-a29e-4640-97dc-25b63796fb39	026f387d-c847-4d81-9e7f-14e5ebce03bf	Annual Financial Audit Report 2025-2026	https://pdfobject.com/pdf/sample.pdf	Audit Statement	PRIVATE	VERIFIED	Maulana Qari Abul Qasim	\N	Internal financial compliance and audit details reserved for committee members.	2026-10-30 11:15:20.87	2026-10-30 11:15:20.87
0738ebb2-f312-429e-877f-40e59b9116d6	026f387d-c847-4d81-9e7f-14e5ebce03bf	Property & Land Title Deed	https://pdfobject.com/pdf/sample.pdf	Property Deed	PRIVATE	VERIFIED	Maulana Qari Abul Qasim	\N	Original land ownership title deed and boundary mapping.	2026-10-30 11:15:20.87	2026-10-30 11:15:20.87
837aa235-e376-46bb-a776-42bf850af65a	9eb37b65-668d-4f06-bc95-45922daec7cd	Official Waqf Board Registration Certificate	https://pdfobject.com/pdf/sample.pdf	Waqf Certificate	PUBLIC	VERIFIED	Peer Farooq Ahmad Waqfi	\N	Certified registration document issued by the Central Waqf Council of India.	2026-10-30 11:15:20.903	2026-10-30 11:15:20.903
95b74ec3-84c2-4b6c-96a4-ca99777e4430	9eb37b65-668d-4f06-bc95-45922daec7cd	Annual Financial Audit Report 2025-2026	https://pdfobject.com/pdf/sample.pdf	Audit Statement	PRIVATE	VERIFIED	Peer Farooq Ahmad Waqfi	\N	Internal financial compliance and audit details reserved for committee members.	2026-10-30 11:15:20.903	2026-10-30 11:15:20.903
b3f765e6-0a22-4496-9f4a-869b324a0ebf	9eb37b65-668d-4f06-bc95-45922daec7cd	Property & Land Title Deed	https://pdfobject.com/pdf/sample.pdf	Property Deed	PRIVATE	VERIFIED	Peer Farooq Ahmad Waqfi	\N	Original land ownership title deed and boundary mapping.	2026-10-30 11:15:20.903	2026-10-30 11:15:20.903
bdffc243-ee61-47e8-be3a-145fe0a39cc5	430e8beb-85d0-430e-882d-9690b77fd2f9	Official Waqf Board Registration Certificate	https://pdfobject.com/pdf/sample.pdf	Waqf Certificate	PUBLIC	VERIFIED	Nawab Mir Sultan Ali Khan	\N	Certified registration document issued by the Central Waqf Council of India.	2026-10-30 11:15:20.937	2026-10-30 11:15:20.937
a14b0a60-733b-407e-af94-28033360a02a	430e8beb-85d0-430e-882d-9690b77fd2f9	Annual Financial Audit Report 2025-2026	https://pdfobject.com/pdf/sample.pdf	Audit Statement	PRIVATE	VERIFIED	Nawab Mir Sultan Ali Khan	\N	Internal financial compliance and audit details reserved for committee members.	2026-10-30 11:15:20.937	2026-10-30 11:15:20.937
431f080b-8a3b-4c4b-8f19-236d92b4a61c	430e8beb-85d0-430e-882d-9690b77fd2f9	Property & Land Title Deed	https://pdfobject.com/pdf/sample.pdf	Property Deed	PRIVATE	VERIFIED	Nawab Mir Sultan Ali Khan	\N	Original land ownership title deed and boundary mapping.	2026-10-30 11:15:20.937	2026-10-30 11:15:20.937
\.


--
-- Data for Name: MasjidDonation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidDonation" (id, "masjidId", "financialYearId", "donationDate", amount, "fundType", "paymentMethod", "receiptNumber", "donorName", "donorPhone", "donorEmail", "donorAddress", description, "chequeNumber", "bankName", "chequeDate", "ddNumber", "upiTransactionId", "utrNumber", status, "createdBy", "createdAt", "updatedAt") FROM stdin;
195b599b-a9c2-4cb9-9809-d0a88fe5eb66	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-18 17:42:00	250000.00	ZAKAT	UPI	REC-JAM-2026-081	Mohammed Imran	+91 98450 11223	imran.m@gmail.com	Nagwara, Bangalore	Annual Zakat Contribution for Widows & Destitute Aid	\N	\N	\N	\N	UPI/20260818/98812039	\N	VERIFIED	Hafiz Zubair (Trustee)	2026-10-30 11:20:30.943	2026-10-30 11:20:30.943
cb2889f5-a308-4ce3-a5c6-264c700581da	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-18 14:15:00	150000.00	GENERAL_FUND	NEFT_RTGS	REC-JAM-2026-082	Syed Zaid Khan	+91 99160 44556	zaid.khan@outlook.com	\N	Masjid Flooring & Wudu Khana Upkeep Support	\N	State Bank of India	\N	\N	\N	SBIN88291048821	VERIFIED	Hafiz Zubair (Trustee)	2026-10-30 11:20:30.943	2026-10-30 11:20:30.943
16173974-785b-40ef-a44a-a99b41e70247	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-14 14:00:00	50000.00	SADAQAH	CASH	REC-JAM-2026-095	Abdul Rahman	+91 97410 77889	\N	\N	Friday Jummah Community Sadaqah	\N	\N	\N	\N	\N	\N	VERIFIED	Hafiz Zubair (Trustee)	2026-10-30 11:20:30.943	2026-10-30 11:20:30.943
a5093aa6-6287-4599-8e4c-499b12b0e5b1	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-01 10:00:00	20000.00	INTEREST_FUND	NEFT_RTGS	REC-JAM-2026-041	Khurram Parvez	+91 98800 33441	\N	\N	Bank Interest Disposal for Public Toilet Upkeep	\N	HDFC Bank	\N	\N	\N	HDFC991204881	VERIFIED	Central Office	2026-10-30 11:20:30.943	2026-10-30 11:20:30.943
56ec69cb-57f8-416a-a4ad-debe4aebbb84	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-10-31 18:24:53.44	2500.00	GENERAL_CHARITY	UPI	REC-2026-99557	Haji Brother Karim	\N	karim@community.org	\N	Public Donation via Campaign: Flood Relief Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-10-31 18:24:53.446	2026-10-31 18:24:53.446
93410772-47b9-464b-9a77-5dfbbc29caa6	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-10-31 18:25:23.865	2500.00	GENERAL_CHARITY	UPI	REC-2026-95712	Haji Brother Karim	\N	karim@community.org	\N	Public Donation via Campaign: Flood Relief Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-10-31 18:25:23.866	2026-10-31 18:25:23.866
ee9d7801-9afe-4ec6-ab5e-acc5461bfaa1	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-11-01 07:40:00.903	1500.00	GENERAL_FUND	UPI	REC-2026-17194	Brother Tariq Al-Mansoor	\N	tariq.mansoor@example.com	\N	Public Donation via Campaign: Jama Masjid Old Delhi General Welfare & Maintenance Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-11-01 07:40:00.914	2026-11-01 07:40:00.914
a5b3af17-812a-4015-a4c9-c39d660dcebc	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-11-01 07:41:20.466	1500.00	GENERAL_FUND	UPI	REC-2026-77463	Brother Tariq Al-Mansoor	\N	tariq.mansoor@example.com	\N	Public Donation via Campaign: Jama Masjid Old Delhi General Welfare & Maintenance Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-11-01 07:41:20.476	2026-11-01 07:41:20.476
594115b9-c1a2-46b2-bcaf-2b75d250796a	430e8beb-85d0-430e-882d-9690b77fd2f9	47c84a0b-5370-48ee-aef4-966db1386dc4	2026-11-01 07:41:20.585	2500.00	GENERAL_FUND	UPI	REC-2026-30987	Sister Amina Begum	\N	amina.begum@example.com	\N	Public Donation via Campaign: Mecca Masjid Hyderabad General Welfare & Maintenance Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-11-01 07:41:20.59	2026-11-01 07:41:20.59
ca5aa0c8-b352-4c32-ae1b-b6b8fef7bc51	430e8beb-85d0-430e-882d-9690b77fd2f9	47c84a0b-5370-48ee-aef4-966db1386dc4	2026-11-01 09:22:24.166	2500.00	GENERAL_CHARITY	UPI	REC-2026-72276	Brother Zayd Testing	\N	zayd.test@example.com	\N	[Donation Type: Charity] Public Donation via Campaign: Mecca Masjid Hyderabad General Welfare & Maintenance Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-11-01 09:22:24.177	2026-11-01 09:22:24.177
c212cfa0-49e8-48fa-9e2c-f121bff33420	430e8beb-85d0-430e-882d-9690b77fd2f9	47c84a0b-5370-48ee-aef4-966db1386dc4	2026-11-01 09:22:24.258	5000.00	OTHER_SOURCES	UPI	REC-2026-41991	Sister Fatima Testing	\N	fatima.test@example.com	\N	[Donation Type: Medical Aid for Musallis] Public Donation via Campaign: Mecca Masjid Hyderabad General Welfare & Maintenance Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-11-01 09:22:24.263	2026-11-01 09:22:24.263
1a370002-6f3b-48b7-8025-4137e03b780b	26c5e07c-4f54-436b-a962-2b67b371d24c	5a37bd1a-6f93-4d84-897d-786868e023cf	2026-11-01 10:01:00.638	1000.00	ZAKAT	UPI	REC-2026-78554	hhh	\N	hhh!@h.com	\N	[Donation Type: Zakat] Public Donation via Campaign: RNM General Welfare & Maintenance Fund	\N	\N	\N	\N	\N	\N	VERIFIED	Public Online Donor	2026-11-01 10:01:00.647	2026-11-01 10:01:00.647
\.


--
-- Data for Name: MasjidEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidEvent" (id, "masjidId", title, category, "eventDate", "eventEndDate", "eventTime", location, description, "imageUrl", "speakerName", "verificationStatus", "createdAt", "updatedAt") FROM stdin;
e358cd3a-5deb-4e63-a0c2-05f352846927	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Weekly Quranic Tafseer Circle by Senior Scholars	QURANIC_CIRCLE	2026-11-02 11:15:20.844	\N	Every Saturday After Maghrib (07:15 PM)	Main Prayer Hall	Comprehensive commentary of Juz Amma focusing on spiritual lessons and daily moral guidance.	\N	Maulana Mufti Mukarram	PENDING	2026-10-30 11:15:20.85	2026-10-30 11:15:20.85
682c3b06-ee41-46a0-b4e9-54c0ad76df52	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	Youth Islamic Character & Leadership Workshop	YOUTH_PROGRAM	2026-11-06 11:15:20.844	\N	Sunday 10:00 AM - 01:00 PM	Mosque Conference Library	Interactive session for high school & college students on balancing modern career ambitions with authentic Islamic ethics.	\N	Adv. Tariq Anwar	PENDING	2026-10-30 11:15:20.85	2026-10-30 11:15:20.85
d1231128-bf17-4fbb-a7f9-6626d852073a	026f387d-c847-4d81-9e7f-14e5ebce03bf	Weekly Quranic Tafseer Circle by Senior Scholars	QURANIC_CIRCLE	2026-11-02 11:15:20.88	\N	Every Saturday After Maghrib (07:15 PM)	Main Prayer Hall	Comprehensive commentary of Juz Amma focusing on spiritual lessons and daily moral guidance.	\N	Maulana Mufti Mukarram	PENDING	2026-10-30 11:15:20.884	2026-10-30 11:15:20.884
35f5b7e7-1245-405b-9fbb-86beaa0cdf2c	026f387d-c847-4d81-9e7f-14e5ebce03bf	Youth Islamic Character & Leadership Workshop	YOUTH_PROGRAM	2026-11-06 11:15:20.88	\N	Sunday 10:00 AM - 01:00 PM	Mosque Conference Library	Interactive session for high school & college students on balancing modern career ambitions with authentic Islamic ethics.	\N	Adv. Tariq Anwar	PENDING	2026-10-30 11:15:20.884	2026-10-30 11:15:20.884
f320bdb8-e56e-4369-9316-7ec496b48264	9eb37b65-668d-4f06-bc95-45922daec7cd	Weekly Quranic Tafseer Circle by Senior Scholars	QURANIC_CIRCLE	2026-11-02 11:15:20.914	\N	Every Saturday After Maghrib (07:15 PM)	Main Prayer Hall	Comprehensive commentary of Juz Amma focusing on spiritual lessons and daily moral guidance.	\N	Maulana Mufti Mukarram	PENDING	2026-10-30 11:15:20.919	2026-10-30 11:15:20.919
09d77be1-cc1d-48fb-be5b-38946a4c32ce	9eb37b65-668d-4f06-bc95-45922daec7cd	Youth Islamic Character & Leadership Workshop	YOUTH_PROGRAM	2026-11-06 11:15:20.914	\N	Sunday 10:00 AM - 01:00 PM	Mosque Conference Library	Interactive session for high school & college students on balancing modern career ambitions with authentic Islamic ethics.	\N	Adv. Tariq Anwar	PENDING	2026-10-30 11:15:20.919	2026-10-30 11:15:20.919
dfc22bd8-e579-4fde-9f7a-e7c91383e513	430e8beb-85d0-430e-882d-9690b77fd2f9	Weekly Quranic Tafseer Circle by Senior Scholars	QURANIC_CIRCLE	2026-11-02 11:15:20.946	\N	Every Saturday After Maghrib (07:15 PM)	Main Prayer Hall	Comprehensive commentary of Juz Amma focusing on spiritual lessons and daily moral guidance.	\N	Maulana Mufti Mukarram	PENDING	2026-10-30 11:15:20.95	2026-10-30 11:15:20.95
eea4dc5c-671f-4789-8965-d4b6f7a892fa	430e8beb-85d0-430e-882d-9690b77fd2f9	Youth Islamic Character & Leadership Workshop	YOUTH_PROGRAM	2026-11-06 11:15:20.946	\N	Sunday 10:00 AM - 01:00 PM	Mosque Conference Library	Interactive session for high school & college students on balancing modern career ambitions with authentic Islamic ethics.	\N	Adv. Tariq Anwar	PENDING	2026-10-30 11:15:20.95	2026-10-30 11:15:20.95
\.


--
-- Data for Name: MasjidExpenditure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidExpenditure" (id, "masjidId", "financialYearId", "expenseDate", category, subcategory, "fundType", description, amount, "paymentMethod", "payeeName", "billInvoiceNumber", "referenceNumber", "billDocumentUrl", "chequeNumber", "bankName", "upiTransactionId", "utrNumber", notes, "disbursedBy", status, "createdBy", "createdAt", "updatedAt") FROM stdin;
94ecffac-851c-44d2-b382-8e9c67b2a600	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-10 10:30:00	GENERAL_ADMINISTRATION	Staff Salary	GENERAL_FUND	Monthly Imam Honorarium / Salary - Aug 2026	35000.00	NEFT_RTGS	Maulana Hafiz Tariq (Head Imam)	VOUCH-SAL-01	\N	\N	\N	State Bank of India	\N	SBIN99281048	Approved by Mutawalli Committee	\N	ACTIVE	Secretary Sahab	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
85645e3f-3e5d-45a8-aaff-4870ba135cc5	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-10 11:00:00	GENERAL_ADMINISTRATION	Staff Salary	GENERAL_FUND	Muezzin & 2 Cleaning Staff Salaries	45000.00	CASH	Bilal Muezzin & Cleaners	VOUCH-SAL-02	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	Secretary Sahab	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
e8b6e51b-d84f-49f6-9ea9-0ba742145bec	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-12 15:15:00	GENERAL_ADMINISTRATION	Electricity	GENERAL_FUND	Main Prayer Hall & Wudu Khana Electricity Bill - Aug	14200.00	UPI	BESCOM Power Distribution	BILL-EB-882109	\N	https://pdfobject.com/pdf/sample.pdf	\N	\N	UPI/BESCOM/88921102	\N	\N	\N	ACTIVE	Accountant	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
667d5299-7b6f-4bb9-ab0b-7fb1960beff7	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-13 14:45:00	GENERAL_ADMINISTRATION	Water	GENERAL_FUND	Monthly Water Supply & Tanker Charges	4800.00	UPI	BWSSB Water Board	BILL-WB-4410	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	Accountant	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
8192731d-eb15-4bc0-adb2-03de9f74e7ad	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-15 16:30:00	GENERAL_ADMINISTRATION	Maintenance	GENERAL_FUND	4 Central AC Unit Deep Servicing & Gas Refill	18500.00	CHEQUE	Al-Noor Electricals & AC Service	INV-ALN-781	\N	\N	CHQ-004918	State Bank of India	\N	\N	\N	\N	ACTIVE	Accountant	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
05a8da27-dab7-470f-b12f-afe59114934d	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-15 09:00:00	FESTIVAL_EXPENSE	Independence Day / Milad Event	GENERAL_FUND	Student Madrasa Gathering, Sweets & Audio System	12000.00	CASH	City Sound & Madrasa Catering	FEST-2026-08	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	Trustee	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
397fe92e-f408-4ab0-9dd6-16eb1fd6a5b1	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-16 17:00:00	CHARITABLE_EXPENSE	Zakat / Sadaqah Needy Aid	ZAKAT	Direct Monthly Ration Kits & Medical Assistance for 50 Destitute Families	65000.00	CASH	Beneficiary Families Register #4	AID-DIST-08	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	Zakat Committee	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
c5ecb1c6-de25-401f-93a0-394c39574c46	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	2026-08-17 13:30:00	MISCELLANEOUS_EXPENSE	Stationery & Cleaning	GENERAL_FUND	Floor Cleaners, Wudu Mats, Phenyl & Register Books	5500.00	CASH	City Mart Wholesale	MISC-0912	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	Accountant	2026-10-30 11:20:30.967	2026-10-30 11:20:30.967
\.


--
-- Data for Name: MasjidFinancialAdjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidFinancialAdjustment" (id, "masjidId", "manualAuditId", amount, type, reason, "documentUrl", remarks, "approvedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: MasjidFinancialYear; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidFinancialYear" (id, "masjidId", "yearName", "startDate", "endDate", "isClosed", "createdAt", "updatedAt") FROM stdin;
c02fa32f-60ac-4f51-a540-79abd88eabf2	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	2026-2027	2026-04-01 00:00:00	2027-03-31 00:00:00	f	2026-10-30 11:20:30.9	2026-10-30 11:20:30.9
5a37bd1a-6f93-4d84-897d-786868e023cf	26c5e07c-4f54-436b-a962-2b67b371d24c	2026-2027	2026-04-01 00:00:00	2027-03-31 00:00:00	f	2026-10-31 05:25:59.821	2026-10-31 05:25:59.821
47c84a0b-5370-48ee-aef4-966db1386dc4	430e8beb-85d0-430e-882d-9690b77fd2f9	2026-2027	2026-04-01 00:00:00	2027-03-31 00:00:00	f	2026-10-31 19:52:29.985	2026-10-31 19:52:29.985
d592bc11-6b2c-4746-9d8e-efbba3140c09	9eb37b65-668d-4f06-bc95-45922daec7cd	2026-2027	2026-04-01 00:00:00	2027-03-31 00:00:00	f	2026-11-01 06:55:53.359	2026-11-01 06:55:53.359
\.


--
-- Data for Name: MasjidManualAudit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidManualAudit" (id, "masjidId", "financialYearId", month, "auditDate", status, "systemOpeningBalance", "actualOpeningBalance", "openingDifference", "systemTotalIncome", "verifiedTotalIncome", "incomeDifference", "systemTotalExpenditure", "verifiedTotalExpenditure", "expenditureDifference", "systemClosingBalance", "verifiedClosingBalance", "systemCashBalance", "actualCashCounted", "cashDifference", "systemBankBalance", "actualBankBalance", "bankDifference", "auditRemarks", "comparisonData", "auditedBy", "approvedBy", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MasjidOpeningBalance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidOpeningBalance" (id, "financialYearId", "masjidId", "cashBalance", "bankBalance", "generalFund", zakat, sadaqah, "generalCharity", "interestFund", "isLocked", notes, "createdAt", "updatedAt") FROM stdin;
ddefac75-df12-4aaa-ac2c-0caf7b579cb5	c02fa32f-60ac-4f51-a540-79abd88eabf2	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	45000.00	725000.00	350000.00	200000.00	120000.00	80000.00	20000.00	t	Audited opening balance carried forward from FY 2025-2026.	2026-10-30 11:20:30.917	2026-10-30 11:20:30.917
90011bc9-e44d-4c96-b2b9-4de565b826d3	5a37bd1a-6f93-4d84-897d-786868e023cf	26c5e07c-4f54-436b-a962-2b67b371d24c	0.00	0.00	0.00	0.00	0.00	0.00	0.00	t	Initial opening balance.	2026-10-31 05:25:59.833	2026-10-31 05:25:59.833
0fe543d8-b46d-4912-aa90-66a16a7a1cd7	47c84a0b-5370-48ee-aef4-966db1386dc4	430e8beb-85d0-430e-882d-9690b77fd2f9	0.00	0.00	0.00	0.00	0.00	0.00	0.00	t	Initial opening balance.	2026-10-31 19:52:30.092	2026-10-31 19:52:30.092
\.


--
-- Data for Name: MasjidOtherIncome; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidOtherIncome" (id, "masjidId", "financialYearId", "sourceName", description, amount, "incomeDate", "paymentMethod", "referenceNumber", "fundType", "collectorName", "documentUrl", status, "createdBy", "createdAt", "updatedAt") FROM stdin;
cedecfa3-d177-48cc-9553-46d8e9df7aa9	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	c02fa32f-60ac-4f51-a540-79abd88eabf2	Water Purifier Sponsorship	Commercial RO Water Plant Sponsorship for Musallees	35000.00	2026-08-12 20:20:00	CASH	OTH-JAM-2026-012	GENERAL_FUND	Imam Sahab	\N	VERIFIED	Imam Sahab	2026-10-30 11:20:30.954	2026-10-30 11:20:30.954
\.


--
-- Data for Name: MasjidProperty; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidProperty" (id, "masjidId", "propertyCustomId", "contactPhone", location, "documentUrl", "monthlyRent", "revenueTotal", status, "verificationStatus", "createdAt", "updatedAt") FROM stdin;
35c7e2cf-a3a1-4003-a7e1-22185bab53d4	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	PROP-JAM-01	+91 11 2326 2154	Chandni Chowk, Old Delhi Commercial Complex	https://pdfobject.com/pdf/sample.pdf	45000.00	540000.00	OCCUPIED	PENDING	2026-10-30 11:15:20.814	2026-10-30 11:15:20.814
61085f5a-7628-4a89-afcd-46eda5b5db8e	026f387d-c847-4d81-9e7f-14e5ebce03bf	PROP-MAS-01	+91 1336 222 124	Darul Uloom Campus, Deoband Commercial Complex	https://pdfobject.com/pdf/sample.pdf	45000.00	540000.00	OCCUPIED	PENDING	2026-10-30 11:15:20.873	2026-10-30 11:15:20.873
c9d79ce2-05fc-4e67-b981-c1a5bd26b696	9eb37b65-668d-4f06-bc95-45922daec7cd	PROP-HAZ-01	+91 194 242 0981	Dal Lake Northern Bank, Srinagar Commercial Complex	https://pdfobject.com/pdf/sample.pdf	45000.00	540000.00	OCCUPIED	PENDING	2026-10-30 11:15:20.906	2026-10-30 11:15:20.906
fd9d562d-6e36-4167-8d71-f05a538218a6	430e8beb-85d0-430e-882d-9690b77fd2f9	PROP-MEC-01	+91 40 2452 3041	Charminar Road, Hyderabad Commercial Complex	https://pdfobject.com/pdf/sample.pdf	45000.00	540000.00	OCCUPIED	PENDING	2026-10-30 11:15:20.94	2026-10-30 11:15:20.94
\.


--
-- Data for Name: MasjidStaff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidStaff" (id, "masjidId", "userId", name, role, contact, salary, "joiningDate", status, "createdAt") FROM stdin;
9ab9b4ba-7021-411d-a646-879672887d14	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	\N	Imam Maulana Jama	IMAM	+91 98765 22222	0	2026-10-30 11:15:20.797	ACTIVE	2026-10-30 11:15:20.797
f53c7d3e-ab72-4e15-a33a-66201586363d	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	\N	Qari Hafiz Ziauddin	MUEZZIN	+91 98765 33333	0	2026-10-30 11:15:20.797	ACTIVE	2026-10-30 11:15:20.797
4aa2f457-d2a6-4c75-b816-7504fe38cc87	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	\N	Al-Haj Rashid Siddiqui	MUTAWALLI	+91 98765 44444	0	2026-10-30 11:15:20.797	ACTIVE	2026-10-30 11:15:20.797
03683c22-ec3e-4c74-859c-cfc38268df6b	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	\N	Adv. Tariq Anwar	LAWYER	+91 98765 55555	0	2026-10-30 11:15:20.797	ACTIVE	2026-10-30 11:15:20.797
3152ee2e-c7cf-440f-8128-80333bdab69c	d4c83fe0-c7f8-4cc4-90f7-390cc747dbe3	\N	Mohd Shakeel Electrician	ELECTRICIAN	+91 98765 66666	0	2026-10-30 11:15:20.797	ACTIVE	2026-10-30 11:15:20.797
d7755523-69ba-407d-ac19-756a871037ce	026f387d-c847-4d81-9e7f-14e5ebce03bf	\N	Imam Maulana Masjid-e-Rasheed	IMAM	+91 98765 22222	0	2026-10-30 11:15:20.867	ACTIVE	2026-10-30 11:15:20.867
c7c9b92a-b97f-4dcb-a00c-cea0eff60c2a	026f387d-c847-4d81-9e7f-14e5ebce03bf	\N	Qari Hafiz Ziauddin	MUEZZIN	+91 98765 33333	0	2026-10-30 11:15:20.867	ACTIVE	2026-10-30 11:15:20.867
5fed8739-db23-4cd7-96de-f3d0874f7a49	026f387d-c847-4d81-9e7f-14e5ebce03bf	\N	Al-Haj Rashid Siddiqui	MUTAWALLI	+91 98765 44444	0	2026-10-30 11:15:20.867	ACTIVE	2026-10-30 11:15:20.867
c009fd52-cd59-45e4-b77d-4b2d7dcc0bc7	026f387d-c847-4d81-9e7f-14e5ebce03bf	\N	Adv. Tariq Anwar	LAWYER	+91 98765 55555	0	2026-10-30 11:15:20.867	ACTIVE	2026-10-30 11:15:20.867
d4a0ee52-e01d-4f31-adf1-b292485b300f	026f387d-c847-4d81-9e7f-14e5ebce03bf	\N	Mohd Shakeel Electrician	ELECTRICIAN	+91 98765 66666	0	2026-10-30 11:15:20.867	ACTIVE	2026-10-30 11:15:20.867
7dd4f392-7b5a-401b-9f0b-4d6ce16aab78	9eb37b65-668d-4f06-bc95-45922daec7cd	\N	Imam Maulana Hazratbal	IMAM	+91 98765 22222	0	2026-10-30 11:15:20.899	ACTIVE	2026-10-30 11:15:20.899
98994644-57c4-4579-a70c-3d482d50b3bd	9eb37b65-668d-4f06-bc95-45922daec7cd	\N	Qari Hafiz Ziauddin	MUEZZIN	+91 98765 33333	0	2026-10-30 11:15:20.899	ACTIVE	2026-10-30 11:15:20.899
5af0d35c-2991-4cae-8ddd-2b02ca450557	9eb37b65-668d-4f06-bc95-45922daec7cd	\N	Al-Haj Rashid Siddiqui	MUTAWALLI	+91 98765 44444	0	2026-10-30 11:15:20.899	ACTIVE	2026-10-30 11:15:20.899
71f342d2-2421-4614-b576-b49e6a8d6cee	9eb37b65-668d-4f06-bc95-45922daec7cd	\N	Adv. Tariq Anwar	LAWYER	+91 98765 55555	0	2026-10-30 11:15:20.899	ACTIVE	2026-10-30 11:15:20.899
e09bf420-00cf-4f39-a08f-ed16de9a6758	9eb37b65-668d-4f06-bc95-45922daec7cd	\N	Mohd Shakeel Electrician	ELECTRICIAN	+91 98765 66666	0	2026-10-30 11:15:20.899	ACTIVE	2026-10-30 11:15:20.899
209ec300-e12e-4f7e-86c6-35fe9217338f	430e8beb-85d0-430e-882d-9690b77fd2f9	\N	Imam Maulana Mecca	IMAM	+91 98765 22222	0	2026-10-30 11:15:20.935	ACTIVE	2026-10-30 11:15:20.935
34be46cf-1703-4dee-b3dd-9c94f61ed9d2	430e8beb-85d0-430e-882d-9690b77fd2f9	\N	Qari Hafiz Ziauddin	MUEZZIN	+91 98765 33333	0	2026-10-30 11:15:20.935	ACTIVE	2026-10-30 11:15:20.935
81e8b321-1abb-49f8-bd96-c96be6c816e8	430e8beb-85d0-430e-882d-9690b77fd2f9	\N	Al-Haj Rashid Siddiqui	MUTAWALLI	+91 98765 44444	0	2026-10-30 11:15:20.935	ACTIVE	2026-10-30 11:15:20.935
e8fe0f4d-bbc9-4206-b07e-517d4211a5fe	430e8beb-85d0-430e-882d-9690b77fd2f9	\N	Adv. Tariq Anwar	LAWYER	+91 98765 55555	0	2026-10-30 11:15:20.935	ACTIVE	2026-10-30 11:15:20.935
1eb89604-cf2f-4280-9ba2-7dd3ba2c0fe2	430e8beb-85d0-430e-882d-9690b77fd2f9	\N	Mohd Shakeel Electrician	ELECTRICIAN	+91 98765 66666	0	2026-10-30 11:15:20.935	ACTIVE	2026-10-30 11:15:20.935
\.


--
-- Data for Name: MasjidTenant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasjidTenant" (id, "propertyId", "tenantCustomId", "tenantName", "contactPhone", "tenantDocUrl", "monthlyRent", "leaseStartDate", "leaseEndDate", status, "createdAt", "updatedAt") FROM stdin;
b2ec65d9-8d1d-435f-ae27-de0350559b31	35c7e2cf-a3a1-4003-a7e1-22185bab53d4	TNT-4808	Al-Barakah Islamic Bookshop & Attar	+91 98111 22334	https://pdfobject.com/pdf/sample.pdf	45000.00	2026-10-30 11:15:20.814	\N	ACTIVE	2026-10-30 11:15:20.814	2026-10-30 11:15:20.814
f582c7bf-f5f0-464a-a700-61a11960b5a2	61085f5a-7628-4a89-afcd-46eda5b5db8e	TNT-7887	Al-Barakah Islamic Bookshop & Attar	+91 98111 22334	https://pdfobject.com/pdf/sample.pdf	45000.00	2026-10-30 11:15:20.873	\N	ACTIVE	2026-10-30 11:15:20.873	2026-10-30 11:15:20.873
f521ac72-caf7-4422-8e77-24c61f9dcf00	c9d79ce2-05fc-4e67-b981-c1a5bd26b696	TNT-6931	Al-Barakah Islamic Bookshop & Attar	+91 98111 22334	https://pdfobject.com/pdf/sample.pdf	45000.00	2026-10-30 11:15:20.906	\N	ACTIVE	2026-10-30 11:15:20.906	2026-10-30 11:15:20.906
7ebff0d0-f923-43a3-97c0-ae963e784e52	fd9d562d-6e36-4167-8d71-f05a538218a6	TNT-6005	Al-Barakah Islamic Bookshop & Attar	+91 98111 22334	https://pdfobject.com/pdf/sample.pdf	45000.00	2026-10-30 11:15:20.94	\N	ACTIVE	2026-10-30 11:15:20.94	2026-10-30 11:15:20.94
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", type, message, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: SavedMasjid; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SavedMasjid" (id, "userId", "masjidId", "createdAt") FROM stdin;
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSetting" (key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "customId", email, "passwordHash", "plainPassword", name, phone, role, avatar, "isEmailVerified", "isApproved", "isSuspended", "emailVerificationToken", "passwordResetToken", "passwordResetExpires", "createdAt", "updatedAt", "deletedAt", "deletedBy", "isDeleted", "masjidId") FROM stdin;
f62ecb8b-adec-410b-bbc7-9d38d59d7bef	SUP-001	superadmin@mosque.org	$2b$10$CAiuRYr1P10E6qgrIRxcI.Mu9XY56559FjGv02Q4vUdCnHKlQFray	admin123	Global Mutawalli Council (Super Admin)	+91 98765 00000	SUPER_ADMIN	\N	t	t	f	\N	\N	\N	2026-10-30 11:15:20.757	2026-10-30 11:15:20.757	\N	\N	f	\N
a1ff1efb-851f-482c-adf3-fb3d55ae245b	ADM-1127	admin.jama@mosque.org	$2b$10$CAiuRYr1P10E6qgrIRxcI.Mu9XY56559FjGv02Q4vUdCnHKlQFray	admin123	Haji Maulana Mufti Mukarram	+91 98765 11111	MASJID_ADMIN	\N	t	t	f	\N	\N	\N	2026-10-30 11:15:20.768	2026-10-30 11:15:20.768	\N	\N	f	\N
2a07ad4d-3f03-4b6f-97ab-5646fb010397	ADM-6365	admin.rasheed@mosque.org	$2b$10$CAiuRYr1P10E6qgrIRxcI.Mu9XY56559FjGv02Q4vUdCnHKlQFray	admin123	Maulana Qari Abul Qasim	+91 98765 11111	MASJID_ADMIN	\N	t	t	f	\N	\N	\N	2026-10-30 11:15:20.858	2026-10-30 11:15:20.858	\N	\N	f	\N
7950e646-9005-4435-8868-4e7b1082140f	ADM-3465	admin.hazratbal@mosque.org	$2b$10$CAiuRYr1P10E6qgrIRxcI.Mu9XY56559FjGv02Q4vUdCnHKlQFray	admin123	Peer Farooq Ahmad Waqfi	+91 98765 11111	MASJID_ADMIN	\N	t	t	f	\N	\N	\N	2026-10-30 11:15:20.887	2026-10-30 11:15:20.887	\N	\N	f	\N
55e3f350-64dd-4e2a-8823-ef28b5fa2caf	ADM-1076	admin.mecca@mosque.org	$2b$10$CAiuRYr1P10E6qgrIRxcI.Mu9XY56559FjGv02Q4vUdCnHKlQFray	admin123	Nawab Mir Sultan Ali Khan	+91 98765 11111	MASJID_ADMIN	\N	t	t	f	\N	\N	\N	2026-10-30 11:15:20.922	2026-10-30 11:15:20.922	\N	\N	f	\N
634d383e-cfd5-4580-aad8-d93ff23680ce	USR-8038	user.tariq@gmail.com	$2b$10$JXSMmpw01HepvBKbqNhXp.sSAcwBMYCmvI8emZWE6mLiAnOc6NZQa	user123	Tariq Mahmood	+91 98100 11223	USER	\N	t	t	f	\N	\N	\N	2026-10-30 11:15:20.953	2026-10-30 11:15:20.953	\N	\N	f	\N
48ba5623-d290-466a-b8bb-e77ab6bc2126	USR-6166	user.fatima@gmail.com	$2b$10$JXSMmpw01HepvBKbqNhXp.sSAcwBMYCmvI8emZWE6mLiAnOc6NZQa	user123	Fatima Noor	+91 98100 44556	USER	\N	t	t	f	\N	\N	\N	2026-10-30 11:15:20.956	2026-10-30 11:15:20.956	\N	\N	f	\N
9f6a80de-7938-41b4-bcda-9ee02e682687	HUB83056	rn@rn.com	$2b$10$Cbxe5vR6MkyS7SVxyCrnuuHHmjmkAsgyojrcMNP9A03gTAkz9YsTC	rn123	RN	9999977777	MASJID_ADMIN	\N	t	t	f	\N	\N	\N	2026-10-31 05:25:59.79	2026-10-31 05:25:59.79	\N	\N	f	\N
b83b47cc-4ac4-4192-ba24-a9bde3ecb173	USR66019	rnn@rnn.com	$2b$10$LbZErA./gHYRKpCNQDQ.4.aR4qFNkLPP5Tg46x7iYW.8anxnJHR2a	rnn123	rnn	919999955555	USER	\N	t	t	f	\N	\N	\N	2026-10-31 18:29:10.54	2026-10-31 18:32:54.721	\N	\N	f	430e8beb-85d0-430e-882d-9690b77fd2f9
e7147cb5-effe-49c4-a5f3-fc6383823efd	USR31291	testuser_1793475867430@example.com	$2b$10$mFQxDMcYwvGd80g9P9pRzu9gghF.mFLSxpYzCoqz20rAR50XDhh8m	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-10-31 19:44:27.578	2026-10-31 19:44:27.578	\N	\N	f	\N
1678abea-52a0-48bc-9d79-9a0e9f558f78	USR20502	testuser_1793475939052@example.com	$2b$10$737G8o02tIb6tDq4174vj.nJDTz9TgJSq3cO3A7GrgofjqyxOg.5K	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-10-31 19:45:39.13	2026-10-31 19:45:39.13	\N	\N	f	\N
1613b189-281f-4a24-ae31-effbffea7255	USR72637	testuser_1793518926162@example.com	$2b$10$opDSOrVMsGNsb/eZxLi04e31/o2wzHpci4Yv145lBtNVU7Rxs61WG	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 07:42:06.551	2026-11-01 07:42:06.551	\N	\N	f	\N
8c144876-3d6b-4ce9-a878-0ffbd1a6a792	USR42909	testuser_1793524956763@example.com	$2b$10$aGv3jykWkOe6JCIpnxU4h.1zMY.XcvQSA2JUmcdib25SNKS7qa2oi	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 09:22:36.991	2026-11-01 09:22:36.991	\N	\N	f	\N
eca9403d-31b8-4a36-9ed7-78e8ec7991d9	USR69011	testuser_1793534830851@example.com	$2b$10$K550v2QOydubqq72xeUj5utPfEgi0MKLi57T1aLTLzQD4MuQOnLvi	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 12:07:10.981	2026-11-01 12:07:10.981	\N	\N	f	\N
0eb045d5-3b27-4f77-800f-996543225b7f	USR22397	testuser_1793535263070@example.com	$2b$10$gjL8gd9qrdK.xJeL9.y.YOS0xjqL9WgF8wrYzjH7w8MDvzrY/z3vi	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 12:14:23.244	2026-11-01 12:14:23.244	\N	\N	f	\N
aaac1d92-0f48-4427-8dc8-142672ba1b44	USR53899	testuser_1793535841254@example.com	$2b$10$hPGD4aB8b8AfEKCJu/EjAeCLWMP35I79POxHemJaOE5fObHE0wxEG	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 12:24:01.77	2026-11-01 12:24:01.77	\N	\N	f	\N
7605af32-8e8f-45de-af4f-4368ba448582	USR67047	testuser_1793537222712@example.com	$2b$10$sj7lq4MncnbmWNy.PL.FAuYG9/NK3iypq4uuRa3C26e3XrfEMemBy	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 12:47:03.009	2026-11-01 12:47:03.009	\N	\N	f	\N
74318926-0610-465b-b7ec-2ab692692dc4	USR23373	testuser_1793537384675@example.com	$2b$10$/iOeQgNn6oZcxt.4h..AaueJNc9qy//G9NFnDOtx/kb75hCk6KEHC	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 12:49:44.821	2026-11-01 12:49:44.821	\N	\N	f	\N
7d3adcf2-3923-429a-a78e-121a741624c7	USR75398	testuser_1793542530156@example.com	$2b$10$Yu/2oDVbwfeH690CmSJA8OZyQNM/ZAMF3/vVVmDtxghsai/HT37q6	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 14:15:30.299	2026-11-01 14:15:30.299	\N	\N	f	\N
2b5f3b8f-9374-470e-906b-251dff952b99	USR30175	testuser_1793542573133@example.com	$2b$10$.hmMTQJjyHTFXyo4IGk0cOwJ4DvBDuCi4vNTyovwE3oZmQ4J5G20W	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 14:16:13.243	2026-11-01 14:16:13.243	\N	\N	f	\N
3f4ca334-440b-4fc0-ad10-f21bca77b6e7	USR27832	testuser_1793543192105@example.com	$2b$10$sLowvgwwmSPcMZs.Sfb33ePnMjAN21w/flMlooy.5XMOXz0LDe7wG	password123	Test Worshipper	+91 99999 88888	USER	\N	t	t	f	\N	\N	\N	2026-11-01 14:26:32.237	2026-11-01 14:26:32.237	\N	\N	f	\N
\.


--
-- Name: Advertisement Advertisement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Advertisement"
    ADD CONSTRAINT "Advertisement_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: City City_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);


--
-- Name: CommunityAd CommunityAd_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommunityAd"
    ADD CONSTRAINT "CommunityAd_pkey" PRIMARY KEY (id);


--
-- Name: DonationCampaign DonationCampaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DonationCampaign"
    ADD CONSTRAINT "DonationCampaign_pkey" PRIMARY KEY (id);


--
-- Name: DonationRecord DonationRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DonationRecord"
    ADD CONSTRAINT "DonationRecord_pkey" PRIMARY KEY (id);


--
-- Name: FinancialAuditLog FinancialAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialAuditLog"
    ADD CONSTRAINT "FinancialAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: MasjidAdditionRequest MasjidAdditionRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidAdditionRequest"
    ADD CONSTRAINT "MasjidAdditionRequest_pkey" PRIMARY KEY (id);


--
-- Name: MasjidAdminApplication MasjidAdminApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidAdminApplication"
    ADD CONSTRAINT "MasjidAdminApplication_pkey" PRIMARY KEY (id);


--
-- Name: MasjidAdminPermission MasjidAdminPermission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidAdminPermission"
    ADD CONSTRAINT "MasjidAdminPermission_pkey" PRIMARY KEY (id);


--
-- Name: MasjidAnnouncement MasjidAnnouncement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidAnnouncement"
    ADD CONSTRAINT "MasjidAnnouncement_pkey" PRIMARY KEY (id);


--
-- Name: MasjidBankAccount MasjidBankAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidBankAccount"
    ADD CONSTRAINT "MasjidBankAccount_pkey" PRIMARY KEY (id);


--
-- Name: MasjidDocument MasjidDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidDocument"
    ADD CONSTRAINT "MasjidDocument_pkey" PRIMARY KEY (id);


--
-- Name: MasjidDonation MasjidDonation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidDonation"
    ADD CONSTRAINT "MasjidDonation_pkey" PRIMARY KEY (id);


--
-- Name: MasjidEvent MasjidEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidEvent"
    ADD CONSTRAINT "MasjidEvent_pkey" PRIMARY KEY (id);


--
-- Name: MasjidExpenditure MasjidExpenditure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidExpenditure"
    ADD CONSTRAINT "MasjidExpenditure_pkey" PRIMARY KEY (id);


--
-- Name: MasjidFinancialAdjustment MasjidFinancialAdjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidFinancialAdjustment"
    ADD CONSTRAINT "MasjidFinancialAdjustment_pkey" PRIMARY KEY (id);


--
-- Name: MasjidFinancialYear MasjidFinancialYear_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidFinancialYear"
    ADD CONSTRAINT "MasjidFinancialYear_pkey" PRIMARY KEY (id);


--
-- Name: MasjidManualAudit MasjidManualAudit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidManualAudit"
    ADD CONSTRAINT "MasjidManualAudit_pkey" PRIMARY KEY (id);


--
-- Name: MasjidOpeningBalance MasjidOpeningBalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidOpeningBalance"
    ADD CONSTRAINT "MasjidOpeningBalance_pkey" PRIMARY KEY (id);


--
-- Name: MasjidOtherIncome MasjidOtherIncome_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidOtherIncome"
    ADD CONSTRAINT "MasjidOtherIncome_pkey" PRIMARY KEY (id);


--
-- Name: MasjidProperty MasjidProperty_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidProperty"
    ADD CONSTRAINT "MasjidProperty_pkey" PRIMARY KEY (id);


--
-- Name: MasjidStaff MasjidStaff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidStaff"
    ADD CONSTRAINT "MasjidStaff_pkey" PRIMARY KEY (id);


--
-- Name: MasjidTenant MasjidTenant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidTenant"
    ADD CONSTRAINT "MasjidTenant_pkey" PRIMARY KEY (id);


--
-- Name: Masjid Masjid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Masjid"
    ADD CONSTRAINT "Masjid_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: SavedMasjid SavedMasjid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedMasjid"
    ADD CONSTRAINT "SavedMasjid_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (key);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Advertisement_displayOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Advertisement_displayOrder_idx" ON public."Advertisement" USING btree ("displayOrder");


--
-- Name: Advertisement_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Advertisement_isActive_idx" ON public."Advertisement" USING btree ("isActive");


--
-- Name: Advertisement_isExclusive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Advertisement_isExclusive_idx" ON public."Advertisement" USING btree ("isExclusive");


--
-- Name: Advertisement_isTest_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Advertisement_isTest_idx" ON public."Advertisement" USING btree ("isTest");


--
-- Name: Advertisement_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Advertisement_masjidId_idx" ON public."Advertisement" USING btree ("masjidId");


--
-- Name: Advertisement_placement_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Advertisement_placement_idx" ON public."Advertisement" USING btree (placement);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: City_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "City_name_key" ON public."City" USING btree (name);


--
-- Name: City_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "City_slug_key" ON public."City" USING btree (slug);


--
-- Name: CommunityAd_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CommunityAd_category_idx" ON public."CommunityAd" USING btree (category);


--
-- Name: CommunityAd_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CommunityAd_status_idx" ON public."CommunityAd" USING btree (status);


--
-- Name: DonationCampaign_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DonationCampaign_category_idx" ON public."DonationCampaign" USING btree (category);


--
-- Name: DonationCampaign_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DonationCampaign_masjidId_idx" ON public."DonationCampaign" USING btree ("masjidId");


--
-- Name: DonationCampaign_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DonationCampaign_status_idx" ON public."DonationCampaign" USING btree (status);


--
-- Name: DonationRecord_campaignId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DonationRecord_campaignId_idx" ON public."DonationRecord" USING btree ("campaignId");


--
-- Name: DonationRecord_donorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DonationRecord_donorId_idx" ON public."DonationRecord" USING btree ("donorId");


--
-- Name: DonationRecord_receiptNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DonationRecord_receiptNumber_idx" ON public."DonationRecord" USING btree ("receiptNumber");


--
-- Name: DonationRecord_receiptNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DonationRecord_receiptNumber_key" ON public."DonationRecord" USING btree ("receiptNumber");


--
-- Name: FinancialAuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialAuditLog_action_idx" ON public."FinancialAuditLog" USING btree (action);


--
-- Name: FinancialAuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialAuditLog_createdAt_idx" ON public."FinancialAuditLog" USING btree ("createdAt");


--
-- Name: FinancialAuditLog_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialAuditLog_masjidId_idx" ON public."FinancialAuditLog" USING btree ("masjidId");


--
-- Name: MasjidAdditionRequest_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAdditionRequest_createdAt_idx" ON public."MasjidAdditionRequest" USING btree ("createdAt");


--
-- Name: MasjidAdditionRequest_customId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasjidAdditionRequest_customId_key" ON public."MasjidAdditionRequest" USING btree ("customId");


--
-- Name: MasjidAdditionRequest_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAdditionRequest_status_idx" ON public."MasjidAdditionRequest" USING btree (status);


--
-- Name: MasjidAdminApplication_applicantEmail_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAdminApplication_applicantEmail_idx" ON public."MasjidAdminApplication" USING btree ("applicantEmail");


--
-- Name: MasjidAdminApplication_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAdminApplication_createdAt_idx" ON public."MasjidAdminApplication" USING btree ("createdAt");


--
-- Name: MasjidAdminApplication_customId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasjidAdminApplication_customId_key" ON public."MasjidAdminApplication" USING btree ("customId");


--
-- Name: MasjidAdminApplication_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAdminApplication_status_idx" ON public."MasjidAdminApplication" USING btree (status);


--
-- Name: MasjidAdminPermission_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAdminPermission_masjidId_idx" ON public."MasjidAdminPermission" USING btree ("masjidId");


--
-- Name: MasjidAdminPermission_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAdminPermission_userId_idx" ON public."MasjidAdminPermission" USING btree ("userId");


--
-- Name: MasjidAdminPermission_userId_masjidId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasjidAdminPermission_userId_masjidId_key" ON public."MasjidAdminPermission" USING btree ("userId", "masjidId");


--
-- Name: MasjidAnnouncement_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAnnouncement_category_idx" ON public."MasjidAnnouncement" USING btree (category);


--
-- Name: MasjidAnnouncement_isImportant_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAnnouncement_isImportant_idx" ON public."MasjidAnnouncement" USING btree ("isImportant");


--
-- Name: MasjidAnnouncement_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidAnnouncement_masjidId_idx" ON public."MasjidAnnouncement" USING btree ("masjidId");


--
-- Name: MasjidBankAccount_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidBankAccount_masjidId_idx" ON public."MasjidBankAccount" USING btree ("masjidId");


--
-- Name: MasjidDocument_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidDocument_masjidId_idx" ON public."MasjidDocument" USING btree ("masjidId");


--
-- Name: MasjidDocument_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidDocument_status_idx" ON public."MasjidDocument" USING btree (status);


--
-- Name: MasjidDocument_visibility_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidDocument_visibility_idx" ON public."MasjidDocument" USING btree (visibility);


--
-- Name: MasjidDonation_fundType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidDonation_fundType_idx" ON public."MasjidDonation" USING btree ("fundType");


--
-- Name: MasjidDonation_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidDonation_masjidId_idx" ON public."MasjidDonation" USING btree ("masjidId");


--
-- Name: MasjidDonation_masjidId_receiptNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasjidDonation_masjidId_receiptNumber_key" ON public."MasjidDonation" USING btree ("masjidId", "receiptNumber");


--
-- Name: MasjidDonation_receiptNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidDonation_receiptNumber_idx" ON public."MasjidDonation" USING btree ("receiptNumber");


--
-- Name: MasjidEvent_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidEvent_category_idx" ON public."MasjidEvent" USING btree (category);


--
-- Name: MasjidEvent_eventDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidEvent_eventDate_idx" ON public."MasjidEvent" USING btree ("eventDate");


--
-- Name: MasjidEvent_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidEvent_masjidId_idx" ON public."MasjidEvent" USING btree ("masjidId");


--
-- Name: MasjidExpenditure_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidExpenditure_category_idx" ON public."MasjidExpenditure" USING btree (category);


--
-- Name: MasjidExpenditure_fundType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidExpenditure_fundType_idx" ON public."MasjidExpenditure" USING btree ("fundType");


--
-- Name: MasjidExpenditure_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidExpenditure_masjidId_idx" ON public."MasjidExpenditure" USING btree ("masjidId");


--
-- Name: MasjidFinancialAdjustment_manualAuditId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidFinancialAdjustment_manualAuditId_idx" ON public."MasjidFinancialAdjustment" USING btree ("manualAuditId");


--
-- Name: MasjidFinancialAdjustment_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidFinancialAdjustment_masjidId_idx" ON public."MasjidFinancialAdjustment" USING btree ("masjidId");


--
-- Name: MasjidFinancialYear_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidFinancialYear_masjidId_idx" ON public."MasjidFinancialYear" USING btree ("masjidId");


--
-- Name: MasjidFinancialYear_masjidId_yearName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasjidFinancialYear_masjidId_yearName_key" ON public."MasjidFinancialYear" USING btree ("masjidId", "yearName");


--
-- Name: MasjidManualAudit_masjidId_financialYearId_month_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasjidManualAudit_masjidId_financialYearId_month_key" ON public."MasjidManualAudit" USING btree ("masjidId", "financialYearId", month);


--
-- Name: MasjidManualAudit_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidManualAudit_masjidId_idx" ON public."MasjidManualAudit" USING btree ("masjidId");


--
-- Name: MasjidOpeningBalance_financialYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidOpeningBalance_financialYearId_idx" ON public."MasjidOpeningBalance" USING btree ("financialYearId");


--
-- Name: MasjidOpeningBalance_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidOpeningBalance_masjidId_idx" ON public."MasjidOpeningBalance" USING btree ("masjidId");


--
-- Name: MasjidOtherIncome_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidOtherIncome_masjidId_idx" ON public."MasjidOtherIncome" USING btree ("masjidId");


--
-- Name: MasjidProperty_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidProperty_masjidId_idx" ON public."MasjidProperty" USING btree ("masjidId");


--
-- Name: MasjidProperty_propertyCustomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidProperty_propertyCustomId_idx" ON public."MasjidProperty" USING btree ("propertyCustomId");


--
-- Name: MasjidStaff_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidStaff_masjidId_idx" ON public."MasjidStaff" USING btree ("masjidId");


--
-- Name: MasjidStaff_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidStaff_role_idx" ON public."MasjidStaff" USING btree (role);


--
-- Name: MasjidTenant_propertyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidTenant_propertyId_idx" ON public."MasjidTenant" USING btree ("propertyId");


--
-- Name: MasjidTenant_tenantCustomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MasjidTenant_tenantCustomId_idx" ON public."MasjidTenant" USING btree ("tenantCustomId");


--
-- Name: Masjid_cityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Masjid_cityId_idx" ON public."Masjid" USING btree ("cityId");


--
-- Name: Masjid_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Masjid_name_idx" ON public."Masjid" USING btree (name);


--
-- Name: Masjid_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Masjid_slug_key" ON public."Masjid" USING btree (slug);


--
-- Name: Masjid_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Masjid_status_idx" ON public."Masjid" USING btree (status);


--
-- Name: Notification_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_isRead_idx" ON public."Notification" USING btree ("isRead");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: SavedMasjid_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SavedMasjid_masjidId_idx" ON public."SavedMasjid" USING btree ("masjidId");


--
-- Name: SavedMasjid_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SavedMasjid_userId_idx" ON public."SavedMasjid" USING btree ("userId");


--
-- Name: SavedMasjid_userId_masjidId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SavedMasjid_userId_masjidId_key" ON public."SavedMasjid" USING btree ("userId", "masjidId");


--
-- Name: User_customId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_customId_key" ON public."User" USING btree ("customId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_isDeleted_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_isDeleted_idx" ON public."User" USING btree ("isDeleted");


--
-- Name: User_masjidId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_masjidId_idx" ON public."User" USING btree ("masjidId");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Advertisement Advertisement_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Advertisement"
    ADD CONSTRAINT "Advertisement_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DonationCampaign DonationCampaign_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DonationCampaign"
    ADD CONSTRAINT "DonationCampaign_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DonationRecord DonationRecord_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DonationRecord"
    ADD CONSTRAINT "DonationRecord_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."DonationCampaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DonationRecord DonationRecord_donorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DonationRecord"
    ADD CONSTRAINT "DonationRecord_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FinancialAuditLog FinancialAuditLog_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialAuditLog"
    ADD CONSTRAINT "FinancialAuditLog_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidAdminPermission MasjidAdminPermission_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidAdminPermission"
    ADD CONSTRAINT "MasjidAdminPermission_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidAdminPermission MasjidAdminPermission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidAdminPermission"
    ADD CONSTRAINT "MasjidAdminPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidAnnouncement MasjidAnnouncement_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidAnnouncement"
    ADD CONSTRAINT "MasjidAnnouncement_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidBankAccount MasjidBankAccount_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidBankAccount"
    ADD CONSTRAINT "MasjidBankAccount_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidDocument MasjidDocument_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidDocument"
    ADD CONSTRAINT "MasjidDocument_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidDonation MasjidDonation_financialYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidDonation"
    ADD CONSTRAINT "MasjidDonation_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES public."MasjidFinancialYear"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidDonation MasjidDonation_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidDonation"
    ADD CONSTRAINT "MasjidDonation_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidEvent MasjidEvent_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidEvent"
    ADD CONSTRAINT "MasjidEvent_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidExpenditure MasjidExpenditure_financialYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidExpenditure"
    ADD CONSTRAINT "MasjidExpenditure_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES public."MasjidFinancialYear"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidExpenditure MasjidExpenditure_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidExpenditure"
    ADD CONSTRAINT "MasjidExpenditure_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidFinancialAdjustment MasjidFinancialAdjustment_manualAuditId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidFinancialAdjustment"
    ADD CONSTRAINT "MasjidFinancialAdjustment_manualAuditId_fkey" FOREIGN KEY ("manualAuditId") REFERENCES public."MasjidManualAudit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidFinancialAdjustment MasjidFinancialAdjustment_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidFinancialAdjustment"
    ADD CONSTRAINT "MasjidFinancialAdjustment_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidFinancialYear MasjidFinancialYear_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidFinancialYear"
    ADD CONSTRAINT "MasjidFinancialYear_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidManualAudit MasjidManualAudit_financialYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidManualAudit"
    ADD CONSTRAINT "MasjidManualAudit_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES public."MasjidFinancialYear"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidManualAudit MasjidManualAudit_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidManualAudit"
    ADD CONSTRAINT "MasjidManualAudit_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidOpeningBalance MasjidOpeningBalance_financialYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidOpeningBalance"
    ADD CONSTRAINT "MasjidOpeningBalance_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES public."MasjidFinancialYear"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidOtherIncome MasjidOtherIncome_financialYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidOtherIncome"
    ADD CONSTRAINT "MasjidOtherIncome_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES public."MasjidFinancialYear"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidOtherIncome MasjidOtherIncome_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidOtherIncome"
    ADD CONSTRAINT "MasjidOtherIncome_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidProperty MasjidProperty_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidProperty"
    ADD CONSTRAINT "MasjidProperty_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidStaff MasjidStaff_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidStaff"
    ADD CONSTRAINT "MasjidStaff_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasjidStaff MasjidStaff_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidStaff"
    ADD CONSTRAINT "MasjidStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MasjidTenant MasjidTenant_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasjidTenant"
    ADD CONSTRAINT "MasjidTenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."MasjidProperty"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Masjid Masjid_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Masjid"
    ADD CONSTRAINT "Masjid_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedMasjid SavedMasjid_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedMasjid"
    ADD CONSTRAINT "SavedMasjid_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedMasjid SavedMasjid_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedMasjid"
    ADD CONSTRAINT "SavedMasjid_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_masjidId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES public."Masjid"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict CJQohnBo789GNapuZZcKCOG2WpyCxAjU0Uvx9OGYorQDCQDnNVhrNNW2xNoqPa2

