import { v4 as uuidv4 } from "uuid";

/**
 * Mock Telephony Provider
 * Simulates a cloud telephony service (like Exotel, Ozonetel, Knowlarity)
 * for development and testing purposes.
 */
export class MockTelephonyProvider {
  constructor() {
    this.providerName = "MockTelephonyCloud";
    this.activeCalls = new Map();
  }

  /**
   * Initiate an outbound call from an agent to a customer phone number.
   * Returns a telephony call ID and simulated connection metadata.
   */
  async initiateCall(fromAgent, toCustomerPhone) {
    const telephonyCallId = `TEL-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const callRecord = {
      telephony_call_id: telephonyCallId,
      from_agent: fromAgent,
      to_phone: toCustomerPhone,
      provider: this.providerName,
      status: "RINGING",
      initiated_at: new Date().toISOString(),
      connected_at: null,
      ended_at: null,
      duration_seconds: 0,
      recording_available: false,
      recording_s3_key: null
    };

    this.activeCalls.set(telephonyCallId, callRecord);

    // Simulate async connection after ~2s
    setTimeout(() => {
      const call = this.activeCalls.get(telephonyCallId);
      if (call && call.status === "RINGING") {
        // 80% chance of connection, 20% unanswered
        const isConnected = Math.random() < 0.8;
        if (isConnected) {
          call.status = "CONNECTED";
          call.connected_at = new Date().toISOString();

          // Simulate random call duration (30-300 seconds) then auto-end
          const duration = Math.floor(30 + Math.random() * 270);
          call.simulated_duration = duration;
          call.recording_available = true;
          call.recording_s3_key = `recordings/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${telephonyCallId}.mp3`;

          setTimeout(() => {
            const endingCall = this.activeCalls.get(telephonyCallId);
            if (endingCall && endingCall.status === "CONNECTED") {
              endingCall.status = "COMPLETED";
              endingCall.ended_at = new Date().toISOString();
              endingCall.duration_seconds = duration;
            }
          }, 500); // In mock, we don't actually wait the full duration
        } else {
          call.status = "UNANSWERED";
          call.ended_at = new Date().toISOString();
          call.duration_seconds = 0;
        }
      }
    }, 100); // Mock: near-instant instead of real 2s

    return {
      success: true,
      telephony_call_id: telephonyCallId,
      provider: this.providerName,
      status: "RINGING",
      message: "Call initiated. Ringing customer phone.",
      initiated_at: callRecord.initiated_at
    };
  }

  /**
   * Get the real-time status of a call from the provider.
   */
  async getCallStatus(telephonyCallId) {
    const call = this.activeCalls.get(telephonyCallId);

    if (!call) {
      return {
        success: false,
        telephony_call_id: telephonyCallId,
        status: "NOT_FOUND",
        message: "No active call found for this telephony ID."
      };
    }

    return {
      success: true,
      telephony_call_id: telephonyCallId,
      status: call.status,
      from_agent: call.from_agent,
      to_phone: call.to_phone,
      initiated_at: call.initiated_at,
      connected_at: call.connected_at,
      ended_at: call.ended_at,
      duration_seconds: call.duration_seconds,
      recording_available: call.recording_available
    };
  }

  /**
   * Get the recording URL for a completed call.
   */
  async getRecordingUrl(telephonyCallId) {
    const call = this.activeCalls.get(telephonyCallId);

    if (!call || !call.recording_available) {
      return {
        success: false,
        message: "Recording not available for this call."
      };
    }

    return {
      success: true,
      telephony_call_id: telephonyCallId,
      s3_bucket: "paymagic-telephony-recordings-secure",
      s3_key: call.recording_s3_key,
      recording_url: `https://paymagic-telephony-recordings-secure.s3.ap-south-1.amazonaws.com/${call.recording_s3_key}`,
      duration_seconds: call.duration_seconds,
      file_size_bytes: call.duration_seconds * 16000,
      mime_type: "audio/mp3",
      encryption_type: "aws:kms:sse"
    };
  }

  /**
   * Generate a time-limited signed URL for secure recording access.
   */
  async generateSignedUrl(s3Key, expiresIn = 3600) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const mockSignature = uuidv4().replace(/-/g, "");

    return {
      success: true,
      signed_url: `https://paymagic-telephony-recordings-secure.s3.ap-south-1.amazonaws.com/${s3Key}?X-Amz-Signature=${mockSignature}&X-Amz-Expires=${expiresIn}`,
      expires_at: expiresAt,
      expires_in_seconds: expiresIn
    };
  }

  /**
   * Simulate an entire call lifecycle instantly for development testing.
   * Returns the full call metadata as if the call happened in real-time.
   */
  async simulateFullCallLifecycle(fromAgent, toCustomerPhone) {
    const telephonyCallId = `TEL-SIM-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const isConnected = Math.random() < 0.8;
    const duration = isConnected ? Math.floor(30 + Math.random() * 300) : 0;
    const now = new Date();
    const startedAt = new Date(now.getTime() - (duration + 10) * 1000).toISOString();
    const connectedAt = isConnected ? new Date(now.getTime() - duration * 1000).toISOString() : null;
    const endedAt = now.toISOString();

    const s3Key = isConnected
      ? `recordings/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${telephonyCallId}.mp3`
      : null;

    const callData = {
      telephony_call_id: telephonyCallId,
      from_agent: fromAgent,
      to_phone: toCustomerPhone,
      provider: this.providerName,
      status: isConnected ? "COMPLETED" : "UNANSWERED",
      initiated_at: startedAt,
      connected_at: connectedAt,
      ended_at: endedAt,
      duration_seconds: duration,
      recording_available: isConnected,
      recording_s3_key: s3Key,
      recording_url: s3Key
        ? `https://paymagic-telephony-recordings-secure.s3.ap-south-1.amazonaws.com/${s3Key}`
        : null,
      file_size_bytes: isConnected ? duration * 16000 : 0
    };

    this.activeCalls.set(telephonyCallId, callData);

    return {
      success: true,
      simulated: true,
      call: callData
    };
  }

  /**
   * Verify a webhook signature from the telephony provider.
   * In production, this would verify HMAC signatures. Mock always returns true.
   */
  verifyWebhookSignature(payload, signature) {
    // Mock verification - in production, compute HMAC-SHA256 of payload with secret
    if (!signature) return false;
    if (signature === "mock-invalid-signature") return false;
    return true;
  }
}

// Singleton instance
export const telephonyProvider = new MockTelephonyProvider();

export default telephonyProvider;
