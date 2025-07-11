import dotenv from "dotenv";
dotenv.config();

function getEnvVar(key: string) {
    const path = process.env[key];
    if (!path) {
        throw new Error(`${key} environment variable is not defined. Please set it before running the application.`);
    }
    return path;
}

export const PORT = getEnvVar("PORT");

export const DATA_PATH = getEnvVar("DATA_PATH");

export const FRONTEND_URL = getEnvVar("FRONTEND_URL")

export const DISCORD_TOKEN = getEnvVar("DISCORD_TOKEN");
export const DISCORD_APP_ID = getEnvVar("DISCORD_APP_ID");