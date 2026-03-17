import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import BlockPackEditor from "@/components/editors/BlockPackEditor/BlockPackEditor";
import { getAuthorization } from "@/util/getAuthorization";
import { prefetchGetMyBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/prefetches/blockGroup.prefetch";
import { prefetchGetMyBlockPackAndItsParentById } from "@shared/api/prefetches/blockPack.prefetch";
import { getDefaultBlockPackMeta } from "@shared/types/blockPackMeta.type";
import { CookieStoreKeys } from "@shared/types/cookieStore.type";
import { isValidUUID } from "@shared/types/uuidv4.type";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface BlockPackEditorPageProps {
  params: Promise<{
    blockPackId: string;
  }>;
  searchParams: Promise<{
    parentSubShelfId: string;
    rootShelfId: string;
  }>;
}

const BlockPackEditorPage = async ({
  params,
  searchParams,
}: BlockPackEditorPageProps) => {
  const { blockPackId } = await params;
  const { parentSubShelfId, rootShelfId } = await searchParams;
  if (
    !isValidUUID(blockPackId) ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(rootShelfId)
  )
    return notFound();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CookieStoreKeys.accessToken)?.value;
  if (accessToken) {
    const headerList = await headers();
    const getMyBlockPackAndItsParentPrefetcher =
      prefetchGetMyBlockPackAndItsParentById();
    await getMyBlockPackAndItsParentPrefetcher.prefetchQuery({
      header: {
        userAgent: headerList.get("user-agent") || "",
        authorization: getAuthorization(accessToken),
      },
      param: {
        blockPackId: blockPackId,
      },
    });
    const getMyBlockGroupsAndTheirBlocksByBlockPackIdPrefetcher =
      prefetchGetMyBlockGroupsAndTheirBlocksByBlockPackId(
        getMyBlockPackAndItsParentPrefetcher.nextQueryClient
      );
    await getMyBlockGroupsAndTheirBlocksByBlockPackIdPrefetcher.prefetchQuery({
      header: {
        userAgent: headerList.get("user-agent") || "",
        authorization: getAuthorization(accessToken),
      },
      param: {
        blockPackId: blockPackId,
      },
    });

    return (
      <HydrationBoundary
        state={dehydrate(
          getMyBlockGroupsAndTheirBlocksByBlockPackIdPrefetcher.nextQueryClient
        )}
      >
        <Suspense fallback={<StrictLoadingCover />}>
          <BlockPackEditor
            defaultBlockPackMeta={getDefaultBlockPackMeta(
              blockPackId,
              parentSubShelfId,
              rootShelfId
            )}
          />
        </Suspense>
      </HydrationBoundary>
    );
  }

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <BlockPackEditor
        defaultBlockPackMeta={getDefaultBlockPackMeta(
          blockPackId,
          parentSubShelfId,
          rootShelfId
        )}
      />
    </Suspense>
  );
};

export default BlockPackEditorPage;
