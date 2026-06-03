import { createFileRoute } from "@tanstack/react-router";
import RoutinesPage from "@/pages/root/routines/RoutinesPage";

export const Route = createFileRoute("/_root/routines/")({
  component: RoutinesPage,
});
