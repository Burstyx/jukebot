import fs from "fs";
import path from "path";
import { DATA_PATH } from "@/config/constants";
import AudioUtils from "./audio";
import { Music } from "@jukebot/types";

interface GuildData { [hash: string]: Music }
interface StoredData { [hash: string]: number }

export default class DataParser {
    static async getMusics(guildId: string) {
        const guildMusicsPath = path.join(DATA_PATH, `${guildId}.json`)

        const content = await fs.promises.readFile(guildMusicsPath, "utf-8").catch(() => "{}")
        const musicsData: GuildData = JSON.parse(content)

        return musicsData
    }

    static async updateMusics(guildId: string, musics: GuildData) {
        const guildMusicsPath = path.join(DATA_PATH, `${guildId}.json`)
        await fs.promises.writeFile(guildMusicsPath, JSON.stringify(musics));
    }

    static async getStored() {
        const storedPath = path.join(DATA_PATH, `stored.json`)

        const content = await fs.promises.readFile(storedPath, "utf-8").catch(() => "{}")
        const stored: StoredData = JSON.parse(content);

        return stored;
    }

    static async updateStored(stored: StoredData) {
        const storedPath = path.join(DATA_PATH, `stored.json`)
        await fs.promises.writeFile(storedPath, JSON.stringify(stored));
    }

    static async updateStoredTracker(musicHash: string, type: "add" | "remove") {
        const stored = await this.getStored();

        if (type === "add") {
            const currentCounter = stored[musicHash] ?? 0;
            stored[musicHash] = currentCounter + 1;
        } else if (type === "remove") {
            const currentCounter = stored[musicHash] ?? 1;
            stored[musicHash] = currentCounter - 1;
            if (stored[musicHash] === 0)
                delete stored[musicHash];
        }

        await this.updateStored(stored);

        return stored;
    }

    static async addMusic(guildId: string, rawData: any, music: Music) {
        const musicPath = path.join(DATA_PATH, `${music.hash}.tmp`);
        const musics = await this.getMusics(guildId);
        const stored = await this.getStored();

        if (!stored.hasOwnProperty(music.hash)) {
            await fs.promises.writeFile(musicPath, rawData);
            await AudioUtils.compressAndConvertToOpus(music.hash);
        }

        musics[music.hash] = music

        await this.updateMusics(guildId, musics);
        await this.updateStoredTracker(music.hash, "add");

        return musics;
    }

    static async getMusic(guildId: string, musicHash: string) {
        const musics = await this.getMusics(guildId);
        return musics[musicHash]
    }

    static async removeMusic(guildId: string, musicHash: string) {
        const musicPath = path.join(DATA_PATH, `${musicHash}.opus`);
        const musics = await this.getMusics(guildId);
        let stored = await this.getStored();

        delete musics[musicHash];

        const guildMusicsPath = path.join(DATA_PATH, `${guildId}.json`);
        await fs.promises.writeFile(guildMusicsPath, JSON.stringify(musics));

        stored = await this.updateStoredTracker(musicHash, "remove");

        if (!stored.hasOwnProperty(musicHash))
            await fs.promises.rm(musicPath, { force: true })

        return musics;
    }

    static toMusicList(guildData: GuildData): Music[] {
        return Object.entries(guildData).map(([_, music]) => music)
    }
}