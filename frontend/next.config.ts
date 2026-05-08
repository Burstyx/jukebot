import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

const rootDir = process.cwd().endsWith(`${path.sep}frontend`)
  ? path.resolve(process.cwd(), "../")
  : process.cwd();
dotenv.config({ path: path.join(rootDir, ".env"), quiet: true });

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not defined`);
  return value;
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: rootDir,
  env: {
    NEXT_PUBLIC_API_URL: requiredEnv("NEXT_PUBLIC_API_URL"),
    NEXT_PUBLIC_WS_URL: requiredEnv("NEXT_PUBLIC_WS_URL"),
  },
};

export default nextConfig;
