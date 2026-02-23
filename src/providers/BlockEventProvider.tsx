"use client";

import { useDebounceCallback } from "@/hooks";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  MaxWaitCount,
  MergingDebounceTimeout,
  MinMergedEvents,
  MinRequestEvents,
} from "@shared/constants/blockEventLimitations.constant";
import { BlockEvent } from "@shared/types/blockEvent.type";
import { UUID } from "crypto";
import { createContext, useRef, useState } from "react";

interface BlockEventContextType {
  editor: BlockNoteEditor;
  state: "merging" | "syncing" | "idle";
}

export const BlockEventContext = createContext<
  BlockEventContextType | undefined
>(undefined);

interface BlockEventProviderProps {
  children: React.ReactNode;
  blockPackId: string;
  initialContent: PartialBlock[];
}

export const BlockEventProvider = ({
  children,
  blockPackId,
  initialContent,
}: BlockEventProviderProps) => {
  const eventQueueRef = useRef<BlockEvent[]>([]);
  const [state, setState] = useState<"merging" | "syncing" | "idle">("idle");

  const merge = (events: BlockEvent[]): BlockEvent[] => {
    const mergedEventMap = new Map<UUID, BlockEvent | undefined>();
    for (let i = 0; i < events.length; i++) {
      const id = events[i].payload.block.id as UUID;

      let mergedEvent = mergedEventMap.get(id) as BlockEvent | undefined;
      if (mergedEvent === undefined) {
        mergedEventMap.set(id, events[i]);
        continue;
      }

      if (mergedEvent.type === "delete") continue;

      switch (events[i].type) {
        case "insert":
          throw new Error(
            `insert after event of block with id ${id} constructed`
          );
        case "update":
          mergedEvent.payload.block = events[i].payload.block;
          mergedEvent.timestamp = events[i].timestamp;
          break;
        case "move":
          mergedEvent.payload.prevParent = events[i].payload.prevParent;
          mergedEvent.payload.currentParent = events[i].payload.currentParent;
          break;
        case "delete":
          mergedEvent = undefined;
          break;
      }

      mergedEventMap.set(id, mergedEvent);
    }

    events = [];
    for (const event of mergedEventMap.values()) {
      if (event) events.push(event);
    }

    return events;
  };

  const editor = BlockNoteEditor.create({
    initialContent: initialContent,
  });

  editor.onChange((editor, { getChanges }) => {
    const changes = getChanges();
    for (const change of changes) {
      eventQueueRef.current.push({
        type: change.type,
        payload: {
          block: change.block,
          source: change.source,
          prevBlock: change.prevBlock,
          ...(change.type === "move"
            ? {
                prevBlock: change.prevBlock,
                prevParent: change.prevParent,
                currentParent: change.currentParent,
              }
            : {}),
        },
        timestamp: new Date(),
      });
    }

    if (eventQueueRef.current.length > MinMergedEvents) {
      const mergedEvents = merge(eventQueueRef.current);
      eventQueueRef.current = mergedEvents;
      if (mergedEvents.length > MinRequestEvents) {
        // merge events into one insert many request and one update many request and one delete many request.
        // send the above at most three requests to the backend.
        // reset the eventQueueRef.current.
      }
    } else {
      useDebounceCallback(
        () => {
          const mergedEvents = merge(eventQueueRef.current);
          eventQueueRef.current = mergedEvents;
          if (mergedEvents.length > MinRequestEvents) {
            // merge events into one insert many request and one update many request and one delete many request.
            // send the above at most three requests to the backend.
            // reset the eventQueueRef.current.
          }
        },
        MergingDebounceTimeout,
        MaxWaitCount
      );
    }
  });

  return (
    <BlockEventContext.Provider value={{ editor, state }}>
      {children}
    </BlockEventContext.Provider>
  );
};
