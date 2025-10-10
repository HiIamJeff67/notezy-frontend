"use client";

import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useGetUserData } from "@shared/api/hooks/user.hook";
import React, { Suspense } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarManager = useSidebar();

  const getUserDataQuerier = useGetUserData();

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <StrictLoadingOutlay condition={getUserDataQuerier.isFetching} />
      {sidebarManager.isMobile && <SidebarTrigger className="fixed m-2" />}
      {children}
    </Suspense>
  );
};

export default DashboardLayout;
