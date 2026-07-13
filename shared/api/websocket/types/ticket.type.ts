import { RealtimePermissionSchema } from "@shared/api/interfaces/enums";
import type { z } from "zod";

export type RealtimeConnectionTicket = {
  realtimeEndpoint: string;
  connectionTicket: string;
};

export type RealtimeBlockPackChannelTicket = {
  channelId: string;
  permission: z.infer<typeof RealtimePermissionSchema>;
  channelTicket: string;
};
