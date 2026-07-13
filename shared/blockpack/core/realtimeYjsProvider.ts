import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import * as Y from "yjs";
import { RealtimeBinaryFrameType } from "@shared/api/websocket/types";

const remoteRealtimeOrigin = Symbol("notezy-realtime-remote");
const RealtimeYjsDocumentDebounceMs = 2_500;

type SendRealtimeBinaryFrame = (
  type: RealtimeBinaryFrameType,
  payload: Uint8Array
) => void;

const logRealtimeYjs = (
  message: string,
  data?: Record<string, unknown>
) => {
  if (import.meta.env.DEV) {
    console.info(`[RealtimeYjs] ${message}`, data ?? "");
  }
};

export class RealtimeYjsProvider {
  readonly awareness: Awareness;

  private send: SendRealtimeBinaryFrame | null = null;
  private readOnly = false;
  private readonly pendingDocumentUpdates: Uint8Array[] = [];
  private readonly pendingAwarenessUpdates: Uint8Array[] = [];
  private documentFlushTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly doc: Y.Doc;
  private readonly handleDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === remoteRealtimeOrigin || this.readOnly) return;
    this.sendOrQueue(RealtimeBinaryFrameType.YjsDocument, update);
  };
  private readonly handleAwarenessUpdate = (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    if (origin === remoteRealtimeOrigin) return;
    const changedClients = [
      ...changes.added,
      ...changes.updated,
      ...changes.removed,
    ];
    if (changedClients.length === 0) return;
    this.sendOrQueue(
      RealtimeBinaryFrameType.Awareness,
      encodeAwarenessUpdate(this.awareness, changedClients)
    );
  };

  constructor(doc: Y.Doc) {
    this.doc = doc;
    this.awareness = new Awareness(doc);
    this.doc.on("update", this.handleDocUpdate);
    this.awareness.on("update", this.handleAwarenessUpdate);
  }

  connect(send: SendRealtimeBinaryFrame) {
    this.send = send;
    logRealtimeYjs("provider connected", {
      pendingDocumentUpdates: this.pendingDocumentUpdates.length,
      pendingAwarenessUpdates: this.pendingAwarenessUpdates.length,
    });
    this.flushPendingUpdates();
  }

  disconnect() {
    if (this.send !== null) {
      logRealtimeYjs("provider disconnected");
    }
    this.clearDocumentFlushTimeout();
    this.send = null;
  }

  flushPendingDocumentUpdatesNow() {
    this.clearDocumentFlushTimeout();
    this.flushPendingDocumentUpdates();
  }

  setReadOnly(readOnly: boolean) {
    this.readOnly = readOnly;
    if (readOnly) {
      this.clearDocumentFlushTimeout();
      this.pendingDocumentUpdates.length = 0;
    }
  }

  applyDocumentUpdate(update: Uint8Array) {
    logRealtimeYjs("received document update", {
      byteLength: update.byteLength,
    });
    Y.applyUpdate(this.doc, update, remoteRealtimeOrigin);
  }

  applyAwarenessUpdate(update: Uint8Array) {
    logRealtimeYjs("received awareness update", {
      byteLength: update.byteLength,
    });
    applyAwarenessUpdate(this.awareness, update, remoteRealtimeOrigin);
  }

  destroy() {
    this.flushPendingDocumentUpdatesNow();
    this.disconnect();
    this.pendingDocumentUpdates.length = 0;
    this.pendingAwarenessUpdates.length = 0;
    this.doc.off("update", this.handleDocUpdate);
    this.awareness.off("update", this.handleAwarenessUpdate);
    this.awareness.destroy();
  }

  private sendOrQueue(type: RealtimeBinaryFrameType, payload: Uint8Array) {
    if (this.readOnly && type === RealtimeBinaryFrameType.YjsDocument) return;

    if (type === RealtimeBinaryFrameType.YjsDocument) {
      this.queueDocumentUpdate(payload);
      return;
    }

    if (this.send === null) {
      this.pendingAwarenessUpdates.push(payload);
      logRealtimeYjs("queued update before channel connect", {
        type,
        byteLength: payload.byteLength,
      });
      return;
    }

    logRealtimeYjs("sending update", {
      type,
      byteLength: payload.byteLength,
    });
    this.send(type, payload);
  }

  private queueDocumentUpdate(payload: Uint8Array) {
    this.pendingDocumentUpdates.push(payload);

    if (this.send === null) {
      logRealtimeYjs("queued document update before channel connect", {
        byteLength: payload.byteLength,
        queuedUpdates: this.pendingDocumentUpdates.length,
      });
      return;
    }

    this.scheduleDocumentFlush();
  }

  private scheduleDocumentFlush() {
    this.clearDocumentFlushTimeout();
    this.documentFlushTimeout = setTimeout(() => {
      this.documentFlushTimeout = null;
      this.flushPendingDocumentUpdates();
    }, RealtimeYjsDocumentDebounceMs);
  }

  private clearDocumentFlushTimeout() {
    if (this.documentFlushTimeout === null) return;
    clearTimeout(this.documentFlushTimeout);
    this.documentFlushTimeout = null;
  }

  private flushPendingDocumentUpdates() {
    const send = this.send;
    if (
      send === null ||
      this.readOnly ||
      this.pendingDocumentUpdates.length === 0
    )
      return;

    const updates = this.pendingDocumentUpdates.splice(0);
    const payload = updates.length === 1 ? updates[0] : Y.mergeUpdates(updates);
    logRealtimeYjs("sending debounced document update", {
      updateCount: updates.length,
      byteLength: payload.byteLength,
    });
    send(RealtimeBinaryFrameType.YjsDocument, payload);
  }

  private flushPendingUpdates() {
    const send = this.send;
    if (send === null) return;

    if (this.readOnly) {
      this.pendingDocumentUpdates.length = 0;
    }

    this.flushPendingDocumentUpdates();

    while (this.pendingAwarenessUpdates.length > 0) {
      const update = this.pendingAwarenessUpdates.shift();
      if (!update) continue;
      logRealtimeYjs("flushing queued awareness update", {
        byteLength: update.byteLength,
      });
      send(RealtimeBinaryFrameType.Awareness, update);
    }
  }
}
