import type { BaseWSMessage } from "./base";

export type WSErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "INTERNAL"
  | "INVALID_PAYLOAD"
  | "UNKNOWN";

export interface WSErrorPayload {
  code: WSErrorCode;
  message: string;
  details?: unknown;
}

export interface ErrorWSMessage extends BaseWSMessage {
  type: "error";
  payload: WSErrorPayload;
}
