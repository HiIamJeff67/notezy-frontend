"use client";

import AuthPanel from "@/components/AuthPanel/AuthPanel";
import GridBackground from "@/components/GridBackground/GridBackground";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import {
  useForgetPassword,
  useSendAuthCode,
} from "@shared/api/hooks/auth.hook";
import { AuthCodeBlockedSecond, WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const ForgetPasswordPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const sendAuthCodeMutator = useSendAuthCode();
  const forgetPasswordMutator = useForgetPassword();

  const [email, setEmail] = useState<string>("");
  const [authCode, setAuthCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [sendAuthCodeTimeCounter, setSendAuthCodeTimeCounter] =
    useState<number>(0);

  useEffect(() => {
    loadingManager.setIsLoading(false);
    loadingManager.clearInactiveStrictLoadingStates();
    loadingManager.clearInactiveLaxLoadingStates();
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

  const handleSendAuthCodeOnClick = useCallback(
    async function (): Promise<void> {
      try {
        const userAgent = navigator.userAgent;
        const responseOfSendingAuthCode = await sendAuthCodeMutator.mutateAsync(
          {
            header: {
              userAgent: userAgent,
            },
            body: {
              email: email,
            },
          }
        );

        const blockUntil = new Date(
          responseOfSendingAuthCode.data.blockAuthCodeUntil
        );
        const blockTime = Math.floor(
          (blockUntil.getTime() - new Date().getTime()) / 1000
        );
        setSendAuthCodeTimeCounter(Math.max(AuthCodeBlockedSecond, blockTime));
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    },
    [email, loadingManager, languageManager, sendAuthCodeMutator]
  );

  const handleResetPasswordOnSubmit = useCallback(
    async function (): Promise<void> {
      try {
        if (newPassword !== confirmNewPassword) {
          throw new Error(
            languageManager.t(
              tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
            )
          );
        }

        const userAgent = navigator.userAgent;
        await forgetPasswordMutator.mutateAsync({
          header: {
            userAgent: userAgent,
          },
          body: {
            account: email,
            newPassword: newPassword,
            authCode: authCode,
          },
        });
        setEmail("");
        setAuthCode("");
        setNewPassword("");
        setConfirmNewPassword("");
        router.push(WebURLPathDictionary.auth.login);
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    },
    [
      email,
      authCode,
      newPassword,
      confirmNewPassword,
      loadingManager,
      languageManager,
      forgetPasswordMutator,
      router,
    ]
  );

  return (
    <GridBackground>
      {(sendAuthCodeMutator.isPending || forgetPasswordMutator.isPending) && (
        <StrictLoadingOutlay />
      )}
      <Suspense fallback={<StrictLoadingOutlay />}>
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
                    : `${languageManager.t(
                        tKey.common.send
                      )}${languageManager.t(
                        tKey.syntax.separator
                      )}${languageManager.t(tKey.auth.authCode)}`,
                onClick: async () => handleSendAuthCodeOnClick(),
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
          onSubmit={handleResetPasswordOnSubmit}
          switchButtons={[
            {
              description: languageManager.t(
                tKey.auth.haveNotRegisterAnAccount
              ),
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
      </Suspense>
    </GridBackground>
  );
};

export default ForgetPasswordPage;
