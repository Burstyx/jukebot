import { wsInit } from "@/controllers/ws.controller";
import { FastifyInstance } from "fastify";

export default async function wsRoutes(app: FastifyInstance) {
    app.get("/:guild_id", { websocket: true }, wsInit);
}