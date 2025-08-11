import { Jukebot } from "@/bot/jukebot";
import WS from "@/utils/ws";
import { WebSocket } from "@fastify/websocket";
import { ClearQueueWSMessage, NextAudioWSMessage, PauseStateUpdatedWSMessage, QueueUpdatedWSMessage, UpdateVCWSMessage, WSClientMessage, WSServerMessage } from "@jukebot/types";

export default class WSService {
    socket: WebSocket
    jukebot: Jukebot
    guildId: string

    constructor(socket: WebSocket, jukebot: Jukebot, guildId: string) {
        this.socket = socket
        this.jukebot = jukebot
        this.guildId = guildId
    }

    async handle(rawMessage: string) {
        try {
            const data = JSON.parse(rawMessage.toString()) as WSClientMessage

            if (!data.type) {
                const msg: WSServerMessage = {
                    type: "error",
                    payload: {
                        message: "Impossible de déterminer le type de la requête WS"
                    }
                }
                return this.socket.send(JSON.stringify(msg))
            } else {
                // Handle messages
                switch (data.type) {
                    case "update_vc":
                        return await this.updateVC(this.socket, data)
                    case "pause_state_updated":
                        return await this.updatePauseState(this.socket, data)
                    case "next_audio":
                        return await this.nextAudio(this.socket, data)
                    case "clear_queue":
                        return await this.clearQueue(this.socket, data)
                    default:
                        const msg: WSServerMessage = {
                            type: "error",
                            payload: {
                                message: "Le type de la requête WS n'existe pas"
                            }
                        }
                        return this.socket.send(JSON.stringify(msg))
                }
            }
        } catch (err) {
            const msg: WSServerMessage = {
                type: "error",
                payload: {
                    message: "Une erreur s'est produite lors du traitement de la requête WS"
                }
            }

            console.error(err);
            return this.socket.send(JSON.stringify(msg))
        }
    }

    private async updateVC(socket: WebSocket, data: UpdateVCWSMessage) {
        const jukebox = await this.jukebot.createAndGetJukebox(this.guildId)
        jukebox.voiceChannelId = data.payload.channelId
        jukebox.joinVoiceChannel()
    }

    private async updatePauseState(socket: WebSocket, data: PauseStateUpdatedWSMessage) {
        const jukebox = await this.jukebot.createAndGetJukebox(this.guildId)
        await jukebox.updatePauseState(data.payload.pause);
    }

    private async nextAudio(socket: WebSocket, data: NextAudioWSMessage) {
        const jukebox = await this.jukebot.createAndGetJukebox(this.guildId)
        jukebox.playNextAudio();
    }

    private async clearQueue(socket: WebSocket, data: ClearQueueWSMessage) {
        const jukebox = await this.jukebot.createAndGetJukebox(this.guildId)
        jukebox.clearQueue()
    }
}