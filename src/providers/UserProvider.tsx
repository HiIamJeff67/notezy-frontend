import { NotezyAPIError } from "@shared/api/exceptions";
import { ClientCommonExceptions } from "@shared/api/exceptions/clientCommon.exception";
import { useLogout } from "@shared/api/hooks/auth.hook";
import {
  queryFnGetMe,
  queryFnGetUserData,
} from "@shared/api/invokers/user.invoker";
import { queryFnGetMyAccount } from "@shared/api/invokers/userAccount.invoker";
import { queryFnGetMyInfo } from "@shared/api/invokers/userInfo.invoker";
import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { tKey } from "@shared/translations";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { User, UserAccount, UserData, UserInfo } from "@shared/types/user.type";
import React, { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useLanguage } from "@/hooks/useLanguage";
import { useLoading } from "@/hooks/useLoading";
import { getAuthorization } from "@/util/getAuthorization";

interface UserContextType {
  isOnline: boolean;
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

  const logoutMutator = useLogout();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
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

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enableAutoFetching]);

  const fetchUserData = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (!isOnline)
            throw new NotezyAPIError(ClientCommonExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await queryFnGetUserData({
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
        } catch (error) {
          if (
            !(error instanceof NotezyAPIError) ||
            error.unWrap.reason !==
              ClientCommonExceptions.NetworkRequired().reason
          ) {
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
          return;
        }
      }),
    [router, loadingManager]
  );

  /**
   * A method within useUser() to update the user data of the current user
   * @param fields Partial<UserData>
   * @returns a boolean value to indicate if the update operation is success or not
   * @description since if the previous user data is null, we can set it using a partial fields,
   * in this case it will just return false to indicate the update operation is failed.
   */
  const updateUserData = (fields: Partial<UserData>): boolean => {
    if (!isOnline) return false;
    if (userData === null) return false;
    setUserData(prev => (prev ? { ...prev, ...fields } : null));
    return userData !== null;
  };

  const fetchUser = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (!isOnline)
            throw new NotezyAPIError(ClientCommonExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await queryFnGetMe({
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
        } catch (error) {
          if (
            !(error instanceof NotezyAPIError) ||
            error.unWrap.reason !==
              ClientCommonExceptions.NetworkRequired().reason
          ) {
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
          return;
        }
      }),
    [router, loadingManager]
  );

  const updateUser = (fields: Partial<User>): boolean => {
    if (!isOnline) return false;
    if (user === null) return false;
    setUser(prev => (prev ? { ...prev, ...fields } : null));
    return user !== null;
  };

  const fetchUserInfo = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (!isOnline)
            throw new NotezyAPIError(ClientCommonExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await queryFnGetMyInfo({
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
        } catch (error) {
          if (
            !(error instanceof NotezyAPIError) ||
            error.unWrap.reason !==
              ClientCommonExceptions.NetworkRequired().reason
          ) {
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
          return;
        }
      }),
    [router, loadingManager]
  );

  const updateUserInfo = (fields: Partial<UserInfo>): boolean => {
    if (!isOnline) return false;
    if (userInfo === null) return false;
    setUserInfo(prev => (prev ? { ...prev, ...fields } : null));
    return userInfo !== null;
  };

  const fetchUserAccount = useCallback(
    async (accessToken: string | null) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (!isOnline)
            throw new NotezyAPIError(ClientCommonExceptions.NetworkRequired());

          const userAgent = navigator.userAgent;
          const response = await queryFnGetMyAccount({
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
        } catch (error) {
          if (
            !(error instanceof NotezyAPIError) ||
            error.unWrap.reason !==
              ClientCommonExceptions.NetworkRequired().reason
          ) {
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
          return;
        }
      }),
    [router, loadingManager]
  );

  const updateUserAccount = (fields: Partial<UserAccount>): boolean => {
    if (!isOnline) return false;
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
    if (isOnline) {
      await logoutMutator.mutateAsync({
        header: { userAgent: userAgent },
      });
    }
  }, []);

  const contextValue: UserContextType = {
    isOnline: isOnline,
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
