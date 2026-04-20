interface OtpEntry {
  code: string;
  expiresAt: number;
}

// Module-level store — resets on server restart (demo only)
const OTP_STORE = new Map<string, OtpEntry>();

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateOtp(key: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE.set(key.toLowerCase(), { code, expiresAt: Date.now() + TTL_MS });
  return code;
}

export function verifyOtp(key: string, code: string): boolean {
  const entry = OTP_STORE.get(key.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    OTP_STORE.delete(key.toLowerCase());
    return false;
  }
  if (entry.code !== code.trim()) return false;
  OTP_STORE.delete(key.toLowerCase());
  return true;
}
