import { useGetUserData } from "@shared/api/hooks/user.hook";
import React, { Suspense, useEffect, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { WidgetProvider } from "@/providers/WidgetProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarManager = useSidebar();
  const [hydrated, setHydrated] = useState(false);

  const getUserDataQuerier = useGetUserData();
  const shouldShowBlockingLoading = hydrated && getUserDataQuerier.isLoading;

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <StrictLoadingCover condition={shouldShowBlockingLoading} />
      {hydrated && sidebarManager.isMobile && (
        <SidebarTrigger className="fixed m-2" />
      )}
      <WidgetProvider>{children}</WidgetProvider>
    </Suspense>
  );
};

export default DashboardLayout;
