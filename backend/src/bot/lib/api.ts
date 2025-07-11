import { DATA_PATH } from "@/config/constants";
import { JukebotClient } from "@/bot/types/global";
import Jukebox from "./jukebox";
import path from "path";
import { createAudioResource } from "@discordjs/voice";
import { ChannelType } from "discord.js";
import DataParser from "@/utils/parser";

export default class JukebotAPI {
    static createSession = async (client: JukebotClient, guildId: string, voiceChannelIdToJoin: string) => {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) return false;

        const jukebox: Jukebox = client.jukeboxes.get(guildId) ?? new Jukebox(client, guild, voiceChannelIdToJoin);
        client.jukeboxes.set(guildId, jukebox);

        return true;
    }

    static endSession = (client: JukebotClient, guildId: string) => {
        const jukebox: Jukebox = client.jukeboxes.get(guildId);
        if (jukebox) jukebox.destroy();

        return true;
    }

    static playMusic = (client: JukebotClient, guildId: string, musicHash: string) => {
        const jukebox: Jukebox = client.jukeboxes.get(guildId);
        if (!jukebox) return false;

        const audioPath = path.join(DATA_PATH, `${musicHash}.opus`)
        const audioResource = createAudioResource(audioPath)

        jukebox.playMusic(audioResource);

        return true;
    }

    static getMusicsFromQueue = (client: JukebotClient, guildId: string) => {
        const jukebox: Jukebox = client.jukeboxes.get(guildId);
        if (!jukebox) return false;

        return jukebox.getQueue().map(async val => await DataParser.getNameFromHash(guildId, val.hash))
    }

    static addMusicToQueue = (client: JukebotClient, guildId: string, musicHash: string) => {
        const jukebox: Jukebox = client.jukeboxes.get(guildId);
        if (!jukebox) return false;

        const audioPath = path.join(DATA_PATH, `${musicHash}.opus`)
        const audioResource = createAudioResource(audioPath)

        jukebox.addToQueue(musicHash, audioResource);

        return true;
    }

    static removeMusicFromQueue = (client: JukebotClient, guildId: string, index: number) => {
        const jukebox: Jukebox = client.jukeboxes.get(guildId);
        if (!jukebox) return false;

        jukebox.removeFromQueue(index);

        return true;
    }

    static updateMusicState = async (client: JukebotClient, guildId: string, pause: boolean) => {
        const jukebox: Jukebox = client.jukeboxes.get(guildId);
        if (!jukebox) return false;

        if (pause) await jukebox.pause();
        else await jukebox.unpause();

        return true;
    }

    static getChannels = async (client: JukebotClient, guildId: string, channelType?: ChannelType) => {
        const guild = await client.guilds.fetch(guildId);
        return guild.channels.cache.filter(channel => channelType ? channel.type === channelType : true).map(channel => ({
            name: channel.name,
            id: channel.id
        }));
    }
}
