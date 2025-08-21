import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Base64Bytes: { input: string; output: string; }
  Int32: { input: number; output: number; }
  Int64: { input: number; output: number; }
  Time: { input: string; output: string; }
  UUID: { input: string; output: string; }
};

export type AccessControlPermission =
  | 'Admin'
  | 'Read'
  | 'Write';

export type BadgeType =
  | 'Bronze'
  | 'Diamond'
  | 'Golden'
  | 'Silver'
  | 'Steel';

export type Country =
  | 'Australia'
  | 'Canada'
  | 'China'
  | 'Japan'
  | 'Malaysia'
  | 'Singapore'
  | 'Taiwan'
  | 'UnitedKingdom'
  | 'UnitedStatesOfAmerica';

export type CountryCode =
  | 'COUNTRY_CODE_1'
  | 'COUNTRY_CODE_44'
  | 'COUNTRY_CODE_60'
  | 'COUNTRY_CODE_61'
  | 'COUNTRY_CODE_65'
  | 'COUNTRY_CODE_81'
  | 'COUNTRY_CODE_86'
  | 'COUNTRY_CODE_886';

export type Language =
  | 'English'
  | 'Japanese'
  | 'Korean'
  | 'SimpleChinese'
  | 'TraditionalChinese';

export type MaterialContentType =
  | 'Image_GIF'
  | 'Image_JPEG'
  | 'Image_JPG'
  | 'Image_PNG'
  | 'Image_SVG'
  | 'Text_HTML'
  | 'Text_Markdown'
  | 'Text_Plain'
  | 'VIDEO_MP4'
  | 'Video_MP3';

export type MaterialType =
  | 'LearningCards'
  | 'Notebook'
  | 'Textbook'
  | 'Workflow';

