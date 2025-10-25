"use client";

import { AppSidebar } from "@/components/AppSidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ShelfMaterialProvider } from "@/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ShelfMaterialProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </ShelfMaterialProvider>
    </SidebarProvider>
  );
}
