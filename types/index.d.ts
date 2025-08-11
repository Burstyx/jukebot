// WSMessages


export interface MusicAddedWSMessage extends BaseWSMessage {
    type: "music_added",
    payload: {
        music: Music
    }
}

export interface ClearQueueWSMessage extends BaseWSMessage {
    type: "clear_queue",
}

export interface NextAudioWSMessage extends BaseWSMessage {
    type: "next_audio",
}

export interface PauseStateUpdatedWSMessage extends BaseWSMessage {
    type: "pause_state_updated",
    payload: {
        pause: boolean
    }
}

export interface QueueUpdatedWSMessage extends BaseWSMessage {
    type: "queue_updated",
    payload: {
        current_music?: Music,
        queue: Music[]
    }
}

export interface MusicRemovedWSMessage extends BaseWSMessage {
    type: "music_removed",
    payload: {
        music: Music
    }
}

interface PlayMusicWSMessage extends BaseWSMessage {
    type: "play_music",
    payload: {
        hash: string
    }
}

interface ErrorWSMessage extends BaseWSMessage {
    type: "error",
    payload: {
        message: string
    }
}

interface UpdateVCWSMessage extends BaseWSMessage {
    type: "update_vc",
    payload: {
        channelId?: string
    }
}

interface BaseWSMessage {
    type: string,
    payload?: any
}

export type WSServerMessage = ErrorWSMessage | UpdateVCWSMessage | MusicAddedWSMessage |
    MusicRemovedWSMessage | QueueUpdatedWSMessage | PauseStateUpdatedWSMessage
export type WSClientMessage = PlayMusicWSMessage | UpdateVCWSMessage | PauseStateUpdatedWSMessage |
    NextAudioWSMessage | ClearQueueWSMessage
export type Channel = { name: string; id: string }
export type Music = { hash: string, name: string, author: string, }