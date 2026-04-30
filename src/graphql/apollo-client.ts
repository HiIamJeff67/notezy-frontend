import { ApolloLink, HttpLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-tanstack-start";
import { CurrentAPIBaseURL } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { getAuthorization } from "@/util/getAuthorization";

export const createApolloClient = () => {
  const apiDomainURL = import.meta.env.VITE_API_DOMAIN_URL || "";

  const httpLink = new HttpLink({
    uri: `${apiDomainURL}/${CurrentAPIBaseURL}/graphql/`,
    credentials: "include", // for including the cookies
  });

  const authLink = new ApolloLink((operation, forward) => {
    const userAgent =
      typeof navigator !== "undefined"
        ? navigator.userAgent
        : "TanStackStartServer";
    const accessToken =
      typeof window !== "undefined"
        ? LocalStorageManipulator.getItemByKey(LocalStorageKey.accessToken)
        : null;
    const authorization = getAuthorization(accessToken);

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        ...(authorization ? { Authorization: authorization } : {}),
      },
    }));
    return forward(operation);
  });

  const errorLink = new ErrorLink(({ error, forward, operation }) => {
    if (error.name === "AbortError") {
      return forward(operation);
    }

    if (error) {
      console.error("[GraphQL error] GraphQL Errors:", error);
    }

    return undefined;
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          searchRootShelves: {
            keyArgs: ["input", ["query", "sortBy", "sortOrder"]],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;

              if (args?.input?.after) {
                return {
                  ...incoming,
                  searchEdges: [
                    ...(existing.searchEdges || []),
                    ...(incoming.searchEdges || []),
                  ],
                };
              }

              return incoming;
            },
          },
          user: {
            keyArgs: ["id"],
          },
          shelf: {
            keyArgs: ["id"],
          },
        },
      },
      User: {
        fields: {
          shelves: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      Shelf: {
        fields: {
          materials: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
    possibleTypes: {
      // Union or Interface can be defined here
    },
  });

  return new ApolloClient({
    link: errorLink.concat(authLink, httpLink),
    cache: cache,
  });
};
