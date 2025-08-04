/* 
  ### Note that we only list the Exception with `IsInternal = false` here 
*/

export const DatabaseExceptionReasons = {
  notFound: "NotFound",
  failedToCreate: "FailedToCreate",
  failedToUpdate: "FailedToUpdate",
  failedToDelete: "FailedToDelete",
};
export const APIExceptionReasons = {
  timeout: "Timeout",
};
export const GraphQLExceptionReasons = {};
export const TypeExceptionReasons = {
  invalidDto: "InvalidDto",
};
export const CommonExceptionReasons = {};

export const ExceptionReasonDictionary = {
  auth: {
    ...APIExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
    wrongPassword: "WrongPassword",
    wrongAuthCode: "WrongAuthCode",
    loginBlockedDueToTryingTooManyTimes: "LoginBlockedDueToTryingTooManyTimes",
    authCodeBlockedDueToTryingTooManyTimes:
      "AuthCodeBlockedDueToTryingTooManyTimes",
    permissionDeniedDueToUserRole: "PermissionDeniedDueToUserRole",
    permissionDeniedDueToUserPlan: "PermissionDeniedDueToUserPlan",
    permissionDeniedDueToInvalidRequestOriginDomain:
      "PermissionDeniedDueToInvalidRequestOriginDomain",
    permissionDeniedDueToTooManyRequests:
      "PermissionDeniedDueToTooManyRequests",
  },
  user: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
    duplicateName: "DuplicateName",
    duplicateEmail: "DuplicateEmail",
  },
  userInfo: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  userSetting: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  userAccount: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  usersToBadges: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  theme: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  badge: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  search: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
  },
  email: {
    ...APIExceptionReasons,
  },
};
