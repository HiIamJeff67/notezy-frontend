/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment FragmentedBasicPublicBadge on PublicBadge {\n  publicId\n  title\n  description\n  type\n  imageURL\n  createdAt\n}": typeof types.FragmentedBasicPublicBadgeFragmentDoc,
    "fragment FragmentedBasicPrivateMaterial on PrivateMaterial {\n  id\n  parentSubShelfId\n  name\n  type\n  size\n  contentKey\n  parseMediaType\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateMaterial on PrivateMaterial {\n  ...FragmentedBasicPrivateMaterial\n  parentSubShelf {\n    ...FragmentedBasicPrivateSubShelf\n  }\n}": typeof types.FragmentedBasicPrivateMaterialFragmentDoc,
    "fragment FragmentedBasicPrivateRootShelf on PrivateRootShelf {\n  id\n  name\n  totalShelfNodes\n  totalMaterials\n  lastAnalyzedAt\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateRootShelf on PrivateRootShelf {\n  ...FragmentedBasicPrivateRootShelf\n  owner {\n    ...FragmentedBasicPublicUser\n  }\n}": typeof types.FragmentedBasicPrivateRootShelfFragmentDoc,
    "fragment FragmentedBasicPrivateSubShelf on PrivateSubShelf {\n  id\n  name\n  rootShelfId\n  prevSubShelfId\n  path\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateSubShelf on PrivateSubShelf {\n  ...FragmentedBasicPrivateSubShelf\n  rootShelf {\n    ...FragmentedBasicPrivateRootShelf\n  }\n  nextSubShelves {\n    ...FragmentedBasicPrivateSubShelf\n  }\n  materials {\n    ...FragmentedBasicPrivateMaterial\n  }\n}": typeof types.FragmentedBasicPrivateSubShelfFragmentDoc,
    "fragment FragmentedBasicPublicTheme on PublicTheme {\n  publicId\n  name\n  isDark\n  version\n  isDefault\n  downloadURL\n  downloadCount\n  createdAt\n  updatedAt\n}\n\nfragment FragmentedPublicTheme on PublicTheme {\n  ...FragmentedBasicPublicTheme\n  author {\n    ...FragmentedBasicPublicUser\n  }\n}": typeof types.FragmentedBasicPublicThemeFragmentDoc,
    "fragment FragmentedBasicPublicUser on PublicUser {\n  publicId\n  name\n  displayName\n  role\n  plan\n  status\n  createdAt\n}\n\nfragment FragmentedPublicUser on PublicUser {\n  ...FragmentedBasicPublicUser\n  userInfo {\n    ...FragmentedBasicPublicUserInfo\n  }\n  badges {\n    ...FragmentedBasicPublicBadge\n  }\n  themes {\n    ...FragmentedBasicPublicTheme\n  }\n}": typeof types.FragmentedBasicPublicUserFragmentDoc,
    "fragment FragmentedBasicPublicUserInfo on PublicUserInfo {\n  avatarURL\n  coverBackgroundURL\n  header\n  introduction\n  gender\n  country\n  birthDate\n}": typeof types.FragmentedBasicPublicUserInfoFragmentDoc,
    "query SearchUsers($input: SearchUserInput!) {\n  searchUsers(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicUser\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchThemes($input: SearchThemeInput!) {\n  searchThemes(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicTheme\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchRootShelves($input: SearchRootShelfInput!) {\n  searchRootShelves(input: $input) {\n    searchEdges {\n      node {\n        ...FragmentedPrivateRootShelf\n      }\n      encodedSearchCursor\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}": typeof types.SearchUsersDocument,
};
const documents: Documents = {
    "fragment FragmentedBasicPublicBadge on PublicBadge {\n  publicId\n  title\n  description\n  type\n  imageURL\n  createdAt\n}": types.FragmentedBasicPublicBadgeFragmentDoc,
    "fragment FragmentedBasicPrivateMaterial on PrivateMaterial {\n  id\n  parentSubShelfId\n  name\n  type\n  size\n  contentKey\n  parseMediaType\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateMaterial on PrivateMaterial {\n  ...FragmentedBasicPrivateMaterial\n  parentSubShelf {\n    ...FragmentedBasicPrivateSubShelf\n  }\n}": types.FragmentedBasicPrivateMaterialFragmentDoc,
    "fragment FragmentedBasicPrivateRootShelf on PrivateRootShelf {\n  id\n  name\n  totalShelfNodes\n  totalMaterials\n  lastAnalyzedAt\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateRootShelf on PrivateRootShelf {\n  ...FragmentedBasicPrivateRootShelf\n  owner {\n    ...FragmentedBasicPublicUser\n  }\n}": types.FragmentedBasicPrivateRootShelfFragmentDoc,
    "fragment FragmentedBasicPrivateSubShelf on PrivateSubShelf {\n  id\n  name\n  rootShelfId\n  prevSubShelfId\n  path\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateSubShelf on PrivateSubShelf {\n  ...FragmentedBasicPrivateSubShelf\n  rootShelf {\n    ...FragmentedBasicPrivateRootShelf\n  }\n  nextSubShelves {\n    ...FragmentedBasicPrivateSubShelf\n  }\n  materials {\n    ...FragmentedBasicPrivateMaterial\n  }\n}": types.FragmentedBasicPrivateSubShelfFragmentDoc,
    "fragment FragmentedBasicPublicTheme on PublicTheme {\n  publicId\n  name\n  isDark\n  version\n  isDefault\n  downloadURL\n  downloadCount\n  createdAt\n  updatedAt\n}\n\nfragment FragmentedPublicTheme on PublicTheme {\n  ...FragmentedBasicPublicTheme\n  author {\n    ...FragmentedBasicPublicUser\n  }\n}": types.FragmentedBasicPublicThemeFragmentDoc,
    "fragment FragmentedBasicPublicUser on PublicUser {\n  publicId\n  name\n  displayName\n  role\n  plan\n  status\n  createdAt\n}\n\nfragment FragmentedPublicUser on PublicUser {\n  ...FragmentedBasicPublicUser\n  userInfo {\n    ...FragmentedBasicPublicUserInfo\n  }\n  badges {\n    ...FragmentedBasicPublicBadge\n  }\n  themes {\n    ...FragmentedBasicPublicTheme\n  }\n}": types.FragmentedBasicPublicUserFragmentDoc,
    "fragment FragmentedBasicPublicUserInfo on PublicUserInfo {\n  avatarURL\n  coverBackgroundURL\n  header\n  introduction\n  gender\n  country\n  birthDate\n}": types.FragmentedBasicPublicUserInfoFragmentDoc,
    "query SearchUsers($input: SearchUserInput!) {\n  searchUsers(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicUser\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchThemes($input: SearchThemeInput!) {\n  searchThemes(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicTheme\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchRootShelves($input: SearchRootShelfInput!) {\n  searchRootShelves(input: $input) {\n    searchEdges {\n      node {\n        ...FragmentedPrivateRootShelf\n      }\n      encodedSearchCursor\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}": types.SearchUsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment FragmentedBasicPublicBadge on PublicBadge {\n  publicId\n  title\n  description\n  type\n  imageURL\n  createdAt\n}"): (typeof documents)["fragment FragmentedBasicPublicBadge on PublicBadge {\n  publicId\n  title\n  description\n  type\n  imageURL\n  createdAt\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment FragmentedBasicPrivateMaterial on PrivateMaterial {\n  id\n  parentSubShelfId\n  name\n  type\n  size\n  contentKey\n  parseMediaType\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateMaterial on PrivateMaterial {\n  ...FragmentedBasicPrivateMaterial\n  parentSubShelf {\n    ...FragmentedBasicPrivateSubShelf\n  }\n}"): (typeof documents)["fragment FragmentedBasicPrivateMaterial on PrivateMaterial {\n  id\n  parentSubShelfId\n  name\n  type\n  size\n  contentKey\n  parseMediaType\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateMaterial on PrivateMaterial {\n  ...FragmentedBasicPrivateMaterial\n  parentSubShelf {\n    ...FragmentedBasicPrivateSubShelf\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment FragmentedBasicPrivateRootShelf on PrivateRootShelf {\n  id\n  name\n  totalShelfNodes\n  totalMaterials\n  lastAnalyzedAt\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateRootShelf on PrivateRootShelf {\n  ...FragmentedBasicPrivateRootShelf\n  owner {\n    ...FragmentedBasicPublicUser\n  }\n}"): (typeof documents)["fragment FragmentedBasicPrivateRootShelf on PrivateRootShelf {\n  id\n  name\n  totalShelfNodes\n  totalMaterials\n  lastAnalyzedAt\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateRootShelf on PrivateRootShelf {\n  ...FragmentedBasicPrivateRootShelf\n  owner {\n    ...FragmentedBasicPublicUser\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment FragmentedBasicPrivateSubShelf on PrivateSubShelf {\n  id\n  name\n  rootShelfId\n  prevSubShelfId\n  path\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateSubShelf on PrivateSubShelf {\n  ...FragmentedBasicPrivateSubShelf\n  rootShelf {\n    ...FragmentedBasicPrivateRootShelf\n  }\n  nextSubShelves {\n    ...FragmentedBasicPrivateSubShelf\n  }\n  materials {\n    ...FragmentedBasicPrivateMaterial\n  }\n}"): (typeof documents)["fragment FragmentedBasicPrivateSubShelf on PrivateSubShelf {\n  id\n  name\n  rootShelfId\n  prevSubShelfId\n  path\n  deletedAt\n  updatedAt\n  createdAt\n}\n\nfragment FragmentedPrivateSubShelf on PrivateSubShelf {\n  ...FragmentedBasicPrivateSubShelf\n  rootShelf {\n    ...FragmentedBasicPrivateRootShelf\n  }\n  nextSubShelves {\n    ...FragmentedBasicPrivateSubShelf\n  }\n  materials {\n    ...FragmentedBasicPrivateMaterial\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment FragmentedBasicPublicTheme on PublicTheme {\n  publicId\n  name\n  isDark\n  version\n  isDefault\n  downloadURL\n  downloadCount\n  createdAt\n  updatedAt\n}\n\nfragment FragmentedPublicTheme on PublicTheme {\n  ...FragmentedBasicPublicTheme\n  author {\n    ...FragmentedBasicPublicUser\n  }\n}"): (typeof documents)["fragment FragmentedBasicPublicTheme on PublicTheme {\n  publicId\n  name\n  isDark\n  version\n  isDefault\n  downloadURL\n  downloadCount\n  createdAt\n  updatedAt\n}\n\nfragment FragmentedPublicTheme on PublicTheme {\n  ...FragmentedBasicPublicTheme\n  author {\n    ...FragmentedBasicPublicUser\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment FragmentedBasicPublicUser on PublicUser {\n  publicId\n  name\n  displayName\n  role\n  plan\n  status\n  createdAt\n}\n\nfragment FragmentedPublicUser on PublicUser {\n  ...FragmentedBasicPublicUser\n  userInfo {\n    ...FragmentedBasicPublicUserInfo\n  }\n  badges {\n    ...FragmentedBasicPublicBadge\n  }\n  themes {\n    ...FragmentedBasicPublicTheme\n  }\n}"): (typeof documents)["fragment FragmentedBasicPublicUser on PublicUser {\n  publicId\n  name\n  displayName\n  role\n  plan\n  status\n  createdAt\n}\n\nfragment FragmentedPublicUser on PublicUser {\n  ...FragmentedBasicPublicUser\n  userInfo {\n    ...FragmentedBasicPublicUserInfo\n  }\n  badges {\n    ...FragmentedBasicPublicBadge\n  }\n  themes {\n    ...FragmentedBasicPublicTheme\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment FragmentedBasicPublicUserInfo on PublicUserInfo {\n  avatarURL\n  coverBackgroundURL\n  header\n  introduction\n  gender\n  country\n  birthDate\n}"): (typeof documents)["fragment FragmentedBasicPublicUserInfo on PublicUserInfo {\n  avatarURL\n  coverBackgroundURL\n  header\n  introduction\n  gender\n  country\n  birthDate\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SearchUsers($input: SearchUserInput!) {\n  searchUsers(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicUser\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchThemes($input: SearchThemeInput!) {\n  searchThemes(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicTheme\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchRootShelves($input: SearchRootShelfInput!) {\n  searchRootShelves(input: $input) {\n    searchEdges {\n      node {\n        ...FragmentedPrivateRootShelf\n      }\n      encodedSearchCursor\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}"): (typeof documents)["query SearchUsers($input: SearchUserInput!) {\n  searchUsers(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicUser\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchThemes($input: SearchThemeInput!) {\n  searchThemes(input: $input) {\n    searchEdges {\n      encodedSearchCursor\n      node {\n        ...FragmentedPublicTheme\n      }\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}\n\nquery SearchRootShelves($input: SearchRootShelfInput!) {\n  searchRootShelves(input: $input) {\n    searchEdges {\n      node {\n        ...FragmentedPrivateRootShelf\n      }\n      encodedSearchCursor\n    }\n    searchPageInfo {\n      hasNextPage\n      hasPreviousPage\n      startEncodedSearchCursor\n      endEncodedSearchCursor\n    }\n    totalCount\n    searchTime\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;