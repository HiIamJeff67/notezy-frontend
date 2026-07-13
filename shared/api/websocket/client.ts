import {
  RealtimePermission,
  RealtimePermissionSchema,
} from "@shared/api/interfaces/enums";
import { getRealtimeWebSocketURL } from "@shared/lib/getURL";
import {
  encodeRealtimeBinaryFrame,
  encodeRealtimePingFrame,
  encodeRealtimeSubscribeFrame,
  encodeRealtimeUnsubscribeFrame,
  type RealtimeBinaryFrame,
  RealtimeBinaryFrameType,
  type RealtimeBlockPackChannelStatus,
  type RealtimeBlockPackChannelTicket,
  type RealtimeConnectionState,
  type RealtimeConnectionTicket,
  type RealtimeErrorFrame,
  type RealtimeRegisteredChannel,
  type RealtimeSubscribedFrame,
  parseRealtimeBinaryFrame,
  parseRealtimeServerFrame,
} from "./types";
import type { z } from "zod";

type RealtimeClientOptions = {
  getConnectionTicket: () => Promise<RealtimeConnectionTicket>;
  getBlockPackChannelTicket: (
    blockPackId: string,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => Promise<RealtimeBlockPackChannelTicket>;
  onState?: (state: RealtimeConnectionState) => void;
  onReady?: (connectionId: string) => void;
  onChannelStatus?: (
    blockPackId: string,
    status: RealtimeBlockPackChannelStatus
  ) => void;
  onChannelSubscribed?: (
    blockPackId: string,
    frame: RealtimeSubscribedFrame,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => void;
  onChannelBinary?: (blockPackId: string, frame: RealtimeBinaryFrame) => void;
  onChannelError?: (blockPackId: string, frame: RealtimeErrorFrame) => void;
  onError?: (error: unknown) => void;
};

const logRealtimeClient = (
  message: string,
  data?: Record<string, unknown>
) => {
  if (import.meta.env.DEV) {
    console.info(`[RealtimeClient] ${message}`, data ?? "");
  }
};

export class RealtimeClient {
  private socket: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private shouldReconnect = false;
  private readonly channels = new Map<string, RealtimeRegisteredChannel>();
  private readonly channelByConnectorId = new Map<number, string>();
  private readonly channelByRequestId = new Map<string, string>();
  private readonly textEncoder = new TextEncoder();

  constructor(private readonly options: RealtimeClientOptions) {}

  start() {
    if (this.socket !== null || this.shouldReconnect) return;
    this.shouldReconnect = true;
    void this.connect();
  }

  stop() {
    this.shouldReconnect = false;
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    for (const channel of this.channels.values()) {
      channel.connectorChannelId = null;
      channel.pendingRequestId = null;
    }
    this.channelByConnectorId.clear();
    this.channelByRequestId.clear();
    if (this.socket !== null) {
      const socket = this.socket;
      this.socket = null;
      socket.close(1000, "Realtime root client stopped.");
    }
    this.options.onState?.("closed");
  }

  registerBlockPackChannel(
    blockPackId: string,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) {
    const existing = this.channels.get(blockPackId);
    if (existing) {
      existing.permission = permission;
      logRealtimeClient("register existing block pack channel", {
        blockPackId,
        permission,
        connectorChannelId: existing.connectorChannelId,
        pendingRequestId: existing.pendingRequestId,
      });
      if (existing.connectorChannelId === null) {
        void this.subscribeBlockPackChannel(existing);
      }
      return;
    }

    const channel: RealtimeRegisteredChannel = {
      blockPackId,
      permission,
      connectorChannelId: null,
      pendingRequestId: null,
    };
    this.channels.set(blockPackId, channel);
    logRealtimeClient("register block pack channel", {
      blockPackId,
      permission,
    });
    void this.subscribeBlockPackChannel(channel);
  }

  unregisterBlockPackChannel(blockPackId: string) {
    const channel = this.channels.get(blockPackId);
    if (!channel) return;

    if (channel.connectorChannelId !== null && this.isSocketOpen()) {
      this.sendControlFrame(
        "unsubscribe",
        encodeRealtimeUnsubscribeFrame({
          requestId: this.createRequestId("unsubscribe"),
          connectorChannelId: channel.connectorChannelId,
        })
      );
      this.channelByConnectorId.delete(channel.connectorChannelId);
    }
    if (channel.pendingRequestId) {
      this.channelByRequestId.delete(channel.pendingRequestId);
    }
    this.channels.delete(blockPackId);
    this.options.onChannelStatus?.(blockPackId, "unsubscribed");
  }

  sendBlockPackBinary(
    blockPackId: string,
    type: RealtimeBinaryFrameType,
    payload: Uint8Array
  ) {
    const channel = this.channels.get(blockPackId);
    if (!channel) {
      logRealtimeClient("skip binary send: channel not registered", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return;
    }
    if (channel.connectorChannelId === null) {
      logRealtimeClient("skip binary send: channel not subscribed", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return;
    }
    if (!this.isSocketOpen()) {
      logRealtimeClient("skip binary send: socket not open", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return;
    }
    if (
      channel.permission === RealtimePermission.Read &&
      type === RealtimeBinaryFrameType.YjsDocument
    ) {
      logRealtimeClient("skip binary send: read-only channel", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return;
    }

    logRealtimeClient("send binary frame", {
      blockPackId,
      connectorChannelId: channel.connectorChannelId,
      type,
      byteLength: payload.byteLength,
    });
    this.sendBinaryFrame(
      encodeRealtimeBinaryFrame({
        type,
        connectorChannelId: channel.connectorChannelId,
        payload,
      })
    );
  }

  private async connect() {
    if (typeof WebSocket === "undefined" || !this.shouldReconnect) return;

    this.options.onState?.(
      this.reconnectAttempt > 0 ? "reconnecting" : "connecting"
    );

    try {
      const ticket = await this.options.getConnectionTicket();
      if (!this.shouldReconnect) return;

      const socket = new WebSocket(
        getRealtimeWebSocketURL(ticket.realtimeEndpoint),
        ticket.connectionTicket
      );
      socket.binaryType = "arraybuffer";
      this.socket = socket;

      socket.onopen = () => {
        this.options.onState?.("open");
      };

      socket.onmessage = event => {
        this.handleMessage(event);
      };

      socket.onerror = event => {
        this.options.onState?.("error");
        this.options.onError?.(event);
      };

      socket.onclose = () => {
        if (this.socket === socket) this.socket = null;
        this.clearConnectorState();
        if (this.shouldReconnect) this.scheduleReconnect();
        else this.options.onState?.("closed");
      };
    } catch (error) {
      this.options.onState?.("error");
      this.options.onError?.(error);
      if (this.shouldReconnect) this.scheduleReconnect();
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      if (typeof event.data === "string") {
        this.handleControlMessage(event.data);
        return;
      }

      if (event.data instanceof ArrayBuffer) {
        const frame = parseRealtimeBinaryFrame(event.data);
        const blockPackId = this.channelByConnectorId.get(
          frame.connectorChannelId
        );
        if (blockPackId) {
          logRealtimeClient("received binary frame", {
            blockPackId,
            connectorChannelId: frame.connectorChannelId,
            type: frame.type,
            byteLength: frame.payload.byteLength,
          });
          this.options.onChannelBinary?.(blockPackId, frame);
        }
        return;
      }

      if (event.data instanceof Blob) {
        void event.data.arrayBuffer().then(buffer => {
          const frame = parseRealtimeBinaryFrame(buffer);
          const blockPackId = this.channelByConnectorId.get(
            frame.connectorChannelId
          );
          if (blockPackId) {
            logRealtimeClient("received binary frame", {
              blockPackId,
              connectorChannelId: frame.connectorChannelId,
              type: frame.type,
              byteLength: frame.payload.byteLength,
            });
            this.options.onChannelBinary?.(blockPackId, frame);
          }
        });
      }
    } catch (error) {
      this.options.onError?.(error);
    }
  }

  private handleControlMessage(data: string) {
    const frame = parseRealtimeServerFrame(data);

    switch (frame.type) {
      case "ready":
        this.reconnectAttempt = 0;
        logRealtimeClient("received ready frame", {
          connectionId: frame.connectionId,
          registeredChannels: this.channels.size,
        });
        this.options.onState?.("ready");
        this.options.onReady?.(frame.connectionId);
        this.sendControlFrame(
          "ping",
          encodeRealtimePingFrame(this.createRequestId("ping"))
        );
        for (const channel of this.channels.values()) {
          void this.subscribeBlockPackChannel(channel);
        }
        break;
      case "pong":
        this.options.onState?.("connected");
        break;
      case "subscribed":
        this.handleSubscribed(frame);
        break;
      case "unsubscribed":
        this.channelByConnectorId.delete(frame.connectorChannelId);
        break;
      case "error":
        this.handleServerError(frame);
        break;
      case "heartbeat":
      case "ack":
      case "acknowledged":
        break;
    }
  }

  private async subscribeBlockPackChannel(
    channel: RealtimeRegisteredChannel
  ) {
    if (!this.isSocketOpen()) {
      logRealtimeClient("delay subscribe: socket not open", {
        blockPackId: channel.blockPackId,
        permission: channel.permission,
      });
      return;
    }
    if (channel.pendingRequestId !== null) {
      logRealtimeClient("skip subscribe: request already pending", {
        blockPackId: channel.blockPackId,
        pendingRequestId: channel.pendingRequestId,
      });
      return;
    }

    this.options.onChannelStatus?.(channel.blockPackId, "ticketing");
    try {
      const ticket = await this.options.getBlockPackChannelTicket(
        channel.blockPackId,
        channel.permission
      );
      if (!this.isSocketOpen() || !this.channels.has(channel.blockPackId))
        return;

      const requestId = this.createRequestId("subscribe");
      channel.pendingRequestId = requestId;
      this.channelByRequestId.set(requestId, channel.blockPackId);
      this.options.onChannelStatus?.(channel.blockPackId, "subscribing");
      logRealtimeClient("send subscribe frame", {
        blockPackId: channel.blockPackId,
        requestId,
        permission: channel.permission,
      });
      this.sendControlFrame(
        "subscribe",
        encodeRealtimeSubscribeFrame({
          requestId,
          channelId: ticket.channelId,
          channelTicket: ticket.channelTicket,
        })
      );
    } catch (error) {
      channel.pendingRequestId = null;
      this.options.onChannelStatus?.(channel.blockPackId, "error");
      this.options.onError?.(error);
    }
  }

  private handleSubscribed(frame: RealtimeSubscribedFrame) {
    const blockPackId =
      (frame.requestId && this.channelByRequestId.get(frame.requestId)) ||
      frame.channelId;
    const channel = this.channels.get(blockPackId);
    if (!channel) return;

    if (channel.pendingRequestId) {
      this.channelByRequestId.delete(channel.pendingRequestId);
    }
    channel.pendingRequestId = null;
    channel.connectorChannelId = frame.connectorChannelId;
    this.channelByConnectorId.set(frame.connectorChannelId, blockPackId);
    logRealtimeClient("received subscribed frame", {
      blockPackId,
      connectorChannelId: frame.connectorChannelId,
      permission: channel.permission,
    });
    this.options.onChannelStatus?.(
      blockPackId,
      channel.permission === RealtimePermission.Read ? "readOnly" : "subscribed"
    );
    this.options.onChannelSubscribed?.(blockPackId, frame, channel.permission);
  }

  private handleServerError(frame: RealtimeErrorFrame) {
    const blockPackId =
      frame.channelId ??
      (frame.connectorChannelId !== undefined
        ? this.channelByConnectorId.get(frame.connectorChannelId)
        : undefined) ??
      (frame.requestId
        ? this.channelByRequestId.get(frame.requestId)
        : undefined);

    if (!blockPackId) {
      this.options.onError?.(frame);
      return;
    }

    if (
      frame.code === "permission_revoked" ||
      frame.code === "resource_unavailable" ||
      frame.code === "resync_required"
    ) {
      const channel = this.channels.get(blockPackId);
      if (channel && channel.connectorChannelId !== null) {
        this.channelByConnectorId.delete(channel.connectorChannelId);
      }
      if (channel) {
        if (channel.pendingRequestId) {
          this.channelByRequestId.delete(channel.pendingRequestId);
        }
        channel.connectorChannelId = null;
        channel.pendingRequestId = null;
      }
      this.channels.delete(blockPackId);
    }

    this.options.onChannelStatus?.(blockPackId, "error");
    this.options.onChannelError?.(blockPackId, frame);
  }

  private clearConnectorState() {
    this.channelByConnectorId.clear();
    this.channelByRequestId.clear();
    for (const channel of this.channels.values()) {
      channel.connectorChannelId = null;
      channel.pendingRequestId = null;
      this.options.onChannelStatus?.(channel.blockPackId, "idle");
    }
  }

  private scheduleReconnect() {
    this.options.onState?.("reconnecting");
    const delay = Math.min(500 * 2 ** this.reconnectAttempt, 10_000);
    this.reconnectAttempt += 1;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      void this.connect();
    }, delay);
  }

  private isSocketOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private sendControlFrame(label: string, frame: Record<string, unknown>) {
    const payload = JSON.stringify(frame);
    logRealtimeClient("send control frame", {
      label,
      byteLength: this.textEncoder.encode(payload).byteLength,
      preview: payload,
    });
    this.socket?.send(payload);
  }

  private sendBinaryFrame(payload: ArrayBuffer) {
    logRealtimeClient("send encoded binary frame", {
      byteLength: payload.byteLength,
    });
    this.socket?.send(payload);
  }

  private createRequestId(prefix: string) {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `realtime-${prefix}-${Date.now()}-${Math.random()}`;
  }
}
