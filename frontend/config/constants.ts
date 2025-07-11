export function getEnvVar(key: "NEXT_PUBLIC_API_URL") {
    const path = process.env[key];
    if (!path) {
        throw new Error(`${key} environment variable is not defined. Please set it before running the application.`);
    }
    return path;
}