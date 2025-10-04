"use client";

import { AppSidebar } from "@/components/AppSidebar/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLoading } from "@/hooks";
import { useEffect } from "react";

export default function MaterialEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadingManager = useLoading();
  const sidebarManager = useSidebar();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
