import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || ""

export const DATA_PATH = process.env.DATA_PATH || ""

export const FRONTEND_URL = process.env.FRONTEND_URL || ""

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || ""
export const DISCORD_APP_ID = process.env.DISCORD_APP_ID || ""