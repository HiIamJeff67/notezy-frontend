"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { makeClient } from "@/graphql/apollo-client";

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
