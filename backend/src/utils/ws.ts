import { WebSocket } from "@fastify/websocket";
import {
  Music,
  PauseStateUpdatedWSMessage,
  QueueUpdatedWSMessage,
  UpdateVCServerMessage,
  WSErrorCode,
  WSServerMessage,
} from "@jukebot/types";

export default class WS {
  static connections = new Map<string, Set<WebSocket>>();

  public static broadcast(guildId: string, msg: WSServerMessage) {
    this.connections.get(guildId)?.forEach((con) => {
      con.send(JSON.stringify(msg));
    });
  }

  public static updatePauseState(guildId: string, pauseState: boolean) {
    const msg: PauseStateUpdatedWSMessage = {
      type: "pause_state_updated",
      payload: {
        pause: pauseState,
      },
    };
    this.broadcast(guildId, msg);
  }

  public static updateQueue(guildId: string, currentMusic: Music | undefined, queue: Music[]) {
    const msg: QueueUpdatedWSMessage = {
      type: "queue_updated",
      payload: {
        current_music: currentMusic,
        queue: queue,
      },
    };
    this.broadcast(guildId, msg);
  }

  public static updateVoiceChannel(
    guildId: string,
    channelId: string | null,
  ) {
    const msg: UpdateVCServerMessage = {
      type: "update_vc",
      payload: {
        channelId
      },
    };
    this.broadcast(guildId, msg);
  }

  public static error(
    guildId: string,
    code: WSErrorCode,
    message: string,
    details?: unknown,
  ) {
    this.broadcast(guildId, {
      type: "error",
      payload: {
        code,
        message,
        details: details instanceof Error ? details.message : details,
      },
    });
  }
}
