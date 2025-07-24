import { UserDataContext } from "@/providers/UserDataProvider";
import { useContext } from "react";

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
};
