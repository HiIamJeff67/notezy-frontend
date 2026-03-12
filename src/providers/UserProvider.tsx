"use client";

import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { getAuthorization } from "@/util/getAuthorization";
import { useLogout } from "@shared/api/hooks/auth.hook";
import { useGetMe, useGetUserData } from "@shared/api/hooks/user.hook";
import { useGetMyAccount } from "@shared/api/hooks/userAccount.hook";
import { useGetMyInfo } from "@shared/api/hooks/userInfo.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { tKey } from "@shared/translations";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { User, UserAccount, UserData, UserInfo } from "@shared/types/user.type";
import React, { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UserContextType {
  enableAutoFetching: boolean;
  setEnableAutoFetching: (state: boolean) => void;
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
  updateUserData: (fields: Partial<UserData>) => boolean;
  fetchUserData: (accessToken: string | null) => Promise<void>;

  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (fields: Partial<User>) => boolean;
  fetchUser: (accessToken: string | null) => Promise<void>;

  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  updateUserInfo: (fields: Partial<UserInfo>) => boolean;
  fetchUserInfo: (accessToken: string | null) => Promise<void>;

  userAccount: UserAccount | null;
  setUserAccount: (userAccount: UserAccount | null) => void;
  updateUserAccount: (fields: Partial<UserAccount>) => boolean;
  fetchUserAccount: (accessToken: string | null) => Promise<void>;

  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();

  const getUserDataQuerier = useGetUserData();
  const getUserQuerier = useGetMe();
  const getUserInfoQuerier = useGetMyInfo();
  const getUserAccountQuerier = useGetMyAccount();
  const logoutMutator = useLogout();

  const [enableAutoFetching, setEnableAutoFetching] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  // For maintaining the basic user data in the context
  useEffect(() => {
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    if (userData === null && accessToken && enableAutoFetching) {
      console.log("fetching user automatically...");
      fetchUserData(accessToken);
    }
  }, [enableAutoFetching]);

  const fetchUserData = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (accessToken === null) throw new Error(); // throw empty error to enter catch scope

          const userAgent = navigator.userAgent;
          const response = await getUserDataQuerier.queryAsync({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
            },
            body: {},
          });

          if (!response) {
            throw new Error(
              languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
            );
          }

          setUserData(response.data);
        } catch {
          if (
            !router.isSamePath(
              router.getCurrentPath(),
              WebURLPathDictionary.home
            )
          ) {
            toast.error(
              "Your account has been logged out, please try to log in again."
            );
            router.push(WebURLPathDictionary.auth.login);
          }
        }
      }),
    [router, loadingManager, getUserDataQuerier]
  );

  /**
   * A method within useUser() to update the user data of the current user
   * @param fields Partial<UserData>
   * @returns a boolean value to indicate if the update operation is success or not
   * @description since if the previous user data is null, we can set it using a partial fields,
   * in this case it will just return false to indicate the update operation is failed.
   */
  const updateUserData = (fields: Partial<UserData>): boolean => {
    if (userData === null) return false;
    setUserData(prev => (prev ? { ...prev, ...fields } : null));
    return userData !== null;
  };

  const fetchUser = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (accessToken === null) throw new Error("");

          const userAgent = navigator.userAgent;
          const response = await getUserQuerier.queryAsync({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
            },
          });

          if (!response) {
            throw new Error(
              languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
            );
          }

          setUser(response.data);
        } catch {
          if (
            !router.isSamePath(
              router.getCurrentPath(),
              WebURLPathDictionary.home
            )
          ) {
            toast.error(
              "Your account has been logged out, please try to log in again."
            );
            router.push(WebURLPathDictionary.auth.login);
          }
        }
      }),
    [router, loadingManager, getUserQuerier]
  );

  const updateUser = (fields: Partial<User>): boolean => {
    if (user === null) return false;
    setUser(prev => (prev ? { ...prev, ...fields } : null));
    return user !== null;
  };

  const fetchUserInfo = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (accessToken === null) throw new Error("");

          const userAgent = navigator.userAgent;
          const response = await getUserInfoQuerier.queryAsync({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
            },
          });

          if (!response) {
            throw new Error(
              languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
            );
          }

          setUserInfo(response.data);
        } catch {
          if (
            !router.isSamePath(
              router.getCurrentPath(),
              WebURLPathDictionary.home
            )
          ) {
            toast.error(
              "Your account has been logged out, please try to log in again."
            );
            router.push(WebURLPathDictionary.auth.login);
          }
        }
      }),
    [router, loadingManager, getUserInfoQuerier]
  );

  const updateUserInfo = (fields: Partial<UserInfo>): boolean => {
    if (userInfo === null) return false;
    setUserInfo(prev => (prev ? { ...prev, ...fields } : null));
    return userInfo !== null;
  };

  const fetchUserAccount = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (accessToken === null) throw new Error("");

          const userAgent = navigator.userAgent;
          const response = await getUserAccountQuerier.queryAsync({
            header: {
              userAgent: userAgent,
              authorization: getAuthorization(accessToken),
            },
          });

          if (!response) {
            throw new Error(
              languageManager.t(tKey.error.apiError.getUser.failedToGetUser)
            );
          }

          setUserAccount(response.data);
        } catch {
          if (
            !router.isSamePath(
              router.getCurrentPath(),
              WebURLPathDictionary.home
            )
          ) {
            toast.error(
              "Your account has been logged out, please try to log in again."
            );
            router.push(WebURLPathDictionary.auth.login);
          }
        }
      }),
    [router, loadingManager, getUserAccountQuerier]
  );

  const updateUserAccount = (fields: Partial<UserAccount>): boolean => {
    if (userAccount === null) return false;
    setUserAccount(prev => (prev ? { ...prev, ...fields } : null));
    return userAccount !== null;
  };

  const logout = useCallback(async () => {
    setUserData(null);
    setUser(null);
    setUserInfo(null);
    setUserAccount(null);
    const userAgent = navigator.userAgent;
    // logout without showing error if there is one
    await logoutMutator.mutateAsync({
      header: { userAgent: userAgent },
    });
  }, []);

  const contextValue: UserContextType = {
    enableAutoFetching: enableAutoFetching,
    setEnableAutoFetching: setEnableAutoFetching,
    userData: userData,
    setUserData: setUserData,
    updateUserData: updateUserData,
    fetchUserData: fetchUserData,

    user: user,
    setUser: setUser,
    fetchUser: fetchUser,
    updateUser: updateUser,

    userInfo: userInfo,
    setUserInfo: setUserInfo,
    fetchUserInfo: fetchUserInfo,
    updateUserInfo: updateUserInfo,

    userAccount: userAccount,
    setUserAccount: setUserAccount,
    fetchUserAccount: fetchUserAccount,
    updateUserAccount: updateUserAccount,

    logout: logout,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
