import DataParser from "@/utils/parser";
import { Music } from "@jukebot/types";
import crypto from "crypto";

export default class LibraryService {
  static async exists(guildId: string, data: any, hashData: boolean) {
    const musics = await DataParser.getMusics(guildId);
    let hash = data;
    if (hashData) hash = crypto.createHash("sha256").update(data).digest("hex");

    return musics.hasOwnProperty(hash);
  }

  static async uploadFile(
    rawData: any,
    guildId: string,
    fileName: string,
    author: string,
  ) {
    const hash = crypto.createHash("sha256").update(rawData).digest("hex");
    const music: Music = {
      name: fileName,
      hash: hash,
      author: author,
    };

    await DataParser.addMusic(guildId, rawData, music);

    return music;
  }

  static async deleteMusic(guildId: string, music: Music) {
    await DataParser.removeMusic(guildId, music.hash);
  }
}
