"use client";

import { Register } from "@/api/auth.api";
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
    try {
      if (!isValidName(name)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputValidName));
        return;
      } else if (!isValidEmail(email)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputValidEmail));
        return;
      } else if (password !== confirmPassword) {
        throw new Error(
          languageManager.t(
            tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
          )
        );
        return;
      } else if (!isValidPassword(password)) {
        throw new Error(languageManager.t(tKey.auth.pleaseInputStrongPassword));
        return;
      }

      const userAgent = navigator.userAgent;
      const response = await Register({
        header: {
          userAgent: userAgent,
        },
        body: {
          name: name,
          email: email,
          password: password,
        },
      });
      // if there's any error, it will be caught by the below catch block
      // since we don't wrap the try-catch block in Register()

      console.log(response);

      /* storing user data and navigate to dashboard */

      // run api /getMe to get the user data cache
      // and then store it in the userDataManager
    } catch (error) {
      handleAndLogCaughtError(error);
      return;
    }
  };

  return (
    <GridBlackBackground>
      <div>
        <AuthPanel
          title={languageManager.t(tKey.auth.register)}
          subtitle={languageManager.t(tKey.auth.authenticationPanelSubtitle)}
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
