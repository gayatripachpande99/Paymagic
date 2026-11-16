-- PayMagic Enterprise Loan Recovery Schema Migration 006
-- Module A Phase 6: Recovery Operations & Collection Tracking System
-- Idempotent, safe migration with transaction integrity

-- 1. ENHANCE PAYMENTS TABLE WITH VERIFICATION, REVERSALS, AND SETTLEMENT
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'VERIFIED',
  ADD COLUMN IF NOT EXISTS verified_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_reversed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reversal_reason TEXT,
  ADD COLUMN IF NOT EXISTS original_payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS settlement_type VARCHAR(30) DEFAULT 'PARTIAL';

-- 2. CUSTOMER CONTACTS (Comprehensive omnichannel contact logging)
CREATE TABLE IF NOT EXISTS customer_contacts (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  contacted_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  contact_method VARCHAR(50) NOT NULL, -- PHONE_CALL, FIELD_VISIT, WHATSAPP, SMS, IN_PERSON, EMAIL
  outcome VARCHAR(50) NOT NULL, -- PROMISE_TO_PAY, REFUSED_TO_PAY, DISPUTED, CALL_BACK, UNREACHABLE, WRONG_NUMBER, PAID
  discussion_notes TEXT,
  next_callback_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROMISE-TO-PAY (PTP) COMMITMENTS
CREATE TABLE IF NOT EXISTS case_ptp_commitments (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  created_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  promised_amount NUMERIC(14, 2) NOT NULL,
  promised_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_mode VARCHAR(30) DEFAULT 'UPI',
  status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, FULFILLED, PARTIALLY_FULFILLED, BROKEN, CANCELLED
  fulfilled_payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE SET NULL,
  fulfilled_amount NUMERIC(14, 2) DEFAULT 0.00,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_ptp_commitments_status'
  ) THEN
    ALTER TABLE case_ptp_commitments
      ADD CONSTRAINT chk_ptp_commitments_status
      CHECK (status IN ('PENDING', 'FULFILLED', 'PARTIALLY_FULFILLED', 'BROKEN', 'CANCELLED'));
  END IF;
END $$;

-- 4. OFFICIAL PAYMENT RECEIPTS (Tamper-evident, audit-verified receipts)
CREATE TABLE IF NOT EXISTS payment_receipts (
  id VARCHAR(64) PRIMARY KEY,
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  case_id VARCHAR(64) NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  issued_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  amount NUMERIC(14, 2) NOT NULL,
  balance_after_payment NUMERIC(14, 2) NOT NULL,
  signature_hash VARCHAR(128) NOT NULL,
  receipt_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BANK & GATEWAY RECONCILIATION BATCHES
CREATE TABLE IF NOT EXISTS reconciliation_batches (
  id VARCHAR(64) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  uploaded_by_id VARCHAR(64) NOT NULL REFERENCES users(id),
  total_records INTEGER DEFAULT 0,
  matched_records INTEGER DEFAULT 0,
  unmatched_records INTEGER DEFAULT 0,
  discrepancy_records INTEGER DEFAULT 0,
  total_amount NUMERIC(14, 2) DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'COMPLETED', -- COMPLETED, FAILED, PARTIAL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RECONCILIATION STATEMENT RECORDS
CREATE TABLE IF NOT EXISTS reconciliation_records (
  id VARCHAR(64) PRIMARY KEY,
  batch_id VARCHAR(64) NOT NULL REFERENCES reconciliation_batches(id) ON DELETE CASCADE,
  bank_txn_ref VARCHAR(100) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  txn_date TIMESTAMP WITH TIME ZONE,
  matched_payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE SET NULL,
  match_status VARCHAR(30) NOT NULL, -- MATCHED, UNMATCHED, AMOUNT_MISMATCH
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PERFORMANCE AND VERIFICATION INDEXES
CREATE INDEX IF NOT EXISTS idx_payments_verification ON payments(verification_status, is_reversed);
CREATE INDEX IF NOT EXISTS idx_payments_txn_ref ON payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_case ON payments(case_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_collector ON payments(collected_by_id, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_ptp_case_status ON case_ptp_commitments(case_id, status);
CREATE INDEX IF NOT EXISTS idx_ptp_promised_date ON case_ptp_commitments(promised_date, status);
CREATE INDEX IF NOT EXISTS idx_ptp_creator ON case_ptp_commitments(created_by_id);

CREATE INDEX IF NOT EXISTS idx_contacts_case ON customer_contacts(case_id, contact_date DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_agent ON customer_contacts(contacted_by_id, contact_date DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_callback ON customer_contacts(next_callback_date);

CREATE INDEX IF NOT EXISTS idx_receipts_payment ON payment_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_case ON payment_receipts(case_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON payment_receipts(receipt_number);

CREATE INDEX IF NOT EXISTS idx_recon_batch ON reconciliation_records(batch_id, match_status);
CREATE INDEX IF NOT EXISTS idx_recon_bank_ref ON reconciliation_records(bank_txn_ref);

