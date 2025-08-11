import { getEnvVar } from "@/config/constants";
import { Channel, Music } from "@jukebot/types";
import axios from "axios";

export default class ApiService {
    // Channels

    static async getChannels(guildId: string) {
        return await axios.get<Channel[]>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/get_channels/${guildId}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    // Musics

    static async addToQueue(guildId: string, musicHash: string) {
        return await axios.put<Music[]>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/add_to_queue/${guildId}/${musicHash}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    static async getMusics(guildId: string) {
        return await axios.get<Music[]>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/get_musics/${guildId}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    static async getSelectedChannelId(guildId: string) {
        return await axios.get<{ ok: boolean, channel_id?: string }>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/get_selected_channel/${guildId}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    static async getQueue(guildId: string) {
        return await axios.get<{ ok: boolean, current_music?: Music, queue: Music[] }>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/get_queue/${guildId}`, {
            headers: {
                "Content-Type": "application/json",
            }
        })
    }

    static async pauseQueue(guildId: string) {
        return await axios.get<{ ok: boolean }>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/pause/${guildId}`, {
            headers: {
                "Content-Type": "application/json",
            }
        })
    }

    static async unpauseQueue(guildId: string) {
        return await axios.get<{ ok: boolean }>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/unpause/${guildId}`, {
            headers: {
                "Content-Type": "application/json",
            }
        })
    }

    static async getPauseState(guildId: string) {
        return await axios.get<boolean>(`${process.env.NEXT_PUBLIC_API_URL}/guilds/get_pause_state/${guildId}`)
    }

    static async uploadMusic(guildId: string, fileName: string, fileType: string, rawData: any) {
        return await axios.post<Music>(`${process.env.NEXT_PUBLIC_API_URL}/library/file/${guildId}`, rawData, {
            headers: {
                "Content-Type": fileType || "audio/*",
                "X-File-Name": encodeURI(fileName)
            }
        })
    }

    static async deleteMusic(guildId: string, musicHash: string) {
        return await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/library/delete_music/${guildId}/${musicHash}`, {
            headers: {
                "Content-Type": "application/json",
            }
        })
    }
}