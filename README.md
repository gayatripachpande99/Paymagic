# PayMagic - Enterprise Debt Recovery Platform

PayMagic is an enterprise-grade fintech loan recovery platform built with strict adherence to the canonical **PayMagic Platform Architecture Report**.

---

## 🏛️ Repository Architecture

The repository is organized into two core decoupled applications:

```
├── frontend/             # Single-Page Application (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/   # Navbar, HomePage, AdminPortalShell, EmployeePortalShell, ThemeToggle
│   │   ├── services/     # Unified API Client
│   │   ├── App.jsx       # Routing, Session, and Theme Engine
│   │   └── App.css       # Design System Tokens (Light & Dark Theme)
│   └── package.json
│
└── backend/              # Node.js + Express ES Module API Server
    ├── config/           # Database Connection & In-Memory Relational Engine
    ├── controllers/      # Admin, Employee, and Unified Auth Handlers
    ├── middleware/       # JWT Authentication & Role-Based Access Control (RBAC)
    ├── routes/           # Admin, Employee, and Auth Endpoints
    ├── scripts/          # Direct Module & API Verification Suite
    └── server.js         # Server Entry Point & WebSocket Bridge
```

---

## 🚀 Key Platform Features

1. **Clean Public Landing Experience**:
   - Single unified **Home Page** with comprehensive service overviews, compliance badges, leadership credentials, and enterprise enquiry form.
   - Header with **Only ONE Login Button** opening a modal supporting Email or Employee ID, Password, and 1-click Quick Demo logins.
   - Dynamic **Light and Dark Theme Switcher** with persistent state across all screens.

2. **Single Relational Database — Single Source of Truth**:
   - Admin Panel, Supervisor Workspace, and Employee Portal read and write to the same relational schema.
   - Zero duplicated databases; all state transitions update instantly in real time.

3. **Decoupled Campaign Membership & Unbroken Lineage**:
   - Lineage model: `Organization -> Allocator -> Allocation -> Campaign -> Agent/Group -> Accounts`.
   - Removing an agent from a campaign does not orphan case history, notes, or evidence recordings.

4. **8 Algorithmic Allocation Strategies**:
   - `EQUAL_COUNT`, `OUTSTANDING_BALANCE`, `PRIORITY_BASED`, `DPD_TIER`, `GEOGRAPHIC_AREA`, `EMPLOYEE_CAPACITY`, `SHIFT_STATUS`, and `AGENT_CHANNEL`.

5. **Dual-Control Payment Verification Desk (Invariant 5)**:
   - When an agent records a payment claim, it enters `PENDING_VERIFICATION` status.
   - Balances and recovery realization metrics only update after authorized Supervisor approval, producing an immutable transaction in `payment_ledger`.

6. **Ground Field Recovery & GPS Radar**:
   - Live field route visit lists with on-site GPS check-ins, geo-deviation logging, and on-the-spot digital receipt generation.
   - End-of-day supervisor cash handover reconciliation against bank teller deposit slips.

7. **Voice Telephony CDR & Evidence Vault**:
   - Automated softphone call recording with waveform audio player.
   - Strict adherence to RBI fair practice calling hours (**08:00 - 19:00 IST**).

---

## 💻 Getting Started

### 1. Prerequisites
- **Node.js** v20.x or higher
- **npm** or **pnpm**

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Web application starts on http://localhost:5173
```

### 4. Run End-to-End Test Suite
```bash
node backend/scripts/verifyEndpoints.js
# Asserts all 27 unit tests across Admin, Field, Telephony, and Employee modules
```

---

## 🔑 Demo Access Accounts

| Role | Employee ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `PM-ADM-0001` | `Admin@123` | Executive Command & Full Admin Operations |
| **Operations Supervisor** | `PM-SUP-0001` | `Admin@123` | Dual-Control Verification, Allocation, & Radar |
| **Recovery Telecaller** | `PM-CAL-0001` | `Emp@123` | Working Queue, Softphone, & Dispositions |
| **Field Recovery Officer**| `PM-FLD-0001` | `Emp@123` | Ground Field Route, GPS Check-in, & Spot Cash |
