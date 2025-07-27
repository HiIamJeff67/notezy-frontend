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
  common: {
    loading: "common.loading",
    error: "common.error",
    success: "common.success",
    cancel: "common.cancel",
    confirm: "common.confirm",
    save: "common.save",
    delete: "common.delete",
    edit: "common.edit",
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
    logout: "auth.logout",
    account: "auth.account",
    name: "auth.name",
    email: "auth.email",
    password: "auth.password",
    confirmPassword: "auth.confirmPassword",
    forgotPassword: "auth.forgotPassword",
    haveNotRegisterAnAccount: "auth.haveNotRegisterAnAccount",
    alreadyHaveAnAccount: "auth.alreadyHaveAnAccount",
    authenticationPanelSubtitle: "auth.authenticationPanelSubtitle",
    oopsIForgotMyAccount: "auth.oopsIForgotMyAccount",
    pleaseInputValidName: "auth.pleaseInputValidName",
    pleaseInputValidEmail: "auth.pleaseInputValidEmail",
    pleaseInputStrongPassword: "auth.pleaseInputStrongPassword",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch",
  },
  themes: {
    defaultDark: "themes.defaultDark",
    defaultLight: "themes.defaultLight",
    defaultNeon: "themes.defaultNeon",
    defaultOcean: "themes.defaultOcean",
    defaultStandard: "themes.defaultStandard",
  },
  languages: {
    english: "languages.english",
    traditionalChinese: "languages.traditionalChinese",
    simpleChinese: "languages.simpleChinese",
    japanese: "languages.japanese",
    korean: "languages.korean",
  },
  error: {
    encounterUnknownError: "error.encounterUnknownError",
    apiError: {
      register: {
        failedToRegister: "error.apiError.register.failedToRegister",
        duplicateName: "error.apiError.register.duplicateName",
        duplicateEmail: "error.apiError.register.duplicateEmail",
      },
      login: {
        failedToLogin: "error.apiError.failedToLogin",
        wrongPassword: "error.apiError.login.wrongPassword",
      },
      logout: {
        failedToLogout: "error.apiError.failedToLogout",
      },
      getUser: {
        failedToGetUser: "error.apiError.failedToGetUser",
      },
    },
  },
} as const;
