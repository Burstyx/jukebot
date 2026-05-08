import type { BaseWSMessage } from "./base";

export interface UpdateVCClientMessage extends BaseWSMessage {
  type: "update_vc";
  payload: { channelId?: string };
}

export interface PauseStateUpdatedWSMessage extends BaseWSMessage {
  type: "pause_state_updated";
  payload: { pause: boolean };
}

export interface NextAudioWSMessage extends BaseWSMessage {
  type: "next_audio";
}

export interface ClearQueueWSMessage extends BaseWSMessage {
  type: "clear_queue";
}

export interface PlayMusicWSMessage extends BaseWSMessage {
  type: "play_music";
  payload: { hash: string };
}

export type WSClientMessage =
  | UpdateVCClientMessage
  | PauseStateUpdatedWSMessage
  | NextAudioWSMessage
  | ClearQueueWSMessage
  | PlayMusicWSMessage;
