import { createFileRoute } from "@tanstack/react-router";
import RoutinesIndexPage from "@/pages/root/routines/RoutinesIndexPage";

export const Route = createFileRoute("/_root/routines/")({
  ssr: false,
  component: RoutinesIndexPage,
});
