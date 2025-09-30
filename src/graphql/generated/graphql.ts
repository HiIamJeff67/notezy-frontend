/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
import { UUID } from "crypto";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Base64Bytes: { input: string; output: string };
  Int32: { input: number; output: number };
  Int64: { input: number; output: number };
  Time: { input: Date; output: Date };
  UUID: { input: UUID; output: UUID };
};

export enum AccessControlPermission {
  Admin = "Admin",
  Read = "Read",
  Write = "Write",
}

export enum BadgeType {
  Bronze = "Bronze",
  Diamond = "Diamond",
  Golden = "Golden",
  Silver = "Silver",
  Steel = "Steel",
}

export enum Country {
  Australia = "Australia",
  Canada = "Canada",
  China = "China",
  Japan = "Japan",
  Malaysia = "Malaysia",
  Singapore = "Singapore",
  Taiwan = "Taiwan",
  UnitedKingdom = "UnitedKingdom",
  UnitedStatesOfAmerica = "UnitedStatesOfAmerica",
}

export enum CountryCode {
  CountryCode_1 = "COUNTRY_CODE_1",
  CountryCode_44 = "COUNTRY_CODE_44",
  CountryCode_60 = "COUNTRY_CODE_60",
  CountryCode_61 = "COUNTRY_CODE_61",
  CountryCode_65 = "COUNTRY_CODE_65",
  CountryCode_81 = "COUNTRY_CODE_81",
  CountryCode_86 = "COUNTRY_CODE_86",
  CountryCode_886 = "COUNTRY_CODE_886",
}

export enum Language {
  English = "English",
  Japanese = "Japanese",
  Korean = "Korean",
  SimpleChinese = "SimpleChinese",
  TraditionalChinese = "TraditionalChinese",
}

export enum MaterialContentType {
  ImageGif = "Image_GIF",
  ImageJpeg = "Image_JPEG",
  ImageJpg = "Image_JPG",
  ImagePng = "Image_PNG",
  ImageSvg = "Image_SVG",
  TextHtml = "Text_HTML",
  TextMarkdown = "Text_Markdown",
  TextPlain = "Text_Plain",
  VideoMp4 = "VIDEO_MP4",
  VideoMp3 = "Video_MP3",
}

export enum MaterialType {
  LearningCards = "LearningCards",
  Notebook = "Notebook",
  Textbook = "Textbook",
  Workflow = "Workflow",
}

export type PrivateMaterial = {
  __typename?: "PrivateMaterial";
  contentKey: Scalars["String"]["output"];
  contentType: MaterialContentType;
  createdAt: Scalars["Time"]["output"];
  deletedAt?: Maybe<Scalars["Time"]["output"]>;
  id: Scalars["UUID"]["output"];
  name: Scalars["String"]["output"];
  parentSubShelf: PrivateSubShelf;
  parentSubShelfId: Scalars["UUID"]["output"];
  parseMediaType: Scalars["String"]["output"];
  size: Scalars["Int64"]["output"];
  type: MaterialType;
  updatedAt: Scalars["Time"]["output"];
};

export type PrivateRootShelf = {
  __typename?: "PrivateRootShelf";
  createdAt: Scalars["Time"]["output"];
  deletedAt?: Maybe<Scalars["Time"]["output"]>;
  id: Scalars["UUID"]["output"];
  lastAnalyzedAt: Scalars["Time"]["output"];
  name: Scalars["String"]["output"];
  owner: Array<PublicUser>;
  totalMaterials: Scalars["Int32"]["output"];
  totalShelfNodes: Scalars["Int32"]["output"];
  updatedAt: Scalars["Time"]["output"];
};

