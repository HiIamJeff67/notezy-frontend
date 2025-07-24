import { TranslationWords } from "../types/translationWords.type";

export const JapaneseTranslationWords: TranslationWords = {
  common: {
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    cancel: "キャンセル",
    confirm: "確認",
    save: "保存",
    delete: "削除",
    edit: "編集",
  },
  navigation: {
    home: "ホーム",
    documents: "ドキュメント",
    settings: "設定",
    profile: "プロフィール",
  },
  homePage: {
    mainTitle: "Notezy",
    secondaryTitle: "より人間的な AI 駆動ノートアプリケーション",
    subtitle: "あなたのデジタルノートパートナー",
    getStarted: "始める",
    viewDocs: "ドキュメントを見る",
    switchTheme: "テーマ切替",
  },
  auth: {
    login: "ログイン",
    register: "登録",
    logout: "ログアウト",
    account: "アカウント",
    name: "名前",
    email: "メール",
    password: "パスワード",
    confirmPassword: "パスワード確認",
    forgotPassword: "パスワードを忘れた？",
    haveNotRegisterAnAccount: "まだアカウントを登録していませんか？",
    alreadyHaveAnAccount: "すでにアカウントをお持ちですか？",
    authenticationPanelSubtitle: "認証パネル",
    oopsIForgotMyAccount: "しまった！アカウントを忘れてしまいました..",
    pleaseInputValidName:
      "有効な名前を入力してください。英数字を含み、8文字以上である必要があります。",
    pleaseInputValidEmail: "有効なメールアドレスを入力してください。",
    pleaseInputStrongPassword: "強力なパスワードを入力してください",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "パスワードと確認用パスワードが一致していることを確認してください。",
  },
  themes: {
    dark: "ダーク",
    light: "ライト",
    neon: "ネオン",
    ocean: "オーシャン",
  },
};
