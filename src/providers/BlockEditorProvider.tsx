import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  useDeleteMyBlocksByIds,
  useInsertBlock,
  useInsertBlocks,
  useUpdateMyBlocksByIds,
} from "@shared/api/hooks/block.hook";
import {
  ArborizedEditableBlock,
  DeleteMyBlocksByIdsRequest,
  InsertBlockRequest,
  InsertBlocksRequest,
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

interface NewBlockPackInitState {
  blockId: UUID;
  requestPromise: Promise<void> | null;
  isInitialized: boolean;
}

const newBlockPackInitStateByBlockPackId = new Map<
  UUID,
  NewBlockPackInitState
>();

export type BlockEditorState =
  | "initializing"
  | "idle"
  | "event"
  | "debouncing"
  | "merge"
  | "toRequest"
  | "sendAPI"
  | "waitResponse";

const toArborizedEditableBlock = (block: Block): ArborizedEditableBlock => ({
  id: block.id,
  type: block.type,
  props: block.props ?? {},
  content: (block.content ?? []) as any,
  children: (block.children ?? []).map(child =>
    toArborizedEditableBlock(child as Block)
  ),
});

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
  const hasInitializedRef = useRef<boolean>(false);
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
        let initState = newBlockPackInitStateByBlockPackId.get(
          blockPackMeta.id
        );

        if (initState === undefined) {
          initState = {
            blockId: generateUUID(),
            requestPromise: null,
            isInitialized: false,
          };
          newBlockPackInitStateByBlockPackId.set(blockPackMeta.id, initState);
        }

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

    return {
      insertBlocksRequest,
      updateBlocksRequest,
      deleteBlocksRequest,
    };
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
    if (sentEvents.length < MinRequestEvents) {
      setState("idle");
      isSyncingRef.current = false;
      return;
    }

    setState("toRequest");
    const { insertBlocksRequest, updateBlocksRequest, deleteBlocksRequest } =
      toRequest(sentEvents);

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
    const requests = [
      insertBlocksRequest.body.insertedBlocks.length > 0 &&
        insertBlocksMutator.mutateAsync(insertBlocksRequest),
      updateBlocksRequest.body.updatedBlocks.length > 0 &&
        updateBlocksMutator.mutateAsync(updateBlocksRequest),
      deleteBlocksRequest.body.blockIds.length > 0 &&
        deleteBlocksMutator.mutateAsync(deleteBlocksRequest),
    ];
    setState("waitResponse");
    await Promise.all(requests).catch(error =>
      toast.error(languageManager.tError(error))
    );
    eventQueueRef.current = eventQueueRef.current.filter(
      event => !sentEvents.includes(event)
    );
    isSyncingRef.current = false;
    if (eventQueueRef.current.length > 0) {
      setState("debouncing");
      mergeTimeoutRef.current = setTimeout(sync, MergingDebounceTimeout);
    } else {
      setState("idle");
    }
  };

  const syncNewBlockPack = useCallback(async () => {
    let initState = newBlockPackInitStateByBlockPackId.get(blockPackMeta.id);

    if (initState === undefined) {
      initState = {
        blockId: generateUUID(),
        requestPromise: null,
        isInitialized: false,
      };
      newBlockPackInitStateByBlockPackId.set(blockPackMeta.id, initState);
    }

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
