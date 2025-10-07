"use client";

/*
 * Make sure this file is placing as one of the children files of 'material-editor/'
 * instead of one of the children files of 'material-editor/[materialId]/'
 * so that the AppSidebar will not reload or refresh its status
 * when materialId from params changing, this means by doing so,
 * even if the user refresh or click to navigate to other material,
 * the sidebar status including expanded shelf structure won't change along
 */

import { AppSidebar } from "@/components/AppSidebar/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function MaterialEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
