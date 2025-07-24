import LoadingOverlay from "@/components/LoadingOutlay";
import "@/global/styles/theme.css";
import {
  LanguageProvider,
  LoadingProvider,
  ThemeProvider,
  UserDataProvider,
} from "@/providers";
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
        <LoadingProvider>
          <LanguageProvider>
            <ThemeProvider>
              <UserDataProvider>
                <Toaster position="top-center" />
                <LoadingOverlay />
                {children}
              </UserDataProvider>
            </ThemeProvider>
          </LanguageProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
