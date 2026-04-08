import { isServer, QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | undefined;

export const makeQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 6 * 60 * 60 * 1000, // 6 hours
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

export const getQueryClient = (): QueryClient => {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!queryClient) queryClient = makeQueryClient();
    return queryClient;
  }
};
