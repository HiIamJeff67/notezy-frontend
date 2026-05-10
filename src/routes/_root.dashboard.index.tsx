import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/pages/root/dashboard/DashboardPage";

export const Route = createFileRoute("/_root/dashboard/")({
  component: DashboardPage,
});
