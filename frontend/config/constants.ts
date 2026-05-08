type PublicEnvKey = "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_WS_URL";

const defaults: Record<PublicEnvKey, string> = {
  NEXT_PUBLIC_API_URL: "http://localhost:3001/api/v1",
  NEXT_PUBLIC_WS_URL: "ws://localhost:3001/api/v1/ws",
};

export function getEnvVar(key: PublicEnvKey) {
  const value = process.env[key] || defaults[key];
  return value.replace(/\/$/, "");
}
