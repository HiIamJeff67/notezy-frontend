"use client";

import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { Button } from "@/components/ui/button";
import { useAppRouter } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RedirectErrorPage() {
  const searchParams = useSearchParams();
  const router = useAppRouter();
  const title = searchParams.get("title") || "重導向錯誤";
  const description = searchParams.get("description") || "重導向時發生未知錯誤";

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-500">{title}</h1>
        <p className="text-gray-600">{description}</p>
        <div className="flex justify-center items-center gap-4">
          <Button variant="outline" onClick={() => {}}>
            聯絡我們
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(WebURLPathDictionary.home)}
          >
            返回首頁
          </Button>
        </div>
      </div>
    </Suspense>
  );
}

export default RedirectErrorPage;
