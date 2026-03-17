"use client";

import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { BlockEditorProvider } from "@/providers/BlockEditorProvider";
import { blockPackMetaReducer } from "@/reducers/blockPackMeta.reducer";
import { getAuthorization } from "@/util/getAuthorization";
import "@blocknote/core/style.css";
import { useGetMyBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/hooks/blockGroup.hook";
import { useGetMyBlockPackAndItsParentById } from "@shared/api/hooks/blockPack.hook";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { BlockGroupMeta } from "@shared/types/blockGroupMeta.type";
import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { UUID } from "crypto";
import { Suspense, useEffect, useReducer, useState } from "react";
import toast from "react-hot-toast";
import BlockPackEditorContent from "./BlockPackEditorContent";

interface BlockPackEditorProps {
  defaultBlockPackMeta: BlockPackMeta;
}

const BlockPackEditor = ({ defaultBlockPackMeta }: BlockPackEditorProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const getMyBlockPackAndItsParentQuerier = useGetMyBlockPackAndItsParentById();
  const getMyBlockGroupsAndTheirBlocksQuerier =
    useGetMyBlockGroupsAndTheirBlocksByBlockPackId();

  const [meta, dispatchMeta] = useReducer(
    blockPackMetaReducer,
    defaultBlockPackMeta
  );
  const [isBlockPackMetaInitialized, setIsBlockPackMetaInitialized] =
    useState<boolean>(false);

  useEffect(() => {
    if (shelfItemManager.isItemNodeEditing(meta.id)) {
      dispatchMeta({
        type: "setName",
        newName: shelfItemManager.editItemNodeName,
      });
    }
  }, [shelfItemManager.editItemNodeName]);

  useEffect(() => {
    const initializeBlockPack = async () =>
      await loadingManager
        .startAsyncTransactionLoading(
          async () => {
            const blockPackMeta = await loadBlockPack(meta.id);
            dispatchMeta({
              type: "init",
              payload: blockPackMeta,
            });
          },
          3000,
          5000
        )
        .then(() => setIsBlockPackMetaInitialized(true))
        .catch(error => toast.error(languageManager.tError(error)));

    initializeBlockPack();
  }, []);

  const loadBlockPack = async (blockPackId: UUID): Promise<BlockPackMeta> => {
    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const responseOfGettingBlockPack =
      await getMyBlockPackAndItsParentQuerier.queryAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          blockPackId: blockPackId,
        },
      });
    const responseOfGettingBlockGroupsAndTheirBlocks =
      await getMyBlockGroupsAndTheirBlocksQuerier.queryAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          blockPackId: blockPackId,
        },
      });

    return {
      id: defaultBlockPackMeta.id,
      parentId: defaultBlockPackMeta.parentId,
      rootId: defaultBlockPackMeta.rootId,
      name: responseOfGettingBlockPack.data.name,
      icon: responseOfGettingBlockPack.data.icon,
      headerBackgroundURL: responseOfGettingBlockPack.data.headerBackgroundURL,
      blockCount: BigInt(responseOfGettingBlockPack.data.blockCount),
      path: responseOfGettingBlockPack.data.parentSubShelfPath as UUID[],
      deletedAt: responseOfGettingBlockPack.data.deletedAt
        ? new Date(responseOfGettingBlockPack.data.deletedAt)
        : null,
      updatedAt: new Date(responseOfGettingBlockPack.data.updatedAt),
      createdAt: new Date(responseOfGettingBlockPack.data.createdAt),
      blockGroups:
        responseOfGettingBlockGroupsAndTheirBlocks.data as BlockGroupMeta[],
    };
  };

  if (!meta.id || !meta.parentId || !meta.rootId) {
    return undefined;
  }

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      {isBlockPackMetaInitialized && (
        <BlockEditorProvider
          blockPackMeta={meta}
          isBlockPackMetaInitialized={isBlockPackMetaInitialized}
        >
          <BlockPackEditorContent blockPackMeta={meta} />
        </BlockEditorProvider>
      )}
    </Suspense>
  );
};

export default BlockPackEditor;
