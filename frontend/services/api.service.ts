import { getEnvVar } from "@/config/constants";
import axios from "axios";

export default class ApiService {
    // Channels

    static async getChannels(guildId: string, channelType?: string) {
        return await axios.get(`${getEnvVar("API_URL")}/channels/${guildId}?channel_type=${channelType || ""}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    // Musics

    static async getMusics(guildId: string) {
        return await axios.get(`${getEnvVar("API_URL")}/musics/${guildId}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    static async playMusic(guildId: string, channelId: string, musicHash: string) {
        return await axios.post(`${getEnvVar("API_URL")}/musics/${guildId}`, JSON.stringify({
            channel_id: channelId,
            music_hash: musicHash
        }), {
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    static async updateMusicState(guildId: string, pauseState: boolean) {
        return await axios.post(`${getEnvVar("API_URL")}/musics/state/${guildId}`, JSON.stringify({
            pause: pauseState
        }), {
            headers: {
                "Content-Type": "application/json",
            }
        })
    }

    static async getMusicsFromQueue(guildId: string) {
        return await axios.get(`${getEnvVar("API_URL")}/musics/queue/${guildId}`), {
            headers: {
                "Content-Type": "application/json",
            }
        }
    }

    static async addMusicsFromQueue(guildId: string, channelId: string, musicHash: string) {
        return await axios.post(`${getEnvVar("API_URL")}/musics/queue/${guildId}`), JSON.stringify({
            channel_id: channelId,
            music_hash: musicHash
        }), {
            headers: {
                "Content-Type": "application/json",
            }
        }
    }

    static async removeMusicsFromQueue(guildId: string, channelId: string, index: number) {
        return await axios.post(`${getEnvVar("API_URL")}/music/queue/delete/${guildId}`), JSON.stringify({
            channel_id: channelId,
            index: index
        }), {
            headers: {
                "Content-Type": "application/json",
            }
        }
    }

    static async uploadMusic(guildId: string, fileName: string, fileType: string, rawData: any) {
        return await axios.post(`${getEnvVar("API_URL")}/musics/upload/${guildId}`, rawData, {
            headers: {
                "Content-Type": fileType || "audio/*",
                "X-File-Name": encodeURI(fileName)
            }
        })
    }

    static async deleteMusic(guildId: string, musicHash: string) {
        return await axios.post(`${getEnvVar("API_URL")}/musics/delete/${guildId}`, JSON.stringify({
            music_hash: musicHash
        }), {
            headers: {
                "Content-Type": "application/json",
            }
        })
    }
}