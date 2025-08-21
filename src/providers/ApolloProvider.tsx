"use client";

import { apolloClient } from "@/graphql/apollo-client";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client";
import React from "react";

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>
  );
};
