"use client";

import AuthPanel from "@/components/AuthPanel/AuthPanel";
import GridBackground from "@/components/GridBackground/GridBackground";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { isValidEmail, isValidName, isValidPassword } from "@/util/validation";
import { Register } from "@shared/api/functions/auth.api";
import { GetUserData } from "@shared/api/functions/user.api";
import { useRegister } from "@shared/api/hooks/auth.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const registerManager = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const newHandleRegisterOnSubmit = useCallback(
    async function (): Promise<void> {
      loadingManager.setIsLoading(true);
      try {
        if (password !== confirmPassword) {
          throw new Error(
            languageManager.t(
              tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
            )
          );
        }

        const userAgent = navigator.userAgent;
        await registerManager.mutateAsync({
          header: {
            userAgent: userAgent,
          },
          body: {
            name: name,
            email: email,
            password: password,
          },
        });
      } catch (error) {}
    },
    []
  );

  const handleRegisterOnSubmit = useCallback(
    async function (): Promise<void> {
      loadingManager.setIsLoading(true);

      try {
        if (!isValidName(name)) {
          throw new Error(languageManager.t(tKey.auth.pleaseInputValidName));
        }
        if (!isValidEmail(email)) {
          throw new Error(languageManager.t(tKey.auth.pleaseInputValidEmail));
        }
        if (!isValidPassword(password)) {
          throw new Error(
            languageManager.t(tKey.auth.pleaseInputStrongPassword)
          );
        }
        if (password !== confirmPassword) {
          throw new Error(
            languageManager.t(
              tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
            )
          );
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

        const responseOfGetMe = await GetUserData({
          header: {
            userAgent: userAgent,
          },
          body: {},
        });
        if (
          responseOfGetMe.data.accessToken !==
          responseOfRegister.data.accessToken
        ) {
          router.push(WebURLPathDictionary.auth.login);
          throw new Error(
            languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
          );
        }

        userDataManager.setUserData(responseOfGetMe.data);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.push(WebURLPathDictionary.root.dashboard);
      } catch (error) {
        toast.error(languageManager.tError(error));
        setPassword("");
        setConfirmPassword("");
        loadingManager.setIsLoading(false);
      }
    },
    [
      name,
      email,
      password,
      confirmPassword,
      loadingManager,
      languageManager,
      userDataManager,
      router,
    ]
  );

  return (
    <GridBackground>
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
        onSubmit={handleRegisterOnSubmit}
        switchButtons={[
          {
            description: languageManager.t(tKey.auth.alreadyHaveAnAccount),
            title: languageManager.t(tKey.auth.login),
            onClick: () => {
              loadingManager.setIsLoading(true);
              router.push(WebURLPathDictionary.auth.login);
            },
          },
        ]}
        statusDetail={"System Ready"}
        isLoading={loadingManager.isLoading}
      />
    </GridBackground>
  );
};

export default RegisterPage;
