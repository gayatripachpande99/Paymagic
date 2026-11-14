-- PayMagic Enterprise Loan Recovery Schema Migration 002
-- Module A Enhancements: Audit Traceability, Case Follow-ups, and Composite Indexes
-- Idempotent script: Safe to execute multiple times

-- 1. ENHANCE CASE STATUS HISTORY (Audit Source and External Reference Tracking)
ALTER TABLE case_status_history 
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'System',
  ADD COLUMN IF NOT EXISTS reference_id VARCHAR(64);

-- 2. CASE FOLLOW-UPS (Structured Follow-up Scheduling & SLA Monitoring)
CREATE TABLE IF NOT EXISTS case_followups (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  scheduled_by VARCHAR(64) NOT NULL REFERENCES users(id),
  follow_up_date DATE NOT NULL,
  follow_up_time VARCHAR(20),
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  notes TEXT,
  status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, COMPLETED, MISSED, RESCHEDULED
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by VARCHAR(64) REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES FOR CASE FOLLOW-UPS
CREATE INDEX IF NOT EXISTS idx_case_followups_case_id ON case_followups(case_id);
CREATE INDEX IF NOT EXISTS idx_case_followups_date_status ON case_followups(follow_up_date, status);
CREATE INDEX IF NOT EXISTS idx_case_followups_scheduled_by ON case_followups(scheduled_by);

-- 4. COMPOSITE & HIGH-PERFORMANCE INDEXES FOR LOAN CASES
CREATE INDEX IF NOT EXISTS idx_loan_cases_status_assigned ON loan_cases(status, assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_loan_cases_priority_dpd ON loan_cases(priority, dpd DESC);
CREATE INDEX IF NOT EXISTS idx_loan_cases_lender_account ON loan_cases(lender_name, loan_account_no);
CREATE INDEX IF NOT EXISTS idx_loan_cases_customer_status ON loan_cases(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_loan_cases_outstanding ON loan_cases(outstanding_amount DESC);

-- 5. INDEXES FOR CASE STATUS AUDIT TIMELINE
CREATE INDEX IF NOT EXISTS idx_case_status_history_case_created ON case_status_history(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_status_history_emp_created ON case_status_history(employee_id, created_at DESC);

-- 6. INDEXES FOR CASE ASSIGNMENTS
CREATE INDEX IF NOT EXISTS idx_case_assignments_case_id ON case_assignments(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_assignments_to_id ON case_assignments(assigned_to_id, created_at DESC);
