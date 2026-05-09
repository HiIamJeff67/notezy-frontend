import { Language } from "@shared/api/interfaces/enums";
import { EnglishTranslationWords } from "@shared/translations/english.translation";
import { JapaneseTranslationWords } from "@shared/translations/japanese.translation";
import { KoreanTranslationWords } from "@shared/translations/korean.translation";
import { SimpleChineseTranslationWords } from "@shared/translations/simpleChinese.translation";
import { TraditionalChineseTranslationWords } from "@shared/translations/traditionalChinese.translation";
import { TranslationWords } from "@shared/types/translationWords.type";

export const translations: Record<Language, TranslationWords> = {
  English: EnglishTranslationWords,
  TraditionalChinese: TraditionalChineseTranslationWords,
  SimpleChinese: SimpleChineseTranslationWords,
  Japanese: JapaneseTranslationWords,
  Korean: KoreanTranslationWords,
};

export const tKey: TranslationWords = {
  syntax: {
    separator: "syntax.separator",
  },
  common: {
    loading: "common.loading",
    error: "common.error",
    success: "common.success",
    cancel: "common.cancel",
    confirm: "common.confirm",
    save: "common.save",
    delete: "common.delete",
    edit: "common.edit",
    choose: "common.choose",
    send: "common.send",
  },
  navigation: {
    home: "navigation.home",
    documents: "navigation.documents",
    settings: "navigation.settings",
    profile: "navigation.profile",
  },
  homePage: {
    mainTitle: "homePage.mainTitle",
    secondaryTitle: "homePage.secondaryTitle",
    subtitle: "homePage.subtitle",
    getStarted: "homePage.getStarted",
    viewDocs: "homePage.viewDocs",
    switchTheme: "homePage.switchTheme",
  },
  auth: {
    login: "auth.login",
    register: "auth.register",
    resetPassword: "auth.resetPassword",
    switchAccount: "auth.switchAccount",
    logout: "auth.logout",
    account: "auth.account",
    name: "auth.name",
    email: "auth.email",
    password: "auth.password",
    confirmPassword: "auth.confirmPassword",
    newPassword: "auth.newPassword",
    confirmNewPassword: "auth.confirmNewPassword",
    authCode: "auth.authCode",
    userRole: "auth.userRole",
    userPlan: "auth.userPlan",
    forgetPassword: "auth.forgetPassword",
    haveNotRegisterAnAccount: "auth.haveNotRegisterAnAccount",
    alreadyHaveAnAccount: "auth.alreadyHaveAnAccount",
    authenticationPanelSubtitle: "auth.authenticationPanelSubtitle",
    oopsIForgotMyAccount: "auth.oopsIForgotMyAccount",
    pleaseInputValidName: "auth.pleaseInputValidName",
    pleaseInputValidEmail: "auth.pleaseInputValidEmail",
    pleaseInputValidAccount: "auth.pleaseInputValidAccount",
    pleaseInputValidAuthCode: "auth.pleaseInputValidAuthCode",
    pleaseInputStrongPassword: "auth.pleaseInputStrongPassword",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch",
  },
  themes: {
    theme: "themes.theme",
    defaultDark: "themes.defaultDark",
    defaultLight: "themes.defaultLight",
    defaultNeon: "themes.defaultNeon",
    defaultOcean: "themes.defaultOcean",
    defaultStandard: "themes.defaultStandard",
  },
  languages: {
    language: "languages.language",
    english: "languages.english",
    traditionalChinese: "languages.traditionalChinese",
    simpleChinese: "languages.simpleChinese",
    japanese: "languages.japanese",
    korean: "languages.korean",
  },
  error: {
    encounterUnknownError: "error.encounterUnknownError",
    urlNotFound: "error.urlNotFound",
    unauthorized: "error.unauthorized",
    permissionDeniedDueTo: "error.permissionDeniedDueTo",
    apiError: {
      register: {
        failedToRegister: "error.apiError.register.failedToRegister",
        duplicateName: "error.apiError.register.duplicateName",
        duplicateEmail: "error.apiError.register.duplicateEmail",
      },
      login: {
        failedToLogin: "error.apiError.login.failedToLogin",
        wrongPassword: "error.apiError.login.wrongPassword",
      },
      logout: {
        failedToLogout: "error.apiError.logout.failedToLogout",
      },
      getUser: {
        failedToGetUser: "error.apiError.getUser.failedToGetUser",
      },
    },
    localDatabaseError: "error.localDatabaseError",
  },
  settings: {
    accountSettings: "settings.accountSettings",
    preferences: "settings.preferences",
  },
} as const;
