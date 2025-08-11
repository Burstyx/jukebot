import { WSClientMessage, WSServerMessage, UpdateVCWSMessage } from "@jukebot/types"
import EventEmitter from "events"

export default class WSService {
    static wsEvents = new EventEmitter()

    static async handle(rawMessage: string) {
        try {
            const data = JSON.parse(rawMessage.toString()) as WSServerMessage
            switch (data.type) {
                case "update_vc":
                    return this.wsEvents.emit("update_vc", data.payload.channelId)
                case "music_added":
                    return this.wsEvents.emit("music_added", data.payload.music)
                case "music_removed":
                    return this.wsEvents.emit("music_removed", data.payload.music)
                case "queue_updated":
                    return this.wsEvents.emit("queue_updated", data.payload.current_music, data.payload.queue)
                case "pause_state_updated":
                    return this.wsEvents.emit("pause_state_updated", data.payload.pause)
            }
        } catch (err) {
            console.error(err);
        }
    }
}