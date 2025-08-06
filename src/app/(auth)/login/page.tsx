"use client";

import { Login } from "@/api/auth.api";
import { GetUserData } from "@/api/user.api";
import AuthPanel from "@/components/AuthPanel/AuthPanel";
import GridBackground from "@/components/GridBackground/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { isValidEmail, isValidName, isValidPassword } from "@/lib/validation";
import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const handlingLoginOnSubmit = async function (): Promise<void> {
    loadingManager.setIsLoading(true);

    try {
      if (!isValidName(account) && !isValidEmail(account)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputValidAccount));
      }
      if (!isValidPassword(password)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputStrongPassword));
      }

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

      const responseOfGetMe = await GetUserData({
        header: {
          userAgent: userAgent,
        },
      });
      if (
        responseOfGetMe.data.accessToken !== responseOfRegister.data.accessToken
      ) {
        throw new Error(
          languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
        );
      }
      userDataManager.setUserData(responseOfGetMe.data);
      router.push(WebURLPathDictionary.root.dashboard);
    } catch (error) {
      toast.error(languageManager.tError(error));
      setPassword("");
      loadingManager.setIsLoading(false);
    }
  };

  return (
    <GridBackground>
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
        onSubmit={handlingLoginOnSubmit}
        switchButtons={[
          {
            description: languageManager.t(tKey.auth.haveNotRegisterAnAccount),
            title: languageManager.t(tKey.auth.register),
            onClick: () => {
              loadingManager.setIsLoading(true);
              router.push(WebURLPathDictionary.auth.register);
            },
          },
          {
            description: languageManager.t(tKey.auth.oopsIForgotMyAccount),
            title: languageManager.t(tKey.auth.resetPassword),
            onClick: () => {
              loadingManager.setIsLoading(true);
              router.push(WebURLPathDictionary.auth.forgetPassword);
            },
          },
        ]}
        statusDetail={"System Ready"}
        isLoading={loadingManager.isLoading}
      />
    </GridBackground>
  );
};

export default LoginPage;
