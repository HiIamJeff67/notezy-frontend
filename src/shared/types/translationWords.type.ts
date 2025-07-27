export interface TranslationWords {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
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
    logout: string;
    account: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    haveNotRegisterAnAccount: string;
    alreadyHaveAnAccount: string;
    authenticationPanelSubtitle: string;
    oopsIForgotMyAccount: string;
    pleaseInputValidName: string;
    pleaseInputValidEmail: string;
    pleaseInputStrongPassword: string;
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch: string;
  };
  themes: {
    defaultDark: string;
    defaultLight: string;
    defaultNeon: string;
    defaultOcean: string;
    defaultStandard: string;
  };
  languages: {
    english: string;
    traditionalChinese: string;
    simpleChinese: string;
    japanese: string;
    korean: string;
  };
  error: {
    encounterUnknownError: string;
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
      };
    };
  };
}
