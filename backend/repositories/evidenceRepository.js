import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Voice Evidence Repository
 * Manages call recording metadata, WORM compliance, legal holds, and immutable access logs.
 * Fully supports PostgreSQL and memoryStore fallback.
 */
export const evidenceRepository = {
  /**
   * Insert recording record
   */
  async createRecording(data, client = null) {
    const id = data.id || `rec_${uuidv4()}`;
    const now = new Date().toISOString();
    const retentionUntil = data.retention_until || new Date(Date.now() + 365 * 86400000).toISOString(); // 1-year default

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `INSERT INTO call_recordings (
          id, call_id, s3_bucket, s3_key, recording_url,
          duration_seconds, file_size_bytes, mime_type, encryption_type,
          processing_status, is_legal_hold, retention_until, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          id,
          data.call_id || data.callId,
          data.s3_bucket || "paymagic-telephony-recordings-secure",
          data.s3_key || data.s3Key,
          data.recording_url || null,
          data.duration_seconds || 0,
          data.file_size_bytes || 0,
          data.mime_type || "audio/mp3",
          data.encryption_type || "aws:kms:sse",
          data.processing_status || "READY",
          Boolean(data.is_legal_hold),
          retentionUntil,
          now
        ]
      );
      return res.rows[0];
    }

    // In-memory fallback
    if (!memoryStore.call_recordings) memoryStore.call_recordings = [];

    const recording = {
      id,
      call_id: data.call_id || data.callId,
      s3_bucket: data.s3_bucket || "paymagic-telephony-recordings-secure",
      s3_key: data.s3_key || data.s3Key,
      recording_url: data.recording_url || null,
      duration_seconds: data.duration_seconds || 0,
      file_size_bytes: data.file_size_bytes || 0,
      mime_type: data.mime_type || "audio/mp3",
      encryption_type: data.encryption_type || "aws:kms:sse",
      processing_status: data.processing_status || "READY",
      is_legal_hold: Boolean(data.is_legal_hold),
      retention_until: retentionUntil,
      created_at: now
    };

    memoryStore.call_recordings.unshift(recording);
    return { ...recording };
  },

  /**
   * Get recording by ID
   */
  async getRecordingById(recordingId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT cr.*,
                c.case_id, c.employee_id, c.customer_id, c.started_at as call_date, c.call_outcome,
                lc.case_number, lc.loan_account_no,
                cust.full_name as customer_name,
                u.full_name as agent_name
         FROM call_recordings cr
         JOIN calls c ON cr.call_id = c.id
         JOIN loan_cases lc ON c.case_id = lc.id
         JOIN customers cust ON c.customer_id = cust.id
         LEFT JOIN users u ON c.employee_id = u.id
         WHERE cr.id = $1`,
        [recordingId]
      );
      return res.rows[0] || null;
    }

    const rec = (memoryStore.call_recordings || []).find(r => r.id === recordingId);
    if (!rec) return null;

    const call = (memoryStore.calls || []).find(c => c.id === rec.call_id);
    const lc = call ? (memoryStore.loan_cases || []).find(c => c.id === call.case_id) : null;
    const cust = call ? (memoryStore.customers || []).find(c => c.id === call.customer_id) : null;
    const u = call ? (memoryStore.users || []).find(user => user.id === call.employee_id) : null;

    return {
      ...rec,
      case_id: call ? call.case_id : null,
      employee_id: call ? call.employee_id : null,
      customer_id: call ? call.customer_id : null,
      call_date: call ? call.started_at : rec.created_at,
      call_outcome: call ? call.call_outcome : null,
      case_number: lc ? lc.case_number : "Unknown",
      loan_account_no: lc ? lc.loan_account_no : "Unknown",
      customer_name: cust ? cust.full_name : "Unknown",
      agent_name: u ? u.full_name : "Staff Agent"
    };
  },

  /**
   * Update legal hold status on recording
   */
  async updateLegalHold(recordingId, isLegalHold, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE call_recordings
         SET is_legal_hold = $1
         WHERE id = $2
         RETURNING *`,
        [Boolean(isLegalHold), recordingId]
      );
      return res.rows[0] || null;
    }

    const rec = (memoryStore.call_recordings || []).find(r => r.id === recordingId);
    if (!rec) return null;

    rec.is_legal_hold = Boolean(isLegalHold);
    return { ...rec };
  },

  /**
   * Record immutable playback or download access event
   */
  async logAccess({
    id = null,
    recordingId,
    callId = null,
    accessedById,
    userName = null,
    userRole = null,
    employeeCode = null,
    actionType = "PLAYBACK",
    purpose = null,
    ipAddress = null,
    userAgent = null,
    accessedAt = null
  }, client = null) {
    const logId = id || `ral_${uuidv4()}`;
    const now = accessedAt || new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `INSERT INTO recording_access_logs (
          id, recording_id, accessed_by_id, action_type, signed_url_generated,
          ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          logId,
          recordingId,
          accessedById,
          actionType.toUpperCase(),
          true,
          ipAddress,
          userAgent,
          now
        ]
      );
      return res.rows[0];
    }

    // In-memory fallback
    if (!memoryStore.recording_access_logs) memoryStore.recording_access_logs = [];

    const logEntry = {
      id: logId,
      recording_id: recordingId,
      call_id: callId,
      user_id: accessedById,
      user_name: userName || "Authorized Officer",
      user_role: userRole || "STAFF",
      employee_code: employeeCode || "EMP-SEC",
      access_type: actionType.toUpperCase(),
      purpose: purpose || "Routine Recovery Quality Review",
      signed_url_generated: true,
      ip_address: ipAddress || "127.0.0.1",
      user_agent: userAgent || "PayMagic-Console/1.0",
      accessed_at: now,
      created_at: now
    };

    memoryStore.recording_access_logs.push(logEntry);
    return { ...logEntry };
  },

  /**
   * Get audit trail for a recording
   */
  async getAccessLogs(recordingId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `SELECT ral.*, u.full_name as accessed_by_name, u.role as accessed_by_role
         FROM recording_access_logs ral
         JOIN users u ON ral.accessed_by_id = u.id
         WHERE ral.recording_id = $1
         ORDER BY ral.created_at DESC`,
        [recordingId]
      );
      return res.rows;
    }

    return (memoryStore.recording_access_logs || [])
      .filter(l => l.recording_id === recordingId)
      .map(l => {
        const u = (memoryStore.users || []).find(user => user.id === l.accessed_by_id);
        return {
          ...l,
          accessed_by_name: u ? u.full_name : "Authorized Officer",
          accessed_by_role: u ? u.role : "STAFF"
        };
      });
  }
};

export default evidenceRepository;
