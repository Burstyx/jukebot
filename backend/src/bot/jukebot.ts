import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import Jukebox from "./lib/jukebox";
import { JukebotClient } from "./types/global";

class Jukebot {
    client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
    }) as JukebotClient;

    constructor() {
        this.client.jukeboxes = new Collection<string, Jukebox>();
        this.client.on(Events.ClientReady, readyClient => {
            console.log(`<${readyClient.user.displayName}>: I'm ready ^^!`);
        })
    }
}

const jukebot = new Jukebot();
export default jukebot;