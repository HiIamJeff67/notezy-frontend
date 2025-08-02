export interface TranslationWords {
  syntax: {
    separator: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    choose: string;
    send: string;
  };
  navigation: {
    home: string;
    documents: string;
    settings: string;
    profile: string;
  };
  homePage: {
    mainTitle: string;
    secondaryTitle: string;
    subtitle: string;
    getStarted: string;
    viewDocs: string;
    switchTheme: string;
  };
  auth: {
    login: string;
    register: string;
    resetPassword: string;
    switchAccount: string;
    logout: string;
    account: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    authCode: string;
    userRole: string;
    userPlan: string;
    forgetPassword: string;
    haveNotRegisterAnAccount: string;
    alreadyHaveAnAccount: string;
    authenticationPanelSubtitle: string;
    oopsIForgotMyAccount: string;
    pleaseInputValidName: string;
    pleaseInputValidEmail: string;
    pleaseInputValidAccount: string;
    pleaseInputStrongPassword: string;
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch: string;
  };
  themes: {
    theme: string;
    defaultDark: string;
    defaultLight: string;
    defaultNeon: string;
    defaultOcean: string;
    defaultStandard: string;
  };
  languages: {
    language: string;
    english: string;
    traditionalChinese: string;
    simpleChinese: string;
    japanese: string;
    korean: string;
  };
  error: {
    encounterUnknownError: string;
    urlNotFound: string;
    unauthorized: string;
    permissionDeniedDueTo: string;
    apiError: {
      register: {
        failedToRegister: string;
        duplicateName: string;
        duplicateEmail: string;
      };
      login: {
        failedToLogin: string;
        wrongPassword: string;
      };
      logout: {
        failedToLogout: string;
      };
      getUser: {
        failedToGetUser: string;
        // notFound: string;
      };
    };
  };
  settings: {
    accountSettings: string;
    preferences: string;
    // accountSetting: {};
    // preference: {
    //   appearance: {
    //     fontSize: string;
    //     compactMode: string;
    //     enableAnimation: string;
    //     interfaceLanguage: string;
    //   };
    //   privacy: {
    //     publicProfile: {}
    //     usageStates: {}
    //   }
    // };
  };
}
