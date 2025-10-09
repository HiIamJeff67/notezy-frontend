import { FetchQueryOptions, UseQueryOptions } from "@tanstack/react-query";

// ! Do NOT directly expand this in the prefetchQuery as the default FetchQueryOptions
export const PrefetchQueryDefaultOptions: Partial<FetchQueryOptions> = {
  staleTime: (15 * 60 * 1000) as number,
};

// ! Do NOT directly expand this in the useQuery as the default UseQueryOptions
export const UseQueryDefaultOptions: Partial<UseQueryOptions> = {
  staleTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

// ! Do NOT directly expand this in the queryAsync as the default FetchQueryOptions
export const QueryAsyncDefaultOptions: Partial<FetchQueryOptions> = {
  staleTime: (15 * 60 * 1000) as number,
};
