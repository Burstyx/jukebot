type PublicEnvKey = "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_WS_URL";

export function getEnvVar(key: PublicEnvKey) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not defined`);
  }

  return value.replace(/\/$/, "");
}
