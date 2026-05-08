import type { BaseWSMessage } from "./base";
import type { Music } from "../model";
import type { ErrorWSMessage } from "./errors";

export interface MusicAddedWSMessage extends BaseWSMessage {
  type: "music_added";
  payload: { music: Music };
}

export interface MusicRemovedWSMessage extends BaseWSMessage {
  type: "music_removed";
  payload: { music: Music };
}

export interface QueueUpdatedWSMessage extends BaseWSMessage {
  type: "queue_updated";
  payload: { current_music?: Music; queue: Music[] };
}

export interface PauseStateUpdatedWSMessage extends BaseWSMessage {
  type: "pause_state_updated";
  payload: { pause: boolean };
}

export interface UpdateVCServerMessage extends BaseWSMessage {
  type: "update_vc";
  payload: { channelId: string | null };
}

export type WSServerMessage =
  | ErrorWSMessage
  | UpdateVCServerMessage
  | MusicAddedWSMessage
  | MusicRemovedWSMessage
  | QueueUpdatedWSMessage
  | PauseStateUpdatedWSMessage;