export type PrivateSubShelf = {
  __typename?: "PrivateSubShelf";
  createdAt: Scalars["Time"]["output"];
  deletedAt?: Maybe<Scalars["Time"]["output"]>;
  id: Scalars["UUID"]["output"];
  materials: Array<PrivateMaterial>;
  name: Scalars["String"]["output"];
  nextSubShelves: Array<PrivateSubShelf>;
  path: Array<Scalars["UUID"]["output"]>;
  prevSubShelfId?: Maybe<Scalars["UUID"]["output"]>;
  rootShelf: PrivateRootShelf;
  rootShelfId: Scalars["UUID"]["output"];
  updatedAt: Scalars["Time"]["output"];
};

export type PublicBadge = {
  __typename?: "PublicBadge";
  createdAt: Scalars["Time"]["output"];
  description: Scalars["String"]["output"];
  imageURL?: Maybe<Scalars["String"]["output"]>;
  publicId: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  type: BadgeType;
  users: Array<PublicUser>;
};

export type PublicTheme = {
  __typename?: "PublicTheme";
  author: PublicUser;
  createdAt: Scalars["Time"]["output"];
  downloadCount: Scalars["Int64"]["output"];
  downloadURL?: Maybe<Scalars["String"]["output"]>;
  isDark: Scalars["Boolean"]["output"];
  isDefault: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  publicId: Scalars["String"]["output"];
  updatedAt: Scalars["Time"]["output"];
  version: Scalars["String"]["output"];
};

export type PublicUser = {
  __typename?: "PublicUser";
  badges: Array<PublicBadge>;
  createdAt: Scalars["Time"]["output"];
  displayName: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  plan: UserPlan;
  publicId: Scalars["String"]["output"];
  role: UserRole;
  status: UserStatus;
  themes: Array<PublicTheme>;
  userInfo: PublicUserInfo;
};

export type PublicUserInfo = {
  __typename?: "PublicUserInfo";
  avatarURL?: Maybe<Scalars["String"]["output"]>;
  birthDate: Scalars["Time"]["output"];
  country?: Maybe<Country>;
  coverBackgroundURL?: Maybe<Scalars["String"]["output"]>;
  gender: UserGender;
  header?: Maybe<Scalars["String"]["output"]>;
  introduction?: Maybe<Scalars["String"]["output"]>;
};

export type Query = {
  __typename?: "Query";
  searchRootShelves: SearchRootShelfConnection;
  searchThemes: SearchThemeConnection;
  searchUsers: SearchUserConnection;
};

export type QuerySearchRootShelvesArgs = {
  input: SearchRootShelfInput;
};

export type QuerySearchThemesArgs = {
  input: SearchThemeInput;
};

export type QuerySearchUsersArgs = {
  input: SearchUserInput;
};

export type SearchBadgeConnection = SearchConnection & {
  __typename?: "SearchBadgeConnection";
  searchEdges: Array<SearchBadgeEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars["Float"]["output"];
  totalCount: Scalars["Int"]["output"];
};

export type SearchBadgeCursorFields = {
  publicId: Scalars["String"]["input"];
};

export type SearchBadgeEdge = SearchEdge & {
  __typename?: "SearchBadgeEdge";
  encodedSearchCursor: Scalars["String"]["output"];
  node: PublicBadge;
};

export type SearchBadgeFilters = {
  type?: InputMaybe<BadgeType>;
};

export type SearchBadgeInput = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  filters?: InputMaybe<SearchBadgeFilters>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  query: Scalars["String"]["input"];
  sortBy?: InputMaybe<SearchBadgeSortBy>;
  sortOrderr?: InputMaybe<SearchSortOrder>;
};

export enum SearchBadgeSortBy {
  CreatedAt = "CREATED_AT",
  Relevance = "RELEVANCE",
  Title = "TITLE",
}

export type SearchConnection = {
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars["Float"]["output"];
  totalCount: Scalars["Int"]["output"];
};

export type SearchEdge = {
  encodedSearchCursor: Scalars["String"]["output"];
};

