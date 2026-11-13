-- PayMagic Enterprise Loan Recovery Schema Migration 001
-- PostgreSQL 14+ compatible normalized relational schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL REFERENCES roles(id),
  department VARCHAR(100) DEFAULT 'Recovery Operations',
  designation VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  refresh_token_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMPLOYEES PROFILE (Extends users with recovery operational metrics)
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  assigned_target NUMERIC(14, 2) DEFAULT 100000.00,
  current_recovery NUMERIC(14, 2) DEFAULT 0.00,
  max_workload_capacity INTEGER DEFAULT 150,
  active_cases_count INTEGER DEFAULT 0,
  shift_status VARCHAR(30) DEFAULT 'OFF_SHIFT', -- OFF_SHIFT, ON_SHIFT, ON_BREAK
  telephony_agent_id VARCHAR(100),
  location_zone VARCHAR(100) DEFAULT 'West Hub',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS (Borrowers)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  customer_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone_masked VARCHAR(20) NOT NULL,
  phone_raw VARCHAR(20) NOT NULL, -- Encrypted/restricted
  alternate_phone VARCHAR(20),
  email VARCHAR(255),
  current_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  credit_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. IMPORT BATCHES
CREATE TABLE IF NOT EXISTS import_batches (
  id VARCHAR(64) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(64) REFERENCES users(id),
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  errors_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. LOAN CASES
CREATE TABLE IF NOT EXISTS loan_cases (
  id VARCHAR(64) PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lender_name VARCHAR(150) NOT NULL,
  loan_account_no VARCHAR(100) NOT NULL,
  loan_type VARCHAR(50) NOT NULL, -- Personal, Auto, Home, Business, Credit Card
  principal_amount NUMERIC(14, 2) NOT NULL,
  outstanding_amount NUMERIC(14, 2) NOT NULL,
  total_recovered_amount NUMERIC(14, 2) DEFAULT 0.00,
  dpd INTEGER NOT NULL DEFAULT 0, -- Days Past Due
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  status VARCHAR(30) NOT NULL DEFAULT 'New',
  assigned_employee_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  follow_up_date DATE,
  import_batch_id VARCHAR(64) REFERENCES import_batches(id) ON DELETE SET NULL,
  is_field_visit_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CASE STATUS HISTORY (CRITICAL AUDIT TABLE)
CREATE TABLE IF NOT EXISTS case_status_history (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  employee_id VARCHAR(64) NOT NULL REFERENCES users(id),
  previous_status VARCHAR(30) NOT NULL,
  new_status VARCHAR(30) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CASE ASSIGNMENTS HISTORY
CREATE TABLE IF NOT EXISTS case_assignments (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  assigned_from_id VARCHAR(64) REFERENCES users(id),
  assigned_to_id VARCHAR(64) NOT NULL REFERENCES users(id),
  assigned_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  assignment_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CALLS
CREATE TABLE IF NOT EXISTS calls (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  employee_id VARCHAR(64) NOT NULL REFERENCES users(id),
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  telephony_call_id VARCHAR(100) UNIQUE,
  direction VARCHAR(20) DEFAULT 'OUTBOUND', -- OUTBOUND, INBOUND
  status VARCHAR(30) NOT NULL, -- answered, busy, rejected, unanswered
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  customer_notification_status VARCHAR(50) DEFAULT 'ANNOUNCED_RECORDED', -- ANNOUNCED_RECORDED, FAILED, EXEMPT
  call_outcome VARCHAR(50), -- Promise to Pay, Disputed dues, Call back later, Not reachable, Refused
  call_notes TEXT,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CALL RECORDINGS
CREATE TABLE IF NOT EXISTS call_recordings (
  id VARCHAR(64) PRIMARY KEY,
  call_id VARCHAR(64) UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  s3_bucket VARCHAR(150) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  recording_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  mime_type VARCHAR(50) DEFAULT 'audio/mp3',
  encryption_type VARCHAR(50) DEFAULT 'aws:kms:sse',
  processing_status VARCHAR(30) DEFAULT 'READY', -- PROCESSING, READY, FAILED
  is_legal_hold BOOLEAN DEFAULT FALSE,
  retention_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. RECORDING ACCESS LOGS (Immutable security audit log)
CREATE TABLE IF NOT EXISTS recording_access_logs (
  id VARCHAR(64) PRIMARY KEY,
  recording_id VARCHAR(64) NOT NULL REFERENCES call_recordings(id) ON DELETE CASCADE,
  accessed_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  action_type VARCHAR(30) NOT NULL, -- PLAYBACK, DOWNLOAD, AUDIT_REVIEW
  signed_url_generated BOOLEAN DEFAULT TRUE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  collected_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  amount NUMERIC(14, 2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL, -- UPI, NetBanking, Cheque, Cash, Card
  transaction_ref VARCHAR(100) UNIQUE NOT NULL,
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  reconciliation_status VARCHAR(30) DEFAULT 'RECONCILED', -- PENDING, RECONCILED, REJECTED
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. TARGETS
CREATE TABLE IF NOT EXISTS targets (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year VARCHAR(10) NOT NULL, -- '2026-11'
  target_amount NUMERIC(14, 2) NOT NULL,
  achieved_amount NUMERIC(14, 2) DEFAULT 0.00,
  created_by_id VARCHAR(64) REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. SHIFTS & ATTENDANCE
CREATE TABLE IF NOT EXISTS shifts (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_start TIMESTAMP WITH TIME ZONE NOT NULL,
  shift_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, AUTO_LOGOUT
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE,
  work_minutes INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'PRESENT', -- PRESENT, HALF_DAY, ABSENT, LEAVE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- Casual, Sick, Earned
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  days_count NUMERIC(4, 1) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  reviewed_by_id VARCHAR(64) REFERENCES users(id),
  review_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. FIELD VISITS
CREATE TABLE IF NOT EXISTS field_visits (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  field_agent_id VARCHAR(64) NOT NULL REFERENCES users(id),
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  visit_start TIMESTAMP WITH TIME ZONE,
  visit_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  visit_outcome VARCHAR(50), -- Customer Met & Paid, Customer Met PTP, House Locked, Shifted, Refused
  visit_notes TEXT,
  collected_amount NUMERIC(14, 2) DEFAULT 0.00,
  payment_mode VARCHAR(50),
  receipt_ref VARCHAR(100),
  gps_latitude NUMERIC(10, 7),
  gps_longitude NUMERIC(10, 7),
  gps_consent_acknowledged BOOLEAN DEFAULT TRUE,
  status VARCHAR(30) DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. COMPLAINTS & GRIEVANCES
CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(64) PRIMARY KEY,
  complaint_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  case_id VARCHAR(64) REFERENCES loan_cases(id),
  reported_employee_id VARCHAR(64) REFERENCES users(id),
  assigned_supervisor_id VARCHAR(64) REFERENCES users(id),
  complaint_type VARCHAR(100) NOT NULL, -- Harassment, Calling outside hours, Incorrect balance, Tone/behavior
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'Open', -- Open, Under Review, Escalated, Resolved
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_actions (
  id VARCHAR(64) PRIMARY KEY,
  complaint_id VARCHAR(64) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  actor_id VARCHAR(64) NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL, -- STATUS_CHANGE, NOTE_ADDED, CALL_REVIEWED, ESCALATED, RESOLVED
  action_detail TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  recipient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. ENQUIRIES (Public Marketing Website)
CREATE TABLE IF NOT EXISTS enquiries (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  organization VARCHAR(200) NOT NULL,
  portfolio_size VARCHAR(100),
  services_requested VARCHAR(200),
  message TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'NEW',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(64),
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes & Composite Optimization
CREATE INDEX IF NOT EXISTS idx_loan_cases_status ON loan_cases(status);
CREATE INDEX IF NOT EXISTS idx_loan_cases_assigned ON loan_cases(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_loan_cases_assigned_status ON loan_cases(assigned_employee_id, status);
CREATE INDEX IF NOT EXISTS idx_loan_cases_lender ON loan_cases(lender_name);
CREATE INDEX IF NOT EXISTS idx_loan_cases_priority ON loan_cases(priority);
CREATE INDEX IF NOT EXISTS idx_loan_cases_dpd ON loan_cases(dpd);
CREATE INDEX IF NOT EXISTS idx_loan_cases_follow_up ON loan_cases(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_raw);
CREATE INDEX IF NOT EXISTS idx_case_status_history_case ON case_status_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_status_history_created ON case_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_case ON calls(case_id);
CREATE INDEX IF NOT EXISTS idx_calls_employee ON calls(employee_id);
CREATE INDEX IF NOT EXISTS idx_calls_started ON calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_telephony_id ON calls(telephony_call_id);
CREATE INDEX IF NOT EXISTS idx_recordings_call ON call_recordings(call_id);
CREATE INDEX IF NOT EXISTS idx_payments_case ON payments(case_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);

