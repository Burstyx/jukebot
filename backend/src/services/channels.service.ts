import { ChannelType } from "discord.js";
import JukebotAPI from "@/bot/lib/api";
import { JukebotClient } from "@/bot/types/global";

export default class ChannelsService {
    static async getChannels(client: JukebotClient, guildId: string, channelType: string) {
        switch (channelType) {
            case "voice":
                return await JukebotAPI.getChannels(client, guildId, ChannelType.GuildVoice);
            default:
                return await JukebotAPI.getChannels(client, guildId);
        }
    }
}