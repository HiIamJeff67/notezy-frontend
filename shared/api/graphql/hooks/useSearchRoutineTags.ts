import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SearchRoutineTagsDocument,
  type SearchRoutineTagsQuery,
  type SearchRoutineTagsQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { searchRoutineTagsLocalAdapter } from "@shared/api/graphql/searchLocalAdapters";
import {
  useLocalSearchLazyQuery,
  useLocalSearchQuery,
} from "@shared/api/graphql/searchLocalBridge";

export const useSearchRoutineTagsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutineTagsQuery,
  SearchRoutineTagsQueryVariables
> =>
  useLocalSearchLazyQuery(
    SearchRoutineTagsDocument,
    options,
    searchRoutineTagsLocalAdapter
  );

export const useSearchRoutineTagsQuery = (
  variables: SearchRoutineTagsQueryVariables,
  options?: useQuery.Options<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >
) =>
  useLocalSearchQuery(
    SearchRoutineTagsDocument,
    variables,
    options,
    searchRoutineTagsLocalAdapter
  );
