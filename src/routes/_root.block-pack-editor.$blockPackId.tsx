import type { PartialBlock } from "@blocknote/core";
import { useGetMyBlocksByBlockPackId } from "@shared/api/hooks/block.hook";
import { useGetMyBlockPackAndItsParentById } from "@shared/api/hooks/blockPack.hook";
import type { PrivateBlock } from "@shared/api/interfaces/block.interface";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { isValidUUID } from "@shared/types/uuidv4.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import BlockPackEditorNotFoundPage from "@/pages/root/block-pack-editor/BlockPackEditorNotFoundPage";
import BlockPackEditorPage from "@/pages/root/block-pack-editor/BlockPackEditorPage";
import { BlockPackMeta } from "@/reducers/blockPackMeta.reducer";

export const Route = createFileRoute("/_root/block-pack-editor/$blockPackId")({
  ssr: false, // since the blocknote editor view is a client side component
  validateSearch: search => ({
    parentSubShelfId:
      typeof search.parentSubShelfId === "string"
        ? search.parentSubShelfId
        : undefined,
    rootShelfId:
      typeof search.rootShelfId === "string" ? search.rootShelfId : undefined,
  }),
  loaderDeps: ({ search }) => {
    const { parentSubShelfId, rootShelfId } = search;

    if (
      !parentSubShelfId ||
      !rootShelfId ||
      !isValidUUID(parentSubShelfId) ||
      !isValidUUID(rootShelfId)
    ) {
      throw notFound();
    }

    return {
      parentSubShelfId: parentSubShelfId as UUID,
      rootShelfId: rootShelfId as UUID,
    };
  },
  loader: ({ params, deps }) => {
    return {
      blockPackId: params.blockPackId as UUID,
      ...deps,
    };
  },
  component: BlockPackEditorIndexRoute,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});

function BlockPackEditorIndexRoute() {
  const loaderData = useLoaderData({
    from: "/_root/block-pack-editor/$blockPackId",
  });

  const blockPackQuerier = useGetMyBlockPackAndItsParentById(undefined, {
    staleTime: 0,
  });
  const blocksQuerier = useGetMyBlocksByBlockPackId(undefined, {
    staleTime: 0,
  });
  const [blockPackMeta, setBlockPackMeta] = useState<BlockPackMeta | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchBlockPackMeta = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );

      try {
        const blockPackResponse = await blockPackQuerier.fetch({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          param: {
            blockPackId: loaderData.blockPackId,
          },
        });

        if (!isActive) return;

        if (!blockPackResponse?.data) {
          setIsNotFound(true);
          setBlockPackMeta(null);
          return;
        }

        const blocksResponse = await blocksQuerier
          .fetch({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
            },
            param: {
              blockPackId: loaderData.blockPackId,
            },
          })
          .catch(() => null);

        if (!isActive) return;

        const blocks = Array.isArray(blocksResponse?.data)
          ? blocksResponse.data.filter(block => block.deletedAt === null)
          : [];
        const childrenByParentId = new Map<string, PrivateBlock[]>();
        const orderedChildrenByParentId = new Map<string, PrivateBlock[]>();
        const partialBlockById = new Map<string, PartialBlock>();
        const rootBlocks: PartialBlock[] = [];

        for (const block of blocks) {
          const parentKey = block.parentBlockId ?? "ROOT";
          childrenByParentId.set(parentKey, [
            ...(childrenByParentId.get(parentKey) ?? []),
            block,
          ]);
          partialBlockById.set(block.id, {
            id: block.id,
            type: block.type as any,
            props: block.props as any,
            content: block.content as any,
            children: [],
          });
        }

        for (const [parentKey, siblings] of childrenByParentId.entries()) {
          const blockById = new Map(siblings.map(block => [block.id, block]));
          const visitedBlockIds = new Set<string>();
          const orderedBlocks: PrivateBlock[] = [];
          let currentBlock = siblings.find(block => block.prevBlockId === null);

          while (currentBlock && !visitedBlockIds.has(currentBlock.id)) {
            orderedBlocks.push(currentBlock);
            visitedBlockIds.add(currentBlock.id);
            currentBlock = currentBlock.nextBlockId
              ? blockById.get(currentBlock.nextBlockId)
              : undefined;
          }

          for (const block of siblings) {
            if (!visitedBlockIds.has(block.id)) orderedBlocks.push(block);
          }

          orderedChildrenByParentId.set(parentKey, orderedBlocks);
        }

        for (const [parentKey, orderedBlocks] of orderedChildrenByParentId) {
          const children = orderedBlocks
            .map(block => partialBlockById.get(block.id))
            .filter((block): block is PartialBlock => Boolean(block));

          if (parentKey === "ROOT") {
            rootBlocks.push(...children);
            continue;
          }

          const parentBlock = partialBlockById.get(parentKey);
          if (parentBlock) {
            parentBlock.children = children;
          }
        }

        setBlockPackMeta({
          id: blockPackResponse.data.id as UUID,
          parentId: loaderData.parentSubShelfId,
          rootId: loaderData.rootShelfId,
          name: blockPackResponse.data.name,
          icon: blockPackResponse.data.icon,
          headerBackgroundURL: blockPackResponse.data.headerBackgroundURL,
          blockCount: blockPackResponse.data.blockCount,
          path: (blockPackResponse.data.parentSubShelfPath || []) as UUID[],
          deletedAt: blockPackResponse.data.deletedAt
            ? new Date(blockPackResponse.data.deletedAt)
            : null,
          updatedAt: new Date(blockPackResponse.data.updatedAt),
          createdAt: new Date(blockPackResponse.data.createdAt),
          blocks: rootBlocks,
        });
      } catch {
        if (!isActive) return;
        setIsNotFound(true);
        setBlockPackMeta(null);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void fetchBlockPackMeta();

    return () => {
      isActive = false;
    };
  }, [
    loaderData.blockPackId,
    loaderData.parentSubShelfId,
    loaderData.rootShelfId,
  ]);

  if (isLoading) return <StrictLoadingCover />;
  if (isNotFound || !blockPackMeta) return <BlockPackEditorNotFoundPage />;

  return <BlockPackEditorPage blockPackMeta={blockPackMeta} />;
}
