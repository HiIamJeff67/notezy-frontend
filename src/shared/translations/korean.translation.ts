import { TranslationWords } from "../types/translationWords.type";

export const KoreanTranslationWords: TranslationWords = {
  common: {
    loading: "로딩 중...",
    error: "오류",
    success: "성공",
    cancel: "취소",
    confirm: "확인",
    save: "저장",
    delete: "삭제",
    edit: "편집",
  },
  navigation: {
    home: "홈",
    documents: "문서",
    settings: "설정",
    profile: "프로필",
  },
  homePage: {
    mainTitle: "Notezy",
    secondaryTitle: "보다 인간적인 AI 기반 노트 애플리케이션",
    subtitle: "당신의 디지털 노트 파트너",
    getStarted: "시작하기",
    viewDocs: "문서 보기",
    switchTheme: "테마 전환",
  },
  auth: {
    login: "로그인",
    register: "회원가입",
    logout: "로그아웃",
    account: "계정",
    name: "이름",
    email: "이메일",
    password: "비밀번호",
    confirmPassword: "비밀번호 확인",
    forgotPassword: "비밀번호를 잊으셨나요?",
    haveNotRegisterAnAccount: "아직 계정을 등록하지 않으셨나요？",
    alreadyHaveAnAccount: "이미 계정이 있으신가요？",
    authenticationPanelSubtitle: "인증 패널",
    oopsIForgotMyAccount: "앗! 제 계정을 잊어버렸어요..",
    pleaseInputValidName:
      "유효한 이름을 입력해 주세요. 영문자와 숫자를 포함하며 최소 8자여야 합니다.",
    pleaseInputValidEmail: "유효한 이메일을 입력해 주세요.",
    pleaseInputStrongPassword: "강력한 비밀번호를",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "비밀번호와 비밀번호 확인이 일치하는지 확인해 주세요.",
  },
  themes: {
    dark: "다크",
    light: "라이트",
    neon: "네온",
    ocean: "오션",
  },
  error: {
    encounterUnknownError: "알 수 없는 오류가 발생했습니다",
    apiError: {
      failedToRegister:
        "회원가입에 실패했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
      failedToLogin:
        "로그인에 실패했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
      failedToLogout:
        "로그아웃에 실패했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
      failedToGetUser:
        "사용자 정보를 가져오지 못했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
    },
  },
};
