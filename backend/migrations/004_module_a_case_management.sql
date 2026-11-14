-- PayMagic Enterprise Loan Recovery Schema Migration 004
-- Module A Phase 4: Case Management, Supervisor Scope, and Query Performance Indexes
-- Idempotent: safe to run multiple times

-- 1. ADD SUPERVISOR AND REMARKS TO CASES AND ASSIGNMENTS
ALTER TABLE loan_cases
  ADD COLUMN IF NOT EXISTS assigned_supervisor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE case_assignments
  ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 2. PERFORMANCE INDEXES FOR FILTERING, SORTING, AND SEARCH
CREATE INDEX IF NOT EXISTS idx_loan_cases_supervisor ON loan_cases(assigned_supervisor_id);
CREATE INDEX IF NOT EXISTS idx_loan_cases_created_at ON loan_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_cases_updated_at ON loan_cases(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_cases_loan_type ON loan_cases(loan_type);
CREATE INDEX IF NOT EXISTS idx_loan_cases_dpd ON loan_cases(dpd);

CREATE INDEX IF NOT EXISTS idx_customers_city_state ON customers(city, state);
CREATE INDEX IF NOT EXISTS idx_customers_pincode ON customers(pincode);
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);
