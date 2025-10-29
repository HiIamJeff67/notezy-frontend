"use client";

import { AppSidebar } from "@/components/AppSidebar/AppSidebar";
import AppSidebarInset from "@/components/AppSidebar/AppSidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ShelfMaterialProvider } from "@/providers";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ResizeSidebarProvider>
        <ShelfMaterialProvider>
          <AppSidebar />
          <AppSidebarInset>{children}</AppSidebarInset>
        </ShelfMaterialProvider>
      </ResizeSidebarProvider>
    </SidebarProvider>
  );
}
