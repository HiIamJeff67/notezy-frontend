import { fetchGetUserData } from "@shared/api/fetches/user.fetch";
import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/_auth/login")({
  loader: async () => {
    try {
      // const userData = await fetchGetUserData({
      // });
    } catch (error) {}
  },
  component: LoginPage,
});
