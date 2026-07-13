import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeUnsubscribedFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "unsubscribed";
  requestId?: string;
  connectorChannelId: number;
};

export const parseRealtimeUnsubscribedFrame = (
  frame: Record<string, unknown>
): RealtimeUnsubscribedFrame => {
  if (
    typeof frame.connectorChannelId !== "number" ||
    !Number.isInteger(frame.connectorChannelId) ||
    frame.connectorChannelId < 0
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "unsubscribed",
    requestId: typeof frame.requestId === "string" ? frame.requestId : undefined,
    connectorChannelId: frame.connectorChannelId,
  };
};
