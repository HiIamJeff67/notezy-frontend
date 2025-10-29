"use client";

import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { useResizeSidebar } from "@/hooks";
import React from "react";

interface AppSidebarInsetProps {
  children: React.ReactNode;
}

const ResizableSidebarInset = ({ children }: AppSidebarInsetProps) => {
  const sidebarManager = useSidebar();
  const { insetStyle } = useResizeSidebar();

  return (
    <SidebarInset
      style={{
        transition: "padding-left 0.2s",
        ...(sidebarManager.open && insetStyle),
      }}
    >
      {children}
    </SidebarInset>
  );
};

export default ResizableSidebarInset;
