import { wsInit } from "@/controllers/ws.controller";
import { FastifyInstance, FastifyRequest } from "fastify";

export default async function wsRoutes(app: FastifyInstance) {
    app.get("/:guild_id", { websocket: true }, (socket, req: FastifyRequest<{ Params: { guild_id: string } }>) => wsInit(socket, req, app.jukebot));
}