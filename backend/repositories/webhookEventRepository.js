import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Durable Webhook Processing Repository
 * Manages webhook idempotency, replay attack prevention, and state transitions
 * with full dual-mode support for PostgreSQL and memoryStore.
 */
export const webhookEventRepository = {
  /**
   * Compute SHA-256 hash of webhook payload for tamper/change detection
   */
  computePayloadHash(payload) {
    if (!payload) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Empty hash
    const raw = Buffer.isBuffer(payload)
      ? payload.toString("utf-8")
      : typeof payload === "string"
        ? payload
        : JSON.stringify(payload);
    return crypto.createHash("sha256").update(raw).digest("hex");
  },

  /**
   * Record receipt of an incoming webhook event.
   * Atomically detects and prevents duplicate event processing.
   */
  async recordReceivedEvent({
    provider,
    providerEventId,
    eventType = "generic",
    payload = null,
    metadata = {}
  }, client = null) {
    const cleanProvider = (provider || "GENERIC").toUpperCase();
    const cleanEventId = String(providerEventId || `evt_${Date.now()}_${uuidv4().slice(0, 8)}`).trim();
    const payloadHash = this.computePayloadHash(payload);
    const now = new Date().toISOString();
    const id = `wbe_${uuidv4()}`;

    if (db.isPgActive()) {
      const q = client || db.getPool();

      // Check if event already exists
      const existing = await q.query(
        "SELECT * FROM provider_webhook_events WHERE provider = $1 AND provider_event_id = $2",
        [cleanProvider, cleanEventId]
      );

      if (existing.rows.length > 0) {
        const ev = existing.rows[0];
        // If event was already processed or is duplicate
        return {
          duplicate: true,
          event: ev,
          message: `Webhook event '${cleanEventId}' from '${cleanProvider}' has already been recorded.`
        };
      }

      try {
        const insertRes = await q.query(
          `INSERT INTO provider_webhook_events (
            id, provider, provider_event_id, event_type, payload_hash,
            processing_status, retry_count, received_at, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            id,
            cleanProvider,
            cleanEventId,
            eventType,
            payloadHash,
            "RECEIVED",
            0,
            now,
            JSON.stringify(metadata || {}),
            now
          ]
        );

        return {
          duplicate: false,
          event: insertRes.rows[0],
          message: "Webhook event recorded."
        };
      } catch (err) {
        // Unique constraint collision under race condition
        if (err.code === "23505") {
          const fetchExisting = await q.query(
            "SELECT * FROM provider_webhook_events WHERE provider = $1 AND provider_event_id = $2",
            [cleanProvider, cleanEventId]
          );
          return {
            duplicate: true,
            event: fetchExisting.rows[0],
            message: `Concurrent duplicate webhook event '${cleanEventId}' rejected.`
          };
        }
        throw err;
      }
    }

    // In-memory fallback
    if (!memoryStore.provider_webhook_events) {
      memoryStore.provider_webhook_events = [];
    }

    const existingMem = memoryStore.provider_webhook_events.find(
      e => e.provider === cleanProvider && e.provider_event_id === cleanEventId
    );

    if (existingMem) {
      return {
        duplicate: true,
        event: { ...existingMem },
        message: `Webhook event '${cleanEventId}' from '${cleanProvider}' has already been recorded.`
      };
    }

    const newEvent = {
      id,
      provider: cleanProvider,
      provider_event_id: cleanEventId,
      event_type: eventType,
      payload_hash: payloadHash,
      processing_status: "RECEIVED",
      retry_count: 0,
      error_message: null,
      received_at: now,
      processed_at: null,
      metadata: metadata || {},
      created_at: now
    };

    memoryStore.provider_webhook_events.unshift(newEvent);

    return {
      duplicate: false,
      event: { ...newEvent },
      message: "Webhook event recorded."
    };
  },

  /**
   * Mark event as successfully processed
   */
  async markProcessed(eventId, metadata = null, client = null) {
    const now = new Date().toISOString();

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE provider_webhook_events
         SET processing_status = 'PROCESSED',
             processed_at = $1,
             metadata = COALESCE($2, metadata)
         WHERE id = $3 OR provider_event_id = $3
         RETURNING *`,
        [now, metadata ? JSON.stringify(metadata) : null, eventId]
      );
      return res.rows[0] || null;
    }

    const ev = (memoryStore.provider_webhook_events || []).find(
      e => e.id === eventId || e.provider_event_id === eventId
    );
    if (!ev) return null;

    ev.processing_status = "PROCESSED";
    ev.processed_at = now;
    if (metadata) ev.metadata = { ...ev.metadata, ...metadata };
    return { ...ev };
  },

  /**
   * Mark event as failed with error details and increment retry counter
   */
  async markFailed(eventId, errorMessage, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query(
        `UPDATE provider_webhook_events
         SET processing_status = 'FAILED',
             retry_count = retry_count + 1,
             error_message = $1
         WHERE id = $2 OR provider_event_id = $2
         RETURNING *`,
        [errorMessage, eventId]
      );
      return res.rows[0] || null;
    }

    const ev = (memoryStore.provider_webhook_events || []).find(
      e => e.id === eventId || e.provider_event_id === eventId
    );
    if (!ev) return null;

    ev.processing_status = "FAILED";
    ev.retry_count = (ev.retry_count || 0) + 1;
    ev.error_message = errorMessage;
    return { ...ev };
  },

  /**
   * Get failed webhook events for inspection or manual retry
   */
  async getFailedEvents(provider = null, limit = 50, client = null) {
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    if (db.isPgActive()) {
      const q = client || db.getPool();
      let query = "SELECT * FROM provider_webhook_events WHERE processing_status = 'FAILED'";
      const params = [];
      if (provider) {
        params.push(provider.toUpperCase());
        query += " AND provider = $1";
      }
      query += ` ORDER BY received_at DESC LIMIT $${params.length + 1}`;
      params.push(limitNum);

      const res = await q.query(query, params);
      return res.rows;
    }

    let list = (memoryStore.provider_webhook_events || []).filter(e => e.processing_status === "FAILED");
    if (provider) {
      list = list.filter(e => e.provider === provider.toUpperCase());
    }
    return list.slice(0, limitNum);
  }
};

export default webhookEventRepository;

