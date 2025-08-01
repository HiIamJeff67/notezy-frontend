"use client";

import { SendAuthCode } from "@/api/auth.api";
import AuthPanel from "@/components/AuthPanel";
import GridBackground from "@/components/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { isValidEmail } from "@/lib/validation";
import { AuthCodeBlockedSecond } from "@/shared/constants/blockTimes.constant";
import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ForgetPasswordPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const [email, setEmail] = useState<string>("");
  const [authCode, setAuthCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [sendAuthCodeTimeCounter, setSendAuthCodeTimeCounter] =
    useState<number>(0);

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  useEffect(() => {
    if (sendAuthCodeTimeCounter === 0) return;
    const timer = setInterval(() => {
      setSendAuthCodeTimeCounter(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sendAuthCodeTimeCounter]);

  const handlingSendAuthCodeOnClick = async function (): Promise<void> {
    loadingManager.setIsLoading(true);

    try {
      if (!isValidEmail(email)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputValidEmail));
      }

      const userAgent = navigator.userAgent;
      const responseOfSendingAuthCode = await SendAuthCode({
        header: {
          userAgent: userAgent,
        },
        body: {
          email: email,
        },
      });

      const blockUntil = new Date(
        responseOfSendingAuthCode.data.blockAuthCodeUntil
      );
      const blockTime = Math.floor(
        (blockUntil.getTime() - new Date().getTime()) / 1000
      );
      setSendAuthCodeTimeCounter(Math.max(AuthCodeBlockedSecond, blockTime));
      toast.success("AuthCode Sent");
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      loadingManager.setIsLoading(false);
    }
  };

  const handlingResetPasswordOnSubmit = async function (): Promise<void> {
    loadingManager.setIsLoading(true);

    try {
    } catch (error) {}
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
              description:
                sendAuthCodeTimeCounter > 0
                  ? `${sendAuthCodeTimeCounter}s`
                  : `${languageManager.t(tKey.common.send)}${languageManager.t(
                      tKey.syntax.separator
                    )}${languageManager.t(tKey.auth.authCode)}`,
              onClick: async () => handlingSendAuthCodeOnClick(),
              disabled: sendAuthCodeTimeCounter > 0,
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
