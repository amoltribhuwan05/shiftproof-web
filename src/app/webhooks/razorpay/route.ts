import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    received: Boolean(payload),
    eventId: `evt_${Date.now()}`,
  });
}
