import { useApolloClient } from "@apollo/client/react";
import { AuthAdaptors } from "@shared/api/adaptors/auth.adaptor";
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
} from "@shared/api/invokers/auth.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { type QueryKey, useMutation } from "@tanstack/react-query";

export const useRegister = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRegister,
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.data?.accessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.embedded?.embeddedPublicId
      );
      await AuthAdaptors.syncLocaldbAfterRegister(request, response);
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.data?.accessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.embedded?.embeddedPublicId
      );
      await AuthAdaptors.syncLocaldbAfterRegisterViaGoogle(response);
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.data?.accessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.embedded?.embeddedPublicId
      );
      await AuthAdaptors.syncLocaldbAfterLogin(response);
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.data?.accessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.embedded?.embeddedPublicId
      );
      await AuthAdaptors.syncLocaldbAfterLoginViaGoogle(response);
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
    onSuccess: async (response, request) => {
      await AuthAdaptors.syncLocaldbAfterLogout(response);
      LocalStorageManipulator.removeItem(
        LocalStorageKey.accessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.removeItem(
        SessionStorageKey.csrfToken,
        response.embedded.embeddedPublicId
      );
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
    },
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      await AuthAdaptors.syncLocaldbAfterValidateEmail(response);
    },
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      await AuthAdaptors.syncLocaldbAfterResetEmail(request, response);
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
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
    onSuccess: async (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken ??
          response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      await AuthAdaptors.syncLocaldbAfterResetMe(response);
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
    onSuccess: async (response, request) => {
      await AuthAdaptors.syncLocaldbAfterDeleteMe(response);
      LocalStorageManipulator.removeItem(
        LocalStorageKey.accessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.removeItem(
        SessionStorageKey.csrfToken,
        response.embedded.embeddedPublicId
      );
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
