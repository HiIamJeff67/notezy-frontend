"use client";

import AuthPanel from "@/components/AuthPanel/AuthPanel";
import GridBackground from "@/components/GridBackground/GridBackground";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { useAppRouter, useLanguage, useLoading, useUserData } from "@/hooks";
import { useLogin } from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { queryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const loginMutator = useLogin();
  const getUserDataQuerier = useGetUserData();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadingManager.setIsLoading(false);
    loadingManager.clearInactiveStrictLoadingStates();
    loadingManager.clearInactiveLaxLoadingStates();
  }, []);

  const handleLoginOnSubmit = useCallback(
    async function (): Promise<void> {
      try {
        const userAgent = navigator.userAgent;
        const responseOfLoggingIn = await loginMutator.mutateAsync({
          header: {
            userAgent: userAgent,
          },
          body: {
            account: account,
            password: password,
          },
        });

        const responseOfGettingUserData = await getUserDataQuerier.queryAsync({
          header: {
            userAgent: userAgent,
          },
        });

        if (
          !responseOfGettingUserData ||
          responseOfGettingUserData.data.accessToken !==
            responseOfLoggingIn.data.accessToken // since the user may register failed, but using existing cookies to get his/her data
        ) {
          console.log(responseOfLoggingIn);
          throw new Error(
            languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
          );
        }

        setAccount("");
        setPassword("");
        userDataManager.setUserData(responseOfGettingUserData.data);
        queryClient.setQueryData(
          queryKeys.user.data(),
          responseOfGettingUserData
        );
        router.push(WebURLPathDictionary.root.dashboard);
      } catch (error) {
        setPassword("");
        toast.error(languageManager.tError(error));
      }
    },
    [
      account,
      password,
      loadingManager,
      languageManager,
      userDataManager,
      loginMutator,
      getUserDataQuerier,
      router,
    ]
  );

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingOutlay />}>
        <StrictLoadingOutlay
          condition={
            loginMutator.isPending ||
            getUserDataQuerier.isFetching ||
            router.isNavigating
          }
        />
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
          onSubmit={handleLoginOnSubmit}
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
      </Suspense>
    </GridBackground>
  );
};

export default LoginPage;
