import LoadingOverlay from "@/components/LoadingOutlay/LoadingOutlay";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  ApolloProvider,
  LanguageProvider,
  LoadingProvider,
  ShelfProvider,
  ThemeProvider,
  UserDataProvider,
} from "@/providers";
import { queryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notezy",
  description: "A note-taking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider>
          <QueryClientProvider client={queryClient}>
            <LoadingProvider>
              <LanguageProvider>
                <ThemeProvider>
                  <UserDataProvider>
                    <ShelfProvider maxNumOfExpandedShelves={50}>
                      <SidebarProvider>
                        <Toaster position="top-center" />
                        <LoadingOverlay />
                        {children}
                      </SidebarProvider>
                    </ShelfProvider>
                  </UserDataProvider>
                </ThemeProvider>
              </LanguageProvider>
            </LoadingProvider>
          </QueryClientProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
