"use client";

import { UserData } from "@/shared/types/userData.type";
import React, { createContext, useState } from "react";
import toast from "react-hot-toast";

interface UserDataContextType {
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
  const [userData, setUserData] = useState<UserData | null>(null);

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

  const logout = () => {
    /* may run the API to further completely logout the current user */
    toast.success("Logout successfully");
    setUserData(null);
  };

  const contextValue: UserDataContextType = {
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
