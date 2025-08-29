"use client";
import { makeClient } from "@/graphql/apollo-client";
// ^ this file needs the "use client" pragma

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
