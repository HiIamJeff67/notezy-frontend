import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import LoadingOverlay from "@/components/covers/LoadingCover/LoadingCover";
import Providers from "@/providers/Providers";

export function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>
          <Toaster position="top-center" />
          <LoadingOverlay />
          {/* the component as the start point of the entire application */}
          <Outlet />
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}
