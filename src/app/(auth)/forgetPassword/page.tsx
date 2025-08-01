"use client";

import AuthPanel from "@/components/AuthPanel";
import GridBackground from "@/components/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { useEffect, useState } from "react";

const ForgetPasswordPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const handlingSendAuthCodeOnClick = async function (): Promise<void> {
    loadingManager.setIsLoading(true);
  };

  const handlingResetPasswordOnSubmit = async function (): Promise<void> {
    loadingManager.setIsLoading(true);
  };

  return (
    <GridBackground>
      <AuthPanel
        title={languageManager.t(tKey.auth.resetPassword)}
        subtitle={`${languageManager.t(
          tKey.auth.authenticationPanelSubtitle
        )} ${languageManager.t(tKey.auth.resetPassword)}`}
        inputs={[
          {
            title: languageManager.t(tKey.auth.email),
            placeholder: "ex. example123@email.com",
            type: "email",
            value: email,
            onChange: setEmail,
            required: true,
          },
          {
            title: languageManager.t(tKey.auth.authCode),
            placeholder: "ex. 123456",
            type: "number",
            value: authCode,
            onChange: setAuthCode,
            required: true,
            rightButton: {
              description: `${languageManager.t(
                tKey.common.send
              )}${languageManager.t(tKey.syntax.separator)}${languageManager.t(
                tKey.auth.authCode
              )}`,
              onClick: () => {},
            },
          },
          {
            title: languageManager.t(tKey.auth.newPassword),
            placeholder: "ex. example-password123(&@#$",
            type: "password",
            value: newPassword,
            onChange: setNewPassword,
            required: true,
          },
          {
            title: languageManager.t(tKey.auth.confirmNewPassword),
            placeholder: "ex. example-password123(&@#$",
            type: "password",
            value: confirmNewPassword,
            onChange: setConfirmNewPassword,
            required: true,
          },
        ]}
        submitButtonText={languageManager.t(tKey.auth.resetPassword)}
        onSubmit={handlingResetPasswordOnSubmit}
        switchButtons={[
          {
            description: languageManager.t(tKey.auth.haveNotRegisterAnAccount),
            title: languageManager.t(tKey.auth.register),
            onClick: () => {
              loadingManager.setIsLoading(true);
              router.push(WebURLPathDictionary.auth.register);
            },
          },
        ]}
        statusDetail={"System Ready"}
        isLoading={loadingManager.isLoading}
      />
    </GridBackground>
  );
};

export default ForgetPasswordPage;
