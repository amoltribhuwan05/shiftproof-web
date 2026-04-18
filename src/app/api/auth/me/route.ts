import { NextRequest, NextResponse } from "next/server";
import { parseSession, SESSION_COOKIE } from "@/lib/users";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const session = parseSession(raw);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json(session);
}
