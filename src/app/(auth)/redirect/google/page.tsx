"use client";

import { useAppRouter, useLanguage, useLoading, useUser } from "@/hooks";
import { getAuthorization } from "@/util/getAuthorization";
import {
  useLoginViaGoogle,
  useRegisterViaGoogle,
} from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { useBindGoogleAccount } from "@shared/api/hooks/userAccount.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { RedirectState } from "@shared/types/redirectState.type";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import toast from "react-hot-toast";

function GoogleRedirectPageContent() {
  const searchParams = useSearchParams();

  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userManager = useUser();

  const registerViaGoogleMutator = useRegisterViaGoogle();
  const loginViaGoogleMutator = useLoginViaGoogle();
  const bindGoogleAccountMutator = useBindGoogleAccount();
  const userDataQuerier = useGetUserData();

  const hasRendered = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (hasRendered.current) return;

    if (code === null || error !== null) {
      toast.error(`Google Auth Error: ${error}`);
      router.push(
        WebURLPathDictionary.auth.redirect.error(
          "Google oauth error",
          languageManager.tError(error)
        )
      );
      return;
    }

    hasRendered.current = true;

    const handleOAuthOnRedirect = async () => {
      try {
        let action: "register" | "login" | "binding" = "login";

        if (state) {
          const decoded = state.startsWith("{") ? state : atob(state);
          const parsedState = JSON.parse(decoded) as RedirectState;
          if (parsedState.action) {
            action = parsedState.action;
          }
        }

        let accessToken: string | null = null;
        const userAgent = navigator.userAgent;
        switch (action) {
          case "register":
            const responseOfRegistering =
              await registerViaGoogleMutator.mutateAsync({
                header: {
                  userAgent: userAgent,
                },
                body: {
                  authorizationCode: code,
                },
              });
            accessToken = responseOfRegistering.data.accessToken;
            break;
          case "login":
            const responseOfLogin = await loginViaGoogleMutator.mutateAsync({
              header: {
                userAgent: userAgent,
              },
              body: {
                authorizationCode: code,
              },
            });
            accessToken = responseOfLogin.data.accessToken;
            break;
          case "binding":
            accessToken = LocalStorageManipulator.getItemByKey(
              LocalStorageKeys.accessToken
            );
            await bindGoogleAccountMutator.mutateAsync({
              header: {
                userAgent: userAgent,
                authorization: getAuthorization(accessToken),
              },
              body: {
                authorizationCode: code,
              },
            });
            break;
          default:
            throw new Error("Undefined action type");
        }

        const responseOfGettingUserData = await userDataQuerier.queryAsync({
          header: {
            userAgent: navigator.userAgent,
            authorization: getAuthorization(accessToken),
          },
        });

        userManager.setUserData(responseOfGettingUserData.data);
        router.push(WebURLPathDictionary.root.dashboard._);
      } catch (error) {
        toast.error(languageManager.tError(error));
        router.push(
          WebURLPathDictionary.auth.redirect.error(
            "Redirect to backend error",
            languageManager.tError(error)
          )
        );
      }
    };

    handleOAuthOnRedirect();
  }, [searchParams, router]); // do not add other dependencies here

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Validating Google Authentication...</p>
    </div>
  );
}

function GoogleRedirectPage() {
  return (
    <Suspense fallback={<div>Loading authn data...</div>}>
      <GoogleRedirectPageContent />
    </Suspense>
  );
}

export default GoogleRedirectPage;
