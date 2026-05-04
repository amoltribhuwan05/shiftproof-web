// ─── Allowed request headers ──────────────────────────────────────────────────
// Allowlist — only these headers are forwarded to GCP API Gateway.
// Everything else (sec-ch-ua*, sec-fetch-*, user-agent, referer, cookie, …)
// is silently dropped. This prevents 431 "Request Header Fields Too Large"
// caused by browser metadata accumulating through Cloudflare → GCP.
const ALLOWED_REQUEST_HEADERS = new Set([
  "authorization",
  "content-type",
  "content-length",
  "accept",
  "x-api-key",
  "x-idempotency-key",
]);

// ─── CORS headers ─────────────────────────────────────────────────────────────
// Sent on every response, including errors and preflight.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
  "Access-Control-Max-Age": "86400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a 204 response for CORS preflight (OPTIONS) requests. */
function handlePreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Builds the upstream request to GCP API Gateway.
 * Copies only the allowed headers and rewrites the host.
 */
function buildUpstreamRequest(request, targetUrl) {
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    if (ALLOWED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  // Tell GCP which host originally received the request.
  headers.set("Host", targetUrl.hostname);
  headers.set("X-Forwarded-Host", request.headers.get("host") ?? "");

  return new Request(targetUrl.toString(), {
    method: request.method,
    headers,
    // GET and HEAD requests must not have a body.
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
    redirect: "follow",
  });
}

/**
 * Copies the upstream response and adds CORS headers to it.
 * Streams the body — does not buffer it in memory.
 */
function buildClientResponse(upstreamResponse) {
  const headers = new Headers(upstreamResponse.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}

/** Returns a JSON error response with CORS headers attached. */
function errorResponse(message, status = 500) {
  return new Response(
    JSON.stringify({ error: "Proxy Error", message, timestamp: new Date().toISOString() }),
    {
      status,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
}

// ─── Worker entry point ───────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    // Step 1 — Answer CORS preflight immediately, no upstream call needed.
    if (request.method === "OPTIONS") {
      return handlePreflight();
    }

    // Step 2 — Validate config.
    if (!env.GCP_GATEWAY_HOST) {
      console.error("[proxy] GCP_GATEWAY_HOST is not set");
      return errorResponse("Proxy misconfigured: GCP_GATEWAY_HOST is missing.", 500);
    }

    try {
      // Step 3 — Rewrite the URL to point at GCP API Gateway.
      const targetUrl = new URL(request.url);
      targetUrl.hostname = env.GCP_GATEWAY_HOST;
      targetUrl.protocol = "https:";
      targetUrl.port = "443";

      console.log(`[proxy] ${request.method} ${request.url} → ${targetUrl}`);

      // Step 4 — Forward with a clean, minimal header set.
      const upstream = buildUpstreamRequest(request, targetUrl);
      const upstreamResponse = await fetch(upstream);

      console.log(`[proxy] GCP responded ${upstreamResponse.status}`);

      // Step 5 — Return the response with CORS headers added.
      return buildClientResponse(upstreamResponse);

    } catch (error) {
      console.error("[proxy] Unexpected error:", error.message);
      return errorResponse(error.message);
    }
  },
};
