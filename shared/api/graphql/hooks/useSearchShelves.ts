import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRootShelvesDocument,
  type SearchRootShelvesQuery,
  type SearchRootShelvesQueryVariables,
} from "@shared/api/graphql/generated/graphql";

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
