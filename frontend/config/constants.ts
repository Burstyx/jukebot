type PublicEnvKey = "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_WS_URL";

const defaults: Record<PublicEnvKey, string> = {
  NEXT_PUBLIC_API_URL: "http://localhost:3001/api/v1",
  NEXT_PUBLIC_WS_URL: "ws://localhost:3001/api/v1/ws",
};

export function getEnvVar(key: PublicEnvKey) {
  const value = resolvePublicEnv(key);
  return value.replace(/\/$/, "");
}

function resolvePublicEnv(key: PublicEnvKey) {
  const value = process.env[key] || defaults[key];

  if (typeof window === "undefined") return value;

  const isLocalPage =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalPage || !value.includes("localhost")) return value;

  const protocol = key === "NEXT_PUBLIC_WS_URL" ? "ws:" : window.location.protocol;
  const path = key === "NEXT_PUBLIC_WS_URL" ? "/api/v1/ws" : "/api/v1";

  return `${protocol}//${window.location.hostname}:3001${path}`;
}
