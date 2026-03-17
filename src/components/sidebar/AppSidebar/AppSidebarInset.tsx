"use client";

import ResizableSidebarInset from "@/components/sidebar/ResizableSidebar/ResizableSidebarInset";
import React from "react";

interface AppSidebarInsetProps {
  children: React.ReactNode;
}

const AppSidebarInset = ({ children }: AppSidebarInsetProps) => {
  return <ResizableSidebarInset>{children}</ResizableSidebarInset>;
};

export default AppSidebarInset;
