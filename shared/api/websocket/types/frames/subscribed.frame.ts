import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeSubscribedFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "subscribed";
  requestId?: string;
  channelType: "BlockPack";
  channelId: string;
  connectorChannelId: number;
};

export const parseRealtimeSubscribedFrame = (
  frame: Record<string, unknown>
): RealtimeSubscribedFrame => {
  if (typeof frame.channelId !== "string" || frame.channelType !== "BlockPack") {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }
  if (
    typeof frame.connectorChannelId !== "number" ||
    !Number.isInteger(frame.connectorChannelId) ||
    frame.connectorChannelId < 0
  ) {
    throw new NotezyAPIError(
      RealtimeError.MissingSubscribedConnectorChannelId()
    );
  }

  return {
    version: RealtimeProtocolVersion,
    type: "subscribed",
    requestId: typeof frame.requestId === "string" ? frame.requestId : undefined,
    channelType: "BlockPack",
    channelId: frame.channelId,
    connectorChannelId: frame.connectorChannelId,
  };
};
