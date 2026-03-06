"use client";

import { useAppRouter } from "@/hooks";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function GoogleRedirectPageContent() {
  const searchParams = useSearchParams();
  const router = useAppRouter();
  const effectRan = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (effectRan.current || !code || error) {
      if (error) {
        console.error("Google Auth Error:", error);
        router.push("/login?error=google_auth_failed");
      }
      return;
    }

    effectRan.current = true; // 標記為已執行

    const loginWithGoogle = async () => {
      try {
        console.log("Sending code to backend:", code);

        const res = await fetch(
          "http://localhost:8080/api/v1/auth/google/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ authCode: code }),
          }
        );

        if (!res.ok) {
          throw new Error("Backend validation failed");
        }

        const data = await res.json();
        localStorage.setItem("accessToken", data.token); // 或存入 cookie / zustand

        router.push("/dashboard");
      } catch (err) {
        console.error("Login failed:", err);
        router.push("/login?error=backend_validation_failed");
      }
    };

    loginWithGoogle();
  }, [searchParams, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>正在驗證 Google 登入中...</p>
    </div>
  );
}

export default function GoogleRedirectPage() {
  return (
    <Suspense fallback={<div>Loading authn data...</div>}>
      <GoogleRedirectPageContent />
    </Suspense>
  );
}
