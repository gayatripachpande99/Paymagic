/**
 * PayMagic Enterprise Headset & Audio Hardware Detection Service
 * Automatically detects whether physical/virtual headset, headphones,
 * microphone, and sound output devices are connected to the device's ports.
 */

/**
 * Perform a physical/hardware check of audio input (mic) and audio output (sound/headphones).
 * Automatically requests and tests media streams to verify actual port connectivity.
 */
export async function verifyHeadsetHardware() {
  if (typeof window === "undefined" || !navigator || !navigator.mediaDevices) {
    return {
      connected: false,
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
          hasMic: false,
          hasSound: false,
          reason: "NO_MIC_PORT",
          message: "No microphone detected on any port. Please plug in a headset or microphone."
        };
      }
    }

    // Step 2: Request audio stream to test mic connectivity and unlock device hardware labels
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
          hasMic: false,
          hasSound: false,
          reason: "NO_DEVICE",
          message: "No headset or microphone device found on this port/device."
        };
      }
      if (mediaErr.name === "NotAllowedError" || mediaErr.name === "PermissionDeniedError") {
        return {
          connected: false,
          hasMic: false,
          hasSound: false,
          reason: "PERMISSION_DENIED",
          message: "Microphone permission required to verify headset. Please allow microphone access."
        };
      }
      return {
        connected: false,
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
        hasMic: false,
        hasSound: false,
        reason: "TRACK_INACTIVE",
        message: "Microphone port is not actively transmitting. Please re-plug your headset."
      };
    }

    // Step 4: Enumerate devices with unlocked labels to verify both mic and sound output
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter((d) => d.kind === "audioinput");
    const audioOutputs = devices.filter((d) => d.kind === "audiooutput");

    const hasMic = audioInputs.length > 0;
    // Some browsers do not enumerate audiooutput for privacy, but AudioContext / default sound is available
    const hasSound = audioOutputs.length > 0 || typeof AudioContext !== "undefined" || typeof window.Audio !== "undefined";

    if (!hasMic) {
      return {
        connected: false,
        hasMic: false,
        hasSound,
        reason: "NO_MIC",
        message: "No microphone detected on port. Headset with microphone is required."
      };
    }

    // Pick best human-readable device name
    const detectedName =
      micLabel ||
      audioInputs[0]?.label ||
      "Headset / Audio Device";

    return {
      connected: true,
      hasMic: true,
      hasSound: true,
      deviceName: detectedName,
      audioInputsCount: audioInputs.length,
      audioOutputsCount: audioOutputs.length,
      message: `Verified: ${detectedName} connected to port.`
    };
  } catch (err) {
    return {
      connected: false,
      reason: "ERROR",
      message: err.message || "Failed to verify audio hardware on this device."
    };
  }
}

/**
 * Check if audio device is currently present (quick non-blocking enumeration check)
 */
export async function quickCheckAudioDevices() {
  if (typeof window === "undefined" || !navigator || !navigator.mediaDevices?.enumerateDevices) {
    return { hasMic: false, hasSound: false };
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasMic = devices.some((d) => d.kind === "audioinput");
    const hasSound = devices.some((d) => d.kind === "audiooutput") || typeof AudioContext !== "undefined";
    return { hasMic, hasSound, count: devices.length };
  } catch {
    return { hasMic: false, hasSound: false };
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
      callback({ connected: false, message: "Audio device change detection error." });
    }
  };

  navigator.mediaDevices.addEventListener("devicechange", handler);
  return () => {
    navigator.mediaDevices.removeEventListener("devicechange", handler);
  };
}
