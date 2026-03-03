"use client";

import { getAuthorization } from "@/util/getAuthorization";
import { choiceRandom } from "@/util/random";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  useDeleteMyBlocksByIds,
  useInsertBlocks,
  useUpdateMyBlocksByIds,
} from "@shared/api/hooks/block.hook";
import { useInsertBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/hooks/blockGroup.hook";
import {
  DeleteMyBlocksByIdsRequest,
  InsertBlocksRequest,
  UpdateMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import { InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest } from "@shared/api/interfaces/blockGroup.interface";
import {
  MergingDebounceTimeout,
  MinForcedMergedEvents,
  MinRequestEvents,
} from "@shared/constants/blockEventLimitations.constant";
import { AllDefaultBlockPackInitialContents } from "@shared/constants/defaultBlockPackInitialContent.constant";
import { HybridDisjointSet } from "@shared/lib/disjointSet";
import { LinkedList, LinkedListNode } from "@shared/lib/linkedList";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { BlockEvent } from "@shared/types/blockEvent.type";
import {
  BlockGroupMeta,
  getDefaultBlockGroupMeta,
} from "@shared/types/blockGroupMeta.type";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import { UUID } from "crypto";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface BlockEditorContextType {
  editor: BlockNoteEditor;
  state: "merging" | "syncing" | "initializing" | "idle";
}

export const BlockEditorContext = createContext<
  BlockEditorContextType | undefined
>(undefined);

interface BlockEditorProviderProps {
  children: React.ReactNode;
  blockPackMeta: BlockPackMeta;
  isBlockPackMetaInitialized: boolean;
}

export const BlockEditorProvider = ({
  children,
  blockPackMeta,
  isBlockPackMetaInitialized,
}: BlockEditorProviderProps) => {
  const insertBlocksMutator = useInsertBlocks();
  const insertBlockGroupsAndBlocksMutator =
    useInsertBlockGroupsAndTheirBlocksByBlockPackId();
  const updateBlocksMutator = useUpdateMyBlocksByIds();
  const deleteBlocksMutator = useDeleteMyBlocksByIds();

  const dsuRef = useRef<HybridDisjointSet<UUID, BlockGroupMeta>>(
    new HybridDisjointSet<UUID, BlockGroupMeta>()
  );
  const blockGroupsLinkedListRef = useRef<LinkedList<UUID, number>>(
    new LinkedList<UUID, number>()
  );
  const eventQueueRef = useRef<BlockEvent[]>([]);
  const mergeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const [state, setState] = useState<
    "merging" | "syncing" | "initializing" | "idle"
  >("initializing");

  const traverse = (blocks: PartialBlock[], blockGroupId: UUID): number => {
    let count = 0;
    for (const block of blocks) {
      if (block.id !== undefined) {
        dsuRef.current.add(block.id as UUID);
        dsuRef.current.union(block.id as UUID, blockGroupId);
        count++;
      }
      if (block.children && block.children.length > 0) {
        count += traverse(block.children, blockGroupId);
      }
    }
    return count;
  };

  const initialize = useCallback(
    (
      blockPackMeta: BlockPackMeta
    ): {
      editor: BlockNoteEditor;
      initialContent: PartialBlock[];
      isNewBlockPack: boolean;
    } => {
      let initialContent: PartialBlock[] = [];
      let prevBlockGroup: LinkedListNode<UUID, number> =
        blockGroupsLinkedListRef.current.getHead();
      for (const blockGroup of blockPackMeta.blockGroups) {
        let totalBlockCount = 1;
        initialContent.push(blockGroup.rawArborizedEditableBlock);
        dsuRef.current.add(blockGroup.id, Infinity);
        dsuRef.current.setPayload(blockGroup.id, blockGroup);
        if (blockGroup.rawArborizedEditableBlock.id !== undefined) {
          dsuRef.current.union(
            blockGroup.rawArborizedEditableBlock.id as UUID,
            blockGroup.id
          );
        }
        if (
          blockGroup.rawArborizedEditableBlock.children &&
          blockGroup.rawArborizedEditableBlock.children.length > 0
        ) {
          totalBlockCount =
            traverse(
              blockGroup.rawArborizedEditableBlock.children,
              blockGroup.id
            ) + 1;
        }
        prevBlockGroup = blockGroupsLinkedListRef.current.insertAfter(
          prevBlockGroup,
          blockGroup.id,
          totalBlockCount
        );
      }

      const isNewBlockPack =
        isBlockPackMetaInitialized && initialContent.length === 0;
      if (initialContent.length === 0) {
        initialContent = [choiceRandom(AllDefaultBlockPackInitialContents)];
      }

      return {
        editor: BlockNoteEditor.create({
          initialContent: initialContent,
          trailingBlock: false,
        }),
        initialContent: initialContent,
        isNewBlockPack: isNewBlockPack,
      };
    },
    [isBlockPackMetaInitialized]
  );

  const { editor, initialContent, isNewBlockPack } = useMemo(
    () => initialize(blockPackMeta),
    []
  );

  editor.onCreate(() => {
    setState("idle");
  });

  const merge = (events: BlockEvent[]): BlockEvent[] => {
    const mergedEventMap = new Map<UUID, BlockEvent | undefined>();
    events.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
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

    return Array.from(mergedEventMap.values()).filter(
      (e): e is BlockEvent => e !== undefined
    );
  };

  const toRequest = (
    events: BlockEvent[]
  ): {
    insertBlocksRequest: InsertBlocksRequest;
    insertBlockGroupsAndBlocksRequest: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest;
    updateBlocksRequest: UpdateMyBlocksByIdsRequest;
    deleteBlocksRequest: DeleteMyBlocksByIdsRequest;
  } => {
    // at most four requests are sent in this function
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKeys.accessToken
    );
    const insertBlockGroupsAndBlocksRequest: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest =
      {
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          blockPackId: blockPackMeta.id,
          blockGroupContents: [],
        },
      };
    const insertBlocksRequest: InsertBlocksRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        insertedBlocks: [],
      },
      affected: {
        blockPackId: blockPackMeta.id,
      },
    };
    const updateBlocksRequest: UpdateMyBlocksByIdsRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        updatedBlocks: [],
      },
      affected: {
        blockPackIds: [blockPackMeta.id],
      },
    };
    const deleteBlocksRequest: DeleteMyBlocksByIdsRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        blockIds: [],
      },
      affected: {
        blockGroupIds: [],
        blockPackIds: [blockPackMeta.id],
      },
    };

    const needsRelinkBlockIds: UUID[] = [];
    const needsNewBlockGroupBlockIds: Set<UUID> = new Set<UUID>();

    for (const event of events) {
      if (event.type === "delete") {
        continue;
      }
      const blockId = event.payload.block.id as UUID;
      dsuRef.current.add(blockId);
      const parentBlock = editor.getParentBlock(blockId);
      if (parentBlock !== undefined) {
        dsuRef.current.add(parentBlock.id as UUID);
        dsuRef.current.union(blockId, parentBlock.id as UUID);
      } else {
        if (!dsuRef.current.hasPayload(blockId)) {
          const newBlockGroupId = generateUUID();
          const prevBlock = editor.getPrevBlock(blockId);
          const prevBlockGroupId =
            prevBlock === undefined ||
            dsuRef.current.getPayload(prevBlock.id as UUID) === undefined
              ? null
              : dsuRef.current.getPayload(prevBlock.id as UUID)!.id;
          const prevBlockGroupNode =
            prevBlockGroupId === null ||
            blockGroupsLinkedListRef.current.get(prevBlockGroupId) === undefined
              ? null
              : (blockGroupsLinkedListRef.current.get(
                  prevBlockGroupId
                ) as LinkedListNode<UUID, number>);

          const newBlockGroupMeta = getDefaultBlockGroupMeta(
            newBlockGroupId,
            blockPackMeta.id,
            prevBlockGroupId,
            null
          );

          dsuRef.current.add(newBlockGroupId, Infinity);
          dsuRef.current.union(blockId, newBlockGroupId);
          dsuRef.current.setPayload(blockId, newBlockGroupMeta);
          blockGroupsLinkedListRef.current.insertAfter(
            prevBlockGroupNode === null
              ? blockGroupsLinkedListRef.current.getHead()
              : prevBlockGroupNode,
            newBlockGroupId,
            1
          );
          needsNewBlockGroupBlockIds.add(blockId);

          if (prevBlock !== undefined && prevBlockGroupId === null) {
            needsRelinkBlockIds.push(blockId);
          }
        }
      }
    }

    for (const blockId of needsRelinkBlockIds) {
      const blockGroupMeta = dsuRef.current.getPayload(blockId);
      if (!blockGroupMeta) continue;

      const blockGroupId = blockGroupMeta.id;
      const prevBlock = editor.getPrevBlock(blockId);
      if (prevBlock === undefined) continue;

      const correctPrevGroupId = dsuRef.current.getPayload(
        prevBlock.id as UUID
      )?.id;
      if (correctPrevGroupId === undefined) continue;

      const correctPrevNode =
        blockGroupsLinkedListRef.current.get(correctPrevGroupId);
      if (correctPrevNode === undefined) continue;

      blockGroupsLinkedListRef.current.delete(blockGroupId);
      blockGroupsLinkedListRef.current.insertAfter(
        correctPrevNode,
        blockGroupId,
        correctPrevNode.value
      );
    }

    const getSafePrevBlockGroupId = (blockGroupId: UUID): UUID | null => {
      const node = blockGroupsLinkedListRef.current.get(blockGroupId);
      if (node === undefined || node.prev === null) return null;
      if (node.prev === blockGroupsLinkedListRef.current.getHead()) return null;
      return node.prev.key;
    };

    for (const event of events) {
      const blockId = event.payload.block.id as UUID;
      const blockGroupMeta = dsuRef.current.getPayload(blockId);
      const blockGroupId = blockGroupMeta?.id;
      if (!blockGroupId && event.type !== "delete") {
        console.error("Critical: Group ID not found for block", blockId);
        continue;
      }

      switch (event.type) {
        case "insert": {
          const parentBlock = editor.getParentBlock(blockId);
          if (
            parentBlock === undefined &&
            needsNewBlockGroupBlockIds.has(blockId)
          ) {
            const prevBlockGroupId = getSafePrevBlockGroupId(blockGroupId!);
            insertBlockGroupsAndBlocksRequest.body.blockGroupContents.push({
              blockGroupId: blockGroupId!,
              prevBlockGroupId: prevBlockGroupId,
              arborizedEditableBlock: event.payload.block,
            });
          } else {
            insertBlocksRequest.body.insertedBlocks.push({
              parentBlockId: parentBlock === undefined ? null : parentBlock.id,
              blockGroupId: blockGroupId! as string,
              arborizedEditableBlock: event.payload.block,
            });
          }
          break;
        }
        case "update":
        case "move": {
          if (needsNewBlockGroupBlockIds.has(blockId)) {
            const prevBlockGroupId = getSafePrevBlockGroupId(blockGroupId!);
            insertBlockGroupsAndBlocksRequest.body.blockGroupContents.push({
              blockGroupId: blockGroupId!,
              prevBlockGroupId: prevBlockGroupId,
              arborizedEditableBlock: event.payload.block,
            });
          } else {
            const parentBlock = editor.getParentBlock(blockId);
            updateBlocksRequest.body.updatedBlocks.push({
              blockId: blockId,
              values: {
                props: event.payload.block.props,
                content: event.payload.block.content as any,
                parentBlockId:
                  parentBlock === undefined ? null : parentBlock.id,
                blockGroupId: blockGroupId!,
              },
              setNull: {
                parentBlockId: parentBlock === undefined,
              },
            });
          }
          break;
        }
        case "delete":
          deleteBlocksRequest.body.blockIds.push(blockId);

          break;
      }
    }

    return {
      insertBlocksRequest: insertBlocksRequest,
      insertBlockGroupsAndBlocksRequest: insertBlockGroupsAndBlocksRequest,
      updateBlocksRequest: updateBlocksRequest,
      deleteBlocksRequest: deleteBlocksRequest,
    };
  };

  const sync = async () => {
    if (mergeTimeoutRef.current !== null) {
      clearTimeout(mergeTimeoutRef.current);
      mergeTimeoutRef.current = null;
    }
    setState("merging");
    const mergedEvents = merge(eventQueueRef.current);
    eventQueueRef.current = mergedEvents;
    if (mergedEvents.length > MinRequestEvents) {
      // merge events into one insert many request and one update many request and one delete many request.
      // send the above at most four requests to the backend.
      // reset the eventQueueRef.current.
      const {
        insertBlocksRequest,
        insertBlockGroupsAndBlocksRequest,
        updateBlocksRequest,
        deleteBlocksRequest,
      } = toRequest(mergedEvents);
      // console.log(
      //   "Prepared Requests: ",
      //   insertBlocksRequest,
      //   insertBlockGroupsAndBlocksRequest,
      //   updateBlocksRequest,
      //   deleteBlocksRequest
      // );
      setState("syncing");
      await Promise.all([
        insertBlocksRequest.body.insertedBlocks.length > 0 &&
          insertBlocksMutator.mutateAsync(insertBlocksRequest),
        insertBlockGroupsAndBlocksRequest.body.blockGroupContents.length > 0 &&
          insertBlockGroupsAndBlocksMutator.mutateAsync(
            insertBlockGroupsAndBlocksRequest
          ),
        updateBlocksRequest.body.updatedBlocks.length > 0 &&
          updateBlocksMutator.mutateAsync(updateBlocksRequest),
        deleteBlocksRequest.body.blockIds.length > 0 &&
          deleteBlocksMutator.mutateAsync(deleteBlocksRequest),
      ]);
      eventQueueRef.current = [];
      setState("idle");
    }
  };

  const syncNewBlockPack = useCallback(async () => {
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKeys.accessToken
    );
    const newBlockId = editor.document[0].id as UUID; // should exist
    const newBlockGroupId = generateUUID();
    const newBlockGroupMeta = getDefaultBlockGroupMeta(
      newBlockGroupId,
      blockPackMeta.id,
      null,
      null
    );
    dsuRef.current.add(newBlockGroupId, Infinity);
    dsuRef.current.setPayload(newBlockGroupId, newBlockGroupMeta);
    dsuRef.current.add(newBlockId);
    dsuRef.current.union(newBlockId, newBlockGroupId);
    blockGroupsLinkedListRef.current.insertAfter(
      blockGroupsLinkedListRef.current.getHead(),
      newBlockGroupId,
      1
    );
    await insertBlockGroupsAndBlocksMutator.mutateAsync({
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        blockPackId: blockPackMeta.id,
        blockGroupContents: [
          {
            blockGroupId: newBlockGroupId,
            prevBlockGroupId: null,
            // since if isNewBlockPack, then initialContent has one partial block in it,
            // and although it is not new block pack, initialContent still has non zero length
            arborizedEditableBlock: initialContent[0],
          },
        ],
      },
    });
  }, [insertBlockGroupsAndBlocksMutator, initialContent]);

  useEffect(() => {
    if (isNewBlockPack && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      syncNewBlockPack();
    }

    const unSubscribe = editor.onChange(async (_, { getChanges }) => {
      const changes = getChanges();
      // console.log("=========== Detected changed ===========");
      for (const change of changes) {
        // console.log("type: ", change.type);
        // console.log("block: ", change.block);
        // console.log("prev block: ", editor.getPrevBlock(change.block.id));
        // console.log(
        //   "block group: ",
        //   dsuRef.current.find(change.block.id as UUID)
        // );
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
      // console.log("=========== End of storing changed ===========");

      if (eventQueueRef.current.length > MinForcedMergedEvents) {
        sync();
      } else {
        if (mergeTimeoutRef.current !== null) {
          clearTimeout(mergeTimeoutRef.current);
        }
        mergeTimeoutRef.current = setTimeout(sync, MergingDebounceTimeout);
      }
    });

    return () => {
      unSubscribe();
      if (mergeTimeoutRef.current !== null) {
        clearTimeout(mergeTimeoutRef.current);
        mergeTimeoutRef.current = null;
      }
    };
  }, [isNewBlockPack, editor]);

  return (
    <BlockEditorContext.Provider value={{ editor, state }}>
      {children}
    </BlockEditorContext.Provider>
  );
};
