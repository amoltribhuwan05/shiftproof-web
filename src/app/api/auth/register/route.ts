import { NextRequest, NextResponse } from "next/server";
import { addUser, findUserByEmail, SESSION_COOKIE, Session, upsertUserByEmail } from "@/lib/users";

const PHONE_RE = /^\+\d{7,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    gender?: string;
    deferSession?: boolean;
  };

  const { name, email, phone, password, gender, deferSession } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  // Phone is optional — validate format only when provided
  const cleanPhone = phone?.replace(/[^\d+]/g, "") ?? "";
  if (cleanPhone && !PHONE_RE.test(cleanPhone)) {
    return NextResponse.json({ error: "Valid mobile number with country code is required" }, { status: 400 });
  }

  if (!deferSession && findUserByEmail(email)) {
    return NextResponse.json(
      { error: "Registration unsuccessful. If you already have an account, please sign in." },
      { status: 400 }
    );
  }

  const VALID_GENDERS = ["MALE", "FEMALE", "CO_LIVING"] as const;
  type ValidGender = typeof VALID_GENDERS[number];
  const normalizedGender = gender?.toUpperCase() as ValidGender | undefined;
  const safeGender = normalizedGender && VALID_GENDERS.includes(normalizedGender)
    ? normalizedGender
    : undefined;

  // Role is determined server-side by subscription/residency — default to tenant in mock
  const userData = {
    name: name.trim(),
    email: email.toLowerCase(),
    phone: cleanPhone,
    password,
    role: "tenant" as const,
    ...(safeGender ? { gender: safeGender } : {}),
  };
  const user = deferSession ? upsertUserByEmail(userData) : addUser(userData);

  if (deferSession) {
    return NextResponse.json({ role: user.role, name: user.name, deferred: true });
  }

  const session: Session = { id: user.id, role: user.role, name: user.name, email: user.email };
  const res = NextResponse.json({ role: user.role, name: user.name });

  res.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
