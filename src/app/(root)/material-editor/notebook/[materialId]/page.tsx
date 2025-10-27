import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import NotebookEditor from "@/components/NotebookEditor/NotebookEditor";
import { getAuthorization } from "@/util/getAuthorization";
import { prefetchGetMyMaterialById } from "@shared/api/prefetches/material.prefetch";
import { CookieStoreKeys } from "@shared/types/cookieStore.type";
import { getDefaultNotebookMaterialMeta } from "@shared/types/notebookMaterialMeta.type";
import { isValidUUID } from "@shared/types/uuid_v4.type";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface NotebookMaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
  searchParams: Promise<{
    parentSubShelfId?: string;
  }>;
}

const NotebookMaterialEditorPage = async ({
  params,
  searchParams,
}: NotebookMaterialEditorPageProps) => {
  const { materialId } = await params;
  const { parentSubShelfId } = await searchParams;
  if (
    !parentSubShelfId ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(materialId)
  )
    return notFound();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CookieStoreKeys.accessToken)?.value;
  if (accessToken) {
    const headersList = await headers();
    const { prefetchQuery, nextQueryClient } = prefetchGetMyMaterialById();
    await prefetchQuery({
      header: {
        userAgent: headersList.get("user-agent") || "",
        authorization: getAuthorization(accessToken),
      },
      param: {
        materialId: materialId,
      },
    });

    return (
      <HydrationBoundary state={dehydrate(nextQueryClient)}>
        <Suspense fallback={<StrictLoadingOutlay />}>
          <NotebookEditor
            defaultMeta={getDefaultNotebookMaterialMeta(
              materialId,
              parentSubShelfId
            )}
          />
        </Suspense>
      </HydrationBoundary>
    );
  }

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <NotebookEditor
        defaultMeta={getDefaultNotebookMaterialMeta(
          materialId,
          parentSubShelfId
        )}
      />
    </Suspense>
  );
};

export default NotebookMaterialEditorPage;