export type SearchPageInfo = {
  __typename?: "SearchPageInfo";
  endEncodedSearchCursor?: Maybe<Scalars["String"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  startEncodedSearchCursor?: Maybe<Scalars["String"]["output"]>;
};

export type SearchRootShelfConnection = SearchConnection & {
  __typename?: "SearchRootShelfConnection";
  searchEdges: Array<SearchRootShelfEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars["Float"]["output"];
  totalCount: Scalars["Int"]["output"];
};

export type SearchRootShelfCursorFields = {
  id: Scalars["UUID"]["input"];
};

export type SearchRootShelfEdge = SearchEdge & {
  __typename?: "SearchRootShelfEdge";
  encodedSearchCursor: Scalars["String"]["output"];
  node: PrivateRootShelf;
};

export type SearchRootShelfInput = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  query: Scalars["String"]["input"];
  sortBy?: InputMaybe<SearchRootShelfSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchRootShelfSortBy {
  CreatedAt = "CREATED_AT",
  LastUpdate = "LAST_UPDATE",
  Name = "NAME",
  Relevance = "RELEVANCE",
}

export enum SearchSortOrder {
  Asc = "ASC",
  Desc = "DESC",
}

export type SearchThemeConnection = SearchConnection & {
  __typename?: "SearchThemeConnection";
  searchEdges: Array<SearchThemeEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars["Float"]["output"];
  totalCount: Scalars["Int"]["output"];
};

export type SearchThemeCursorFields = {
  publicId: Scalars["String"]["input"];
};

export type SearchThemeEdge = SearchEdge & {
  __typename?: "SearchThemeEdge";
  encodedSearchCursor: Scalars["String"]["output"];
  node: PublicTheme;
};

export type SearchThemeFilters = {
  downloadCountGreaterThan?: InputMaybe<Scalars["Int"]["input"]>;
  isDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type SearchThemeInput = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  filters?: InputMaybe<SearchThemeFilters>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  query: Scalars["String"]["input"];
  sortBy?: InputMaybe<SearchThemeSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchThemeSortBy {
  CreatedAt = "CREATED_AT",
  LastUpdate = "LAST_UPDATE",
  Name = "NAME",
  Relevance = "RELEVANCE",
}

export type SearchUserConnection = SearchConnection & {
  __typename?: "SearchUserConnection";
  searchEdges: Array<SearchUserEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars["Float"]["output"];
  totalCount: Scalars["Int"]["output"];
};

export type SearchUserCursorFields = {
  publicId: Scalars["String"]["input"];
};

export type SearchUserEdge = SearchEdge & {
  __typename?: "SearchUserEdge";
  encodedSearchCursor: Scalars["String"]["output"];
  node: PublicUser;
};

export type SearchUserFilters = {
  country?: InputMaybe<Country>;
  hasAvatar?: InputMaybe<Scalars["Boolean"]["input"]>;
  isOnline?: InputMaybe<Scalars["Boolean"]["input"]>;
  plan?: InputMaybe<UserPlan>;
  role?: InputMaybe<UserRole>;
  status?: InputMaybe<UserStatus>;
};

export type SearchUserInput = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  filters?: InputMaybe<SearchUserFilters>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  query: Scalars["String"]["input"];
  sortBy?: InputMaybe<SearchUserSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchUserSortBy {
  CreatedAt = "CREATED_AT",
  LastActive = "LAST_ACTIVE",
  Name = "NAME",
  Relevance = "RELEVANCE",
}

export enum UserGender {
  Female = "Female",
  Male = "Male",
  PreferNotToSay = "PreferNotToSay",
}

export enum UserPlan {
  Enterprise = "Enterprise",
  Free = "Free",
  Pro = "Pro",
  Ultimate = "Ultimate",
}

export enum UserRole {
  Admin = "Admin",
  Guest = "Guest",
  Normal = "Normal",
}

export enum UserStatus {
  Afk = "AFK",
  DoNotDisturb = "DoNotDisturb",
  Offline = "Offline",
  Online = "Online",
}

export type FragmentedBasicPublicBadgeFragment = {
  __typename?: "PublicBadge";
  publicId: string;
  title: string;
  description: string;
  type: BadgeType;
  imageURL?: string | null;
  createdAt: Date;
} & { " $fragmentName"?: "FragmentedBasicPublicBadgeFragment" };

export type FragmentedBasicPrivateMaterialFragment = {
  __typename?: "PrivateMaterial";
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  type: MaterialType;
  size: number;
  contentKey: string;
  parseMediaType: string;
  deletedAt?: Date | null;
  updatedAt: Date;
  createdAt: Date;
} & { " $fragmentName"?: "FragmentedBasicPrivateMaterialFragment" };

export type FragmentedPrivateMaterialFragment = ({
  __typename?: "PrivateMaterial";
  parentSubShelf: { __typename?: "PrivateSubShelf" } & {
    " $fragmentRefs"?: {
      FragmentedBasicPrivateSubShelfFragment: FragmentedBasicPrivateSubShelfFragment;
    };
  };
} & {
  " $fragmentRefs"?: {
    FragmentedBasicPrivateMaterialFragment: FragmentedBasicPrivateMaterialFragment;
  };
}) & { " $fragmentName"?: "FragmentedPrivateMaterialFragment" };

export type FragmentedBasicPrivateRootShelfFragment = {
  __typename?: "PrivateRootShelf";
  id: UUID;
  name: string;
  totalShelfNodes: number;
  totalMaterials: number;
  lastAnalyzedAt: Date;
  deletedAt?: Date | null;
  updatedAt: Date;
  createdAt: Date;
} & { " $fragmentName"?: "FragmentedBasicPrivateRootShelfFragment" };

export type FragmentedPrivateRootShelfFragment = ({
  __typename?: "PrivateRootShelf";
  owner: Array<
    { __typename?: "PublicUser" } & {
      " $fragmentRefs"?: {
        FragmentedBasicPublicUserFragment: FragmentedBasicPublicUserFragment;
      };
    }
  >;
} & {
  " $fragmentRefs"?: {
    FragmentedBasicPrivateRootShelfFragment: FragmentedBasicPrivateRootShelfFragment;
  };
}) & { " $fragmentName"?: "FragmentedPrivateRootShelfFragment" };

export type FragmentedBasicPrivateSubShelfFragment = {
  __typename?: "PrivateSubShelf";
  id: UUID;
  name: string;
  rootShelfId: UUID;
  prevSubShelfId?: UUID | null;
  path: Array<UUID>;
  deletedAt?: Date | null;
  updatedAt: Date;
  createdAt: Date;
} & { " $fragmentName"?: "FragmentedBasicPrivateSubShelfFragment" };

export type FragmentedPrivateSubShelfFragment = ({
  __typename?: "PrivateSubShelf";
  rootShelf: { __typename?: "PrivateRootShelf" } & {
    " $fragmentRefs"?: {
      FragmentedBasicPrivateRootShelfFragment: FragmentedBasicPrivateRootShelfFragment;
    };
  };
  nextSubShelves: Array<
    { __typename?: "PrivateSubShelf" } & {
      " $fragmentRefs"?: {
        FragmentedBasicPrivateSubShelfFragment: FragmentedBasicPrivateSubShelfFragment;
      };
    }
  >;
  materials: Array<
    { __typename?: "PrivateMaterial" } & {
      " $fragmentRefs"?: {
        FragmentedBasicPrivateMaterialFragment: FragmentedBasicPrivateMaterialFragment;
      };
    }
  >;
} & {
  " $fragmentRefs"?: {
    FragmentedBasicPrivateSubShelfFragment: FragmentedBasicPrivateSubShelfFragment;
  };
}) & { " $fragmentName"?: "FragmentedPrivateSubShelfFragment" };

export type FragmentedBasicPublicThemeFragment = {
  __typename?: "PublicTheme";
  publicId: string;
  name: string;
  isDark: boolean;
  version: string;
  isDefault: boolean;
  downloadURL?: string | null;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
} & { " $fragmentName"?: "FragmentedBasicPublicThemeFragment" };

export type FragmentedPublicThemeFragment = ({
  __typename?: "PublicTheme";
  author: { __typename?: "PublicUser" } & {
    " $fragmentRefs"?: {
      FragmentedBasicPublicUserFragment: FragmentedBasicPublicUserFragment;
    };
  };
} & {
  " $fragmentRefs"?: {
    FragmentedBasicPublicThemeFragment: FragmentedBasicPublicThemeFragment;
  };
}) & { " $fragmentName"?: "FragmentedPublicThemeFragment" };

export type FragmentedBasicPublicUserFragment = {
  __typename?: "PublicUser";
  publicId: string;
  name: string;
  displayName: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  createdAt: Date;
} & { " $fragmentName"?: "FragmentedBasicPublicUserFragment" };

export type FragmentedPublicUserFragment = ({
  __typename?: "PublicUser";
  userInfo: { __typename?: "PublicUserInfo" } & {
    " $fragmentRefs"?: {
      FragmentedBasicPublicUserInfoFragment: FragmentedBasicPublicUserInfoFragment;
    };
  };
  badges: Array<
    { __typename?: "PublicBadge" } & {
      " $fragmentRefs"?: {
        FragmentedBasicPublicBadgeFragment: FragmentedBasicPublicBadgeFragment;
      };
    }
  >;
  themes: Array<
    { __typename?: "PublicTheme" } & {
      " $fragmentRefs"?: {
        FragmentedBasicPublicThemeFragment: FragmentedBasicPublicThemeFragment;
      };
    }
  >;
} & {
  " $fragmentRefs"?: {
    FragmentedBasicPublicUserFragment: FragmentedBasicPublicUserFragment;
  };
}) & { " $fragmentName"?: "FragmentedPublicUserFragment" };

export type FragmentedBasicPublicUserInfoFragment = {
  __typename?: "PublicUserInfo";
  avatarURL?: string | null;
  coverBackgroundURL?: string | null;
  header?: string | null;
  introduction?: string | null;
  gender: UserGender;
  country?: Country | null;
  birthDate: Date;
} & { " $fragmentName"?: "FragmentedBasicPublicUserInfoFragment" };

export type SearchUsersQueryVariables = Exact<{
  input: SearchUserInput;
}>;

export type SearchUsersQuery = {
  __typename?: "Query";
  searchUsers: {
    __typename?: "SearchUserConnection";
    totalCount: number;
    searchTime: number;
    searchEdges: Array<{
      __typename?: "SearchUserEdge";
      encodedSearchCursor: string;
      node: { __typename?: "PublicUser" } & {
        " $fragmentRefs"?: {
          FragmentedPublicUserFragment: FragmentedPublicUserFragment;
        };
      };
    }>;
    searchPageInfo: {
      __typename?: "SearchPageInfo";
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startEncodedSearchCursor?: string | null;
      endEncodedSearchCursor?: string | null;
    };
  };
};

export type SearchThemesQueryVariables = Exact<{
  input: SearchThemeInput;
}>;

export type SearchThemesQuery = {
  __typename?: "Query";
  searchThemes: {
    __typename?: "SearchThemeConnection";
    totalCount: number;
    searchTime: number;
    searchEdges: Array<{
      __typename?: "SearchThemeEdge";
      encodedSearchCursor: string;
      node: { __typename?: "PublicTheme" } & {
        " $fragmentRefs"?: {
          FragmentedPublicThemeFragment: FragmentedPublicThemeFragment;
        };
      };
    }>;
    searchPageInfo: {
      __typename?: "SearchPageInfo";
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startEncodedSearchCursor?: string | null;
      endEncodedSearchCursor?: string | null;
    };
  };
};

export type SearchRootShelvesQueryVariables = Exact<{
  input: SearchRootShelfInput;
}>;

export type SearchRootShelvesQuery = {
  __typename?: "Query";
  searchRootShelves: {
    __typename?: "SearchRootShelfConnection";
    totalCount: number;
    searchTime: number;
    searchEdges: Array<{
      __typename?: "SearchRootShelfEdge";
      encodedSearchCursor: string;
      node: { __typename?: "PrivateRootShelf" } & {
        " $fragmentRefs"?: {
          FragmentedPrivateRootShelfFragment: FragmentedPrivateRootShelfFragment;
        };
      };
    }>;
    searchPageInfo: {
      __typename?: "SearchPageInfo";
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startEncodedSearchCursor?: string | null;
      endEncodedSearchCursor?: string | null;
    };
  };
};

export const FragmentedBasicPrivateMaterialFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateMaterial" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateMaterial" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "parentSubShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "contentKey" } },
          { kind: "Field", name: { kind: "Name", value: "parseMediaType" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedBasicPrivateMaterialFragment, unknown>;
export const FragmentedBasicPrivateSubShelfFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateSubShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateSubShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "rootShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "prevSubShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "path" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedBasicPrivateSubShelfFragment, unknown>;
export const FragmentedPrivateMaterialFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPrivateMaterial" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateMaterial" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPrivateMaterial" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parentSubShelf" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "FragmentedBasicPrivateSubShelf",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateMaterial" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateMaterial" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "parentSubShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "contentKey" } },
          { kind: "Field", name: { kind: "Name", value: "parseMediaType" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateSubShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateSubShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "rootShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "prevSubShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "path" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedPrivateMaterialFragment, unknown>;
export const FragmentedBasicPrivateRootShelfFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateRootShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateRootShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "totalShelfNodes" } },
          { kind: "Field", name: { kind: "Name", value: "totalMaterials" } },
          { kind: "Field", name: { kind: "Name", value: "lastAnalyzedAt" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedBasicPrivateRootShelfFragment, unknown>;
export const FragmentedBasicPublicUserFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "plan" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedBasicPublicUserFragment, unknown>;
export const FragmentedPrivateRootShelfFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPrivateRootShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateRootShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPrivateRootShelf" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "owner" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicUser" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateRootShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateRootShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "totalShelfNodes" } },
          { kind: "Field", name: { kind: "Name", value: "totalMaterials" } },
          { kind: "Field", name: { kind: "Name", value: "lastAnalyzedAt" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "plan" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedPrivateRootShelfFragment, unknown>;
export const FragmentedPrivateSubShelfFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPrivateSubShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateSubShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPrivateSubShelf" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "rootShelf" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "FragmentedBasicPrivateRootShelf",
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "nextSubShelves" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "FragmentedBasicPrivateSubShelf",
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "materials" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "FragmentedBasicPrivateMaterial",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateSubShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateSubShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "rootShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "prevSubShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "path" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateRootShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateRootShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "totalShelfNodes" } },
          { kind: "Field", name: { kind: "Name", value: "totalMaterials" } },
          { kind: "Field", name: { kind: "Name", value: "lastAnalyzedAt" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateMaterial" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateMaterial" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "parentSubShelfId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "contentKey" } },
          { kind: "Field", name: { kind: "Name", value: "parseMediaType" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedPrivateSubShelfFragment, unknown>;
export const FragmentedBasicPublicThemeFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicTheme" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "isDark" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "downloadURL" } },
          { kind: "Field", name: { kind: "Name", value: "downloadCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedBasicPublicThemeFragment, unknown>;
export const FragmentedPublicThemeFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPublicTheme" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicTheme" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicUser" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicTheme" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "isDark" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "downloadURL" } },
          { kind: "Field", name: { kind: "Name", value: "downloadCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "plan" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedPublicThemeFragment, unknown>;
export const FragmentedBasicPublicUserInfoFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUserInfo" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUserInfo" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "avatarURL" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "coverBackgroundURL" },
          },
          { kind: "Field", name: { kind: "Name", value: "header" } },
          { kind: "Field", name: { kind: "Name", value: "introduction" } },
          { kind: "Field", name: { kind: "Name", value: "gender" } },
          { kind: "Field", name: { kind: "Name", value: "country" } },
          { kind: "Field", name: { kind: "Name", value: "birthDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedBasicPublicUserInfoFragment, unknown>;
export const FragmentedBasicPublicBadgeFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicBadge" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicBadge" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "imageURL" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedBasicPublicBadgeFragment, unknown>;
export const FragmentedPublicUserFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPublicUser" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "userInfo" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "FragmentedBasicPublicUserInfo",
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "badges" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicBadge" },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "themes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "plan" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUserInfo" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUserInfo" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "avatarURL" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "coverBackgroundURL" },
          },
          { kind: "Field", name: { kind: "Name", value: "header" } },
          { kind: "Field", name: { kind: "Name", value: "introduction" } },
          { kind: "Field", name: { kind: "Name", value: "gender" } },
          { kind: "Field", name: { kind: "Name", value: "country" } },
          { kind: "Field", name: { kind: "Name", value: "birthDate" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicBadge" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicBadge" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "imageURL" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicTheme" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "isDark" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "downloadURL" } },
          { kind: "Field", name: { kind: "Name", value: "downloadCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FragmentedPublicUserFragment, unknown>;
export const SearchUsersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchUsers" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SearchUserInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "searchUsers" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "searchEdges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "encodedSearchCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: {
                                kind: "Name",
                                value: "FragmentedPublicUser",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "searchPageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "startEncodedSearchCursor",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endEncodedSearchCursor" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                { kind: "Field", name: { kind: "Name", value: "searchTime" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "plan" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUserInfo" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUserInfo" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "avatarURL" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "coverBackgroundURL" },
          },
          { kind: "Field", name: { kind: "Name", value: "header" } },
          { kind: "Field", name: { kind: "Name", value: "introduction" } },
          { kind: "Field", name: { kind: "Name", value: "gender" } },
          { kind: "Field", name: { kind: "Name", value: "country" } },
          { kind: "Field", name: { kind: "Name", value: "birthDate" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicBadge" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicBadge" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "imageURL" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicTheme" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "isDark" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "downloadURL" } },
          { kind: "Field", name: { kind: "Name", value: "downloadCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPublicUser" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "userInfo" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "FragmentedBasicPublicUserInfo",
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "badges" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicBadge" },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "themes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchUsersQuery, SearchUsersQueryVariables>;
export const SearchThemesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchThemes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SearchThemeInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "searchThemes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "searchEdges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "encodedSearchCursor" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: {
                                kind: "Name",
                                value: "FragmentedPublicTheme",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "searchPageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "startEncodedSearchCursor",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endEncodedSearchCursor" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                { kind: "Field", name: { kind: "Name", value: "searchTime" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicTheme" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "isDark" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "downloadURL" } },
          { kind: "Field", name: { kind: "Name", value: "downloadCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "plan" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPublicTheme" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicTheme" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPublicTheme" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicUser" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchThemesQuery, SearchThemesQueryVariables>;
export const SearchRootShelvesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchRootShelves" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SearchRootShelfInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "searchRootShelves" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "searchEdges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: {
                                kind: "Name",
                                value: "FragmentedPrivateRootShelf",
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "encodedSearchCursor" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "searchPageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasNextPage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hasPreviousPage" },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "startEncodedSearchCursor",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endEncodedSearchCursor" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                { kind: "Field", name: { kind: "Name", value: "searchTime" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPrivateRootShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateRootShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "totalShelfNodes" } },
          { kind: "Field", name: { kind: "Name", value: "totalMaterials" } },
          { kind: "Field", name: { kind: "Name", value: "lastAnalyzedAt" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedBasicPublicUser" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PublicUser" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "publicId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "plan" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FragmentedPrivateRootShelf" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "PrivateRootShelf" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "FragmentSpread",
            name: { kind: "Name", value: "FragmentedBasicPrivateRootShelf" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "owner" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FragmentedBasicPublicUser" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchRootShelvesQuery,
  SearchRootShelvesQueryVariables
>;
