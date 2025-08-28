export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export enum AccessControlPermission {
  Admin = 'Admin',
  Read = 'Read',
  Write = 'Write'
}

export enum BadgeType {
  Bronze = 'Bronze',
  Diamond = 'Diamond',
  Golden = 'Golden',
  Silver = 'Silver',
  Steel = 'Steel'
}

export enum Country {
  Australia = 'Australia',
  Canada = 'Canada',
  China = 'China',
  Japan = 'Japan',
  Malaysia = 'Malaysia',
  Singapore = 'Singapore',
  Taiwan = 'Taiwan',
  UnitedKingdom = 'UnitedKingdom',
  UnitedStatesOfAmerica = 'UnitedStatesOfAmerica'
}

export enum CountryCode {
  CountryCode_1 = 'COUNTRY_CODE_1',
  CountryCode_44 = 'COUNTRY_CODE_44',
  CountryCode_60 = 'COUNTRY_CODE_60',
  CountryCode_61 = 'COUNTRY_CODE_61',
  CountryCode_65 = 'COUNTRY_CODE_65',
  CountryCode_81 = 'COUNTRY_CODE_81',
  CountryCode_86 = 'COUNTRY_CODE_86',
  CountryCode_886 = 'COUNTRY_CODE_886'
}

export enum Language {
  English = 'English',
  Japanese = 'Japanese',
  Korean = 'Korean',
  SimpleChinese = 'SimpleChinese',
  TraditionalChinese = 'TraditionalChinese'
}

export enum MaterialContentType {
  ImageGif = 'Image_GIF',
  ImageJpeg = 'Image_JPEG',
  ImageJpg = 'Image_JPG',
  ImagePng = 'Image_PNG',
  ImageSvg = 'Image_SVG',
  TextHtml = 'Text_HTML',
  TextMarkdown = 'Text_Markdown',
  TextPlain = 'Text_Plain',
  VideoMp4 = 'VIDEO_MP4',
  VideoMp3 = 'Video_MP3'
}

export enum MaterialType {
  LearningCards = 'LearningCards',
  Notebook = 'Notebook',
  Textbook = 'Textbook',
  Workflow = 'Workflow'
}

