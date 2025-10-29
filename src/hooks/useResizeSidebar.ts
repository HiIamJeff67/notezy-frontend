import { ResizeSidebarContext } from "@/providers/ResizeSidebarProvider";
import { useContext } from "react";

export function useResizeSidebar() {
  const context = useContext(ResizeSidebarContext);
  if (!context) {
    throw new Error(
      "useResizeSidebar must be used within ResizeSidebarProvider"
    );
  }
  return context;
}
