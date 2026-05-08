import {
  Client,
  GatewayIntentBits,
  Collection,
  ChannelType,
  Events,
} from "discord.js";
import Jukebox from "./lib/jukebox";
import { DISCORD_TOKEN } from "@/config/constants";
import { Channel, Music } from "@jukebot/types";
import DataParser from "@/utils/parser";
import WS from "@/utils/ws";

export class Jukebot {
  private jukeboxes = new Collection<string, Jukebox>();
  private voiceDisconnectTimers = new Collection<string, NodeJS.Timeout>();
  private client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  /**
   * Initialize the Discord bot
   */
  constructor() {
    this.client.login(DISCORD_TOKEN).catch((err) => {
      console.error("Login bot client failed:", err?.message ?? err);
      process.exit(1);
    });

    this.client.once(Events.ClientReady, (client) => {
      console.info(`Discord bot ready as ${client.user.tag}`);
    });

    this.client.on("voiceStateUpdate", (oldState, newState) => {
      const botId = this.client.user?.id;
      if (!botId) return;

      const oldMemberId = oldState.member?.id;
      const newMemberId = newState.member?.id;
      if (oldMemberId !== botId && newMemberId !== botId) return;

      const oldChannelId = oldState.channelId ?? null;
      const newChannelId = newState.channelId ?? null;
      if (oldChannelId === newChannelId) return;

      const guildId = newState.guild?.id ?? oldState.guild?.id;
      if (!guildId) return;

      if (!newChannelId) {
        const jukebox = this.jukeboxes.get(guildId);
        jukebox?.disconnectVoiceConnection();
        this.scheduleVoiceDisconnect(guildId);
        return;
      }

      this.cancelVoiceDisconnect(guildId);

      const jukebox = this.jukeboxes.get(guildId);
      if (jukebox) {
        void jukebox.syncExternalVoiceChannel(newChannelId).catch((err) => {
          console.error(`syncExternalVoiceChannel: Failed for guild ${guildId}:`, err);
        });
      }

      WS.updateVoiceChannel(guildId, newChannelId);
    });
  }

  private scheduleVoiceDisconnect(guildId: string): void {
    if (this.voiceDisconnectTimers.has(guildId)) return;

    const timer = setTimeout(() => {
      this.voiceDisconnectTimers.delete(guildId);
      this.destroyJukebox(guildId);
      WS.updateVoiceChannel(guildId, null);
    }, 1500);

    this.voiceDisconnectTimers.set(guildId, timer);
  }

  private cancelVoiceDisconnect(guildId: string): void {
    const timer = this.voiceDisconnectTimers.get(guildId);
    if (!timer) return;

    clearTimeout(timer);
    this.voiceDisconnectTimers.delete(guildId);
  }

  /**
   * Create a jukebox for a specific guild if it has none and returns it
   * @param {string} guildId ID of the guild where to create the jukebox
   * @returns {Promise<Jukebox | null>} The created jukebox, null if an error occured
   */
  public async createJukebox(guildId: string): Promise<Jukebox | null> {
    let guild;
    try {
      guild = await this.client.guilds.fetch(guildId);
    } catch (err) {
      console.error(`createJukebox: Fetching guild failed: ${guildId}`);
      return null
    }

    let jukebox = this.jukeboxes.get(guildId);
    if (!jukebox) {
      jukebox = new Jukebox(guild);
      this.jukeboxes.set(guildId, jukebox);
    }

    return jukebox;
  }

  /**
   * Delete a guild's jukebox if it has one
   * @param {string} guildId ID of the guild where to destroy the jukebox
   */
  public destroyJukebox(guildId: string): void {
    this.cancelVoiceDisconnect(guildId);

    const jukebox = this.jukeboxes.get(guildId);
    if (jukebox) {
      jukebox.destroy();
      this.jukeboxes.delete(guildId);
    }
  }

  /**
   * Get guild's channels
   * @param {string} guildId ID of the guild where to get the channels
   * @param {ChannelType | undefined} channelType Specific type of channel to fetch, all channels otherwise
   * @returns {Promise<Channel[] | null>} Returns the channel list, null if an error occured
   */
  public async getChannels(
    guildId: string,
    channelType?: ChannelType,
  ): Promise<Channel[] | null> {
    let guild;
    try {
      guild = await this.client.guilds.fetch(guildId);
    } catch (err) {
      console.error(`getChannels: Fetching guild failed: ${guildId}`);
      return null
    }

    return guild.channels.cache
      .filter((channel) => (channelType ? channel.type === channelType : true))
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
      }));
  }

  /**
   * Get guild's musics
   * @param {string} guildId ID of the guild where to get the musics
   * @returns {Promise<Music[]>} Returns the music list
   */
  public async getMusics(guildId: string): Promise<Music[]> {
    const musicsData = await DataParser.getMusics(guildId);
    return DataParser.toMusicList(musicsData);
  }

  /**
   * Check if Jukebot exists in a given guild
   * @param guildId ID of the guild where to check the presence of Jukebot
   * @returns Returns true if Jukebot is in the guild, false otherwise
   */
  public isInGuild(guildId: string): boolean {
    return this.client.guilds.cache.has(guildId);
  }
}
