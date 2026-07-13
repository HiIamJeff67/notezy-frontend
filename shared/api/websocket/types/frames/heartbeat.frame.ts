import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeHeartbeatFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "heartbeat";
};

export const parseRealtimeHeartbeatFrame = (): RealtimeHeartbeatFrame => ({
  version: RealtimeProtocolVersion,
  type: "heartbeat",
});
