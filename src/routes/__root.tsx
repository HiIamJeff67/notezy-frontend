import type { ApolloClientIntegration } from "@apollo/client-integration-tanstack-start";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { RootDocument } from "@/pages/root/RootDocument";
import { RootNotFoundPage } from "@/pages/root/RootNotFoundPage";
import appCss from "@/styles/globals.css?url";
// @ts-ignore: allow side-effect import of global CSS without declaration
import "@/styles/globals.css";

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
          href: appCss,
        },
      ],
    }),
    component: RootDocument,
    notFoundComponent: RootNotFoundPage,
  });
