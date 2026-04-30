import React from "react";
import ResizableSidebarInset from "@/components/sidebar/ResizableSidebar/ResizableSidebarInset";

interface AppSidebarInsetProps {
  children: React.ReactNode;
}

const AppSidebarInset = ({ children }: AppSidebarInsetProps) => {
  return <ResizableSidebarInset>{children}</ResizableSidebarInset>;
};

export default AppSidebarInset;
