# MOSQUE — Masjid Management & Committee Platform

A full-stack digital platform for Islamic committees, Masjid administrators, and community members to manage Mosque operations, Iqamah schedules, announcements, events, Sadaqah/Zakat donations, committee assets, and the Ads Buzz partner network.

---

## 🚀 Key Modules & Architecture

- **Masjid Admin Operations**:
  - **Masjid Setting**: Mosque Profile & Details, Daily Iqamah Schedule (configurable start & end times), Committee Members, Staff & Leadership, Roles & Permissions, and Admin Ads Buzz.
  - **Activity Setting**: Announcements, Events & Classes, Media Gallery.
  - **Assets Setting**: Documents & Waqf Assets, Property & Tenants.
  - **Donations & Financial**: Inflow Ledger, Expenditure Tracking, Manual Audit, and Support/Donation Popup with customizable donation types and PDF receipt generation.
- **Super Admin Governance**:
  - Global Masjid Module Access Matrix (feature toggles per Masjid for 12+ administrative modules).
  - Admin Verification Queue & approvals.
  - Ads Buzz Manager (Solo Takeover, Full Width, Dual Half Grid, and Quad Grid).
- **Public Community Portal**:
  - Verified Masjids Directory with search and filtering.
  - Dynamic Two-Column Layout integrating live community sponsor promotions with zero layout shift.
  - Interactive Iqamah Schedule viewer.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components & Client Components)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS (Traditional Emerald Green `#194331` and Antique Gold `#BF8B36`)
- **Authentication**: JWT with Role-Based Access Control (RBAC) & HTTP-Only Secure Cookies

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- PostgreSQL 14+ running locally or in the cloud

### 2. Installation
```bash
git clone https://github.com/inkworldwide/dev-masjid.git
cd dev-masjid
npm install
```

### 3. Environment Configuration
Copy the sample environment file and configure your credentials:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL database URL:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/masjid_db?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🗄️ Database Setup & Restoration

The repository includes both a **full PostgreSQL database dump** and **Prisma schema & seed scripts**.

### Option A: Restore Full Database Backup (Recommended)
This restores all tables, enums, verified Masjids, prayer schedules, campaigns, and live community campaigns instantly:
```bash
# Create database if not exists
createdb -U postgres masjid_db

# Restore backup
psql -U postgres -d masjid_db -f prisma/masjid_db_backup.sql
```

### Option B: Prisma Schema Push & Seed
```bash
npx prisma db push
npx ts-node --transpile-only prisma/seed.ts
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@mosque.org` | `admin123` |
| **Masjid Admin (Jama Masjid)** | `admin.jama@mosque.org` | `admin123` |
| **Masjid Admin (Mecca Masjid)** | `admin.mecca@mosque.org` | `admin123` |
| **Committee Member** | `user.tariq@gmail.com` | `password123` |

---

## 🧪 Testing & Development

Run development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Run automated smoke tests (26/26 comprehensive tests):
```bash
npm run test:smoke
```
Validate TypeScript types:
```bash
npx tsc --noEmit
```
