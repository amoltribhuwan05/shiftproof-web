import { NextRequest, NextResponse } from "next/server";
import { addUser, findUserByEmail, SESSION_COOKIE, Session } from "@/lib/users";
import type { Role } from "@/lib/users";

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: string;
  };

  const { name, email, phone, password, role } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!phone || !PHONE_RE.test(phone.replace(/\D/g, ""))) return NextResponse.json({ error: "Valid 10-digit mobile number is required" }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  if (role !== "owner" && role !== "tenant") return NextResponse.json({ error: "Role must be owner or tenant" }, { status: 400 });

  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = addUser({
    name: name.trim(),
    email: email.toLowerCase(),
    phone: phone.replace(/\D/g, ""),
    password,
    role: role as Role,
  });

  const session: Session = { id: user.id, role: user.role, name: user.name, email: user.email };
  const res = NextResponse.json({ role: user.role, name: user.name });

  res.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
