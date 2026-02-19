import BlockPackEditor from "@/components/BlockPackEditor/BlockPackEditor";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { getAuthorization } from "@/util/getAuthorization";
import { prefetchGetMyBlockGroupsAndTheirBlocksByBlockPackId } from "@shared/api/prefetches/blockGroup.prefetch";
import { getDefaultBlockPackMeta } from "@shared/types/blockPackMeta.type";
import { CookieStoreKeys } from "@shared/types/cookieStore.type";
import { isValidUUID } from "@shared/types/uuidv4.type";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { UUID } from "crypto";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface BlockPackEditorPageProps {
  params: Promise<{
    blockPackId: string;
  }>;
  searchParams: Promise<{
    parentSubShelfId?: string;
    rootShelfId?: string;
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
    !parentSubShelfId ||
    !isValidUUID(parentSubShelfId)
  )
    return notFound();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CookieStoreKeys.accessToken)?.value;
  if (accessToken) {
    const headerList = await headers();
    const { prefetchQuery, nextQueryClient } =
      prefetchGetMyBlockGroupsAndTheirBlocksByBlockPackId();
    await prefetchQuery({
      header: {
        userAgent: headerList.get("user-agent") || "",
        authorization: getAuthorization(accessToken),
      },
      param: {
        blockPackId: blockPackId,
      },
    });

    return (
      <HydrationBoundary state={dehydrate(nextQueryClient)}>
        <Suspense fallback={<StrictLoadingOutlay />}>
          <BlockPackEditor
            defaultBlockPackMeta={getDefaultBlockPackMeta(
              blockPackId,
              parentSubShelfId,
              rootShelfId as UUID | undefined
            )}
          />
        </Suspense>
      </HydrationBoundary>
    );
  }

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <BlockPackEditor
        defaultBlockPackMeta={getDefaultBlockPackMeta(
          blockPackId,
          parentSubShelfId
        )}
      />
    </Suspense>
  );
};

export default BlockPackEditorPage;
