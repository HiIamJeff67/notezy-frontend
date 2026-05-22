import type { ApolloClientIntegration } from "@apollo/client-integration-tanstack-start";
import { createRootRouteWithContext } from "@tanstack/react-router";
import appCSS from "@/global/styles/globals.css?url";
import { RootDocument } from "@/pages/root/RootDocument";
import { RootNotFoundPage } from "@/pages/root/RootNotFoundPage";
// @ts-ignore: allow side-effect import of global CSS without declaration
import "@/global/styles/globals.css";

export const Route =
  createRootRouteWithContext<ApolloClientIntegration.RouterContext>()({
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { title: "Notezy" },
      ],
      links: [
        {
          rel: "icon",
          href: `${import.meta.env.BASE_URL}favicon.ico`,
        },
        {
          rel: "stylesheet",
          href: appCSS,
        },
      ],
    }),
    component: RootDocument,
    notFoundComponent: RootNotFoundPage,
  });
