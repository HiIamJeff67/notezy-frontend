import { Collapsible } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Collapsible>
      <Sidebar className="block">
        <SidebarHeader className="flex flex-row justify-end">
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>
    </Collapsible>
  );
}
