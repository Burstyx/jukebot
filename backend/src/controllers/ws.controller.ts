import { Jukebot } from "@/bot/jukebot";
import WSService from "@/services/ws.service";
import WS from "@/utils/ws"
import { WebSocket } from "@fastify/websocket";
import { WSServerMessage } from "@jukebot/types";
import { FastifyRequest } from "fastify";

export async function wsInit(socket: WebSocket, req: FastifyRequest<{ Params: { guild_id: string } }>, jukebot: Jukebot) {
    const guildId = req.params.guild_id

    // Check if guildId is valid
    if (!guildId || !jukebot.IsInGuild(guildId)) {
        const msg: WSServerMessage = {
            type: "error",
            payload: {
                message: "Impossible de se connecter au serveur Discord demandé"
            }
        }
        return socket.send(JSON.stringify(msg), _ => socket.close())
    }

    // Add new client to connections list
    console.log("Client connecté");
    if (!WS.connections.has(guildId))
        WS.connections.set(guildId, new Set())
    WS.connections.get(guildId)?.add(socket)

    // Creating jukebox and message handler
    jukebot.createAndGetJukebox(guildId)
    const wsHandler = new WSService(socket, jukebot, guildId)
    socket.on("message", (rawMessage) => wsHandler.handle(rawMessage.toString()));

    // Remove client from connections list
    socket.on("close", () => {
        console.log("Client déconnecté");
        WS.connections.get(guildId)?.delete(socket)
        if (WS.connections.get(guildId)?.size === 0) WS.connections.delete(guildId)
    });
}