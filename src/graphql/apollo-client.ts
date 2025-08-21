import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { CurrentAPIBaseURL } from "../../shared/constants/url.constant";

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/graphql/`,
  credentials: "include", // for including the cookies
});

const authLink = setContext((_, { headers }) => {
  const userAgent = navigator.userAgent;
  return {
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "User-Agent": userAgent,
      // authorization: token ? `Bearer ${token}` : "", // just use the cookies
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, response }) => {
    if (graphQLErrors) {
      console.error("[GraphQL error] GraphQL Errors:", graphQLErrors);
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          extensions
        );
      });
    }

    if (networkError) {
      console.error("[GraphQL error] Network Error:", networkError);
      console.error("[GraphQL error] Operation Name:", operation.operationName);
      console.error("[GraphQL error] Variables:", operation.variables);
      console.error("[GraphQL error] Query:", operation.query.loc?.source.body);

      if ("result" in networkError && networkError.result) {
        console.error("[GraphQL error] Error Result:", networkError.result);
      }

      if ("statusCode" in networkError && networkError.statusCode === 422) {
        console.error("[GraphQL error] 422 Error - Request likely malformed");
      }
    }
  }
);

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

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink, errorLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  connectToDevTools: process.env.NODE_ENV === "development",
});
