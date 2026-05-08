import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

export const PORT = process.env.PORT || "3001";

export const DATA_PATH = process.env.DATA_PATH || "./data";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
export const DISCORD_APP_ID = process.env.DISCORD_APP_ID || "";
