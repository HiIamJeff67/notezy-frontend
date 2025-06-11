"use client";

import AuthPanel from "@/components/AuthPanel";
import GridBlackBackground from "@/components/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useEffect, useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const loadingManager = useLoading();
  const router = useAppRouter();
  const languageManager = useLanguage();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const handlingRegisterSubmit = async function (): Promise<void> {
    const userAgent = navigator.userAgent;
  };

  return (
    <GridBlackBackground>
      <div>
        <AuthPanel
          title={languageManager.t("auth.register")}
          subtitle={languageManager.t("auth.authenticationPanelSubtitle")}
          inputs={[
            {
              title: languageManager.t("auth.name"),
              placeholder: "ex. myName123",
              type: "text",
              value: name,
              onChange: setName,
              required: true,
            },
            {
              title: languageManager.t("auth.email"),
              placeholder: "ex. example123@email.com",
              type: "email",
              value: email,
              onChange: setEmail,
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
            {
              title: languageManager.t("auth.confirmPassword"),
              placeholder: "ex. example-password123(&@#$",
              type: "password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              required: true,
            },
          ]}
          submitButtonText={languageManager.t("auth.register")}
          onSubmit={handlingRegisterSubmit}
          switchButtons={[
            {
              description: languageManager.t("auth.alreadyHaveAnAccount"),
              title: languageManager.t("auth.login"),
              onClick: () => {
                loadingManager.setIsLoading(true);
                router.push("/login");
              },
            },
          ]}
          statusDetail={"System Ready"}
          isLoading={loadingManager.isLoading}
        />
      </div>
    </GridBlackBackground>
  );
};

export default RegisterPage;
