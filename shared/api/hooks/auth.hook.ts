import { useApolloClient } from "@apollo/client/react";
import {
  mutationFnDeleteMe,
  mutationFnForgetPassword,
  mutationFnLogin,
  mutationFnLoginViaGoogle,
  mutationFnLogout,
  mutationFnRegister,
  mutationFnRegisterViaGoogle,
  mutationFnResetEmail,
  mutationFnResetMe,
  mutationFnSendAuthCode,
  mutationFnValidateEmail,
} from "@shared/api/functions/auth.function";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { type QueryKey, useMutation } from "@tanstack/react-query";

export const useRegister = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRegister,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "REGISTER_HOOK" as const,
  };
};

export const useRegisterViaGoogle = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRegisterViaGoogle,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "REGISTER_VIA_GOOGLE_HOOK" as const,
  };
};

export const useLogin = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnLogin,
    onSuccess: (_response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "LOGIN_HOOK" as const,
  };
};

export const useLoginViaGoogle = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnLoginViaGoogle,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "LOGIN_VIA_GOOGLE_HOOK" as const,
  };
};

export const useLogout = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnLogout,
    onSuccess: _ => {
      queryClient.removeQueries();
      apolloClient.clearStore();
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "LOGOUT_HOOK" as const,
  };
};

export const useSendAuthCode = () => {
  const mutation = useMutation({
    mutationFn: mutationFnSendAuthCode,
    onSuccess: (_, __) => {},
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "SEND_AUTH_CODE_HOOK" as const,
  };
};

export const useValidateEmail = () => {
  const mutation = useMutation({
    mutationFn: mutationFnValidateEmail,
    onSuccess: (_, __) => {},
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "VALIDATE_EMAIL_HOOK" as const,
  };
};

export const useResetEmail = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnResetEmail,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "RESET_EMAIL_HOOK" as const,
  };
};

export const useForgetPassword = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnForgetPassword,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "FORGET_PASSWORD_HOOK" as const,
  };
};

export const useResetMe = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnResetMe,
    onSuccess: (_, __) => {
      apolloClient.cache.evict({ fieldName: "searchRootShelves" });
      const targetKeys: QueryKey[] = [
        queryKeys.user.data(),
        queryKeys.userInfo.all(),
        queryKeys.rootShelf.all(),
        queryKeys.subShelf.all(),
        queryKeys.material.all(),
        queryKeys.blockPack.all(),
        queryKeys.blockGroup.all(),
        queryKeys.block.all(),
        queryKeys.blockPackWithBlockGroup.all(),
        queryKeys.blockGroupWithBlock.all(),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "RESET_ME_HOOK" as const,
  };
};

export const useDeleteMe = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMe,
    onSuccess: _ => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_ME_HOOK" as const,
  };
};
