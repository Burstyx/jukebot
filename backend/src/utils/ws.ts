import { WebSocket } from "@fastify/websocket";
import { WSServerMessage } from "@jukebot/types";

export default class WS {
    static connections = new Map<string, Set<WebSocket>>

    static broadcast(guildId: string, msg: WSServerMessage) {
        this.connections.get(guildId)?.forEach((con) => {
            con.send(JSON.stringify(msg))
        })
    }
}