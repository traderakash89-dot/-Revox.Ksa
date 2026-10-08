// Comprehensive Admin Security & Device Tracking System for Revox Control Room
// Master Access Code: 722566
// 3-Attempt Permanent Lockout & Device Fingerprint Tracker

export const MASTER_ADMIN_SECRET_CODE = '722566';

export interface DeviceMetadata {
  deviceId: string;
  os: string;
  browser: string;
  deviceType: string;
  summaryName: string;
  screenResolution: string;
  userAgent: string;
  firstSeen: string;
  lastLogin: string;
}

export interface AdminSessionInfo {
  token: string;
  role: 'super_admin';
  name: string;
  email?: string;
  deviceId: string;
  deviceMeta: DeviceMetadata;
}

// Generate or retrieve persistent device fingerprint ID
export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem('revox_admin_device_id');
    if (existing && existing.trim()) return existing;

    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timePart = Date.now().toString(36).toUpperCase();
    const newId = `REV-DEV-${randomPart}-${timePart}`;
    localStorage.setItem('revox_admin_device_id', newId);
    if (!localStorage.getItem('revox_device_first_seen')) {
      localStorage.setItem('revox_device_first_seen', new Date().toISOString());
    }
    return newId;
  } catch {
    return 'REV-DEV-STANDALONE';
  }
}

// Inspect browser environment to build human-readable device profile
export function getDeviceMetadata(): DeviceMetadata {
  const deviceId = getOrCreateDeviceId();
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceType = 'Desktop';

  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';

    // OS detection
    if (/iPhone|iPad|iPod/i.test(ua)) {
      os = 'iOS Apple Mobile';
      deviceType = 'Mobile';
    } else if (/Android/i.test(ua)) {
      os = 'Android Device';
      deviceType = 'Mobile';
    } else if (/Mac OS X|Macintosh/i.test(ua)) {
      os = 'macOS Apple Workstation';
      deviceType = 'Desktop';
    } else if (/Windows/i.test(ua)) {
      os = 'Windows Workstation';
      deviceType = 'Desktop';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux System';
      deviceType = 'Desktop';
    }

    // Browser detection
    if (/Edg/i.test(ua)) {
      browser = 'Microsoft Edge';
    } else if (/Chrome|CriOS/i.test(ua)) {
      browser = 'Google Chrome';
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browser = 'Apple Safari';
    } else if (/Firefox|FxiOS/i.test(ua)) {
      browser = 'Mozilla Firefox';
    } else {
      browser = 'Webkit Browser';
    }
  }

  const screenRes =
    typeof window !== 'undefined'
      ? `${window.screen?.width || 0}x${window.screen?.height || 0} (${window.devicePixelRatio || 1}x)`
      : 'Standard Display';

  let firstSeen = '';
  let lastLogin = '';
  try {
    firstSeen = localStorage.getItem('revox_device_first_seen') || new Date().toISOString();
    lastLogin = localStorage.getItem('revox_admin_last_login') || 'Never';
  } catch {}

  const summaryName = `${os} (${browser})`;

  return {
    deviceId,
    os,
    browser,
    deviceType,
    summaryName,
    screenResolution: screenRes,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    firstSeen,
    lastLogin,
  };
}

// Check if this device is permanently locked out (banned)
export function isAdminDeviceBanned(): boolean {
  try {
    const isBanned = localStorage.getItem('revox_admin_device_banned') === 'true';
    const attempts = parseInt(localStorage.getItem('revox_admin_failed_attempts') || '0', 10);
    return isBanned || attempts >= 3;
  } catch {
    return false;
  }
}

// Lock out this device permanently
export function banCurrentDevice(): void {
  try {
    const now = new Date().toISOString();
    localStorage.setItem('revox_admin_device_banned', 'true');
    localStorage.setItem('revox_admin_banned_timestamp', now);
    localStorage.setItem('revox_admin_failed_attempts', '3');
    localStorage.removeItem('revox_admin_session_token');
    localStorage.removeItem('revox_admin_authorized_device_id');
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('revox_admin_security_changed'));
  }
}