export type PrivateShelf = {
  __typename?: 'PrivateShelf';
  createdAt: Scalars['Time']['output'];
  encodedStructure: Scalars['Base64Bytes']['output'];
  encodedStructureByteSize: Scalars['Int64']['output'];
  id: Scalars['UUID']['output'];
  lastAnalyzedAt: Scalars['Time']['output'];
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

export enum SearchBadgeSortBy {
  CreatedAt = 'CREATED_AT',
  Relevance = 'RELEVANCE',
  Title = 'TITLE'
}

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

export enum SearchShelfSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

export enum SearchSortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

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

export enum SearchThemeSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

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

export enum SearchUserSortBy {
  CreatedAt = 'CREATED_AT',
  LastActive = 'LAST_ACTIVE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

export enum UserGender {
  Female = 'Female',
  Male = 'Male',
  PreferNotToSay = 'PreferNotToSay'
}

export enum UserPlan {
  Enterprise = 'Enterprise',
  Free = 'Free',
  Pro = 'Pro',
  Ultimate = 'Ultimate'
}

export enum UserRole {
  Admin = 'Admin',
  Guest = 'Guest',
  Normal = 'Normal'
}

export enum UserStatus {
  Afk = 'AFK',
  DoNotDisturb = 'DoNotDisturb',
  Offline = 'Offline',
  Online = 'Online'
}

export type FragmentedBasicPublicBadgeFragment = { __typename?: 'PublicBadge', publicId: string, title: string, description: string, type: BadgeType, imageURL?: string | null | undefined, createdAt: string };

export type FragmentedBasicPrivateShelfFragment = { __typename?: 'PrivateShelf', id: string, name: string, encodedStructure: string, encodedStructureByteSize: number, totalShelfNodes: number, totalMaterials: number, maxWidth: number, maxDepth: number, lastAnalyzedAt: string, updatedAt: string, createdAt: string };

export type FragmentedPrivateShelfFragment = { __typename?: 'PrivateShelf', id: string, name: string, encodedStructure: string, encodedStructureByteSize: number, totalShelfNodes: number, totalMaterials: number, maxWidth: number, maxDepth: number, lastAnalyzedAt: string, updatedAt: string, createdAt: string, owner: Array<{ __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string }> };

export type FragmentedBasicPublicThemeFragment = { __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null | undefined, downloadCount: number, createdAt: string, updatedAt: string };

export type FragmentedPublicThemeFragment = { __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null | undefined, downloadCount: number, createdAt: string, updatedAt: string, author: { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string } };

export type FragmentedBasicPublicUserFragment = { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string };

export type FragmentedPublicUserFragment = { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string, userInfo: { __typename?: 'PublicUserInfo', avatarURL?: string | null | undefined, coverBackgroundURL?: string | null | undefined, header?: string | null | undefined, introduction?: string | null | undefined, gender: UserGender, country?: Country | null | undefined, birthDate: string }, badges: Array<{ __typename?: 'PublicBadge', publicId: string, title: string, description: string, type: BadgeType, imageURL?: string | null | undefined, createdAt: string }>, themes: Array<{ __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null | undefined, downloadCount: number, createdAt: string, updatedAt: string }> };

export type FragmentedBasicPublicUserInfoFragment = { __typename?: 'PublicUserInfo', avatarURL?: string | null | undefined, coverBackgroundURL?: string | null | undefined, header?: string | null | undefined, introduction?: string | null | undefined, gender: UserGender, country?: Country | null | undefined, birthDate: string };

export type SearchUsersQueryVariables = Exact<{
  input: SearchUserInput;
}>;


export type SearchUsersQuery = { __typename?: 'Query', searchUsers: { __typename?: 'SearchUserConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchUserEdge', encodedSearchCursor: string, node: { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string, userInfo: { __typename?: 'PublicUserInfo', avatarURL?: string | null | undefined, coverBackgroundURL?: string | null | undefined, header?: string | null | undefined, introduction?: string | null | undefined, gender: UserGender, country?: Country | null | undefined, birthDate: string }, badges: Array<{ __typename?: 'PublicBadge', publicId: string, title: string, description: string, type: BadgeType, imageURL?: string | null | undefined, createdAt: string }>, themes: Array<{ __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null | undefined, downloadCount: number, createdAt: string, updatedAt: string }> } }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null | undefined, endEncodedSearchCursor?: string | null | undefined } } };

export type SearchThemesQueryVariables = Exact<{
  input: SearchThemeInput;
}>;


export type SearchThemesQuery = { __typename?: 'Query', searchThemes: { __typename?: 'SearchThemeConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchThemeEdge', encodedSearchCursor: string, node: { __typename?: 'PublicTheme', publicId: string, name: string, isDark: boolean, version: string, isDefault: boolean, downloadURL?: string | null | undefined, downloadCount: number, createdAt: string, updatedAt: string, author: { __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string } } }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null | undefined, endEncodedSearchCursor?: string | null | undefined } } };

export type SearchShelvesQueryVariables = Exact<{
  input: SearchShelfInput;
}>;


export type SearchShelvesQuery = { __typename?: 'Query', searchShelves: { __typename?: 'SearchShelfConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchShelfEdge', encodedSearchCursor: string, node: { __typename?: 'PrivateShelf', id: string, name: string, encodedStructure: string, encodedStructureByteSize: number, totalShelfNodes: number, totalMaterials: number, maxWidth: number, maxDepth: number, lastAnalyzedAt: string, updatedAt: string, createdAt: string, owner: Array<{ __typename?: 'PublicUser', publicId: string, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: string }> } }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null | undefined, endEncodedSearchCursor?: string | null | undefined } } };
