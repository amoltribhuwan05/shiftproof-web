import "server-only";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function envFlag(name: string): boolean {
  return TRUE_VALUES.has((process.env[name] ?? "").toLowerCase());
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isMockApiAllowed(): boolean {
  return !isProductionRuntime() || envFlag("ALLOW_MOCK_API");
}

export function isDemoAuthAllowed(): boolean {
  return !isProductionRuntime() || envFlag("ALLOW_DEMO_AUTH");
}

export function getBackendApiBase(requestOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_ORIGIN ?? "";
  if (configured) return configured.replace(/\/$/, "");
  return isProductionRuntime() ? "" : (requestOrigin ?? "");
}
