import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/pages/root/admin/AdminPage";

export const Route = createFileRoute("/_root/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AdminPage />;
}
