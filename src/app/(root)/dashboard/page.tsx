"use client";

import { useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { useEffect } from "react";

const DashboardPage = () => {
  const loadingManager = useLoading();
  const userDataManager = useUserData();

  useEffect(() => {
    loadingManager.setIsLoading(false);
    console.log(userDataManager.userData);
  }, []);

  return <div>DashboardPage</div>;
};

export default DashboardPage;
