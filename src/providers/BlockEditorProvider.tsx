import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  useDeleteMyBlocksByIds,
  useInsertBlock,
  useInsertBlocks,
  useUpdateMyBlocksByIds,
} from "@shared/api/hooks/block.hook";
import {
  DeleteMyBlocksByIdsRequest,
  InsertBlockRequest,
  InsertBlocksRequest,
  toArborizedEditableBlock,
  UpdateMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import { BlockType } from "@shared/api/interfaces/enums";
import {
  MergingDebounceTimeout,
  MinForcedMergedEvents,
  MinRequestEvents,
} from "@shared/constants/blockEventLimitations.constant";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { BlockEvent } from "@shared/types/blockEvent.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { BlockPackMeta } from "@/reducers/blockPackMeta.reducer";

interface BlockEditorContextType {
  editor: BlockNoteEditor;
  state: BlockEditorState;
}

export const BlockEditorContext = createContext<
  BlockEditorContextType | undefined
>(undefined);

interface BlockEditorProviderProps {
  children: React.ReactNode;
  blockPackMeta: BlockPackMeta;
}

export type BlockEditorState =
  | "initializing"
  | "idle"
  | "event"
  | "debouncing"
  | "merge"
  | "toRequest"
  | "sendAPI"
  | "waitResponse"
  | "syncError";

export const BlockEditorProvider = ({
  children,
  blockPackMeta,
}: BlockEditorProviderProps) => {
  const languageManager = useLanguage();

  const insertBlockMutator = useInsertBlock();
  const insertBlocksMutator = useInsertBlocks();
  const updateBlocksMutator = useUpdateMyBlocksByIds();
  const deleteBlocksMutator = useDeleteMyBlocksByIds();

  const beforeChangeEventMapRef = useRef<Map<string, BlockEvent>>(
    new Map<UUID, BlockEvent>()
  );
  const eventQueueRef = useRef<BlockEvent[]>([]);
  const mergeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef<boolean>(false);
  const forceSyncRef = useRef<boolean>(false);
  const syncRetryCountRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);
  const newBlockPackInitStateRef = useRef<{
    blockId: UUID;
    requestPromise: Promise<void> | null;
    isInitialized: boolean;
  } | null>(null);
  const [state, setState] = useState<BlockEditorState>("initializing");

  const initialize = useCallback(
    (
      blockPackMeta: BlockPackMeta
    ): {
      editor: BlockNoteEditor;
      initialContent: PartialBlock[];
      isNewBlockPack: boolean;
    } => {
      let initialContent = blockPackMeta.blocks;
      const isNewBlockPack = initialContent.length === 0;

      if (isNewBlockPack) {
        const initState =
          newBlockPackInitStateRef.current ??
          (newBlockPackInitStateRef.current = {
            blockId: generateUUID(),
            requestPromise: null,
            isInitialized: false,
          });

        initialContent = [
          {
            id: initState.blockId,
            type: "paragraph",
            content: [],
            children: [],
          },
        ];
      }

      const editor = BlockNoteEditor.create({
        initialContent,
        trailingBlock: false,
      });

      setState("idle");

      return {
        editor,
        initialContent: editor.document,
        isNewBlockPack,
      };
    },
    []
  );

  const { editor, initialContent, isNewBlockPack } = useMemo(
    () => initialize(blockPackMeta),
    []
  );

  const merge = (events: BlockEvent[]): BlockEvent[] => {
    const mergedEventMap = new Map<UUID, BlockEvent | undefined>();
    events.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));

    for (const event of events) {
      const id = event.payload.block.id as UUID;
      const mergedEvent = mergedEventMap.get(id);

      if (mergedEvent === undefined) {
        mergedEventMap.set(id, event);
        continue;
      }

      if (mergedEvent.type === "delete") continue;

      if (event.type === "delete") {
        mergedEventMap.set(
          id,
          mergedEvent.type === "insert"
            ? undefined
            : { ...mergedEvent, type: "delete" }
        );
        continue;
      }

      if (mergedEvent.type === "insert") {
        mergedEvent.payload.block = event.payload.block;
        mergedEvent.timestamp = event.timestamp;
        continue;
      }

      if (event.type === "move") {
        mergedEvent.type = "move";
        mergedEvent.payload.previous = event.payload.previous;
      }

      mergedEvent.payload.block = event.payload.block;
      mergedEvent.timestamp = event.timestamp;
    }

    return Array.from(mergedEventMap.values()).filter(
      (event): event is BlockEvent => event !== undefined
    );
  };

  const getPosition = (blockId: UUID) => {
    const parentBlock = editor.getParentBlock(blockId);
    const prevBlock = editor.getPrevBlock(blockId);

    return {
      parentBlockId: parentBlock?.id ?? null,
      prevBlockId: prevBlock?.id ?? null,
    };
  };

  const toRequest = (
    events: BlockEvent[]
  ): {
    insertBlocksRequest: InsertBlocksRequest;
    updateBlocksRequest: UpdateMyBlocksByIdsRequest;
    deleteBlocksRequest: DeleteMyBlocksByIdsRequest;
    insertEvents: BlockEvent[];
    updateEvents: BlockEvent[];
    deleteEvents: BlockEvent[];
  } => {
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const header = {
      userAgent,
      authorization: getAuthorization(accessToken),
    };
    const affected = {
      blockPackIds: [blockPackMeta.id],
    };
    const insertedBlockIds = new Set(
      events
        .filter(event => event.type === "insert")
        .map(event => event.payload.block.id)
    );
    const insertBlocksRequest: InsertBlocksRequest = {
      header,
      body: {
        insertedBlocks: [],
      },
      affected,
    };
    const updateBlocksRequest: UpdateMyBlocksByIdsRequest = {
      header,
      body: {
        updatedBlocks: [],
      },
      affected,
    };
    const deleteBlocksRequest: DeleteMyBlocksByIdsRequest = {
      header,
      body: {
        blockIds: [],
      },
      affected,
    };

    for (const event of events) {
      const blockId = event.payload.block.id as UUID;
      const parentBlock = editor.getParentBlock(blockId);

      if (
        event.type === "insert" &&
        parentBlock?.id &&
        insertedBlockIds.has(parentBlock.id)
      ) {
        continue;
      }

      switch (event.type) {
        case "insert": {
          const { parentBlockId, prevBlockId } = getPosition(blockId);
          insertBlocksRequest.body.insertedBlocks.push({
            blockPackId: blockPackMeta.id,
            parentBlockId,
            prevBlockId,
            arborizedEditableBlock: toArborizedEditableBlock(
              event.payload.block
            ),
          });
          break;
        }
        case "update":
          updateBlocksRequest.body.updatedBlocks.push({
            blockId,
            values: {
              type: event.payload.block.type as BlockType,
              props: event.payload.block.props,
              content: event.payload.block.content as any,
            },
          });
          break;
        case "move": {
          const { parentBlockId, prevBlockId } = getPosition(blockId);
          const values: UpdateMyBlocksByIdsRequest["body"]["updatedBlocks"][number]["values"] =
            {
              type: event.payload.block.type as BlockType,
              props: event.payload.block.props,
              content: event.payload.block.content as any,
            };
          const setNull: UpdateMyBlocksByIdsRequest["body"]["updatedBlocks"][number]["setNull"] =
            {};

          if (parentBlockId === null) setNull.ParentBlockId = true;
          else values.parentBlockId = parentBlockId;

          if (prevBlockId === null) setNull.PrevBlockId = true;
          else values.prevBlockId = prevBlockId;

          updateBlocksRequest.body.updatedBlocks.push({
            blockId,
            values,
            ...(Object.keys(setNull).length > 0 ? { setNull } : {}),
          });
          break;
        }
        case "delete":
          deleteBlocksRequest.body.blockIds.push(blockId);
          break;
      }
    }

    const blockOrder = new Map<string, number>();
    const collectBlockOrder = (blocks: readonly Block[]) => {
      for (const block of blocks) {
        blockOrder.set(block.id, blockOrder.size);
        if (block.children.length > 0) collectBlockOrder(block.children);
      }
    };
    collectBlockOrder(editor.document);
    updateBlocksRequest.body.updatedBlocks.sort(
      (a, b) =>
        (blockOrder.get(a.blockId) ?? Number.MAX_SAFE_INTEGER) -
        (blockOrder.get(b.blockId) ?? Number.MAX_SAFE_INTEGER)
    );

    const insertEvents =
      insertBlocksRequest.body.insertedBlocks.length > 0
        ? events.filter(event => event.type === "insert")
        : [];
    const updateEventByBlockId = new Map(
      events
        .filter(event => event.type === "update" || event.type === "move")
        .map(event => [event.payload.block.id, event] as const)
    );
    const updateEvents = updateBlocksRequest.body.updatedBlocks.length > 0
      ? updateBlocksRequest.body.updatedBlocks
          .map(block => updateEventByBlockId.get(block.blockId))
          .filter((event): event is BlockEvent => event !== undefined)
      : [];
    const deleteEvents =
      deleteBlocksRequest.body.blockIds.length > 0
        ? events.filter(event => event.type === "delete")
        : [];

    return {
      insertBlocksRequest,
      updateBlocksRequest,
      deleteBlocksRequest,
      insertEvents,
      updateEvents,
      deleteEvents,
    };
  };

  const getFailedIndexes = (response: unknown): number[] | null => {
    if (
      typeof response !== "object" ||
      response === null ||
      Array.isArray(response) ||
      (response as { success?: unknown }).success === false
    ) {
      return [];
    }

    const data = (response as { data?: unknown }).data;
    if (
      typeof data !== "object" ||
      data === null ||
      Array.isArray(data) ||
      (data as { isAllSuccess?: unknown }).isAllSuccess !== false
    )
      return [];

    const failedIndexes = (data as { failedIndexes?: unknown }).failedIndexes;
    return Array.isArray(failedIndexes)
      ? failedIndexes.filter(
          (index): index is number =>
            typeof index === "number" && Number.isInteger(index) && index >= 0
        )
      : null;
  };

  const hasBatchFailure = (response: unknown): boolean => {
    if (
      typeof response !== "object" ||
      response === null ||
      Array.isArray(response) ||
      (response as { success?: unknown }).success === false
    )
      return false;

    const data = (response as { data?: unknown }).data;
    return (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data) &&
      (data as { isAllSuccess?: unknown }).isAllSuccess === false
    );
  };

  const getBatchFailureMessage = (
    kind: "insert" | "update" | "delete",
    response: unknown,
    failedIndexes: number[]
  ) => {
    const exception =
      typeof response === "object" &&
      response !== null &&
      !Array.isArray(response) &&
      typeof (response as { exception?: unknown }).exception === "object" &&
      (response as { exception?: unknown }).exception !== null &&
      !Array.isArray((response as { exception?: unknown }).exception)
        ? ((response as { exception: Record<string, unknown> }).exception as Record<
            string,
            unknown
          >)
        : undefined;
    const detail =
      exception && typeof exception.message === "string"
        ? `: ${
            typeof exception.reason === "string"
              ? `${exception.reason} - `
              : ""
          }${exception.message}`
        : "";
    const indexes =
      failedIndexes.length > 0
        ? ` (failed indexes: ${failedIndexes.join(", ")})`
        : "";

    return `${kind} synchronization failed${indexes}${detail}`;
  };

  const sync = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (mergeTimeoutRef.current !== null) {
      clearTimeout(mergeTimeoutRef.current);
      mergeTimeoutRef.current = null;
    }
    setState("merge");
    const sentEvents = merge(eventQueueRef.current);
    eventQueueRef.current = [...sentEvents];
    const forceSync = forceSyncRef.current;
    forceSyncRef.current = false;
    if (sentEvents.length < MinRequestEvents && !forceSync) {
      setState("idle");
      isSyncingRef.current = false;
      return;
    }

    if (isNewBlockPack) {
      try {
        await syncNewBlockPack();
      } catch (error) {
        toast.error(languageManager.tError(error));
        isSyncingRef.current = false;
        syncRetryCountRef.current += 1;
        if (syncRetryCountRef.current < 3) {
          setState("debouncing");
          mergeTimeoutRef.current = setTimeout(sync, MergingDebounceTimeout);
        } else {
          setState("syncError");
          toast.error("Block synchronization paused after repeated failures.");
        }
        return;
      }
    }

    setState("toRequest");
    const {
      insertBlocksRequest,
      updateBlocksRequest,
      deleteBlocksRequest,
      insertEvents,
      updateEvents,
      deleteEvents,
    } = toRequest(sentEvents);

    console.log("[BlockEditorProvider] sync requests", {
      sentEvents: sentEvents.map(event => ({
        type: event.type,
        blockId: event.payload.block.id,
        blockType: event.payload.block.type,
      })),
      insertBlocksRequest,
      updateBlocksRequest,
      deleteBlocksRequest,
    });

    setState("sendAPI");
    const requests: {
      kind: "insert" | "update" | "delete";
      promise: Promise<unknown>;
      events: BlockEvent[];
    }[] = [];
    if (insertBlocksRequest.body.insertedBlocks.length > 0) {
      requests.push({
        kind: "insert",
        promise: insertBlocksMutator.mutateAsync(insertBlocksRequest),
        events: insertEvents,
      });
    }
    if (updateBlocksRequest.body.updatedBlocks.length > 0) {
      requests.push({
        kind: "update",
        promise: updateBlocksMutator.mutateAsync(updateBlocksRequest),
        events: updateEvents,
      });
    }
    if (deleteBlocksRequest.body.blockIds.length > 0) {
      requests.push({
        kind: "delete",
        promise: deleteBlocksMutator.mutateAsync(deleteBlocksRequest),
        events: deleteEvents,
      });
    }
    setState("waitResponse");
    const settledRequests = await Promise.allSettled(
      requests.map(request => request.promise)
    );
    const retryEvents = new Set<BlockEvent>();
    let hasBusinessFailure = false;
    settledRequests.forEach((result, index) => {
      const request = requests[index];
      if (result.status === "rejected") {
        request.events.forEach(event => retryEvents.add(event));
        toast.error(languageManager.tError(result.reason));
        return;
      }

      if (hasBatchFailure(result.value)) {
        hasBusinessFailure = true;
        const failedIndexes = getFailedIndexes(result.value) ?? [];
        toast.error(
          getBatchFailureMessage(request.kind, result.value, failedIndexes)
        );
        if (request.kind === "insert" || failedIndexes.length === 0) {
          request.events.forEach(event => retryEvents.add(event));
        } else {
          failedIndexes.forEach(index => {
            const event = request.events[index];
            if (event) retryEvents.add(event);
          });
        }
        return;
      }

      const failedIndexes = getFailedIndexes(result.value);
      if (failedIndexes === null) {
        request.events.forEach(event => retryEvents.add(event));
        return;
      }
      failedIndexes.forEach(index => {
        if (request.kind === "insert") {
          request.events.forEach(event => retryEvents.add(event));
        } else {
          const event = request.events[index];
          if (event) retryEvents.add(event);
        }
      });
    });
    eventQueueRef.current = [
      ...eventQueueRef.current.filter(event => !sentEvents.includes(event)),
      ...sentEvents.filter(event => retryEvents.has(event)),
    ];
    if (retryEvents.size > 0) {
      if (hasBusinessFailure) {
        syncRetryCountRef.current = 3;
      } else {
        syncRetryCountRef.current += 1;
      }
      if (
        !hasBusinessFailure &&
        syncRetryCountRef.current < 3
      ) {
        forceSyncRef.current = true;
      } else if (!hasBusinessFailure) {
        toast.error("Block synchronization paused after repeated failures.");
      }
    } else {
      syncRetryCountRef.current = 0;
    }
    isSyncingRef.current = false;
    if (
      eventQueueRef.current.length > 0 &&
      syncRetryCountRef.current < 3
    ) {
      setState("debouncing");
      mergeTimeoutRef.current = setTimeout(sync, MergingDebounceTimeout);
    } else {
      setState(retryEvents.size > 0 ? "syncError" : "idle");
    }
  };

  const syncNewBlockPack = useCallback(async () => {
    const initState =
      newBlockPackInitStateRef.current ??
      (newBlockPackInitStateRef.current = {
        blockId: generateUUID(),
        requestPromise: null,
        isInitialized: false,
      });

    if (initState.isInitialized) return;
    if (initState.requestPromise !== null) return initState.requestPromise;

    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const request: InsertBlockRequest = {
      header: {
        userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        blockPackId: blockPackMeta.id,
        parentBlockId: null,
        prevBlockId: null,
        arborizedEditableBlock: toArborizedEditableBlock(
          editor.document[0] as Block
        ),
      },
      affected: {
        blockPackIds: [blockPackMeta.id],
      },
    };

    initState.requestPromise = insertBlockMutator
      .mutateAsync(request)
      .then(response => {
        if (response.success === false) return;
        initState.isInitialized = true;
      })
      .finally(() => {
        initState.requestPromise = null;
      });

    return initState.requestPromise;
  }, [blockPackMeta.id, editor, insertBlockMutator]);

  useEffect(() => {
    if (!isNewBlockPack || hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    void syncNewBlockPack().catch(error =>
      toast.error(languageManager.tError(error))
    );
  }, [isNewBlockPack, syncNewBlockPack, languageManager]);

  useEffect(() => {
    const unSubscribeOnBeforeChange = editor.onBeforeChange(
      (_, { getChanges }) => {
        const changes = getChanges();
        for (const change of changes) {
          if (change.type !== "move") continue;
          const blockId = change.block.id as UUID;
          beforeChangeEventMapRef.current.set(
            change.block.id + ":" + change.block.type,
            {
              type: change.type,
              payload: {
                block: change.block,
                source: change.source,
                previous: {
                  block: change.prevBlock,
                  parent: editor.getParentBlock(blockId),
                  prev: editor.getPrevBlock(blockId),
                },
              },
              timestamp: new Date(),
            }
          );
        }
      }
    );

    const unSubscribeOnChange = editor.onChange(async (_, { getChanges }) => {
      const changes = getChanges();
      if (changes.length > 0 && !isSyncingRef.current) setState("event");
      if (changes.length > 0) syncRetryCountRef.current = 0;
      for (const change of changes) {
        eventQueueRef.current.push({
          type: change.type,
          payload: {
            block: change.block,
            source: change.source,
            previous: {
              block: change.prevBlock,
            },
          },
          ...beforeChangeEventMapRef.current.get(
            change.block.id + ":" + change.block.type
          ),
          timestamp: new Date(),
        });
      }
      beforeChangeEventMapRef.current.clear();

      if (eventQueueRef.current.length > MinForcedMergedEvents) {
        void sync();
      } else {
        if (mergeTimeoutRef.current !== null) {
          clearTimeout(mergeTimeoutRef.current);
        }
        if (!isSyncingRef.current) setState("debouncing");
        mergeTimeoutRef.current = setTimeout(sync, MergingDebounceTimeout);
      }
    });

    return () => {
      unSubscribeOnBeforeChange();
      unSubscribeOnChange();
      if (mergeTimeoutRef.current !== null) {
        clearTimeout(mergeTimeoutRef.current);
      }
    };
  }, [editor]);

  return (
    <BlockEditorContext.Provider value={{ editor, state }}>
      {children}
    </BlockEditorContext.Provider>
  );
};
