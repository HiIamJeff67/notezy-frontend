import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  useDeleteMyBlocksByIds,
  useInsertBlocks,
  useUpdateMyBlocksByIds,
} from "@shared/api/hooks/block.hook";
import {
  useBatchMoveMyBlockGroupsByIds,
  useDeleteMyBlockGroupsByIds,
  useInsertBlockGroupsAndTheirBlocksByBlockPackId,
  useInsertBlockGroupsByBlockPackId,
} from "@shared/api/hooks/blockGroup.hook";
import {
  DeleteMyBlocksByIdsRequest,
  InsertBlocksRequest,
  UpdateMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import {
  BatchMoveMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsByBlockPackIdRequest,
} from "@shared/api/interfaces/blockGroup.interface";
import { BlockType } from "@shared/api/interfaces/enums";
import {
  MergingDebounceTimeout,
  MinForcedMergedEvents,
  MinRequestEvents,
} from "@shared/constants/blockEventLimitations.constant";
import { HybridDisjointSet } from "@shared/lib/disjointSet";
import { LinkedList, LinkedListNode } from "@shared/lib/linkedList";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { BlockEvent } from "@shared/types/blockEvent.type";
import {
  BlockGroupMeta,
  getDefaultBlockGroupMeta,
} from "@shared/types/blockGroupMeta.type";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { generateUUID } from "@shared/types/uuidv4.type";
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
import { getAuthorization } from "@/util/getAuthorization";

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
}

