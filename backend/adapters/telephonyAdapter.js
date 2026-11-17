import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

/**
 * Base Abstract Telephony Provider Interface
 */
export class BaseTelephonyProvider {
  constructor(providerName = "BaseTelephonyProvider") {
    this.providerName = providerName;
  }

  async initiateCall(fromAgent, toCustomerPhone, options = {}) {
    throw new Error("initiateCall must be implemented by provider");
  }

  async getCallStatus(telephonyCallId) {
    throw new Error("getCallStatus must be implemented by provider");
  }

  async getRecordingUrl(telephonyCallId) {
    throw new Error("getRecordingUrl must be implemented by provider");
  }

  async generateSignedUrl(s3Key, expiresIn = 3600) {
    throw new Error("generateSignedUrl must be implemented by provider");
  }

  verifyWebhookSignature(payload, signature, headers = {}) {
    throw new Error("verifyWebhookSignature must be implemented by provider");
  }
}

/**
 * Compute genuine HMAC SHA-256 signature for a webhook payload
 */
export const computeWebhookSignature = (payload, secret) => {
  const secretKey = secret || process.env.TELEPHONY_WEBHOOK_SECRET || "paymagic_telephony_hmac_secret_key_2026";
  let rawString = "";
  if (Buffer.isBuffer(payload)) {
    rawString = payload.toString("utf-8");
  } else if (typeof payload === "string") {
    rawString = payload;
  } else {
    rawString = JSON.stringify(payload);
  }
  return crypto.createHmac("sha256", secretKey).update(rawString).digest("hex");
};

/**
 * Mock Telephony Provider (Development, CI/CD, & Automated Staging)
 * Implements complete carrier telephony lifecycle with genuine HMAC-SHA256 signature security.
 */
export class MockTelephonyProvider extends BaseTelephonyProvider {
  constructor() {
    super("MockTelephonyCloud");
    this.activeCalls = new Map();
  }

  async initiateCall(fromAgent, toCustomerPhone, options = {}) {
    const telephonyCallId = `TEL-MOCK-${Date.now()}-${uuidv4().slice(0, 8)}`;

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

    return {
      success: true,
      telephony_call_id: telephonyCallId,
      provider: this.providerName,
      status: "RINGING",
      message: "Call initiated. Ringing customer phone.",
      initiated_at: callRecord.initiated_at
    };
  }

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

  async simulateFullCallLifecycle(fromAgent, toCustomerPhone, options = {}) {
    const init = await this.initiateCall(fromAgent, toCustomerPhone, options);
    const call = this.activeCalls.get(init.telephony_call_id);
    const duration = options.duration || 65;
    call.status = "COMPLETED";
    call.connected_at = new Date(Date.now() - duration * 1000).toISOString();
    call.ended_at = new Date().toISOString();
    call.duration_seconds = duration;
    call.recording_available = true;
    call.recording_s3_key = `recordings/2026/11/${init.telephony_call_id}.mp3`;
    return {
      success: true,
      call
    };
  }

  async generateSignedUrl(s3Key, expiresIn = 900) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const mockSignature = crypto.randomBytes(16).toString("hex");

