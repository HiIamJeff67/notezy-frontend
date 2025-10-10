"use client";

import XIcon from "@/components/icons/XIcon";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAppRouter } from "@/hooks";
import { useGetMyMaterialById } from "@shared/api/hooks/material.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { Suspense } from "react";

/*
 * Make sure this file is placing as one of the children files of 'material-editor/'
 * instead of one of the children files of 'material-editor/[materialId]/'
 * so that the AppSidebar will not reload or refresh its status
 * when materialId from params changing, this means by doing so,
 * even if the user refresh or click to navigate to other material,
 * the sidebar status including expanded shelf structure won't change along
 */

export default function MaterialEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useAppRouter();
  const sidebarManager = useSidebar();

  const getMyMaterialQuerier = useGetMyMaterialById();

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <StrictLoadingOutlay condition={getMyMaterialQuerier.isFetching} />
      {sidebarManager.isMobile ? (
        <SidebarTrigger className="fixed m-2 mt-4" />
      ) : (
        !router.isSamePath(
          router.getCurrentPath(),
          WebURLPathDictionary.root.materialEditor._
        ) && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 fixed m-2 mt-4"
            onClick={() =>
              router.push(WebURLPathDictionary.root.materialEditor._)
            }
          >
            <XIcon size={16} />
          </Button>
        )
      )}
      {children}
    </Suspense>
  );
}
