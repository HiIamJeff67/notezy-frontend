import {
  SearchRootShelvesDocument,
  type SearchRootShelvesQuery,
  type SearchRootShelvesQueryVariables,
} from "@/graphql/generated/graphql";
import { useLazyQuery, useQuery } from "@apollo/client/react";

export const useSearchRootShelvesLazyQuery = () => {
  return useLazyQuery<SearchRootShelvesQuery, SearchRootShelvesQueryVariables>(
    SearchRootShelvesDocument,
    {
      notifyOnNetworkStatusChange: true,
    }
  );
};

export const useSearchShelvesQuery = (
  variables: SearchRootShelvesQueryVariables
) => {
  return useQuery<SearchRootShelvesQuery, SearchRootShelvesQueryVariables>(
    SearchRootShelvesDocument,
    { variables: variables }
  );
};
