import { TranslationWords } from "../types/translationWords.type";

export const TraditionalChineseTranslationWords: TranslationWords = {
  syntax: {
    separator: "",
  },
  common: {
    loading: "載入中...",
    error: "錯誤",
    success: "成功",
    cancel: "取消",
    confirm: "確認",
    save: "儲存",
    delete: "刪除",
    edit: "編輯",
    choose: "選擇",
  },
  navigation: {
    home: "首頁",
    documents: "文件",
    settings: "設定",
    profile: "個人資料",
  },
  homePage: {
    mainTitle: "Notezy",
    secondaryTitle: "一個更人性化的 AI 驅動筆記應用程式",
    subtitle: "您的數位筆記夥伴",
    getStarted: "開始使用",
    viewDocs: "查看文件",
    switchTheme: "切換主題",
  },
  auth: {
    login: "登入",
    register: "註冊",
    logout: "登出",
    account: "帳號",
    name: "名稱",
    email: "電子郵件",
    password: "密碼",
    confirmPassword: "確認密碼",
    forgotPassword: "忘記密碼？",
    haveNotRegisterAnAccount: "還沒有註冊帳號？",
    alreadyHaveAnAccount: "已經有帳號了？",
    authenticationPanelSubtitle: "身份驗證面板",
    oopsIForgotMyAccount: "糟了! 我忘記我的帳號了..",
    pleaseInputValidName:
      "請輸入有效的名稱，須包含英文字母和數字並且至少 8 個字元",
    pleaseInputValidEmail: "請輸入有效的電子郵件",
    pleaseInputStrongPassword: "請輸入一組強密碼",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "請確保密碼跟確認密碼一致",
  },
  themes: {
    theme: "主題",

    defaultDark: "預設深色",
    defaultLight: "預設淺色",
    defaultNeon: "預設霓虹",
    defaultOcean: "預設海洋",
    defaultStandard: "預設標準",
  },
  languages: {
    language: "語言",
    english: "英文",
    traditionalChinese: "繁體中文",
    simpleChinese: "簡體中文",
    japanese: "日文",
    korean: "韓文",
  },
  error: {
    encounterUnknownError: "遇到未知錯誤",
    apiError: {
      register: {
        failedToRegister: "註冊失敗，請稍後再試或聯繫我們",
        duplicateName: "此名稱已被註冊，請選擇其他名稱",
        duplicateEmail: "此電子信箱已被註冊，請選擇其他信箱",
      },
      login: {
        failedToLogin: "登入失敗，請稍後再試或聯繫我們",
        wrongPassword: "密碼錯誤，請重新輸入",
      },
      logout: {
        failedToLogout: "登出失敗，請稍後再試或聯繫我們",
      },
      getUser: {
        failedToGetUser: "取得用戶資料失敗，請稍後再試或聯繫我們",
      },
    },
  },
};
