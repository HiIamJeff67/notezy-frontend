import { ApolloLink, HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { ErrorLink } from "@apollo/client/link/error";
import { CurrentAPIBaseURL } from "@shared/constants";

export const makeClient = () => {
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/graphql/`,
    credentials: "include", // for including the cookies
  });

  const authLink = new ApolloLink((operation, forward) => {
    const userAgent = navigator.userAgent;
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        // authorization: token ? `Bearer ${token}` : "", // just use the cookies
      },
    }));
    return forward(operation);
  });

  const errorLink = new ErrorLink(({ error, forward, operation, result }) => {
    if (error.name === "AbortError") forward(operation);
    if (error) {
      console.error("[GraphQL error] GraphQL Errors:", error);
    }
    return forward(operation);
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          searchShelves: {
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
    link: httpLink.concat(authLink).concat(errorLink),
    cache: cache,
  });
};
