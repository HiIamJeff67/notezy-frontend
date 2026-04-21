"use client";

import { getQueryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ApolloWrapper } from "@/providers/ApolloProvider";
import { AppRouterProvider } from "@/providers/AppRouterProvider";
import { BackgroundImagesProvider } from "@/providers/BackgroundImagesProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { ModalProvider } from "@/providers/ModalProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { UserProvider } from "@/providers/UserProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ScreenProvider>
      <ApolloWrapper>
        <QueryClientProvider client={queryClient}>
          <AppRouterProvider>
            <LoadingProvider>
              <LanguageProvider>
                <ThemeProvider>
                  <UserProvider>
                    <BackgroundImagesProvider>
                      <DndProvider backend={HTML5Backend}>
                        <ModalProvider>{children}</ModalProvider>
                      </DndProvider>
                    </BackgroundImagesProvider>
                  </UserProvider>
                </ThemeProvider>
              </LanguageProvider>
            </LoadingProvider>
          </AppRouterProvider>
        </QueryClientProvider>
      </ApolloWrapper>
    </ScreenProvider>
  );
}
