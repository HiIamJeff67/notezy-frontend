import { useTranslation } from "react-i18next";

const IntroductionPage = () => {
  const { t } = useTranslation();
  return <div>{t("workspace.pages.introductionComingSoon")}</div>;
};

export default IntroductionPage;
