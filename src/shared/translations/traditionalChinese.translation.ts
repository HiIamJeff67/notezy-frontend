import { TranslationWords } from "../types/translationWords.type";

export const TraditionalChineseTranslationWords: TranslationWords = {
  common: {
    loading: "載入中...",
    error: "錯誤",
    success: "成功",
    cancel: "取消",
    confirm: "確認",
    save: "儲存",
    delete: "刪除",
    edit: "編輯",
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
    dark: "深色",
    light: "淺色",
    neon: "霓虹",
    ocean: "海洋",
  },
  error: {
    encounterUnknownError: "遇到未知錯誤",
    apiError: {
      failedToRegister: "註冊失敗，請稍候再試或聯絡我們",
      failedToLogin: "登入失敗，請稍候再試或聯絡我們",
      failedToLogout: "登出失敗，請稍候再試或聯絡我們",
      failedToGetUser: "取得使用者資料失敗，請稍候再試或聯絡我們",
    },
  },
};
