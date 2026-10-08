# PayMagic Backend Service

This is the Express backend service for the PayMagic enterprise portal.

## Features
- **Role-Based Authentication**: Secure JWT endpoints for Admin and Employee sign-in.
- **Biometric Attendance Tracking**: Real-time check-in, check-out, working hours calculation, and history logs.
- **Admin Management API**: Staff directory, credential retrieval, live attendance KPI summaries, and employee onboarding.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
JWT_SECRET=paymagic_super_secret_jwt_key_2026
```

### 3. Run Development Server
```bash
npm run dev
```

Or start standard Node server:
```bash
npm start
```
The server will run at `http://localhost:5000`.
