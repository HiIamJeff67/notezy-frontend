import { TranslationWords } from "../types/translationWords.type";

export const EnglishTranslationWords: TranslationWords = {
  syntax: {
    separator: " ",
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    choose: "Choose",
    send: "Send",
  },
  navigation: {
    home: "Home",
    documents: "Documents",
    settings: "Settings",
    profile: "Profile",
  },
  homePage: {
    mainTitle: "Notezy",
    secondaryTitle: "A More Humanized AI-Driven Note-Taking Application",
    subtitle: "Your digital note-taking companion",
    getStarted: "Get Started",
    viewDocs: "View Docs",
    switchTheme: "Switch Theme",
  },
  auth: {
    login: "Login",
    register: "Register",
    resetPassword: "Reset Password",
    switchAccount: "Switch Account",
    logout: "Logout",
    account: "Account",
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    authCode: "Auth Code",
    userRole: "User Role",
    userPlan: "User Plan",
    forgetPassword: "Forgot Password?",
    haveNotRegisterAnAccount: "Haven't register an account?",
    alreadyHaveAnAccount: "Already have an account?",
    authenticationPanelSubtitle: "Authentication panel for",
    oopsIForgotMyAccount: "Oops! I forgot my account..",
    pleaseInputValidName:
      "Please input a valid name which should be alphanumeric and at least 8 characters",
    pleaseInputValidEmail: "Please input a valid email",
    pleaseInputStrongPassword: "Please input a strong password",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "Please make sure the password and confirm password are the same",
  },
  themes: {
    theme: "Theme",
    defaultDark: "Default Dark",
    defaultLight: "Default Light",
    defaultNeon: "Default Neon",
    defaultOcean: "Default Ocean",
    defaultStandard: "Default Standard",
  },
  languages: {
    language: "Language",
    english: "English",
    traditionalChinese: "Traditional Chinese",
    simpleChinese: "Simple Chinese",
    japanese: "Japanese",
    korean: "Korean",
  },
  error: {
    encounterUnknownError: "Encounter an unknown error",
    urlNotFound: "URL not found",
    unauthorized: "Unauthorized",
    permissionDeniedDueTo: "Permission denied due to:",
    apiError: {
      register: {
        failedToRegister:
          "Failed to register, please wait for a second or contact with us",
        duplicateName:
          "This name has already been registered, please choose another one",
        duplicateEmail:
          "This email has already been registered, please choose another one",
      },
      login: {
        failedToLogin:
          "Failed to login, please wait for a second or contact with us",
        wrongPassword: "Wrong password, please try again",
      },
      logout: {
        failedToLogout:
          "Failed to logout, please wait for a second or contact with us",
      },
      getUser: {
        failedToGetUser:
          "Failed to get user, please wait for a second or contact with us",
      },
    },
  },
  settings: {
    accountSettings: "Account Settings",
    preferences: "Preferences",
  },
};
