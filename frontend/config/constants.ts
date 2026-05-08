type PublicEnvKey = "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_WS_URL";

const publicEnv: Record<PublicEnvKey, string | undefined> = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
};

export function getEnvVar(key: PublicEnvKey) {
  const value = publicEnv[key];

  if (!value) {
    throw new Error(`${key} is not defined`);
  }

  return value.replace(/\/$/, "");
}