    return {
      success: true,
      signed_url: `https://paymagic-telephony-recordings-secure.s3.ap-south-1.amazonaws.com/${s3Key}?X-Amz-Signature=${mockSignature}&X-Amz-Expires=${expiresIn}`,
      expires_at: expiresAt,
      expires_in_seconds: expiresIn
    };
  }

  verifyWebhookSignature(payload, signature, headers = {}) {
    if (!signature || typeof signature !== "string") {
      return false;
    }

    const secret = process.env.TELEPHONY_WEBHOOK_SECRET || "paymagic_telephony_hmac_secret_key_2026";
    const expected = computeWebhookSignature(payload, secret);

    const cleanSig = signature.trim().startsWith("sha256=")
      ? signature.trim().slice(7)
      : signature.trim();

    try {
      const expectedBuf = Buffer.from(expected, "hex");
      const actualBuf = Buffer.from(cleanSig, "hex");

      if (expectedBuf.length !== actualBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }
}

/**
 * Exotel Production Telephony Provider (India Telecom Primary Gateway)
 * API Docs: https://developer.exotel.com/api/
 */
export class ExotelTelephonyProvider extends BaseTelephonyProvider {
  constructor() {
    super("ExotelEnterpriseGateway");
    this.apiKey = process.env.EXOTEL_API_KEY || process.env.TELEPHONY_API_KEY;
    this.apiToken = process.env.EXOTEL_API_TOKEN || process.env.TELEPHONY_API_TOKEN;
    this.subdomain = process.env.EXOTEL_SUBDOMAIN || process.env.TELEPHONY_SUBDOMAIN || "api.exotel.com";
    this.accountSid = process.env.EXOTEL_ACCOUNT_SID || process.env.TELEPHONY_ACCOUNT_SID;
    this.callerId = process.env.EXOTEL_CALLER_ID || process.env.TELEPHONY_CALLER_ID || "02071171000";
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiToken && this.accountSid);
  }

  async initiateCall(fromAgent, toCustomerPhone, options = {}) {
    if (!this.isConfigured()) {
      throw new Error("Exotel credentials unconfigured. Set EXOTEL_API_KEY, EXOTEL_API_TOKEN, EXOTEL_ACCOUNT_SID.");
    }

    const endpoint = `https://${this.subdomain}/v1/Accounts/${this.accountSid}/Calls/connect.json`;
    const webhookUrl = options.webhookUrl || `${process.env.APP_URL || "https://paymagic.in"}/api/telephony/webhook`;

    const body = new URLSearchParams({
      From: fromAgent,
      To: toCustomerPhone,
      CallerId: this.callerId,
      CallType: "trans",
      StatusCallback: webhookUrl,
      StatusCallbackEvents: "terminal",
      Record: "true"
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${this.apiKey}:${this.apiToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Exotel API rejected call initiation (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      success: true,
      telephony_call_id: data.Call?.Sid || data.CallSid,
      provider: this.providerName,
      status: "RINGING",
      message: "Exotel outbound call queued successfully.",
      initiated_at: new Date().toISOString()
    };
  }

  async getCallStatus(telephonyCallId) {
    if (!this.isConfigured()) {
      return { success: false, status: "NOT_CONFIGURED" };
    }

    const endpoint = `https://${this.subdomain}/v1/Accounts/${this.accountSid}/Calls/${telephonyCallId}.json`;
    const response = await fetch(endpoint, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${this.apiKey}:${this.apiToken}`).toString("base64")
      }
    });

    if (!response.ok) {
      return { success: false, status: "NOT_FOUND" };
    }

    const data = await response.json();
    const status = data.Call?.Status?.toLowerCase() || "unknown";
    const mappedStatus = status === "completed" ? "answered" : status;

    return {
      success: true,
      telephony_call_id: telephonyCallId,
      status: mappedStatus,
      duration_seconds: parseInt(data.Call?.Duration || "0", 10),
      recording_available: Boolean(data.Call?.RecordingUrl),
      recording_url: data.Call?.RecordingUrl || null
    };
  }

  async getRecordingUrl(telephonyCallId) {
    const statusData = await this.getCallStatus(telephonyCallId);
    if (!statusData.success || !statusData.recording_available) {
      return { success: false, message: "Recording not available from Exotel." };
    }
    return {
      success: true,
      telephony_call_id: telephonyCallId,
      recording_url: statusData.recording_url,
      duration_seconds: statusData.duration_seconds
    };
  }

  verifyWebhookSignature(payload, signature, headers = {}) {
    if (!signature || typeof signature !== "string") return false;
    const secret = process.env.TELEPHONY_WEBHOOK_SECRET;
    if (!secret) return false;

    const expected = computeWebhookSignature(payload, secret);
    const cleanSig = signature.trim().startsWith("sha256=")
      ? signature.trim().slice(7)
      : signature.trim();

    try {
      const expectedBuf = Buffer.from(expected, "hex");
      const actualBuf = Buffer.from(cleanSig, "hex");
      if (expectedBuf.length !== actualBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }
}

/**
 * Twilio Production Telephony Provider (Global Carrier Gateway)
 */
export class TwilioTelephonyProvider extends BaseTelephonyProvider {
  constructor() {
    super("TwilioVoiceGateway");
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER;
  }

  isConfigured() {
    return Boolean(this.accountSid && this.authToken && this.fromNumber);
  }

  async initiateCall(fromAgent, toCustomerPhone, options = {}) {
    if (!this.isConfigured()) {
      throw new Error("Twilio credentials unconfigured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.");
    }

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls.json`;
    const webhookUrl = options.webhookUrl || `${process.env.APP_URL || "https://paymagic.in"}/api/telephony/webhook`;

    const body = new URLSearchParams({
      From: this.fromNumber,
      To: toCustomerPhone,
      Url: `${process.env.APP_URL || "https://paymagic.in"}/api/telephony/twiml/bridge?agent=${encodeURIComponent(fromAgent)}`,
      StatusCallback: webhookUrl,
      StatusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      Record: "true"
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Twilio rejected call (${response.status}): ${err}`);
    }

    const data = await response.json();
    return {
      success: true,
      telephony_call_id: data.sid,
      provider: this.providerName,
      status: "RINGING",
      message: "Twilio outbound call initiated.",
      initiated_at: new Date().toISOString()
    };
  }

  verifyWebhookSignature(payload, signature, headers = {}) {
    if (!signature) return false;
    const secret = process.env.TWILIO_AUTH_TOKEN || process.env.TELEPHONY_WEBHOOK_SECRET;
    if (!secret) return false;

    const expected = computeWebhookSignature(payload, secret);
    try {
      const expectedBuf = Buffer.from(expected, "hex");
      const actualBuf = Buffer.from(signature.trim(), "hex");
      if (expectedBuf.length !== actualBuf.length) return false;
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }
}

/**
 * Standalone HMAC SHA-256 signature verifier
 */
export const verifyWebhookSignature = (payload, signature, secret) => {
  if (!signature || typeof signature !== "string") return false;
  const expected = computeWebhookSignature(payload, secret);
  const cleanSig = signature.trim().startsWith("sha256=")
    ? signature.trim().slice(7)
    : signature.trim();
  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const actualBuf = Buffer.from(cleanSig, "hex");
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
};

/**
 * Universal Telephony Gateway Dispatcher
 * Selects active carrier provider based on TELEPHONY_PROVIDER environment configuration
 */
export class TelephonyGateway extends BaseTelephonyProvider {
  constructor() {
    super("UniversalTelephonyGateway");
    this.mock = new MockTelephonyProvider();
    this.exotel = new ExotelTelephonyProvider();
    this.twilio = new TwilioTelephonyProvider();
  }

  getActiveProvider() {
    const configured = (process.env.TELEPHONY_PROVIDER || "mock").toLowerCase();
    if (configured === "exotel" && this.exotel.isConfigured()) return this.exotel;
    if (configured === "twilio" && this.twilio.isConfigured()) return this.twilio;
    if (configured === "production" && this.exotel.isConfigured()) return this.exotel;
    return this.mock;
  }

  getProvider() {
    return this.getActiveProvider();
  }

  async initiateCall(fromAgent, toCustomerPhone, options = {}) {
    return await this.getActiveProvider().initiateCall(fromAgent, toCustomerPhone, options);
  }

  async getCallStatus(telephonyCallId) {
    return await this.getActiveProvider().getCallStatus(telephonyCallId);
  }

  async getRecordingUrl(telephonyCallId) {
    return await this.getActiveProvider().getRecordingUrl(telephonyCallId);
  }

  async generateSignedUrl(s3Key, expiresIn = 900) {
    return await this.getActiveProvider().generateSignedUrl(s3Key, expiresIn);
  }

  async simulateFullCallLifecycle(fromAgent, toCustomerPhone, options = {}) {
    const active = this.getActiveProvider();
    if (active.simulateFullCallLifecycle) {
      return await active.simulateFullCallLifecycle(fromAgent, toCustomerPhone, options);
    }
    return await this.mock.simulateFullCallLifecycle(fromAgent, toCustomerPhone, options);
  }

  verifyWebhookSignature(payload, signature, headers = {}) {
    // Check against active provider, or fallback to mock
    const active = this.getActiveProvider();
    return active.verifyWebhookSignature(payload, signature, headers);
  }
}

export const telephonyProvider = new TelephonyGateway();
export const telephonyGateway = telephonyProvider;
export default telephonyProvider;
