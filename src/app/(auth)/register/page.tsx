"use client";

import { Register } from "@/api/auth.api";
import { GetMe } from "@/api/user.api";
import AuthPanel from "@/components/AuthPanel";
import GridBlackBackground from "@/components/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { handleAndLogCaughtError } from "@/lib/handleCaughtError";
import { isValidEmail, isValidName, isValidPassword } from "@/lib/validation";

import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { useEffect, useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const loadingManager = useLoading();
  const router = useAppRouter();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const handlingRegisterSubmit = async function (): Promise<void> {
    loadingManager.setIsLoading(true);

    try {
      if (!isValidName(name)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputValidName));
      } else if (!isValidEmail(email)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputValidEmail));
      } else if (password !== confirmPassword) {
        throw new Error(
          languageManager.t(
            tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
          )
        );
      } else if (!isValidPassword(password)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputStrongPassword));
      }

      const userAgent = navigator.userAgent;
      const responseOfRegister = await Register({
        header: {
          userAgent: userAgent,
        },
        body: {
          name: name,
          email: email,
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
      setConfirmPassword("");
      loadingManager.setIsLoading(false);
    }
  };

  return (
    <GridBlackBackground>
      <div>
        <AuthPanel
          title={languageManager.t(tKey.auth.register)}
          subtitle={`${languageManager.t(
            tKey.auth.authenticationPanelSubtitle
          )} ${languageManager.t(tKey.auth.register)}`}
          inputs={[
            {
              title: languageManager.t(tKey.auth.name),
              placeholder: "ex. myName123",
              type: "text",
              value: name,
              onChange: setName,
              required: true,
            },
            {
              title: languageManager.t(tKey.auth.email),
              placeholder: "ex. example123@email.com",
              type: "email",
              value: email,
              onChange: setEmail,
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
            {
              title: languageManager.t(tKey.auth.confirmPassword),
              placeholder: "ex. example-password123(&@#$",
              type: "password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              required: true,
            },
          ]}
          submitButtonText={languageManager.t(tKey.auth.register)}
          onSubmit={handlingRegisterSubmit}
          switchButtons={[
            {
              description: languageManager.t(tKey.auth.alreadyHaveAnAccount),
              title: languageManager.t(tKey.auth.login),
              onClick: () => {
                loadingManager.setIsLoading(true);
                router.push(WebURLPathDictionary.login);
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
