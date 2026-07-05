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

const ROOT_PARENT_KEY = "ROOT";

const buildBlockTree = (blocks: PrivateBlock[]): PartialBlock[] => {
  const childrenByParentId = new Map<string, PrivateBlock[]>();

  for (const block of blocks) {
    const parentKey = block.parentBlockId ?? ROOT_PARENT_KEY;
    childrenByParentId.set(parentKey, [
      ...(childrenByParentId.get(parentKey) ?? []),
      block,
    ]);
  }

  const orderSiblings = (siblings: PrivateBlock[]): PrivateBlock[] => {
    const byId = new Map(siblings.map(block => [block.id, block]));
    const visited = new Set<string>();
    const ordered: PrivateBlock[] = [];
    let current = siblings.find(block => block.prevBlockId === null);

    while (current && !visited.has(current.id)) {
      ordered.push(current);
      visited.add(current.id);
      current = current.nextBlockId ? byId.get(current.nextBlockId) : undefined;
    }

    for (const block of siblings) {
      if (!visited.has(block.id)) ordered.push(block);
    }

    return ordered;
  };

  const toPartialBlock = (block: PrivateBlock): PartialBlock => ({
    id: block.id,
    type: block.type as any,
    props: block.props as any,
    content: block.content as any,
    children: orderSiblings(childrenByParentId.get(block.id) ?? []).map(
      toPartialBlock
    ),
  });

  return orderSiblings(childrenByParentId.get(ROOT_PARENT_KEY) ?? []).map(
    toPartialBlock
  );
};

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

  const blockPackQuerier = useGetMyBlockPackAndItsParentById();
  const blocksQuerier = useGetMyBlocksByBlockPackId();
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
        const [blockPackResponse, blocksResponse] = await Promise.all([
          blockPackQuerier.fetch({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
            },
            param: {
              blockPackId: loaderData.blockPackId,
            },
          }),
          blocksQuerier.fetch({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
            },
            param: {
              blockPackId: loaderData.blockPackId,
            },
          }),
        ]);

        if (!isActive) return;

        if (!blockPackResponse?.data) {
          setIsNotFound(true);
          setBlockPackMeta(null);
          return;
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
          blocks: buildBlockTree(blocksResponse.data),
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
