"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ApolloWrapper } from "./ApolloProvider";
import { AppRouterProvider } from "./AppRouterProvider";
import { LanguageProvider } from "./LanguageProvider";
import { LoadingProvider } from "./LoadingProvider";
import { ShelfMaterialProvider } from "./ShelfMaterialProvider";
import { ThemeProvider } from "./ThemeProvider";
import { UserDataProvider } from "./UserDataProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ApolloWrapper>
      <QueryClientProvider client={queryClient}>
        <AppRouterProvider>
          <LoadingProvider>
            <LanguageProvider>
              <ThemeProvider>
                <UserDataProvider>
                  <DndProvider backend={HTML5Backend}>
                    <SidebarProvider>
                      <ShelfMaterialProvider>{children}</ShelfMaterialProvider>
                    </SidebarProvider>
                  </DndProvider>
                </UserDataProvider>
              </ThemeProvider>
            </LanguageProvider>
          </LoadingProvider>
        </AppRouterProvider>
      </QueryClientProvider>
    </ApolloWrapper>
  );
}
