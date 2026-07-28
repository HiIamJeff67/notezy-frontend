import {
  useLoginViaGoogle,
  useRegisterViaGoogle,
} from "@shared/api/hooks/auth.hook";
import { useBindGoogleAccount } from "@shared/api/hooks/userAccount.hook";
import { queryFnGetUserData } from "@shared/api/invokers/user.invoker";
import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { RedirectState } from "@shared/types/redirectState.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import { useLocation } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useAppRouter, useLoading, useUser } from "@/hooks";
import {
  getPreferredStartPath,
  useLocalPreferences,
} from "@/hooks/localPreferences";
import { translateError } from "@/i18n/error";

function GoogleRedirectPage() {
  const location = useLocation();

  const router = useAppRouter();
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const userManager = useUser();

  const registerViaGoogleMutator = useRegisterViaGoogle();
  const loginViaGoogleMutator = useLoginViaGoogle();
  const bindGoogleAccountMutator = useBindGoogleAccount();

  const hasRendered = useRef(false);

  const performGoogleOAuthAction = useCallback(
    async (
      action: "register" | "login" | "binding",
      code: string
    ): Promise<string | null> => {
      const userAgent = navigator.userAgent;

      switch (action) {
        case "register": {
          const response = await registerViaGoogleMutator.mutateAsync({
            header: { userAgent },
            body: { authorizationCode: code },
          });
          return response.data.accessToken;
        }
        case "login": {
          const response = await loginViaGoogleMutator.mutateAsync({
            header: { userAgent },
            body: { authorizationCode: code },
          });
          return response.data.accessToken;
        }
        case "binding": {
          const accessToken = LocalStorageManipulator.getItemByKey(
            LocalStorageKey.accessToken
          );
          await bindGoogleAccountMutator.mutateAsync({
            header: {
              userAgent,
              authorization: getAuthorization(accessToken),
            },
            body: { authorizationCode: code },
          });
          return accessToken;
        }
      }
    },
    [bindGoogleAccountMutator, loginViaGoogleMutator, registerViaGoogleMutator]
  );

  const handleOAuthOnRedirect = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (code === null || error !== null) {
      toast.error(
        t("workspace.notifications.googleAuthError", {
          error: error ?? t("error.encounterUnknownError"),
        })
      );
      router.push(
        WebURLPathDictionary.auth.redirect.error(
          t("workspace.pages.googleAuthFailed"),
          translateError(error, t)
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

      userManager.setEnableInitialFetching(false);
      await performGoogleOAuthAction(action, code).then(async accessToken => {
        const responseOfGettingUserData = await queryFnGetUserData({
          header: {
            userAgent: navigator.userAgent,
            authorization: getAuthorization(accessToken),
          },
        });

        userManager.setUserData(responseOfGettingUserData.data);
        userManager.setEnableInitialFetching(true);
        router.push(getPreferredStartPath(preferences));
      });
    } catch (error) {
      console.debug(error);
      toast.error(translateError(error, t));
      router.push(
        WebURLPathDictionary.auth.redirect.error(
          t("workspace.pages.googleRedirectFailed"),
          translateError(error, t)
        )
      );
    }
  }, [
    location.search,
    router,
    preferences,
    t,
    userManager,
    performGoogleOAuthAction,
  ]);

  useEffect(() => {
    if (hasRendered.current) return;
    hasRendered.current = true;

    handleOAuthOnRedirect();
  }, [handleOAuthOnRedirect]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <div className="flex h-screen w-full items-center justify-center">
        <p>{t("workspace.pages.validatingGoogle")}</p>
      </div>
    </Suspense>
  );
}

export default GoogleRedirectPage;
