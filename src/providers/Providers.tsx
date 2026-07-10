import { getQueryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AppRouterProvider } from "@/providers/AppRouterProvider";
import { BackgroundImagesProvider } from "@/providers/BackgroundImagesProvider";
import { ClipboardGuardProvider } from "@/providers/ClipboardGuardProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { LocalPreferencesProvider } from "@/providers/LocalPreferencesProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TransactionSynchronizerProvider } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import { UserProvider } from "@/providers/UserProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ScreenProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouterProvider>
          <LoadingProvider>
            <LanguageProvider>
              <ThemeProvider>
                <LocalPreferencesProvider>
                  <ClipboardGuardProvider>
                    <TransactionSynchronizerProvider>
                      <UserProvider>
                        <BackgroundImagesProvider>
                          <DndProvider backend={HTML5Backend}>
                            {children}
                          </DndProvider>
                        </BackgroundImagesProvider>
                      </UserProvider>
                    </TransactionSynchronizerProvider>
                  </ClipboardGuardProvider>
                </LocalPreferencesProvider>
              </ThemeProvider>
            </LanguageProvider>
          </LoadingProvider>
        </AppRouterProvider>
      </QueryClientProvider>
    </ScreenProvider>
  );
}
