import { Jukebot } from "@/bot/jukebot";
import DataParser from "@/utils/parser";
import { ChannelType } from "discord.js";

export default class GuildsService {
    static async getChannels(jukebot: Jukebot, guildId: string) {
        return await jukebot.getChannels(guildId, ChannelType.GuildVoice);
    }

    static async getSelectedChannel(jukebot: Jukebot, guildId: string) {
        return (await jukebot.createAndGetJukebox(guildId)).voiceChannelId
    }

    static async getMusics(jukebot: Jukebot, guildId: string) {
        return await jukebot.getMusics(guildId)
    }

    static async getCurrentMusic(jukebot: Jukebot, guildId: string) {
        return (await jukebot.createAndGetJukebox(guildId)).currentMusic
    }

    static async addToQueue(jukebot: Jukebot, guildId: string, musicHash: string) {
        const music = await DataParser.getMusic(guildId, musicHash)
        const jukebox = await jukebot.createAndGetJukebox(guildId)

        jukebox.queue.push(music)

        return music;
    }

    static async getQueue(jukebot: Jukebot, guildId: string) {
        return (await jukebot.createAndGetJukebox(guildId)).queue || []
    }

    static async getPauseState(jukebot: Jukebot, guildId: string) {
        return (await jukebot.createAndGetJukebox(guildId)).pauseState
    }
}