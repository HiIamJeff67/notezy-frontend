import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeAckFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "ack" | "acknowledged";
  requestId?: string;
};

export const parseRealtimeAckFrame = (
  frame: Record<string, unknown>
): RealtimeAckFrame => ({
  version: RealtimeProtocolVersion,
  type: frame.type as "ack" | "acknowledged",
  requestId: typeof frame.requestId === "string" ? frame.requestId : undefined,
});
