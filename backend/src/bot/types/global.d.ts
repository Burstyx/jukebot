import { Client, Collection } from "discord.js";
import Jukebox from "@/lib/jukebox"

export interface JukebotClient extends Client {
    jukeboxes: Collection<string, Jukebox>;
}