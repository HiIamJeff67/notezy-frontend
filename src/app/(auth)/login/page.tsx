"use client";

import { Login } from "@/api/auth.api";
import { GetMe } from "@/api/user.api";
import AuthPanel from "@/components/AuthPanel";
import GridBlackBackground from "@/components/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { handleAndLogCaughtError } from "@/lib/handleCaughtError";
import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const loadingManager = useLoading();
  const router = useAppRouter();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const handlingLoginSubmit = async function (): Promise<void> {
    const userAgent = navigator.userAgent;

    try {
      const userAgent = navigator.userAgent;
      const responseOfRegister = await Login({
        header: {
          userAgent: userAgent,
        },
        body: {
          account: account,
          password: password,
        },
      });

      const responseOfGetMe = await GetMe({
        header: {
          userAgent: userAgent,
          authorization: undefined,
        },
        body: {},
      });
      if (
        responseOfGetMe.data.accessToken !== responseOfRegister.data.accessToken
      ) {
        router.push(WebURLPathDictionary.login);
        throw new Error(
          languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
        );
      }
      userDataManager.setUserData(responseOfGetMe.data);
      router.push(WebURLPathDictionary.dashboard);
    } catch (error) {
      if (error instanceof Error) {
        error.message = languageManager.t(error.message);
      } else if (typeof error === "string") {
        error = languageManager.t(error);
      }
      handleAndLogCaughtError(error);
      setPassword("");
      loadingManager.setIsLoading(false);
    }
  };

  return (
    <GridBlackBackground>
      <div>
        <AuthPanel
          title={languageManager.t(tKey.auth.login)}
          subtitle={`${languageManager.t(
            tKey.auth.authenticationPanelSubtitle
          )} ${languageManager.t(tKey.auth.login)}`}
          inputs={[
            {
              title: languageManager.t(tKey.auth.account),
              placeholder: "ex. example123@email.com or myName123",
              type: "text",
              value: account,
              onChange: setAccount,
              required: true,
            },
            {
              title: languageManager.t(tKey.auth.password),
              placeholder: "ex. example-password123(&@#$",
              type: "password",
              value: password,
              onChange: setPassword,
              required: true,
            },
          ]}
          submitButtonText={languageManager.t(tKey.auth.login)}
          onSubmit={handlingLoginSubmit}
          switchButtons={[
            {
              description: languageManager.t(
                tKey.auth.haveNotRegisterAnAccount
              ),
              title: languageManager.t(tKey.auth.register),
              onClick: () => {
                loadingManager.setIsLoading(true);
                router.push(WebURLPathDictionary.register);
              },
            },
            {
              description: languageManager.t(tKey.auth.oopsIForgotMyAccount),
              title: languageManager.t(tKey.auth.forgotPassword),
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
