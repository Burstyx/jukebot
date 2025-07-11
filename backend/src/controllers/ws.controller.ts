import WSHandler from "@/services/ws.service";
import { sendTo } from "@/utils/ws";
import { WebSocket } from "@fastify/websocket";
import { FastifyRequest } from "fastify";

const connections = new Map<string, Set<WebSocket>>

export async function wsInit(socket: WebSocket, req: FastifyRequest<{ Params: { guild_id: string } }>) {
    const guildId = req.params.guild_id

    if (!guildId)
        return

    // Ajout du client dans la liste (création de la liste si elle existe po)
    console.log("Client connecté");
    if (!connections.has(guildId))
        connections.set(guildId, new Set())
    connections.get(guildId)?.add(socket)

    // On envoie les infos actuels
    sendTo(socket, {
        type: "init",
        payload: {

        }
    })

    socket.on("message", async (rawMessage) => {
        try {
            const data = JSON.parse(rawMessage.toString())

            if (!data.type) {
                return sendTo(socket, {
                    type: "error",
                    payload: {
                        message: "Une requête n'a pas pu aboutir, la version de votre application est peut être trop ancienne"
                    }
                })
            } else {
                switch (data.type) {
                    case "hello":
                        return await WSHandler.hello(socket)
                    default:
                        return sendTo(socket, {
                            type: "error",
                            payload: {
                                message: "Une requête n'a pas pu aboutir, la version de votre application est peut être trop ancienne"
                            }
                        })
                }
            }
        } catch {
            return sendTo(socket, {
                type: "error",
                payload: {
                    message: "Une requête n'a pas pu aboutir, le format de la requête est invalide"
                }
            })
        }
    });

    socket.on("close", () => {
        console.log("Client déconnecté");

        connections.get(guildId)?.delete(socket)
        if (connections.get(guildId)?.size === 0) connections.delete(guildId)
    });
}