import { TranslationWords } from "../types/translationWords.type";

export const JapaneseTranslationWords: TranslationWords = {
  syntax: {
    separator: "",
  },
  common: {
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    cancel: "キャンセル",
    confirm: "確認",
    save: "保存",
    delete: "削除",
    edit: "編集",
    choose: "選択",
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
    switchAccount: "アカウントを切り替える",
    logout: "ログアウト",
    account: "アカウント",
    name: "名前",
    email: "メール",
    password: "パスワード",
    confirmPassword: "パスワード確認",
    userRole: "ユーザーの役割",
    userPlan: "ユーザープラン",
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
    theme: "テーマ",
    defaultDark: "デフォルトダーク",
    defaultLight: "デフォルトライト",
    defaultNeon: "デフォルトネオン",
    defaultOcean: "デフォルトオーシャン",
    defaultStandard: "デフォルトスタンダード",
  },
  languages: {
    language: "言語",
    english: "英語",
    traditionalChinese: "繁体字中国語",
    simpleChinese: "簡体字中国語",
    japanese: "日本語",
    korean: "韓国語",
  },
  error: {
    encounterUnknownError: "不明なエラーが発生しました",
    urlNotFound: "URLが見つかりません",
    unauthorized: "認証されていません",
    permissionDeniedDueTo: "次の理由で許可されません:",
    apiError: {
      register: {
        failedToRegister:
          "登録に失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
        duplicateName:
          "この名前は既に登録されています。別の名前を選択してください",
        duplicateEmail:
          "このメールアドレスは既に登録されています。別のメールアドレスを選択してください",
      },
      login: {
        failedToLogin:
          "ログインに失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
        wrongPassword: "パスワードが間違っています。再度お試しください",
      },
      logout: {
        failedToLogout:
          "ログアウトに失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
      },
      getUser: {
        failedToGetUser:
          "ユーザー情報の取得に失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
      },
    },
  },
  settings: {
    accountSettings: "アカウント設定",
    preferences: "設定",
  },
};
