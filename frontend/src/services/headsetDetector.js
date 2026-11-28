/**
 * PayMagic Enterprise Headset & Audio Hardware Detection Service
 * Automatically detects whether an EXTERNAL headset (USB, 3.5mm Jack, or Bluetooth)
 * is connected to the device's ports.
 *
 * Built-in / internal device microphones and built-in laptop/PC speakers are strictly
 * NOT allowed; an external headset with microphone and sound is required.
 */

export const EXTERNAL_HEADSET_KEYWORDS = [
  "headset",
  "headphone",
  "headphones",
  "earphone",
  "earphones",
  "earbuds",
  "airpods",
  "buds",
  "bluetooth",
  "usb",
  "wireless",
  "hands-free",
  "handsfree",
  "external",
  "line in",
  "front panel",
  "jack",
  "jabra",
  "plantronics",
  "logitech",
  "sennheiser",
  "poly",
  "hyperx",
  "boat",
  "noise",
  "realme",
  "oneplus",
  "sony",
  "bose",
  "audio-technica",
  "corsair",
  "steelseries",
  "razer",
  "anker",
  "soundcore",
  "epos",
  "beyerdynamic"
];

export const INTERNAL_BUILTIN_KEYWORDS = [
  "internal microphone",
  "built-in microphone",
  "builtin microphone",
  "integrated microphone",
  "microphone array",
  "mic array",
  "pc speaker",
  "pc speakers",
  "laptop speaker",
  "laptop speakers",
  "internal speaker",
  "internal speakers",
  "intel smart sound",
  "intel(r) smart sound",
  "amd audio coprocessor"
];

/**
 * Check if a device label represents an external headset/headphone
 */
