"use client";

import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import AuthPanel from "@/components/panels/AuthPanel/AuthPanel";
import { useAppRouter, useLanguage, useUser } from "@/hooks";
import { useLogin } from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { getOAuthGoogleSearchParamsString } from "@shared/lib/getURL";
import { CSRFTokenGenerator } from "@shared/lib/tokenGenerator";
import { tKey } from "@shared/translations";
import { Suspense, useCallback, useState, useTransition } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const userManager = useUser();

  const loginMutator = useLogin();
  const getUserDataQuerier = useGetUserData();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const [isLoginPending, startLoginTransition] = useTransition();

  const handleLoginOnSubmit = useCallback(
    async function (): Promise<void> {
      startLoginTransition(async () => {
        try {
          const userAgent = navigator.userAgent;
          await loginMutator.mutateAsync({
            header: {
              userAgent: userAgent,
            },
            body: {
              account: account,
              password: password,
            },
          });

          const responseOfGettingUserData = await getUserDataQuerier.queryAsync(
            {
              header: {
                userAgent: userAgent,
              },
            }
          );

          setAccount("");
          setPassword("");
          userManager.setUserData(responseOfGettingUserData.data);
          router.push(WebURLPathDictionary.root.dashboard._);
        } catch (error) {
          setPassword("");
          toast.error(languageManager.tError(error));
        }
      });
    },
    [
      account,
      password,
      languageManager,
      userManager,
      loginMutator,
      getUserDataQuerier,
      router,
    ]
  );

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingCover />}>
        <StrictLoadingCover
          condition={loginMutator.isPending || getUserDataQuerier.isFetching}
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
                router.push(WebURLPathDictionary.auth.register);
              },
            },
            {
              description: languageManager.t(tKey.auth.oopsIForgotMyAccount),
              title: languageManager.t(tKey.auth.resetPassword),
              onClick: () => {
                router.push(WebURLPathDictionary.auth.forgetPassword);
              },
            },
          ]}
          oauthButtons={[
            {
              provider: "google",
              label: "Login via Google",
              onClick: () =>
                router.forceNavigate(
                  WebURLPathDictionary.oauth.google(
                    getOAuthGoogleSearchParamsString({
                      csrfToken: CSRFTokenGenerator.generate(),
                      action: "login",
                      from: router.getCurrentPath(),
                    })
                  )
                ),
            },
          ]}
          statusDetail={"System Ready"}
          isLoading={isLoginPending}
        />
      </Suspense>
    </GridBackground>
  );
};

export default LoginPage;
