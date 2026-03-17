import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import NotebookEditor from "@/components/editors/NotebookEditor/NotebookEditor";
import { getAuthorization } from "@/util/getAuthorization";
import { prefetchGetMyMaterialAndItsParentById } from "@shared/api/prefetches/material.prefetch";
import { CookieStoreKeys } from "@shared/types/cookieStore.type";
import { getDefaultNotebookMaterialMeta } from "@shared/types/notebookMaterialMeta.type";
import { isValidUUID } from "@shared/types/uuidv4.type";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface NotebookMaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
  searchParams: Promise<{
    parentSubShelfId: string;
    rootShelfId: string;
  }>;
}

const NotebookMaterialEditorPage = async ({
  params,
  searchParams,
}: NotebookMaterialEditorPageProps) => {
  const { materialId } = await params;
  const { parentSubShelfId, rootShelfId } = await searchParams;
  if (
    !isValidUUID(materialId) ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(rootShelfId)
  )
    return notFound();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CookieStoreKeys.accessToken)?.value;
  if (accessToken) {
    const headersList = await headers();
    const { prefetchQuery, nextQueryClient } =
      prefetchGetMyMaterialAndItsParentById();
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
        <Suspense fallback={<StrictLoadingCover />}>
          <NotebookEditor
            defaultMeta={getDefaultNotebookMaterialMeta(
              materialId,
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
      <NotebookEditor
        defaultMeta={getDefaultNotebookMaterialMeta(
          materialId,
          parentSubShelfId,
          rootShelfId
        )}
      />
    </Suspense>
  );
};

export default NotebookMaterialEditorPage;
