"use client";

import { AppSidebar } from "@/components/AppSidebar/AppSidebar";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useLoading, useUserData } from "@/hooks";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { queryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const getUserDataQuerier = useGetUserData();

  useEffect(() => {
    if (userDataManager.userData === null) {
      const tryGetUser = async () => {
        try {
          const userAgent = navigator.userAgent;
          const responseOfGettingUserData = await getUserDataQuerier.queryAsync(
            {
              header: {
                userAgent: userAgent,
              },
              body: {},
            }
          );

          if (!responseOfGettingUserData) {
            throw new Error(
              languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
            );
          }

          userDataManager.setUserData(responseOfGettingUserData.data);
          queryClient.setQueryData(
            queryKeys.user.data(),
            responseOfGettingUserData
          );
        } catch {
          toast.error(
            "Your account has been logged out, please try to log in again."
          );
          router.push(WebURLPathDictionary.auth.login);
        }
      };

      tryGetUser();
    }

    loadingManager.setIsLoading(false);
    loadingManager.clearInactiveStrictLoadingStates();
    loadingManager.clearInactiveLaxLoadingStates();
  }, []);

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <StrictLoadingOutlay
        condition={getUserDataQuerier.isFetching || router.isNavigating}
      />
      <div className="w-full h-full p-0 m-0">
        <AppSidebar />
        <SidebarTrigger className="fixed top-2 left-2" />
        <div className="fixed top-2 right-2 z-50"></div>
      </div>
    </Suspense>
  );
};

export default DashboardPage;