export function isExternalHeadsetDevice(label = "") {
  if (!label || typeof label !== "string") return false;
  const lower = label.toLowerCase();
  return EXTERNAL_HEADSET_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Check if a device label represents a built-in / internal device mic or speaker
 */
export function isInternalBuiltinDevice(label = "") {
  if (!label || typeof label !== "string") return false;
  const lower = label.toLowerCase();
  return INTERNAL_BUILTIN_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Perform a physical/hardware check of audio input (mic) and audio output (sound/headphones).
 * Strictly requires an EXTERNAL headset; rejects built-in device mic & speakers.
 */
export async function verifyHeadsetHardware() {
  if (typeof window === "undefined" || !navigator || !navigator.mediaDevices) {
    return {
      connected: false,
      isExternalHeadset: false,
      reason: "UNSUPPORTED",
      message: "Media devices API not supported in this browser."
    };
  }

  try {
    // Step 1: Pre-check available devices to see if any audio input is present at the port level
    if (navigator.mediaDevices.enumerateDevices) {
      const initialDevices = await navigator.mediaDevices.enumerateDevices();
      const hasAnyAudioInput = initialDevices.some((d) => d.kind === "audioinput");
      if (!hasAnyAudioInput) {
        return {
          connected: false,
          isExternalHeadset: false,
          hasMic: false,
          hasSound: false,
          reason: "NO_MIC_PORT",
          message: "No microphone detected on any port. Please plug in an external headset."
        };
      }
    }

    // Step 2: Request audio stream to test mic connectivity and unlock hardware device labels
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
    } catch (mediaErr) {
      if (mediaErr.name === "NotFoundError" || mediaErr.name === "DevicesNotFoundError") {
        return {
          connected: false,
          isExternalHeadset: false,
          hasMic: false,
          hasSound: false,
          reason: "NO_DEVICE",
          message: "No audio device found on this port. Please connect an external headset."
        };
      }
      if (mediaErr.name === "NotAllowedError" || mediaErr.name === "PermissionDeniedError") {
        return {
          connected: false,
          isExternalHeadset: false,
          hasMic: false,
          hasSound: false,
          reason: "PERMISSION_DENIED",
          message: "Microphone permission is required to verify your headset. Please allow microphone access."
        };
      }
      return {
        connected: false,
        isExternalHeadset: false,
        hasMic: false,
        hasSound: false,
        reason: "HARDWARE_ERROR",
        message: mediaErr.message || "Unable to access audio port on this device."
      };
    }

    // Step 3: Verify the audio track is active and healthy
    const audioTracks = stream ? stream.getAudioTracks() : [];
    const activeTrack = audioTracks.find((t) => t.readyState === "live" && t.enabled);
    const micLabel = activeTrack ? activeTrack.label : "";

    // Stop temporary test tracks immediately so the recording indicator turns off
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (!activeTrack) {
      return {
        connected: false,
        isExternalHeadset: false,
        hasMic: false,
        hasSound: false,
        reason: "TRACK_INACTIVE",
        message: "Microphone port is not actively transmitting. Please re-plug your external headset."
      };
    }

    // Step 4: Enumerate all devices now that labels are unlocked
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter((d) => d.kind === "audioinput");
    const audioOutputs = devices.filter((d) => d.kind === "audiooutput");

    const hasMic = audioInputs.length > 0;
    const hasSound = audioOutputs.length > 0 || typeof AudioContext !== "undefined" || typeof window.Audio !== "undefined";

    if (!hasMic) {
      return {
        connected: false,
        isExternalHeadset: false,
        hasMic: false,
        hasSound,
        reason: "NO_MIC",
        message: "No microphone detected. An external headset with microphone is required."
      };
    }

    // Step 5: Check for EXTERNAL headset vs. Internal Built-in Device Mic/Speakers
    // Search both audio inputs and audio outputs for external headset indicators
    const externalInputDevice = audioInputs.find((d) => isExternalHeadsetDevice(d.label));
    const externalOutputDevice = audioOutputs.find((d) => isExternalHeadsetDevice(d.label));
    const trackIsExternal = isExternalHeadsetDevice(micLabel);

    const hasExternalHeadset = Boolean(externalInputDevice || externalOutputDevice || trackIsExternal);

    // Check if the only available inputs are built-in device mics
    const isOnlyBuiltinMic = audioInputs.every((d) => {
      const lbl = d.label.toLowerCase();
      return (
        lbl.includes("internal") ||
        lbl.includes("built-in") ||
        lbl.includes("builtin") ||
        lbl.includes("microphone array") ||
        lbl.includes("mic array") ||
        lbl.includes("integrated") ||
        lbl.includes("intel smart sound") ||
        lbl.includes("intel(r) smart sound")
      );
    });

    // Pick best external device name or fallback
    const externalName =
      (externalInputDevice && externalInputDevice.label) ||
      (externalOutputDevice && externalOutputDevice.label) ||
      (trackIsExternal && micLabel) ||
      null;

    const detectedBuiltinName =
      micLabel ||
      audioInputs[0]?.label ||
      "Built-in Device Microphone";

    // STRICT INVARIANT: Device internal mic and sound are NOT allowed. External headset is required!
    if (!hasExternalHeadset || isOnlyBuiltinMic) {
      return {
        connected: false,
        isExternalHeadset: false,
        isBuiltinOnly: true,
        hasMic: true,
        hasSound,
        deviceName: detectedBuiltinName,
        audioInputsCount: audioInputs.length,
        audioOutputsCount: audioOutputs.length,
        reason: "BUILTIN_NOT_ALLOWED",
        message: "Headset Not Connected"
      };
    }

    // External headset successfully detected and verified!
    const verifiedDeviceName = externalName || micLabel || "External Headset";

    return {
      connected: true,
      isExternalHeadset: true,
      isBuiltinOnly: false,
      hasMic: true,
      hasSound: true,
      deviceName: verifiedDeviceName,
      audioInputsCount: audioInputs.length,
      audioOutputsCount: audioOutputs.length,
      message: "Headset Connected"
    };
  } catch (err) {
    return {
      connected: false,
      isExternalHeadset: false,
      reason: "ERROR",
      message: err.message || "Failed to verify audio hardware on this device."
    };
  }
}

/**
 * Check if external audio device is currently present (quick non-blocking enumeration check)
 */
export async function quickCheckAudioDevices() {
  if (typeof window === "undefined" || !navigator || !navigator.mediaDevices?.enumerateDevices) {
    return { hasMic: false, hasSound: false, hasExternalHeadset: false };
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasMic = devices.some((d) => d.kind === "audioinput");
    const hasSound = devices.some((d) => d.kind === "audiooutput") || typeof AudioContext !== "undefined";
    const hasExternalHeadset = devices.some((d) => isExternalHeadsetDevice(d.label));
    return { hasMic, hasSound, hasExternalHeadset, count: devices.length };
  } catch {
    return { hasMic: false, hasSound: false, hasExternalHeadset: false };
  }
}

/**
 * Subscribe to hardware port insertion/removal events (e.g. plugging/unplugging 3.5mm jack or USB headset)
 */
export function subscribeToAudioDeviceChanges(callback) {
  if (typeof window === "undefined" || !navigator || !navigator.mediaDevices?.addEventListener) {
    return () => {};
  }

  const handler = async () => {
    try {
      const res = await verifyHeadsetHardware();
      callback(res);
    } catch {
      callback({
        connected: false,
        isExternalHeadset: false,
        message: "Audio device change detection error."
      });
    }
  };

  navigator.mediaDevices.addEventListener("devicechange", handler);
  return () => {
    navigator.mediaDevices.removeEventListener("devicechange", handler);
  };
}
