import type {
  SearchShelvesQuery,
  SearchShelvesQueryVariables,
} from "@/graphql/generated/graphql";
import { SearchShelvesDocument } from "@/graphql/generated/graphql";
import { useLazyQuery, useQuery } from "@apollo/client/react";

export const useSearchShelvesLazyQuery = () => {
  return useLazyQuery<SearchShelvesQuery, SearchShelvesQueryVariables>(
    SearchShelvesDocument,
    {
      notifyOnNetworkStatusChange: true,
    }
  );
};

export const useSearchShelvesQuery = (
  variables: SearchShelvesQueryVariables
) => {
  return useQuery<SearchShelvesQuery, SearchShelvesQueryVariables>(
    SearchShelvesDocument,
    { variables: variables }
  );
};
