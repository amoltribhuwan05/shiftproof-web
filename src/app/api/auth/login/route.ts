import { NextRequest, NextResponse } from "next/server";
import { findUser, SESSION_COOKIE, Session } from "@/lib/users";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = findUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

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
