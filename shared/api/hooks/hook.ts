import { UseQueryOptions } from "@tanstack/react-query";

export const defaultQueryOptions: Partial<UseQueryOptions> = {
  staleTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

export const defaultQueryAsyncOptions: Partial<UseQueryOptions> = {
  staleTime: 15 * 60 * 1000,
};
