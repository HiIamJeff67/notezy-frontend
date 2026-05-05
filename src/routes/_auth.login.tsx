import { fetchGetUserData } from "@shared/api/fetches/user.fetch";
import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/_auth/login")({
  loader: async () => {
    const response = await fetchGetUserData({});
    if (response && response.success) {
      throw redirect({ to: "/dashboard", replace: true });
    }
    return {};
  },
  component: LoginPage,
});
