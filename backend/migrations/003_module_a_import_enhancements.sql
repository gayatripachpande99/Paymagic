-- PayMagic Enterprise Loan Recovery Schema Migration 003
-- Module A Import Enhancements: Durable Preview Sessions, Batch Lifecycle & Checksum Audit
-- Idempotent script: Safe to execute multiple times

-- 1. ENHANCE IMPORT BATCHES TABLE
ALTER TABLE import_batches 
  ADD COLUMN IF NOT EXISTS file_checksum VARCHAR(64),
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS valid_records INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duplicate_records INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preview_data JSONB,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS confirmed_by VARCHAR(64) REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 2. STATUS CONSTRAINT (Ensures valid batch lifecycle states: PENDING, CONFIRMED, CANCELLED, EXPIRED)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_import_batches_status'
  ) THEN
    ALTER TABLE import_batches
      ADD CONSTRAINT chk_import_batches_status 
      CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'));
  END IF;
END $$;

-- 3. INDEXES FOR IMPORT BATCH MANAGEMENT & MONITORING
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON import_batches(status);
CREATE INDEX IF NOT EXISTS idx_import_batches_uploader ON import_batches(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_import_batches_created_at ON import_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_batches_checksum ON import_batches(file_checksum);
CREATE INDEX IF NOT EXISTS idx_import_batches_expires_at ON import_batches(expires_at) WHERE status = 'PENDING';

