import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { useRegister } from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import { queryFnGetUserData } from "@shared/api/invokers/user.invoker";
import { WebURLPathDictionary } from "@shared/constants";
import { getOAuthGoogleSearchParamsString } from "@shared/lib/getURL";
import toast from "@shared/lib/toast";
import { CSRFTokenGenerator } from "@shared/lib/tokenGenerator";
import { tKey } from "@shared/translations";
import { Suspense, useCallback, useState, useTransition } from "react";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import AuthPanel from "@/components/panels/AuthPanel/AuthPanel";
import { useAppRouter, useLanguage, useUser } from "@/hooks";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";

const RegisterPage = () => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const userManager = useUser();

  const registerMutator = useRegister();
  const getUserDataQuerier = useGetUserData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isRegisterPending, startRegisterTransition] = useTransition();

  useRegisterLoadingDependencies(() => isRegisterPending);

  const handleRegisterOnSubmit = useCallback(async (): Promise<void> => {
    const register = async () => {
      if (password !== confirmPassword) {
        throw new Error(
          languageManager.t(
            tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
          )
        );
      }

      const userAgent = navigator.userAgent;
      const responseOfRegistering = await registerMutator.mutateAsync({
        header: {
          userAgent: userAgent,
        },
        body: {
          name: name,
          email: email,
          password: password,
        },
      });

      const responseOfGettingUserData = await getUserDataQuerier.fetch({
        header: { userAgent: navigator.userAgent },
        body: {},
      });

      if (
        responseOfGettingUserData?.refreshableTokens?.newAccessToken &&
        responseOfRegistering.data.accessToken !==
          responseOfGettingUserData.refreshableTokens.newAccessToken
      ) {
        throw new NotezyValidationError(
          ValidationClientException.InconsistentToken(
            responseOfRegistering.data.accessToken,
            responseOfGettingUserData.refreshableTokens.newAccessToken
          )
        );
      }

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      userManager.setUserData(responseOfGettingUserData.data);
      router.push(WebURLPathDictionary.root.dashboard._);
    };

    startRegisterTransition(
      async () =>
        await register().catch(error => {
          setPassword("");
          setConfirmPassword("");
          toast.error(languageManager.tError(error));
        })
    );
  }, [
    name,
    email,
    password,
    confirmPassword,
    languageManager,
    userManager,
    registerMutator,
    router,
  ]);

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingCover />}>
        <StrictLoadingCover condition={registerMutator.isPending} />
        <AuthPanel
          title={languageManager.t(tKey.auth.register)}
          subtitle={`${languageManager.t(
            tKey.auth.authenticationPanelSubtitle
          )} ${languageManager.t(tKey.auth.register)}`}
          inputs={[
            {
              title: languageManager.t(tKey.auth.name),
              placeholder: "ex. myName123",
              type: "text",
              value: name,
              onChange: setName,
              required: true,
            },
            {
              title: languageManager.t(tKey.auth.email),
              placeholder: "ex. example123@email.com",
              type: "email",
              value: email,
              onChange: setEmail,
              required: true,
            },
            {
              title: languageManager.t(tKey.auth.password),
              placeholder: "ex. example-password123(&@#$",
              type: "password",
              value: password,
              onChange: setPassword,
              required: true,
            },
            {
              title: languageManager.t(tKey.auth.confirmPassword),
              placeholder: "ex. example-password123(&@#$",
              type: "password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              required: true,
            },
          ]}
          submitButtonText={languageManager.t(tKey.auth.register)}
          onSubmit={handleRegisterOnSubmit}
          switchButtons={[
            {
              description: languageManager.t(tKey.auth.alreadyHaveAnAccount),
              title: languageManager.t(tKey.auth.login),
              onClick: () => {
                router.push(WebURLPathDictionary.auth.login);
              },
            },
          ]}
          oauthButtons={[
            {
              provider: "google",
              label: "Register via Google",
              onClick: () =>
                router.forceNavigate(
                  WebURLPathDictionary.oauth.google(
                    getOAuthGoogleSearchParamsString({
                      csrfToken: CSRFTokenGenerator.generate(),
                      action: "register",
                      from: router.getCurrentPath(),
                    })
                  )
                ),
            },
          ]}
          statusDetail={"System Ready"}
          isLoading={isRegisterPending}
        />
      </Suspense>
    </GridBackground>
  );
};

export default RegisterPage;
