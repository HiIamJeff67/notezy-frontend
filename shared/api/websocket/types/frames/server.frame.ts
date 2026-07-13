import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";
import {
  type RealtimeAckFrame,
  parseRealtimeAckFrame,
} from "./ack.frame";
import {
  type RealtimeErrorFrame,
  parseRealtimeErrorFrame,
} from "./error.frame";
import {
  type RealtimeHeartbeatFrame,
  parseRealtimeHeartbeatFrame,
} from "./heartbeat.frame";
import {
  type RealtimePongFrame,
  parseRealtimePongFrame,
} from "./pong.frame";
import {
  type RealtimeReadyFrame,
  parseRealtimeReadyFrame,
} from "./ready.frame";
import {
  type RealtimeSubscribedFrame,
  parseRealtimeSubscribedFrame,
} from "./subscribed.frame";
import {
  type RealtimeUnsubscribedFrame,
  parseRealtimeUnsubscribedFrame,
} from "./unsubscribed.frame";

export type RealtimeServerFrame =
  | RealtimeReadyFrame
  | RealtimePongFrame
  | RealtimeErrorFrame
  | RealtimeSubscribedFrame
  | RealtimeUnsubscribedFrame
  | RealtimeHeartbeatFrame
  | RealtimeAckFrame;

export const parseRealtimeServerFrame = (data: string): RealtimeServerFrame => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    throw new NotezyAPIError(RealtimeError.InvalidJsonFrame());
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }
  const frame = parsed as Record<string, unknown>;

  if (frame.version !== RealtimeProtocolVersion) {
    throw new NotezyAPIError(RealtimeError.UnsupportedProtocolVersion());
  }
  if (typeof frame.type !== "string") {
    throw new NotezyAPIError(RealtimeError.MissingFrameType());
  }

  switch (frame.type) {
    case "ready":
      return parseRealtimeReadyFrame(frame);
    case "pong":
      return parseRealtimePongFrame(frame);
    case "error":
      return parseRealtimeErrorFrame(frame);
    case "subscribed":
      return parseRealtimeSubscribedFrame(frame);
    case "unsubscribed":
      return parseRealtimeUnsubscribedFrame(frame);
    case "heartbeat":
      return parseRealtimeHeartbeatFrame();
    case "ack":
    case "acknowledged":
      return parseRealtimeAckFrame(frame);
    default:
      throw new NotezyAPIError(RealtimeError.UnsupportedFrameType(frame.type));
  }
};
