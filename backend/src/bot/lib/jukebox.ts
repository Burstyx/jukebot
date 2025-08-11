import { createAudioPlayer, VoiceConnection, AudioPlayerStatus, AudioResource, joinVoiceChannel, AudioPlayerState, createAudioResource } from "@discordjs/voice";
import { Client, Guild } from "discord.js";
import { DATA_PATH } from "@/config/constants";
import path from "path"
import { Channel, Music, PauseStateUpdatedWSMessage, QueueUpdatedWSMessage } from "@jukebot/types";
import { Jukebot } from "../jukebot";
import WS from "@/utils/ws";

export default class Jukebox {
    public pauseState: boolean = true;
    public guild: Guild;
    public currentMusic?: Music;
    public queue: Music[] = [];
    public voiceChannelId: string | undefined;

    private jukebot: Jukebot;
    private voiceConnection: VoiceConnection | undefined;
    private audioPlayer = createAudioPlayer();
    private voiceChannelTimeout: NodeJS.Timeout | undefined;

    constructor(jukebot: Jukebot, guild: Guild) {
        this.jukebot = jukebot;
        this.guild = guild;

        this.audioPlayer.on("stateChange", (_, newState) => {
            if (!this.voiceConnection) return;

            if (newState.status === AudioPlayerStatus.Idle) {
                this.playNextAudio();
            } else {
                this.pauseState = false
                if (this.voiceChannelTimeout) {
                    clearTimeout(this.voiceChannelTimeout)
                    this.voiceChannelTimeout = undefined
                }
            }
        })
    }

    play(music: Music) {
        if (!this.voiceChannelId) return;

        const audioPath = path.join(DATA_PATH, `${music.hash}.opus`)
        const audioResource = createAudioResource(audioPath)

        this.voiceConnection?.subscribe(this.audioPlayer)
        this.audioPlayer.play(audioResource);

        return;
    }

    playNextAudio() {
        const nextAudio = this.queue.shift();
        this.currentMusic = nextAudio;

        const msg: QueueUpdatedWSMessage = {
            type: "queue_updated",
            payload: {
                current_music: this.currentMusic,
                queue: this.queue
            }
        }
        WS.broadcast(this.guild.id, msg)

        if (!nextAudio) {
            this.pauseState = true

            const msg: PauseStateUpdatedWSMessage = {
                type: "pause_state_updated",
                payload: {
                    pause: this.pauseState
                }
            }

            WS.broadcast(this.guild.id, msg)
        } else {
            this.pauseState = false
            this.play(nextAudio)

            const msg: PauseStateUpdatedWSMessage = {
                type: "pause_state_updated",
                payload: {
                    pause: this.pauseState
                }
            }

            WS.broadcast(this.guild.id, msg)
        }
    }

    clearQueue() {
        this.queue = []
        this.currentMusic = undefined
        this.pauseState = true
        this.audioPlayer.stop(true)

        const msg: QueueUpdatedWSMessage = {
            type: "queue_updated",
            payload: {
                current_music: this.currentMusic,
                queue: this.queue
            }
        }
        WS.broadcast(this.guild.id, msg)

        const msg2: PauseStateUpdatedWSMessage = {
            type: "pause_state_updated",
            payload: {
                pause: this.pauseState
            }
        }

        WS.broadcast(this.guild.id, msg2)
    }

    async updatePauseState(pauseState: boolean) {
        if (pauseState) this.pause()
        else this.unpause()
    }

    private pause() {
        this.pauseState = true
        this.audioPlayer.pause()

        const msg: PauseStateUpdatedWSMessage = {
            type: "pause_state_updated",
            payload: {
                pause: this.pauseState
            }
        }

        WS.broadcast(this.guild.id, msg)
    }

    private unpause() {
        this.pauseState = false
        if (!this.currentMusic) this.playNextAudio()
        else this.audioPlayer.unpause()

        const msg: PauseStateUpdatedWSMessage = {
            type: "pause_state_updated",
            payload: {
                pause: this.pauseState
            }
        }

        WS.broadcast(this.guild.id, msg)
    }

    joinVoiceChannel() {
        if (!this.voiceChannelId) return;
        this.voiceConnection = joinVoiceChannel({
            adapterCreator: this.guild.voiceAdapterCreator,
            channelId: this.voiceChannelId,
            guildId: this.guild.id
        })
    }

    destroy() {
        try {
            this.audioPlayer.stop();
            this.voiceConnection?.destroy();
            clearTimeout(this.voiceChannelTimeout);
        } catch { }
    }
}