export type PrivateShelf = {
  __typename?: 'PrivateShelf';
  createdAt: Scalars['Time']['output'];
  encodedStructure: Scalars['Base64Bytes']['output'];
  encodedStructureByteSize: Scalars['Int64']['output'];
  id: Scalars['UUID']['output'];
  maxDepth: Scalars['Int32']['output'];
  maxWidth: Scalars['Int32']['output'];
  name: Scalars['String']['output'];
  owner: Array<PublicUser>;
  totalMaterials: Scalars['Int32']['output'];
  totalShelfNodes: Scalars['Int32']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PublicBadge = {
  __typename?: 'PublicBadge';
  createdAt: Scalars['Time']['output'];
  description: Scalars['String']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  publicId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: BadgeType;
  users: Array<PublicUser>;
};

export type PublicTheme = {
  __typename?: 'PublicTheme';
  author: PublicUser;
  createdAt: Scalars['Time']['output'];
  downloadCount: Scalars['Int64']['output'];
  downloadURL?: Maybe<Scalars['String']['output']>;
  isDark: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  publicId: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  version: Scalars['String']['output'];
};

export type PublicUser = {
  __typename?: 'PublicUser';
  badges: Array<PublicBadge>;
  createdAt: Scalars['Time']['output'];
  displayName: Scalars['String']['output'];
  name: Scalars['String']['output'];
  plan: UserPlan;
  publicId: Scalars['String']['output'];
  role: UserRole;
  status: UserStatus;
  themes: Array<PublicTheme>;
  userInfo: PublicUserInfo;
};

export type PublicUserInfo = {
  __typename?: 'PublicUserInfo';
  avatarURL?: Maybe<Scalars['String']['output']>;
  birthDate: Scalars['Time']['output'];
  country?: Maybe<Country>;
  coverBackgroundURL?: Maybe<Scalars['String']['output']>;
  gender: UserGender;
  header?: Maybe<Scalars['String']['output']>;
  introduction?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  searchShelves: SearchShelfConnection;
  searchThemes: SearchThemeConnection;
  searchUsers: SearchUserConnection;
};


export type QuerySearchShelvesArgs = {
  input: SearchShelfInput;
};


export type QuerySearchThemesArgs = {
  input: SearchThemeInput;
};


export type QuerySearchUsersArgs = {
  input: SearchUserInput;
};

export type SearchBadgeConnection = SearchConnection & {
  __typename?: 'SearchBadgeConnection';
  searchEdges: Array<SearchBadgeEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchBadgeCursorFields = {
  publicId: Scalars['String']['input'];
};

export type SearchBadgeEdge = SearchEdge & {
  __typename?: 'SearchBadgeEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PublicBadge;
};

export type SearchBadgeFilters = {
  type?: InputMaybe<BadgeType>;
};

export type SearchBadgeInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SearchBadgeFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchBadgeSortBy>;
  sortOrderr?: InputMaybe<SearchSortOrder>;
};

export type SearchBadgeSortBy =
  | 'CREATED_AT'
  | 'RELEVANCE'
  | 'TITLE';

export type SearchConnection = {
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchEdge = {
  encodedSearchCursor: Scalars['String']['output'];
};

export type SearchPageInfo = {
  __typename?: 'SearchPageInfo';
  endEncodedSearchCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startEncodedSearchCursor?: Maybe<Scalars['String']['output']>;
};

export type SearchShelfConnection = SearchConnection & {
  __typename?: 'SearchShelfConnection';
  searchEdges: Array<SearchShelfEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchShelfCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchShelfEdge = SearchEdge & {
  __typename?: 'SearchShelfEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateShelf;
};

export type SearchShelfInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchShelfSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export type SearchShelfSortBy =
  | 'CREATED_AT'
  | 'LAST_UPDATE'
  | 'NAME'
  | 'RELEVANCE';

export type SearchSortOrder =
  | 'ASC'
  | 'DESC';

export type SearchThemeConnection = SearchConnection & {
  __typename?: 'SearchThemeConnection';
  searchEdges: Array<SearchThemeEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchThemeCursorFields = {
  publicId: Scalars['String']['input'];
};

export type SearchThemeEdge = SearchEdge & {
  __typename?: 'SearchThemeEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PublicTheme;
};

export type SearchThemeFilters = {
  downloadCountGreaterThan?: InputMaybe<Scalars['Int']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SearchThemeInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SearchThemeFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchThemeSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export type SearchThemeSortBy =
  | 'CREATED_AT'
  | 'LAST_UPDATE'
  | 'NAME'
  | 'RELEVANCE';

export type SearchUserConnection = SearchConnection & {
  __typename?: 'SearchUserConnection';
  searchEdges: Array<SearchUserEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchUserCursorFields = {
  publicId: Scalars['String']['input'];
};

export type SearchUserEdge = SearchEdge & {
  __typename?: 'SearchUserEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PublicUser;
};

export type SearchUserFilters = {
  country?: InputMaybe<Country>;
  hasAvatar?: InputMaybe<Scalars['Boolean']['input']>;
  isOnline?: InputMaybe<Scalars['Boolean']['input']>;
  plan?: InputMaybe<UserPlan>;
  role?: InputMaybe<UserRole>;
  status?: InputMaybe<UserStatus>;
};

export type SearchUserInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SearchUserFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchUserSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export type SearchUserSortBy =
  | 'CREATED_AT'
  | 'LAST_ACTIVE'
  | 'NAME'
  | 'RELEVANCE';

export type UserGender =
  | 'Female'
  | 'Male'
  | 'PreferNotToSay';

export type UserPlan =
  | 'Enterprise'
  | 'Free'
  | 'Pro'
  | 'Ultimate';

export type UserRole =
  | 'Admin'
  | 'Guest'
  | 'Normal';

export type UserStatus =
  | 'AFK'
  | 'DoNotDisturb'
  | 'Offline'
  | 'Online';

export type FragmentedBasicPublicBadgeFragment = { __typename?: 'PublicBadge', publicId: string, title: string, description: string, type: BadgeType, imageURL?: string | null, createdAt: string };

export type FragmentedBasicPrivateShelfFragment = { __typename?: 'PrivateShelf', id: string, name: string, encodedStructure: string, encodedStructureByteSize: number, totalShelfNodes: number, totalMaterials: number, maxWidth: number, maxDepth: number, updatedAt: string, createdAt: string };

export type FragmentedPrivateShelfFragment = { __typename?: 'PrivateShelf', id: string, name: string, encodedStructure: string, encodedStructureByteSize: number, totalShelfNodes: number, totalMaterials: number, maxWidth: number, maxDepth: number, updatedAt: string, createdAt: string, owner: Array<{ __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string }> };

export type FragmentedBasicPublicThemeFragment = { __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null, downloadCount: number, createdAt: string, updatedAt: string };

export type FragmentedPublicThemeFragment = { __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null, downloadCount: number, createdAt: string, updatedAt: string, author: { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string } };

export type FragmentedBasicPublicUserFragment = { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string };

export type FragmentedPublicUserFragment = { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string, userInfo: { __typename?: 'PublicUserInfo', avatarURL?: string | null, coverBackgroundURL?: string | null, header?: string | null, introduction?: string | null, gender: UserGender, country?: Country | null, birthDate: string }, badges: Array<{ __typename?: 'PublicBadge', publicId: string, title: string, description: string, type: BadgeType, imageURL?: string | null, createdAt: string }>, themes: Array<{ __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null, downloadCount: number, createdAt: string, updatedAt: string }> };

export type FragmentedBasicPublicUserInfoFragment = { __typename?: 'PublicUserInfo', avatarURL?: string | null, coverBackgroundURL?: string | null, header?: string | null, introduction?: string | null, gender: UserGender, country?: Country | null, birthDate: string };

export type SearchUsersQueryVariables = Exact<{
  input: SearchUserInput;
}>;


export type SearchUsersQuery = { __typename?: 'Query', searchUsers: { __typename?: 'SearchUserConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchUserEdge', encodedSearchCursor: string, node: { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string, userInfo: { __typename?: 'PublicUserInfo', avatarURL?: string | null, coverBackgroundURL?: string | null, header?: string | null, introduction?: string | null, gender: UserGender, country?: Country | null, birthDate: string }, badges: Array<{ __typename?: 'PublicBadge', publicId: string, title: string, description: string, type: BadgeType, imageURL?: string | null, createdAt: string }>, themes: Array<{ __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null, downloadCount: number, createdAt: string, updatedAt: string }> } }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchThemesQueryVariables = Exact<{
  input: SearchThemeInput;
}>;


export type SearchThemesQuery = { __typename?: 'Query', searchThemes: { __typename?: 'SearchThemeConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchThemeEdge', encodedSearchCursor: string, node: { __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null, downloadCount: number, createdAt: string, updatedAt: string, author: { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string } } }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchShelvesQueryVariables = Exact<{
  input: SearchShelfInput;
}>;


export type SearchShelvesQuery = { __typename?: 'Query', searchShelves: { __typename?: 'SearchShelfConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchShelfEdge', encodedSearchCursor: string, node: { __typename?: 'PrivateShelf', id: string, name: string, encodedStructure: string, encodedStructureByteSize: number, totalShelfNodes: number, totalMaterials: number, maxWidth: number, maxDepth: number, updatedAt: string, createdAt: string, owner: Array<{ __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string }> } }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export const FragmentedBasicPrivateShelfFragmentDoc = gql`
    fragment FragmentedBasicPrivateShelf on PrivateShelf {
  id
  name
  encodedStructure
  encodedStructureByteSize
  totalShelfNodes
  totalMaterials
  maxWidth
  maxDepth
  updatedAt
  createdAt
}
    `;
export const FragmentedBasicPublicUserFragmentDoc = gql`
    fragment FragmentedBasicPublicUser on PublicUser {
  publicId
  name
  displayName
  role
  plan
  status
  createdAt
}
    `;
export const FragmentedPrivateShelfFragmentDoc = gql`
    fragment FragmentedPrivateShelf on PrivateShelf {
  ...FragmentedBasicPrivateShelf
  owner {
    ...FragmentedBasicPublicUser
  }
}
    ${FragmentedBasicPrivateShelfFragmentDoc}
${FragmentedBasicPublicUserFragmentDoc}`;
export const FragmentedBasicPublicThemeFragmentDoc = gql`
    fragment FragmentedBasicPublicTheme on PublicTheme {
  publicId
  name
  isDark
  version
  isDefault
  downloadURL
  downloadCount
  createdAt
  updatedAt
}
    `;
export const FragmentedPublicThemeFragmentDoc = gql`
    fragment FragmentedPublicTheme on PublicTheme {
  ...FragmentedBasicPublicTheme
  author {
    ...FragmentedBasicPublicUser
  }
}
    ${FragmentedBasicPublicThemeFragmentDoc}
${FragmentedBasicPublicUserFragmentDoc}`;
export const FragmentedBasicPublicUserInfoFragmentDoc = gql`
    fragment FragmentedBasicPublicUserInfo on PublicUserInfo {
  avatarURL
  coverBackgroundURL
  header
  introduction
  gender
  country
  birthDate
}
    `;
export const FragmentedBasicPublicBadgeFragmentDoc = gql`
    fragment FragmentedBasicPublicBadge on PublicBadge {
  publicId
  title
  description
  type
  imageURL
  createdAt
}
    `;
export const FragmentedPublicUserFragmentDoc = gql`
    fragment FragmentedPublicUser on PublicUser {
  ...FragmentedBasicPublicUser
  userInfo {
    ...FragmentedBasicPublicUserInfo
  }
  badges {
    ...FragmentedBasicPublicBadge
  }
  themes {
    ...FragmentedBasicPublicTheme
  }
}
    ${FragmentedBasicPublicUserFragmentDoc}
${FragmentedBasicPublicUserInfoFragmentDoc}
${FragmentedBasicPublicBadgeFragmentDoc}
${FragmentedBasicPublicThemeFragmentDoc}`;
export const SearchUsersDocument = gql`
    query SearchUsers($input: SearchUserInput!) {
  searchUsers(input: $input) {
    searchEdges {
      encodedSearchCursor
      node {
        ...FragmentedPublicUser
      }
    }
    searchPageInfo {
      hasNextPage
      hasPreviousPage
      startEncodedSearchCursor
      endEncodedSearchCursor
    }
    totalCount
    searchTime
  }
}
    ${FragmentedPublicUserFragmentDoc}`;

/**
 * __useSearchUsersQuery__
 *
 * To run a query within a React component, call `useSearchUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUsersQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchUsersQuery(baseOptions: Apollo.QueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables> & ({ variables: SearchUsersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, options);
      }
export function useSearchUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, options);
        }
export function useSearchUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchUsersQuery, SearchUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchUsersQuery, SearchUsersQueryVariables>(SearchUsersDocument, options);
        }
export type SearchUsersQueryHookResult = ReturnType<typeof useSearchUsersQuery>;
export type SearchUsersLazyQueryHookResult = ReturnType<typeof useSearchUsersLazyQuery>;
export type SearchUsersSuspenseQueryHookResult = ReturnType<typeof useSearchUsersSuspenseQuery>;
export type SearchUsersQueryResult = Apollo.QueryResult<SearchUsersQuery, SearchUsersQueryVariables>;
export const SearchThemesDocument = gql`
    query SearchThemes($input: SearchThemeInput!) {
  searchThemes(input: $input) {
    searchEdges {
      encodedSearchCursor
      node {
        ...FragmentedPublicTheme
      }
    }
    searchPageInfo {
      hasNextPage
      hasPreviousPage
      startEncodedSearchCursor
      endEncodedSearchCursor
    }
    totalCount
    searchTime
  }
}
    ${FragmentedPublicThemeFragmentDoc}`;

/**
 * __useSearchThemesQuery__
 *
 * To run a query within a React component, call `useSearchThemesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchThemesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchThemesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchThemesQuery(baseOptions: Apollo.QueryHookOptions<SearchThemesQuery, SearchThemesQueryVariables> & ({ variables: SearchThemesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchThemesQuery, SearchThemesQueryVariables>(SearchThemesDocument, options);
      }
export function useSearchThemesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchThemesQuery, SearchThemesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchThemesQuery, SearchThemesQueryVariables>(SearchThemesDocument, options);
        }
export function useSearchThemesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchThemesQuery, SearchThemesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchThemesQuery, SearchThemesQueryVariables>(SearchThemesDocument, options);
        }
export type SearchThemesQueryHookResult = ReturnType<typeof useSearchThemesQuery>;
export type SearchThemesLazyQueryHookResult = ReturnType<typeof useSearchThemesLazyQuery>;
export type SearchThemesSuspenseQueryHookResult = ReturnType<typeof useSearchThemesSuspenseQuery>;
export type SearchThemesQueryResult = Apollo.QueryResult<SearchThemesQuery, SearchThemesQueryVariables>;
export const SearchShelvesDocument = gql`
    query SearchShelves($input: SearchShelfInput!) {
  searchShelves(input: $input) {
    searchEdges {
      node {
        ...FragmentedPrivateShelf
      }
      encodedSearchCursor
    }
    searchPageInfo {
      hasNextPage
      hasPreviousPage
      startEncodedSearchCursor
      endEncodedSearchCursor
    }
    totalCount
    searchTime
  }
}
    ${FragmentedPrivateShelfFragmentDoc}`;

/**
 * __useSearchShelvesQuery__
 *
 * To run a query within a React component, call `useSearchShelvesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchShelvesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchShelvesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchShelvesQuery(baseOptions: Apollo.QueryHookOptions<SearchShelvesQuery, SearchShelvesQueryVariables> & ({ variables: SearchShelvesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchShelvesQuery, SearchShelvesQueryVariables>(SearchShelvesDocument, options);
      }
export function useSearchShelvesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchShelvesQuery, SearchShelvesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchShelvesQuery, SearchShelvesQueryVariables>(SearchShelvesDocument, options);
        }
export function useSearchShelvesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchShelvesQuery, SearchShelvesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchShelvesQuery, SearchShelvesQueryVariables>(SearchShelvesDocument, options);
        }
export type SearchShelvesQueryHookResult = ReturnType<typeof useSearchShelvesQuery>;
export type SearchShelvesLazyQueryHookResult = ReturnType<typeof useSearchShelvesLazyQuery>;
export type SearchShelvesSuspenseQueryHookResult = ReturnType<typeof useSearchShelvesSuspenseQuery>;
export type SearchShelvesQueryResult = Apollo.QueryResult<SearchShelvesQuery, SearchShelvesQueryVariables>;