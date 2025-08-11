import { Client, GatewayIntentBits, Events, Collection, ChannelType, VoiceChannel, VoiceBasedChannel } from "discord.js";
import Jukebox from "./lib/jukebox";
import { DISCORD_TOKEN } from "@/config/constants";
import { Channel, Music, UpdateVCWSMessage } from "@jukebot/types";
import DataParser from "@/utils/parser";
import WS from "@/utils/ws";
import { entersState, getVoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";

export class Jukebot {
    private jukeboxes = new Collection<string, Jukebox>;

    private client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
    });

    constructor() {
        this.client.on(Events.ClientReady, readyClient => {
            console.log(`<${readyClient.user.displayName}>: I'm ready ^^!`);
        })

        this.client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
            // seulement le bot
            if (newState.id !== this.client.user?.id) return;

            const newChannelId = newState.channelId;
            const guildId = newState.guild.id;

            // ignorer si pas de vrai changement
            if (oldState.channelId === newChannelId) return;

            const jukebox = this.jukeboxes.get(guildId);
            if (!jukebox) return;

            if (newChannelId) {
                // attendre que la connexion soit prête avant d'annoncer
                const conn = getVoiceConnection(guildId);
                if (!conn) return;
                try {
                    await entersState(conn, VoiceConnectionStatus.Ready, 15_000);
                } catch {
                    return; // pas prêt -> on n’émet pas
                }

                jukebox.voiceChannelId = newChannelId;
                WS.broadcast(guildId, { type: "update_vc", payload: { channelId: newChannelId } });
            } else {
                // le bot a QUITTÉ le vocal -> on émet aussi
                jukebox.voiceChannelId = undefined; // ou null si tu préfères
                console.log("test");

                WS.broadcast(guildId, { type: "update_vc", payload: { channelId: undefined } });
                this.destroyJukebox(guildId);
            }
        });



        this.client.login(DISCORD_TOKEN)
    }

    /**
     * Create a jukebox for a specific guild if it has none and returns it
     * @param guildId ID of the guild where to create the jukebox
     * @param voiceChannelIdToJoin ID of the voice channel the bot will join first
     */
    async createAndGetJukebox(guildId: string): Promise<Jukebox> {
        const guild = await this.client.guilds.fetch(guildId);
        const jukebox = this.jukeboxes.get(guildId)
        if (!jukebox) {
            const newJukebox = new Jukebox(this, guild);
            this.jukeboxes.set(guildId, newJukebox);
            return newJukebox;
        }
        return jukebox;
    }

    /**
     * Delete a guild's jukebox if it has one
     * @param guildId ID of the guild where to destroy the jukebox
     */
    destroyJukebox(guildId: string) {
        const jukebox = this.jukeboxes.get(guildId)
        if (jukebox) {
            jukebox.destroy();
            this.jukeboxes.delete(guildId)
        }
    }

    /**
     * Get guild's channels if it has one
     * @param guildId ID of the guild where to get the jukebox
     * @returns Returns the Jukebox if it exists, undefined otherwise
     */
    async getChannels(guildId: string, channelType?: ChannelType): Promise<Channel[]> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.channels.cache.filter(channel => channelType ? channel.type === channelType : true).map(channel => ({
            id: channel.id,
            name: channel.name
        }));
    }

    async getMusics(guildId: string): Promise<Music[]> {
        const musicsData = await DataParser.getMusics(guildId)
        return DataParser.toMusicList(musicsData)
    }

    /**
     * Check if Jukebot exists in a given guild
     * @param guildId ID of the guild where to check the presence of Jukebot
     * @returns Returns true if Jukebot is in the guild, false otherwise
     */
    IsInGuild(guildId: string): boolean {
        return this.client.guilds.cache.has(guildId)
    }
}