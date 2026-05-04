import {
  useLoginViaGoogle,
  useRegisterViaGoogle,
} from "@shared/api/hooks/auth.hook";
import { useBindGoogleAccount } from "@shared/api/hooks/userAccount.hook";
import { queryFnGetUserData } from "@shared/api/invokers/user.invoker";
import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { RedirectState } from "@shared/types/redirectState.type";
import { useLocation } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useAppRouter, useLanguage, useLoading, useUser } from "@/hooks";
import { getAuthorization } from "@/util/getAuthorization";

function GoogleRedirectPage() {
  const location = useLocation();

  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userManager = useUser();

  const registerViaGoogleMutator = useRegisterViaGoogle();
  const loginViaGoogleMutator = useLoginViaGoogle();
  const bindGoogleAccountMutator = useBindGoogleAccount();

  const hasRendered = useRef(false);

  const handleOAuthOnRedirect = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

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
              header: { userAgent },
              body: { authorizationCode: code },
            });
          accessToken = responseOfRegistering.data.accessToken;
          break;
        case "login":
          const responseOfLogin = await loginViaGoogleMutator.mutateAsync({
            header: { userAgent },
            body: { authorizationCode: code },
          });
          accessToken = responseOfLogin.data.accessToken;
          console.log("redirect with accessToken: ", accessToken);
          break;
        case "binding":
          accessToken = LocalStorageManipulator.getItemByKey(
            LocalStorageKey.accessToken
          );
          await bindGoogleAccountMutator.mutateAsync({
            header: {
              userAgent,
              authorization: getAuthorization(accessToken),
            },
            body: { authorizationCode: code },
          });
          break;
      }

      const responseOfGettingUserData = await queryFnGetUserData({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
      });

      userManager.setUserData(responseOfGettingUserData.data);
      router.push(WebURLPathDictionary.root.dashboard._);
    } catch (error) {
      console.log(error);
      toast.error(languageManager.tError(error));
      router.push(
        WebURLPathDictionary.auth.redirect.error(
          "Redirect to backend error",
          languageManager.tError(error)
        )
      );
    }
  }, [
    location.search,
    router,
    languageManager,
    registerViaGoogleMutator,
    loginViaGoogleMutator,
    bindGoogleAccountMutator,
    userManager,
  ]);

  useEffect(() => {
    if (hasRendered.current) return;
    hasRendered.current = true;

    handleOAuthOnRedirect();
  }, [handleOAuthOnRedirect]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <div className="flex h-screen w-full items-center justify-center">
        <p>Validating Google Authentication...</p>
      </div>
    </Suspense>
  );
}

export default GoogleRedirectPage;
