import { Collapsible } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Collapsible>
      <Sidebar>
        <SidebarHeader className="flex flex-row justify-end">
          <SidebarTrigger className="" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </Collapsible>
  );
}
