import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeReadyFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "ready";
  connectionId: string;
};

export const parseRealtimeReadyFrame = (
  frame: Record<string, unknown>
): RealtimeReadyFrame => {
  if (typeof frame.connectionId !== "string") {
    throw new NotezyAPIError(RealtimeError.MissingReadyConnectionId());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "ready",
    connectionId: frame.connectionId,
  };
};
