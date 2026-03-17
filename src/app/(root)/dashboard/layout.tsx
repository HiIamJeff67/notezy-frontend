"use client";

import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import WidgetProvider from "@/providers/WidgetProvider";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import React, { Suspense } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarManager = useSidebar();

  const getUserDataQuerier = useGetUserData();

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <StrictLoadingCover condition={getUserDataQuerier.isFetching} />
      {sidebarManager.isMobile && <SidebarTrigger className="fixed m-2" />}
      <WidgetProvider>{children}</WidgetProvider>
    </Suspense>
  );
};

export default DashboardLayout;
