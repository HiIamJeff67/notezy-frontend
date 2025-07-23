"use client";

import { Register } from "@/api/auth.api";
import AuthPanel from "@/components/AuthPanel";
import GridBlackBackground from "@/components/GridBackground";
import { tKey } from "@/global/translations";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const loadingManager = useLoading();
  const router = useAppRouter();
  const languageManager = useLanguage();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  const isValidName = function (name: string): boolean {
    const trimName: string = name.replaceAll(" ", "");
    if (trimName === "") return false;

    let hasEnglishLetter = false,
      hasDigit = false;

    Array.from(name).forEach(l => {
      if (/[a-zA-Z]/.test(l)) hasEnglishLetter = true;
      else if (/[0-9]/.test(l)) hasDigit = true;
      if (hasEnglishLetter && hasDigit) return true;
    });

    return hasEnglishLetter && hasDigit;
  };

  const isValidEmail = function (email: string): boolean {
    const trimEmail: string = email.replaceAll(" ", "");
    return trimEmail !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = function (password: string): boolean {
    if (password.length < 8) return false;

    let hasUpperCaseLetter: boolean = false,
      hasLowerCaseLetter: boolean = false,
      hasDigit: boolean = false,
      hasSpecialCharacter: boolean = false;

    Array.from(password).forEach(l => {
      if (/[ ]/.test(l)) return false;
      else if (/[a-z]/.test(l)) hasLowerCaseLetter = true;
      else if (/[A-Z]/.test(l)) hasUpperCaseLetter = true;
      else if (/[0-9]/.test(l)) hasDigit = true;
      else if (/[`~!@#$%^&*()-_+=]/.test(l)) hasSpecialCharacter = true;
    });

    return (
      hasUpperCaseLetter &&
      hasLowerCaseLetter &&
      hasDigit &&
      hasSpecialCharacter
    );
  };

  const handlingRegisterSubmit = async function (): Promise<void> {
    if (!isValidName(name)) {
      toast.error(languageManager.t(tKey.auth.pleaseInputValidName));
      return;
    } else if (!isValidEmail(email)) {
      toast.error(languageManager.t(tKey.auth.pleaseInputValidEmail));
      return;
    } else if (password !== confirmPassword) {
      toast.error(
        languageManager.t(
          tKey.auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch
        )
      );
      return;
    } else if (!isValidPassword(password)) {
      toast.error(languageManager.t(tKey.auth.pleaseInputStrongPassword));
      return;
    }

    const userAgent = navigator.userAgent;
    const response = await Register({
      name: name,
      email: email,
      password: password,
      userAgent: userAgent,
    });
    console.log(response);

    /* storing user data and navigate to dashboard */
  };

  return (
    <GridBlackBackground>
      <div>
        <AuthPanel
          title={languageManager.t(tKey.auth.register)}
          subtitle={languageManager.t(tKey.auth.authenticationPanelSubtitle)}
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
          onSubmit={handlingRegisterSubmit}
          switchButtons={[
            {
              description: languageManager.t(tKey.auth.alreadyHaveAnAccount),
              title: languageManager.t(tKey.auth.login),
              onClick: () => {
                loadingManager.setIsLoading(true);
                router.push("/login");
              },
            },
          ]}
          statusDetail={"System Ready"}
          isLoading={loadingManager.isLoading}
        />
      </div>
    </GridBlackBackground>
  );
};

export default RegisterPage;
