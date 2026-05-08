import { Jukebot } from "@/bot/jukebot";
import WS from "@/utils/ws";
import { WebSocket } from "@fastify/websocket";
import {
  PauseStateUpdatedWSMessage,
  UpdateVCClientMessage,
  WSClientMessage,
  WSServerMessage,
} from "@jukebot/types";

export default class WSService {
  socket: WebSocket;
  jukebot: Jukebot;
  guildId: string;
  private static voiceChannelVersions = new Map<string, number>();

  constructor(socket: WebSocket, jukebot: Jukebot, guildId: string) {
    this.socket = socket;
    this.jukebot = jukebot;
    this.guildId = guildId;
  }

  async handle(rawMessage: string) {
    try {
      const data = JSON.parse(rawMessage.toString()) as WSClientMessage;

      if (!data.type) {
        const msg: WSServerMessage = {
          type: "error",
          payload: {
            code: "BAD_REQUEST",
            message: "Impossible de déterminer le type de la requête WS",
          },
        };
        return this.socket.send(JSON.stringify(msg));
      } else {
        // Handle messages
        switch (data.type) {
          case "update_vc":
            return await this.updateVC(data);
          case "pause_state_updated":
            return await this.updatePauseState(data);
          case "next_audio":
            return await this.nextAudio();
          case "clear_queue":
            return await this.clearQueue();
          default:
            const msg: WSServerMessage = {
              type: "error",
              payload: {
                code: "NOT_FOUND",
                message: "Le type de la requête WS n'existe pas",
              },
            };
            return this.socket.send(JSON.stringify(msg));
        }
      }
    } catch (err) {
      const msg: WSServerMessage = {
        type: "error",
        payload: {
          code: "INTERNAL",
          message:
            "Une erreur s'est produite lors du traitement de la requête WS",
          details: err instanceof Error ? err.message : err,
        },
      };

      console.error(err);
      return this.socket.send(JSON.stringify(msg));
    }
  }

  private async getJukebox() {
    const jukebox = await this.jukebot.createJukebox(this.guildId);
    if (!jukebox) {
      throw new Error(`Impossible de créer la jukebox du serveur ${this.guildId}`);
    }

    return jukebox;
  }

  private nextVoiceChannelVersion() {
    const version = (WSService.voiceChannelVersions.get(this.guildId) ?? 0) + 1;
    WSService.voiceChannelVersions.set(this.guildId, version);
    return version;
  }

  private async updateVC(data: UpdateVCClientMessage) {
    const version = this.nextVoiceChannelVersion();

    const jukebox = await this.getJukebox();
    jukebox.voiceChannelId = data.payload.channelId;
    const didJoinRequestedChannel = await jukebox.joinVoiceChannel();

    if (
      didJoinRequestedChannel &&
      WSService.voiceChannelVersions.get(this.guildId) === version
    ) {
      WS.updateVoiceChannel(this.guildId, data.payload.channelId ?? null);
    }
  }

  private async updatePauseState(data: PauseStateUpdatedWSMessage) {
    const jukebox = await this.getJukebox();
    await jukebox.updatePauseState(data.payload.pause);
  }

  private async nextAudio() {
    const jukebox = await this.getJukebox();
    await jukebox.playNextAudio();
  }

  private async clearQueue() {
    const jukebox = await this.getJukebox();
    jukebox.resetQueue();
  }
}
