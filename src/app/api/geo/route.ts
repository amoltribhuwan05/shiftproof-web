import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const city    = req.headers.get("cf-ipcity")      ?? "";
  const country = req.headers.get("cf-ipcountry")   ?? "";
  const region  = req.headers.get("cf-ipregion")    ?? "";
  const lat     = req.headers.get("cf-iplatitude")  ?? "";
  const lon     = req.headers.get("cf-iplongitude") ?? "";

  return NextResponse.json({
    city,
    country,
    region,
    latitude:  lat ? parseFloat(lat) : null,
    longitude: lon ? parseFloat(lon) : null,
  });
}
