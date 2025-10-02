"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { queryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ApolloWrapper } from "./ApolloProvider";
import { LanguageProvider } from "./LanguageProvider";
import { LoadingProvider } from "./LoadingProvider";
import { ShelfMaterialProvider } from "./ShelfMaterialProvider";
import { ThemeProvider } from "./ThemeProvider";
import { UserDataProvider } from "./UserDataProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloWrapper>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <LanguageProvider>
            <ThemeProvider>
              <UserDataProvider>
                <DndProvider backend={HTML5Backend}>
                  <ShelfMaterialProvider>
                    <SidebarProvider>{children}</SidebarProvider>
                  </ShelfMaterialProvider>
                </DndProvider>
              </UserDataProvider>
            </ThemeProvider>
          </LanguageProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </ApolloWrapper>
  );
}
