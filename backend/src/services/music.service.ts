import axios from "axios"
import crypto from "crypto"
import JukebotAPI from "@/bot/lib/api";
import { JukebotClient } from "@/bot/types/global";
import DataParser from "@/utils/parser";

export default class MusicService {
    static async getMusics(guildId: string) {
        const musics = await DataParser.getMusics(guildId);
        return DataParser.toMusicList(musics);
    }

    static async exists(guildId: string, data: any, hashData: boolean) {
        const musics = await DataParser.getMusics(guildId);
        let hash = data;
        if (hashData)
            hash = crypto.createHash('sha256').update(data).digest('hex');

        return musics.hasOwnProperty(hash);
    }

    static async playMusic(client: JukebotClient, guildId: string, musicHash: string) {
        return JukebotAPI.playMusic(client, guildId, musicHash)
    }

    static async updateMusicState(client: JukebotClient, guildId: string, pauseState: boolean) {
        return JukebotAPI.updateMusicState(client, guildId, pauseState)
    }

    static async getMusicsFromQueue(client: JukebotClient, guildId: string) {
        return JukebotAPI.getMusicsFromQueue(client, guildId)
    }

    static async addMusicToQueue(client: JukebotClient, guildId: string, musicHash: string) {
        return JukebotAPI.addMusicToQueue(client, guildId, musicHash)
    }

    static async removeMusicFromQueue(client: JukebotClient, guildId: string, index: number) {
        return JukebotAPI.removeMusicFromQueue(client, guildId, index)
    }

    static async uploadMusic(rawData: any, guildId: string, fileName: string) {
        const hash = crypto.createHash('sha256').update(rawData).digest('hex');

        const musics = await DataParser.addMusic(guildId, hash, rawData, fileName);
        return DataParser.toMusicList(musics);
    }

    static async removeMusic(guildId: string, musicHash: string) {
        const musics = await DataParser.removeMusic(guildId, musicHash);
        return DataParser.toMusicList(musics);
    }
}