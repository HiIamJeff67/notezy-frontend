import { LanguageKey } from "../types/language.type";
import { TranslationWords } from "../types/translationWords.type";
import { EnglishTranslationWords } from "./english.translation";
import { JapaneseTranslationWords } from "./japanese.translation";
import { KoreanTranslationWords } from "./korean.translation";
import { SimpleChineseTranslationWords } from "./simpleChinese.translation";
import { TraditionalChineseTranslationWords } from "./traditionalChinese.translation";

export const translations: Record<LanguageKey, TranslationWords> = {
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
  },
  settings: {
    accountSettings: "settings.accountSettings",
    preferences: "settings.preferences",
  },
} as const;
