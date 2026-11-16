-- PayMagic Enterprise Loan Recovery Schema Migration 005
-- Module A Phase 5: Intelligent Case Allocation & Reassignment Engine
-- Safe, idempotent migration with transaction and advisory lock compatibility

-- 1. ENHANCE EMPLOYEES TABLE WITH CAPACITY, SUPERVISION, & GEOGRAPHY
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS supervisor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS max_portfolio_amount NUMERIC(14, 2) DEFAULT 25000000.00,
  ADD COLUMN IF NOT EXISTS current_portfolio_amount NUMERIC(14, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
  ADD COLUMN IF NOT EXISTS specialization VARCHAR(100) DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS is_on_leave BOOLEAN DEFAULT FALSE;

-- 2. ENHANCE CASE ASSIGNMENTS AUDIT TRAIL
ALTER TABLE case_assignments
  ADD COLUMN IF NOT EXISTS allocation_method VARCHAR(50) DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS from_supervisor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS to_supervisor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL;

-- 3. ALLOCATION SESSIONS (Durable preview sessions with expiration & concurrency guards)
CREATE TABLE IF NOT EXISTS allocation_sessions (
  id VARCHAR(64) PRIMARY KEY,
  created_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  strategy VARCHAR(50) NOT NULL,
  rules JSONB,
  total_cases_selected INTEGER NOT NULL DEFAULT 0,
  total_outstanding_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  eligible_employees_count INTEGER NOT NULL DEFAULT 0,
  preview_data JSONB NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, EXECUTED, CANCELLED, EXPIRED
  executed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_allocation_sessions_status'
  ) THEN
    ALTER TABLE allocation_sessions
      ADD CONSTRAINT chk_allocation_sessions_status
      CHECK (status IN ('PENDING', 'EXECUTED', 'CANCELLED', 'EXPIRED'));
  END IF;
END $$;

-- 4. SLA ESCALATIONS (Follow-up delays, broken PTP, and supervisor alerts)
CREATE TABLE IF NOT EXISTS sla_escalations (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL DEFAULT 1, -- 1: Caller, 2: Supervisor, 3: Admin
  escalation_reason VARCHAR(100) NOT NULL, -- OVERDUE_FOLLOWUP, MISSED_PTP, INACTIVE_CRITICAL, EXCESS_UNANSWERED
  notified_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, ACKNOWLEDGED, RESOLVED
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 5. PERFORMANCE AND AUDIT INDEXES
CREATE INDEX IF NOT EXISTS idx_employees_supervisor ON employees(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_employees_location ON employees(city, state);
CREATE INDEX IF NOT EXISTS idx_employees_shift_leave ON employees(shift_status, is_on_leave);
CREATE INDEX IF NOT EXISTS idx_employees_capacity ON employees(active_cases_count, max_workload_capacity);
CREATE INDEX IF NOT EXISTS idx_employees_portfolio ON employees(current_portfolio_amount, max_portfolio_amount);

CREATE INDEX IF NOT EXISTS idx_case_assignments_method ON case_assignments(allocation_method);
CREATE INDEX IF NOT EXISTS idx_case_assignments_assigned_by ON case_assignments(assigned_by_id);

CREATE INDEX IF NOT EXISTS idx_allocation_sessions_status_exp ON allocation_sessions(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_allocation_sessions_creator ON allocation_sessions(created_by_id);

CREATE INDEX IF NOT EXISTS idx_sla_escalations_case_reason ON sla_escalations(case_id, escalation_reason, escalation_level);
CREATE INDEX IF NOT EXISTS idx_sla_escalations_notified ON sla_escalations(notified_user_id, status);
CREATE INDEX IF NOT EXISTS idx_sla_escalations_created ON sla_escalations(created_at DESC);
