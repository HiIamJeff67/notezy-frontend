import { createFileRoute } from "@tanstack/react-router";
import AccountSettingsPage from "@/pages/root/setting/account/AccountSettingsPage";

export const Route = createFileRoute("/_root/setting/account")({
  component: AccountSettingsPage,
});
