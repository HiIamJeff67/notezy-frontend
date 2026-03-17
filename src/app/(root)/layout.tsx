"use client";

import { AppSidebar } from "@/components/sidebar/AppSidebar/AppSidebar";
import AppSidebarInset from "@/components/sidebar/AppSidebar/AppSidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ShelfItemProvider } from "@/providers";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ResizeSidebarProvider>
        <ShelfItemProvider>
          <AppSidebar />
          <AppSidebarInset>{children}</AppSidebarInset>
        </ShelfItemProvider>
      </ResizeSidebarProvider>
    </SidebarProvider>
  );
}
