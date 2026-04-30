import { useEffect } from "react";
import { useLoading } from "./useLoading";

export const useRegisterLoadingDependencies = (
  ...getters: Array<() => boolean>
) => {
  const { registerLoadingDependencies } = useLoading();

  useEffect(() => {
    const unregister = registerLoadingDependencies(...getters);
    return unregister;
  }, getters);
};
