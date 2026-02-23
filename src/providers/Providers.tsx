"use client";

import { ApolloWrapper } from "@/providers/ApolloProvider";
import { AppRouterProvider } from "@/providers/AppRouterProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { ModalProvider } from "@/providers/ModalProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { UserDataProvider } from "@/providers/UserDataProvider";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
                    <ModalProvider>{children}</ModalProvider>
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
