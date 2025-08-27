"use client";

import AuthPanel from "@/components/AuthPanel/AuthPanel";
import GridBackground from "@/components/GridBackground/GridBackground";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { useRegister } from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { queryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const registerMutator = useRegister();
  const getUserDataQuerier = useGetUserData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadingManager.setIsLoading(false);
    loadingManager.clearInactiveStrictLoadingStates();
    loadingManager.clearInactiveLaxLoadingStates();
  }, []);

  const handleRegisterOnSubmit = useCallback(
    async function (): Promise<void> {
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

        const responseOfGettingUserData = await getUserDataQuerier.queryAsync({
          header: { userAgent: navigator.userAgent },
          body: {},
        });

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
        queryClient.setQueryData(
          queryKeys.user.data(),
          responseOfGettingUserData
        );
        router.push(WebURLPathDictionary.root.dashboard);
      } catch (error) {
        setPassword("");
        setConfirmPassword("");
        toast.error(languageManager.tError(error));
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
      registerMutator,
      getUserDataQuerier,
      router,
    ]
  );

  return (
    <GridBackground>
      {(registerMutator.isPending || getUserDataQuerier.isFetching) && (
        <StrictLoadingOutlay />
      )}
      <Suspense fallback={<StrictLoadingOutlay />}>
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
      </Suspense>
    </GridBackground>
  );
};

export default RegisterPage;
