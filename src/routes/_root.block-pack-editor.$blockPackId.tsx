import { fetchGetMyBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/fetches/blockGroup.fetch";
import { fetchGetMyBlockPackAndItsParentById } from "@shared/api/fetches/blockPack.fetch";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { BlockGroupMeta } from "@shared/types/blockGroupMeta.type";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { isValidUUID } from "@shared/types/uuidv4.type";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import type { UUID } from "crypto";
import BlockPackEditorNotFoundPage from "@/pages/root/block-pack-editor/BlockPackEditorNotFoundPage";
import BlockPackEditorPage from "@/pages/root/block-pack-editor/BlockPackEditorPage";
import { getAuthorization } from "@/util/getAuthorization";

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
  loader: async ({ params, deps }): Promise<BlockPackMeta> => {
    // get the user agent and access token from client side utils since the ssr has been turned off in block pack editor
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const responseOfGettingBlockPack =
      await fetchGetMyBlockPackAndItsParentById({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          blockPackId: params.blockPackId,
        },
      });
    const responseOfGettingBlockGroupsAndTheirBlocks =
      await fetchGetMyBlockGroupsAndTheirBlocksByBlockPackId({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          blockPackId: params.blockPackId,
        },
      });
    return {
      id: responseOfGettingBlockPack.data.id,
      parentId: deps.parentSubShelfId,
      rootId: deps.rootShelfId,
      name: responseOfGettingBlockPack.data.name,
      icon: responseOfGettingBlockPack.data.icon,
      headerBackgroundURL: responseOfGettingBlockPack.data.headerBackgroundURL,
      blockCount: responseOfGettingBlockPack.data.blockCount,
      path: (responseOfGettingBlockPack.data.parentSubShelfPath ||
        []) as UUID[],
      deletedAt: responseOfGettingBlockPack.data.deletedAt
        ? new Date(responseOfGettingBlockPack.data.deletedAt)
        : null,
      updatedAt: new Date(responseOfGettingBlockPack.data.updatedAt),
      createdAt: new Date(responseOfGettingBlockPack.data.createdAt),
      blockGroups:
        responseOfGettingBlockGroupsAndTheirBlocks.data as BlockGroupMeta[],
    } as BlockPackMeta;
  },
  component: BlockPackEditorIndexRoute,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});

function BlockPackEditorIndexRoute() {
  const data = useLoaderData({
    from: "/_root/block-pack-editor/$blockPackId",
  });

  return <BlockPackEditorPage blockPackMeta={data} />;
}
