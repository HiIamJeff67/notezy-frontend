import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutinesDocument,
  type SearchRoutinesQuery,
  type SearchRoutinesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRoutinesLocalAdapter } from "@shared/api/graphql/searchLocalAdapters";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@shared/api/graphql/searchLocalBridge";

export const useSearchRoutinesLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutinesQuery,
    SearchRoutinesQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutinesQuery,
  SearchRoutinesQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchRoutinesDocument,
    options,
    searchRoutinesLocalAdapter
  );

export const useSearchRoutinesQuery = (
  variables: SearchRoutinesQueryVariables,
  options?: useQuery.Options<SearchRoutinesQuery, SearchRoutinesQueryVariables>
) =>
  useLocalSearchQuery(
    SearchRoutinesDocument,
    variables,
    options,
    searchRoutinesLocalAdapter
  );
