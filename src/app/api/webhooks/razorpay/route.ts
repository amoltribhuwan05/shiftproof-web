import { NextRequest, NextResponse } from "next/server";

/**
 * POST /webhooks/razorpay
 *
 * Razorpay webhook callback.
 *
 * Production requirement: verify X-Razorpay-Signature header via HMAC-SHA256
 * using RAZORPAY_WEBHOOK_SECRET before processing any event.
 *
 * This mock always returns 200 to prevent Razorpay retries during development.
 * The signature is intentionally NOT verified in mock mode.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get("X-Razorpay-Signature");

  // In production the real backend performs:
  //   const hmac = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!);
  //   hmac.update(rawBody);
  //   const expected = hmac.digest("hex");
  //   if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return 401;

  if (process.env.NODE_ENV !== "production") {
    console.info("[webhook/razorpay] mock — signature check skipped, sig:", signature);
  }

  const res = NextResponse.json({ received: true }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}