// Get count of failed attempts
export function getFailedAttemptsCount(): number {
  try {
    const val = localStorage.getItem('revox_admin_failed_attempts');
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

// Record a failed attempt, triggering ban on 3rd attempt
export function recordFailedAttempt(): { failedCount: number; isBanned: boolean } {
  const current = getFailedAttemptsCount();
  const next = current + 1;
  try {
    localStorage.setItem('revox_admin_failed_attempts', String(next));
  } catch {}

  if (next >= 3) {
    banCurrentDevice();
    return { failedCount: 3, isBanned: true };
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('revox_admin_security_changed'));
  }

  return { failedCount: next, isBanned: false };
}

// Verify secret code (Master: 722566)
export function verifySecretAdminCode(code: string): {
  success: boolean;
  failedCount?: number;
  isBanned?: boolean;
  session?: AdminSessionInfo;
  error?: string;
} {
  if (isAdminDeviceBanned()) {
    return {
      success: false,
      isBanned: true,
      error: 'CRITICAL ACCESS TERMINATION: This device has been permanently blocked from Revox Admin Room.',
    };
  }

  const cleanCode = code.trim().replace(/\s+/g, '');
  if (cleanCode === MASTER_ADMIN_SECRET_CODE) {
    // SUCCESS
    const deviceId = getOrCreateDeviceId();
    const token = `revox-auth-${deviceId}-${Date.now()}`;
    const now = new Date().toISOString();

    try {
      localStorage.removeItem('revox_admin_failed_attempts');
      localStorage.setItem('revox_admin_authorized_device_id', deviceId);
      localStorage.setItem('revox_admin_session_token', token);
      localStorage.setItem('revox_admin_last_login', now);
      localStorage.setItem('revox_admin_device_authorized', 'true');
    } catch {}

    const meta = getDeviceMetadata();
    meta.lastLogin = now;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('revox_admin_security_changed'));
    }

    return {
      success: true,
      session: {
        token,
        role: 'super_admin',
        name: 'Revox Administrator',
        email: 'admin@revox.ksa',
        deviceId,
        deviceMeta: meta,
      },
    };
  }

  // FAILED CODE
  const result = recordFailedAttempt();
  const remaining = 3 - result.failedCount;

  return {
    success: false,
    failedCount: result.failedCount,
    isBanned: result.isBanned,
    error: result.isBanned
      ? 'CRITICAL SECURITY BREACH: 3 consecutive failed attempts detected. Access permanently revoked for this device.'
      : `Invalid Secret Code. Warning: ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before permanent device ban.`,
  };
}

// Check persistent session on authorized device
// "always keep logging on the before. Logging device."
export function checkPersistentAdminSession(): AdminSessionInfo | null {
  if (isAdminDeviceBanned()) return null;

  try {
    const currentDeviceId = getOrCreateDeviceId();
    const authorizedDeviceId = localStorage.getItem('revox_admin_authorized_device_id');
    const sessionToken = localStorage.getItem('revox_admin_session_token');

    // If session token exists:
    if (sessionToken) {
      // If authorized device ID was already bound to this device, or if previous session existed, authorize
      if (!authorizedDeviceId || authorizedDeviceId === currentDeviceId) {
        if (!authorizedDeviceId) {
          localStorage.setItem('revox_admin_authorized_device_id', currentDeviceId);
        }
        const meta = getDeviceMetadata();
        return {
          token: sessionToken,
          role: 'super_admin',
          name: 'Revox Administrator',
          email: 'admin@revox.ksa',
          deviceId: currentDeviceId,
          deviceMeta: meta,
        };
      }
    }
  } catch {}

  return null;
}

// Clear active session (when manually logging out)
export function clearAdminSession(keepDeviceAuthorized: boolean = true): void {
  try {
    localStorage.removeItem('revox_admin_session_token');
    if (!keepDeviceAuthorized) {
      localStorage.removeItem('revox_admin_authorized_device_id');
      localStorage.removeItem('revox_admin_device_authorized');
    }
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('revox_admin_security_changed'));
  }
}
