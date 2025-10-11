"use client";

import AuthPanel from "@/components/AuthPanel/AuthPanel";
import GridBackground from "@/components/GridBackground/GridBackground";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { useAppRouter, useLanguage, useUserData } from "@/hooks";
import { useRegister } from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { Suspense, useCallback, useState, useTransition } from "react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const registerMutator = useRegister();
  const getUserDataQuerier = useGetUserData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isRegisterPending, startRegisterTransition] = useTransition();

  const handleRegisterOnSubmit = useCallback(
    async function (): Promise<void> {
      startRegisterTransition(async () => {
        try {
          if (password !== confirmPassword) {
            throw new Error(
              languageManager.t(
                tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
              )
            );
          }

          const userAgent = navigator.userAgent;
          const responseOfRegistering = await registerMutator.mutateAsync({
            header: {
              userAgent: userAgent,
            },
            body: {
              name: name,
              email: email,
              password: password,
            },
          });

          const responseOfGettingUserData = await getUserDataQuerier.queryAsync(
            {
              header: { userAgent: navigator.userAgent },
              body: {},
            }
          );

          if (
            !responseOfGettingUserData ||
            responseOfRegistering.data.accessToken !==
              responseOfGettingUserData.data.accessToken
          ) {
            throw new Error(
              languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
            );
          }

          setName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          userDataManager.setUserData(responseOfGettingUserData.data);
          router.push(WebURLPathDictionary.root.dashboard._);
        } catch (error) {
          setPassword("");
          setConfirmPassword("");
          toast.error(languageManager.tError(error));
        }
      });
    },
    [
      name,
      email,
      password,
      confirmPassword,
      languageManager,
      userDataManager,
      registerMutator,
      getUserDataQuerier,
      router,
    ]
  );

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingOutlay />}>
        <StrictLoadingOutlay
          condition={registerMutator.isPending || getUserDataQuerier.isFetching}
        />
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
                router.push(WebURLPathDictionary.auth.login);
              },
            },
          ]}
          statusDetail={"System Ready"}
          isLoading={isRegisterPending}
        />
      </Suspense>
    </GridBackground>
  );
};

export default RegisterPage;
