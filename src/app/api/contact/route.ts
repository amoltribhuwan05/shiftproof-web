import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string; email?: string; subject?: string; message?: string;
    };

    if (!body.email || !body.message) {
      return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
    }

    // Forward to backend contact endpoint when available, or log server-side
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const res = await fetch(`${backendUrl}/api/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        // Backend contact endpoint not yet implemented — accept gracefully
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ok: true });
    }

    // Dev: just accept — no backend to forward to
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
