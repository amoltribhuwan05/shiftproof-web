import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isProductionRuntime } from "@/lib/serverEnv";

/**
 * POST /webhooks/razorpay
 *
 * Razorpay webhook callback.
 *
 * Production requirement: verify X-Razorpay-Signature header via HMAC-SHA256
 * using RAZORPAY_WEBHOOK_SECRET before processing any event.
 *
 * Development mode returns an acknowledgment so Razorpay does not retry local
 * tests. Production verifies the HMAC before acknowledging the event.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get("X-Razorpay-Signature");
  const rawBody = await req.text();

  if (isProductionRuntime()) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay webhook secret is not configured" },
        { status: 503 },
      );
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing Razorpay signature" }, { status: 401 });
    }

    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const actualBytes = Buffer.from(signature, "hex");
    const expectedBytes = Buffer.from(expected, "hex");

    if (
      actualBytes.length !== expectedBytes.length ||
      !timingSafeEqual(actualBytes, expectedBytes)
    ) {
      return NextResponse.json({ error: "Invalid Razorpay signature" }, { status: 401 });
    }
  } else {
    console.info("[webhook/razorpay] mock — signature check skipped, sig:", signature);
  }

  const res = NextResponse.json({ received: true }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}
