import { useTranslation } from "react-i18next";

const DocumentPage = () => {
  const { t } = useTranslation();
  return <div>{t("workspace.pages.documentComingSoon")}</div>;
};

export default DocumentPage;
