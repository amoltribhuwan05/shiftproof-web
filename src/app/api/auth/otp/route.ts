import { NextRequest, NextResponse } from "next/server";
import { generateOtp, verifyOtp } from "@/lib/otp";
import { findUserByEmail, updatePassword } from "@/lib/users";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    action?: string;
    email?: string;
    code?: string;
    newPassword?: string;
  };

  const { action, email } = body;

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  if (action === "send") {
    if (!findUserByEmail(email)) {
      // Return same response to avoid email enumeration
      return NextResponse.json({ ok: true, _demo_code: "000000" });
    }
    const code = generateOtp(email);
    // In production this would send SMS/email — for demo we return it in the response
    return NextResponse.json({ ok: true, _demo_code: code });
  }

  if (action === "verify") {
    const { code, newPassword } = body;
    if (!code) return NextResponse.json({ error: "OTP code is required" }, { status: 400 });
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    if (!verifyOtp(email, code)) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    updatePassword(email, newPassword);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
