import { createAudioPlayer, VoiceConnection, AudioPlayerStatus, AudioResource, joinVoiceChannel, AudioPlayerState } from "@discordjs/voice";
import { Guild } from "discord.js";
import { JukebotClient } from "../types/global";

export default class Jukebox {
    private client: JukebotClient;
    private audioPlayer = createAudioPlayer();
    private queue: {
        hash: string,
        audioResource: AudioResource
    }[] = [];
    private guild: Guild;
    private voiceChannelId: string | undefined;
    private voiceConnection: VoiceConnection | undefined;
    private voiceChannelTimeout: NodeJS.Timeout | undefined;

    constructor(client: JukebotClient, guild: Guild, defaultVoiceChannelId: string) {
        this.client = client;
        this.guild = guild;
        this.voiceChannelId = defaultVoiceChannelId;

        this.audioPlayer.on("stateChange", (_, newState) => {
            if (!this.voiceConnection) return;

            if (newState.status === AudioPlayerStatus.Idle) {
                const nextAudio = this.queue.shift();

                if (!nextAudio) {
                    this.voiceChannelTimeout = setTimeout(() => {
                        this.destroy();
                    }, 60000 * 5);
                } else {
                    this.playMusic(nextAudio.audioResource)
                }
            } else {
                if (this.voiceChannelTimeout) {
                    clearTimeout(this.voiceChannelTimeout)
                    this.voiceChannelTimeout = undefined
                }
            }
        })
    }

    playMusic(audioResource: AudioResource) {
        if (!this.voiceChannelId) return;

        this.voiceConnection = joinVoiceChannel({
            adapterCreator: this.guild.voiceAdapterCreator,
            channelId: this.voiceChannelId,
            guildId: this.guild.id
        })

        this.voiceConnection.subscribe(this.audioPlayer)
        this.audioPlayer.play(audioResource);
    }

    getQueue() {
        return this.queue
    }

    addToQueue(hash: string, audioResource: AudioResource) {
        this.queue.push({
            hash,
            audioResource
        });
    }

    removeFromQueue(index: number) {
        this.queue.splice(index, 1);
    }

    pause() {
        return new Promise<void>((resolve, reject) => {
            if (this.audioPlayer.state.status === AudioPlayerStatus.Paused) resolve();

            const timeout = setTimeout(() => {
                this.audioPlayer.off("stateChange", listener);
                reject();
            }, 5000);

            const listener = (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                if (newState.status === AudioPlayerStatus.Paused) {
                    clearTimeout(timeout);
                    this.audioPlayer.off("stateChange", listener);
                    resolve();
                }
            }

            this.audioPlayer.on("stateChange", listener);
            this.audioPlayer.pause();
        })
    }

    unpause() {
        return new Promise<void>((resolve, reject) => {
            if (this.audioPlayer.state.status === AudioPlayerStatus.Playing) resolve();            

            const timeout = setTimeout(() => {
                this.audioPlayer.off("stateChange", listener);
                reject();
            }, 5000);

            const listener = (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                if (newState.status === AudioPlayerStatus.Playing) {
                    clearTimeout(timeout);
                    this.audioPlayer.off("stateChange", listener);
                    resolve();
                }
            }

            this.audioPlayer.on("stateChange", listener);
            this.audioPlayer.unpause();
        })
    }

    destroy() {
        this.audioPlayer.stop();
        this.voiceConnection?.destroy();
        clearTimeout(this.voiceChannelTimeout);
        this.client.jukeboxes.delete(this.guild.id);
    }
}