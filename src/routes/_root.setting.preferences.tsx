import { createFileRoute } from "@tanstack/react-router";
import PreferencesPage from "@/pages/root/setting/preferences/PreferencesPage";

export const Route = createFileRoute("/_root/setting/preferences")({
  component: PreferencesPage,
});
