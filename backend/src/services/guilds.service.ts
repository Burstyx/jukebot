import { Jukebot } from "@/bot/jukebot";
import DataParser from "@/utils/parser";
import { ChannelType } from "discord.js";

export default class GuildsService {
  private static async getJukebox(jukebot: Jukebot, guildId: string) {
    const guildJukebox = await jukebot.createJukebox(guildId);
    if (!guildJukebox) {
      throw new Error(`Impossible de créer la jukebox du serveur ${guildId}`);
    }

    return guildJukebox;
  }

  static async getChannels(jukebot: Jukebot, guildId: string) {
    return await jukebot.getChannels(guildId, ChannelType.GuildVoice);
  }

  static async getSelectedChannel(jukebot: Jukebot, guildId: string) {
    return (await this.getJukebox(jukebot, guildId)).voiceChannelId;
  }

  static async getMusics(jukebot: Jukebot, guildId: string) {
    return await jukebot.getMusics(guildId);
  }

  static async getCurrentMusic(jukebot: Jukebot, guildId: string) {
    return (await this.getJukebox(jukebot, guildId)).currentMusic;
  }

  static async addToQueue(
    jukebot: Jukebot,
    guildId: string,
    musicHash: string,
  ) {
    const music = await DataParser.getMusic(guildId, musicHash);
    const jukebox = await this.getJukebox(jukebot, guildId);

    jukebox.queue.push(music);

    return music;
  }

  static async getQueue(jukebot: Jukebot, guildId: string) {
    return (await this.getJukebox(jukebot, guildId)).queue || [];
  }

  static async getPauseState(jukebot: Jukebot, guildId: string) {
    return (await this.getJukebox(jukebot, guildId)).pauseState;
  }
}
