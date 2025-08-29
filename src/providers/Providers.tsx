"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { queryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { ApolloWrapper } from "./ApolloProvider";
import { LanguageProvider } from "./LanguageProvider";
import { LoadingProvider } from "./LoadingProvider";
import { ShelfProvider } from "./ShelfProvider";
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
                <ShelfProvider maxNumOfExpandedShelves={50}>
                  <SidebarProvider>{children}</SidebarProvider>
                </ShelfProvider>
              </UserDataProvider>
            </ThemeProvider>
          </LanguageProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </ApolloWrapper>
  );
}
