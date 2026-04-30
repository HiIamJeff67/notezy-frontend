import { getQueryClient } from "@shared/api/queryClient";
import { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { queryFnGetMyRootShelfById } from "../functions/rootShelf.function";
import { GetMyRootShelfByIdRequest } from "../interfaces/rootShelf.interface";
import { PrefetchQueryDefaultOptions } from "../queryHookOptions";
import { queryKeys } from "../queryKeys";

export const prefetchGetMyRootShelfById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyRootShelfByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.rootShelf.oneById(
        prefetchRequest?.param.rootShelfId as UUID | undefined
      ),
      queryFn: async () =>
        await queryFnGetMyRootShelfById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_ROOT_SHELF_PREFETCH" as const,
  };
};
