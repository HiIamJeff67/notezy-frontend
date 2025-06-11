"use client";

import AuthPanel from "@/components/AuthPanel";
import GridBlackBackground from "@/components/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const loadingManager = useLoading();
  const router = useAppRouter();
  const languageManager = useLanguage();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const handlingLoginSubmit = async function (): Promise<void> {
    const userAgent = navigator.userAgent;
  };

  return (
    <GridBlackBackground>
      <div>
        <AuthPanel
          title={languageManager.t("auth.login")}
          subtitle={languageManager.t("auth.authenticationPanelSubtitle")}
          inputs={[
            {
              title: languageManager.t("auth.account"),
              placeholder: "ex. example123@email.com or myName123",
              type: "text",
              value: account,
              onChange: setAccount,
              required: true,
            },
            {
              title: languageManager.t("auth.password"),
              placeholder: "ex. example-password123(&@#$",
              type: "password",
              value: password,
              onChange: setPassword,
              required: true,
            },
          ]}
          submitButtonText={languageManager.t("auth.login")}
          onSubmit={handlingLoginSubmit}
          switchButtons={[
            {
              description: languageManager.t("auth.haveNotRegisterAnAccount"),
              title: languageManager.t("auth.register"),
              onClick: () => {
                loadingManager.setIsLoading(true);
                router.push("/register");
              },
            },
            {
              description: languageManager.t("auth.oopsIForgotMyAccount"),
              title: languageManager.t("auth.forgotPassword"),
              onClick: () => {},
            },
          ]}
          statusDetail={"System Ready"}
          isLoading={loadingManager.isLoading}
        />
      </div>
    </GridBlackBackground>
  );
};

export default LoginPage;