export const BlockEditorProvider = ({
  children,
  blockPackMeta,
}: BlockEditorProviderProps) => {
  const languageManager = useLanguage();

  const insertBlocksMutator = useInsertBlocks();
  const insertBlockGroupsAndBlocksMutator =
    useInsertBlockGroupsAndTheirBlocksByBlockPackId();
  const insertBlockGroupsMutator = useInsertBlockGroupsByBlockPackId();
  const updateBlocksMutator = useUpdateMyBlocksByIds();
  const batchMoveBlockGroupsMutator = useBatchMoveMyBlockGroupsByIds();
  const deleteBlocksMutator = useDeleteMyBlocksByIds();
  const deleteBlockGroupsMutator = useDeleteMyBlockGroupsByIds();

  const dsuRef = useRef<HybridDisjointSet<UUID, BlockGroupMeta>>(
    new HybridDisjointSet<UUID, BlockGroupMeta>()
  );
  const blockGroupsLinkedListRef = useRef<LinkedList<UUID, number>>(
    new LinkedList<UUID, number>()
  );
  const beforeChangeEventMapRef = useRef<Map<string, BlockEvent>>(
    new Map<UUID, BlockEvent>()
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
      console.log("initialBlockGroups: ", blockPackMeta.blockGroups);
      for (const blockGroup of blockPackMeta.blockGroups) {
        let totalBlockCount = 1;
        initialContent.push(blockGroup.rawArborizedEditableBlock);
        dsuRef.current.add(blockGroup.id, Infinity);
        dsuRef.current.setPayload(blockGroup.id, blockGroup);
        if (blockGroup.rawArborizedEditableBlock.id === undefined) {
          throw new Error("Invalid blocks with undefined id");
        }
        dsuRef.current.union(
          blockGroup.rawArborizedEditableBlock.id as UUID,
          blockGroup.id
        );
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

      const editor = BlockNoteEditor.create({
        initialContent:
          initialContent.length === 0
            ? [
                {
                  id: generateUUID(),
                  type: "paragraph",
                  content: [],
                },
              ]
            : initialContent,
        trailingBlock: false,
      });

      setState("idle");

      return {
        editor: editor,
        initialContent: editor.document,
        isNewBlockPack: initialContent.length === 0,
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
    for (let i = 0; i < events.length; i++) {
      const id = events[i].payload.block.id as UUID;

      let mergedEvent = mergedEventMap.get(id) as BlockEvent | undefined;
      // the first events for each event with the same id can be placed into the merged events directly
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
          mergedEvent.payload.previous.block = events[i].payload.previous.block; // only overwrite the previous status of the block
          mergedEvent.timestamp = events[i].timestamp;
          break;
        case "move":
          mergedEvent.payload.block = events[i].payload.block; // the current status of the movable block
          mergedEvent.payload.previous = events[i].payload.previous; // overwrite the previous status of the block and the prev block(closest top neighbor block) of the previous status
          mergedEvent.timestamp = events[i].timestamp;
          break;
        case "delete":
          if (mergedEvent.type === "insert") mergedEvent = undefined;
          else mergedEvent.type = "delete"; // modify the type so that it will be handled when it is assembled to the requests
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
    insertBlockGroupsRequest: InsertBlockGroupsByBlockPackIdRequest;
    updateBlocksRequest: UpdateMyBlocksByIdsRequest;
    moveBlockGroupsRequest: BatchMoveMyBlockGroupsByIdsRequest;
    deleteBlocksRequest: DeleteMyBlocksByIdsRequest;
    deleteBlockGroupsRequest: DeleteMyBlockGroupsByIdsRequest;
  } => {
    // Step 1: Prepare all possible requests (at most four requests are sent in this function)
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const insertBlocksRequest: InsertBlocksRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        insertedBlocks: [],
      },
      affected: {
        blockPackIds: [blockPackMeta.id],
      },
    };
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
    const insertBlockGroupsRequest: InsertBlockGroupsByBlockPackIdRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        blockPackId: blockPackMeta.id,
        blockPackContents: [],
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
    const moveBlockGroupsRequest: BatchMoveMyBlockGroupsByIdsRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        movedBlockGroups: [],
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
    const deleteBlockGroupsRequest: DeleteMyBlockGroupsByIdsRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        blockGroupIds: [],
      },
      affected: {
        prevBlockGroupIds: [],
        blockPackIds: [blockPackMeta.id],
      },
    };

    console.log("receiving events", events);

    // Step 2: Prepare the disjoint set for getting the block group of any given blocks, relink blocks, and the blocks required new block groups
    const needsRelinkBlockIds: UUID[] = [];
    const needsNewBlockGroupBlockIds: Set<UUID> = new Set<UUID>();
    for (const event of events) {
      if (event.type === "delete") continue;

      const blockId = event.payload.block.id as UUID;
      const parentBlock = editor.getParentBlock(blockId);
      dsuRef.current.add(blockId);

      console.log(
        "parentBlock: ",
        parentBlock,
        ", block group payload: ",
        dsuRef.current.getPayload(blockId)
      );

      if (parentBlock !== undefined) {
        dsuRef.current.add(parentBlock.id as UUID);
        if (event.type === "move") {
          // check if it is a infantilized move operation
          const currentBlockGroup = dsuRef.current.getPayload(blockId);
          const parentBlockGroup = dsuRef.current.getPayload(
            parentBlock.id as UUID
          );
          if (
            currentBlockGroup !== undefined &&
            parentBlockGroup !== undefined &&
            currentBlockGroup.id !== parentBlockGroup.id
          ) {
            // skip the union on block and its parent here
            // so that we can get the original block group if its parent in the pass 3
            continue;
          }
        }
        dsuRef.current.union(blockId, parentBlock.id as UUID);
      } else if (
        !dsuRef.current.hasPayload(blockId) ||
        (event.type === "move" && event.payload.previous.parent !== undefined) // && parentBlock === undefined
      ) {
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
        const currentBlockGroupNode =
          blockGroupsLinkedListRef.current.insertAfter(
            prevBlockGroupNode === null
              ? blockGroupsLinkedListRef.current.getHead()
              : prevBlockGroupNode,
            newBlockGroupId,
            1
          );

        // check if the current block has next block, and the next block's block group is NOT pointing to the current block's block group
        // then we should update the next block's block group to point to the current block's block group for avoiding the inserting block before current block issues
        const nextBlock = editor.getNextBlock(blockId);
        const nextBlockGroupId =
          nextBlock === undefined ||
          dsuRef.current.getPayload(nextBlock.id as UUID) === undefined
            ? null
            : dsuRef.current.getPayload(nextBlock.id as UUID)!.id;
        const nextBlockGroupNode =
          nextBlockGroupId === null ||
          blockGroupsLinkedListRef.current.get(nextBlockGroupId) === undefined
            ? null
            : (blockGroupsLinkedListRef.current.get(
                nextBlockGroupId
              ) as LinkedListNode<UUID, number>);
        if (
          nextBlockGroupNode !== null &&
          nextBlockGroupNode.prev !== currentBlockGroupNode
        ) {
          nextBlockGroupNode.prev = currentBlockGroupNode;
        }

        console.log("adding to needsNewBlockGroupBlockIds: ", blockId);
        needsNewBlockGroupBlockIds.add(blockId);

        if (prevBlock !== undefined && prevBlockGroupId === null) {
          needsRelinkBlockIds.push(blockId);
        }
      }
    }

    // Step 3: Relink the blocks which may cause broken linked list
    //  (This is mostly happened when the user insert a new block before the current block,
    //    ex. Hit enter while the text cursor is on the head of some blocks)
    for (const needsRelinkBlockId of needsRelinkBlockIds) {
      const blockGroupMeta = dsuRef.current.getPayload(needsRelinkBlockId);
      if (!blockGroupMeta) continue;

      const blockGroupId = blockGroupMeta.id;
      const prevBlock = editor.getPrevBlock(needsRelinkBlockId);
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

    console.log("remaining events", events);

    // Step 4: Iterate through the events to combine them into the requests
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
          console.log(
            "handling insert operation, parentBlock",
            parentBlock,
            ", has new block group: ",
            needsNewBlockGroupBlockIds.has(blockId)
          );
          if (
            parentBlock === undefined &&
            needsNewBlockGroupBlockIds.has(blockId)
          ) {
            console.log("Push to insertBlockGroupsAndBlocksRequest...");
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
        case "update": {
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
                type: event.payload.block.type as BlockType,
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
        case "move": {
          const destinationParentBlock = editor.getParentBlock(blockId);
          if (destinationParentBlock === undefined) {
            const movableBlockGroup = dsuRef.current.getPayload(blockId);
            if (!movableBlockGroup) {
              console.error(
                "Movable block group id not found for block with id: ",
                blockId
              );
              continue;
            }
            const movablePrevBlockGroup = event.payload.previous.prev
              ? (dsuRef.current.getPayload(
                  event.payload.previous.prev.id as UUID
                ) ?? null)
              : null;
            const currentPrevBlock = editor.getPrevBlock(
              event.payload.block.id as UUID
            );
            const destinationBlockGroup = currentPrevBlock
              ? (dsuRef.current.getPayload(currentPrevBlock.id as UUID) ?? null)
              : null;

            // biome-ignore format: make comment of the if conditions at the same line
            if (needsNewBlockGroupBlockIds.has(blockId)) { // if move some children block to the root layer
              // remember that the parent block id is undefined in this scope
              const prevBlockGroupId = getSafePrevBlockGroupId(blockGroupId!);
              insertBlockGroupsRequest.body.blockPackContents.push({
                blockGroupId: blockGroupId!, 
                prevBlockGroupId: prevBlockGroupId,
              })
              updateBlocksRequest.body.updatedBlocks.push({
                blockId: blockId, 
                values: {
                  type: event.payload.block.type as BlockType,
                    props: event.payload.block.props,
                    content: event.payload.block.content as any,
                    parentBlockId: null,
                    blockGroupId: blockGroupId!,
                }, 
                setNull: {
                  parentBlockId: true
                }
              })
            } else {
              moveBlockGroupsRequest.body.movedBlockGroups.push({
                blockPackId: blockPackMeta.id,
                movableBlockGroupId: movableBlockGroup.id,
                movablePrevBlockGroupId:
                  movablePrevBlockGroup !== null
                    ? movablePrevBlockGroup.id
                    : null,
                destinationBlockGroupId:
                  destinationBlockGroup !== null
                    ? destinationBlockGroup.id
                    : null,
              });
            }
          } else {
            const destinationParentBlockGroup = dsuRef.current.getPayload(
              destinationParentBlock.id as UUID
            );
            const movableBlockGroup = dsuRef.current.getPayload(blockId);
            if (!destinationParentBlockGroup) {
              console.error(
                "The block group id of the parent block of the movable block not found for block with id: ",
                blockId
              );
              continue;
            }
            if (!movableBlockGroup) {
              console.error(
                "Movable block group id not found for block with id: ",
                blockId
              );
              continue;
            }

            // update the new block group when its parent block has different block group
            if (destinationParentBlockGroup.id !== movableBlockGroup.id) {
              updateBlocksRequest.body.updatedBlocks.push({
                blockId: blockId,
                values: {
                  type: event.payload.block.type as BlockType,
                  props: event.payload.block.props,
                  content: event.payload.block.content as any,
                  parentBlockId:
                    destinationParentBlock === undefined
                      ? null
                      : destinationParentBlock.id,
                  blockGroupId: destinationParentBlockGroup.id,
                },
                setNull: {
                  parentBlockId: destinationParentBlock === undefined,
                },
              });
            }
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
      insertBlockGroupsRequest: insertBlockGroupsRequest,
      updateBlocksRequest: updateBlocksRequest,
      moveBlockGroupsRequest: moveBlockGroupsRequest,
      deleteBlocksRequest: deleteBlocksRequest,
      deleteBlockGroupsRequest: deleteBlockGroupsRequest,
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
    if (mergedEvents.length >= MinRequestEvents) {
      // merge events into one insert many request and one update many request and one delete many request.
      // send the above at most four requests to the backend.
      // reset the eventQueueRef.current.
      // Note: Make sure before the merge() MUST be called before toRequest()
      const {
        insertBlocksRequest,
        insertBlockGroupsAndBlocksRequest,
        insertBlockGroupsRequest,
        updateBlocksRequest,
        moveBlockGroupsRequest,
        deleteBlocksRequest,
        deleteBlockGroupsRequest,
      } = toRequest(mergedEvents);
      if (insertBlocksRequest.body.insertedBlocks.length > 0) {
        console.log("Prepared Insert Blocks Request: ", insertBlocksRequest);
      }
      if (
        insertBlockGroupsAndBlocksRequest.body.blockGroupContents.length > 0
      ) {
        console.log(
          "Prepared Insert BlockGroups and Blocks Request: ",
          insertBlockGroupsAndBlocksRequest
        );
      }
      if (insertBlockGroupsRequest.body.blockPackContents.length > 0) {
        console.log(
          "Prepared Insert BlockGroups Request:",
          insertBlockGroupsRequest
        );
      }
      if (updateBlocksRequest.body.updatedBlocks.length > 0) {
        console.log("Prepared Update Blocks Request: ", updateBlocksRequest);
      }
      if (moveBlockGroupsRequest.body.movedBlockGroups.length > 0) {
        console.log(
          "Prepared Move BlockGroups Request: ",
          moveBlockGroupsRequest
        );
      }
      if (deleteBlocksRequest.body.blockIds.length > 0) {
        console.log("Prepared Delete Blocks Request: ", deleteBlocksRequest);
      }
      if (deleteBlockGroupsRequest.body.blockGroupIds.length > 0) {
        console.log(
          "Prepared Delete BlockGroups Request: ",
          deleteBlockGroupsRequest
        );
      }
      setState("syncing");
      await Promise.all([
        insertBlocksRequest.body.insertedBlocks.length > 0 &&
          insertBlocksMutator.mutateAsync(insertBlocksRequest),
        insertBlockGroupsAndBlocksRequest.body.blockGroupContents.length > 0 &&
          insertBlockGroupsAndBlocksMutator.mutateAsync(
            insertBlockGroupsAndBlocksRequest
          ),
        insertBlockGroupsRequest.body.blockPackContents.length > 0 &&
          insertBlockGroupsMutator.mutateAsync(insertBlockGroupsRequest),
        updateBlocksRequest.body.updatedBlocks.length > 0 &&
          updateBlocksMutator.mutateAsync(updateBlocksRequest),
        moveBlockGroupsRequest.body.movedBlockGroups.length > 0 &&
          batchMoveBlockGroupsMutator.mutateAsync(moveBlockGroupsRequest),
        deleteBlocksRequest.body.blockIds.length > 0 &&
          deleteBlocksMutator.mutateAsync(deleteBlocksRequest),
        deleteBlockGroupsRequest.body.blockGroupIds.length > 0 &&
          deleteBlockGroupsMutator.mutateAsync(deleteBlockGroupsRequest),
      ]).catch(error => toast.error(languageManager.tError(error)));
      eventQueueRef.current = [];
      setState("idle");
    }
  };

  const syncNewBlockPack = useCallback(async () => {
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
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

    const unSubscribeOnBeforeChange = editor.onBeforeChange(
      (_, { getChanges }) => {
        const changes = getChanges();
        for (const change of changes) {
          if (change.type !== "move") continue; // handling other operations in onChange event listener
          const blockId = change.block.id as UUID;
          const movedPrevBlock = editor.getPrevBlock(blockId);
          const movedParentBlock = editor.getParentBlock(blockId);
          beforeChangeEventMapRef.current.set(
            change.block.id + ":" + change.block.type,
            {
              type: change.type,
              payload: {
                block: change.block,
                source: change.source,
                previous: {
                  block: change.prevBlock,
                  parent: movedParentBlock,
                  prev: movedPrevBlock,
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
      console.log("=========== Detected changed ===========");
      for (const change of changes) {
        console.log("type: ", change.type);
        console.log("block: ", change.block);
        console.log("prev block: ", editor.getPrevBlock(change.block.id));
        console.log("next block: ", editor.getNextBlock(change.block.id));
        console.log("previous status: ", change.prevBlock);
        console.log(
          "block group: ",
          dsuRef.current.find(change.block.id as UUID)
        );

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
            // place the event if it does exist in the beforeChangeEventMap
            // which means it just been modified in onBeforeChange trigger
            change.block.id + ":" + change.block.type
          ),
          timestamp: new Date(), // make sure the actual timestamp in the onChange trigger
        });
      }
      beforeChangeEventMapRef.current.clear();
      console.log("=========== End of storing changed ===========");

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
      unSubscribeOnBeforeChange();
      unSubscribeOnChange();
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
