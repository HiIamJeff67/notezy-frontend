import { isServer, QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | undefined;

export const makeQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000, // 30 minutes
        retry: 3,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

export const getQueryClient = (): QueryClient => {
  if (!isServer) {
    return makeQueryClient();
  } else {
    if (!queryClient) queryClient = makeQueryClient();
    return queryClient;
  }
};
