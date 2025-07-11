import { WebSocket } from "@fastify/websocket";
import { WSMessage } from "@jukebot/shared";

export async function sendTo(socket: WebSocket, msg: WSMessage) {
    return socket.send(JSON.stringify(msg))
}

export async function sendToAll(sockets: Set<WebSocket>, msg: WSMessage) {

}

export async function handleMessage(sender: WebSocket, msg: WSMessage) {

}