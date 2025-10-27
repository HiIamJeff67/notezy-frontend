"use client";

import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { getAuthorization } from "@/util/getAuthorization";
import { useLogout } from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { UserData } from "@shared/types/models";
import React, { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UserDataContextType {
  enableAutoFetching: boolean;
  setEnableAutoFetching: (state: boolean) => void;
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
  updateUserData: (fields: Partial<UserData>) => boolean;
  logout: () => void;
}

export const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const UserDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();

  const getUserDataQuerier = useGetUserData();
  const logoutMutator = useLogout();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [enableAutoFetching, setEnableAutoFetching] = useState<boolean>(false);

  // For maintaining the basic user data in the context
  useEffect(() => {
    if (userData === null && enableAutoFetching) {
      loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const accessToken = localStorage.getItemByKey(
            LocalStorageKeys.accessToken
          );
          const responseOfGettingUserData = await getUserDataQuerier.queryAsync(
            {
              header: {
                userAgent: userAgent,
                authorization: getAuthorization(accessToken),
              },
              body: {},
            }
          );

          if (!responseOfGettingUserData) {
            throw new Error(
              languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
            );
          }

          setUserData(responseOfGettingUserData.data);
        } catch {
          toast.error(
            "Your account has been logged out, please try to log in again."
          );
          router.push(WebURLPathDictionary.auth.login);
        }
      });
    }
  }, []);

  /**
   * A method within useUserData() to update the user data of the current user
   * @param fields Partial<UserData>
   * @returns a boolean value to indicate if the update operation is success or not
   * @description since if the previous user data is null, we can set it using a partial fields,
   * in this case it will just return false to indicate the update operation is failed.
   */
  const updateUserData = (fields: Partial<UserData>): boolean => {
    if (userData == null) return false;
    setUserData(prev => (prev ? { ...prev, ...fields } : null));
    return true;
  };

  const logout = useCallback(async () => {
    const userAgent = navigator.userAgent;
    // logout without showing error if there is one
    await logoutMutator.mutateAsync({
      header: { userAgent: userAgent },
    });
    setUserData(null);
  }, [logoutMutator, setUserData]);

  const contextValue: UserDataContextType = {
    enableAutoFetching: enableAutoFetching,
    setEnableAutoFetching: setEnableAutoFetching,
    userData: userData,
    setUserData: setUserData,
    updateUserData: updateUserData,
    logout: logout,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};
