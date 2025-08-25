import AvatarIcon from "@/components/icons/AvatarIcon";
import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUserData } from "@/hooks/useUserData";
import React from "react";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const userDataManager = useUserData();

  return (
    <Collapsible>
      <Sidebar className="block p-0 m-0">
        <SidebarHeader className="flex flex-col justify-center items-center p-2">
          <div className="w-full flex justify-between items-center bg-muted hover:bg-primary/50 rounded-sm pr-1">
            <Button className="w-9/10 bg-transparent hover:bg-transparent overflow-hidden">
              <p>Select or create a shelf to start</p>
            </Button>
            <SidebarTrigger className="h-full bg-transparent" />
          </div>
          <Button className="w-full bg-muted hover:bg-primary/40 flex justify-between items-center">
            Daily Routine
          </Button>
          <Button className="w-full bg-muted hover:bg-primary/40 flex justify-between items-center">
            Community
          </Button>
          <Button className="w-full bg-muted hover:bg-primary/40 flex justify-between items-center">
            Upgrade
          </Button>
        </SidebarHeader>
        <SidebarSeparator className="w-full m-0 p-0" />
        <SidebarContent>{children}</SidebarContent>
        <SidebarSeparator className="w-full m-0 p-0" />
        <SidebarFooter className="flex flex-col justify-center items-center p-2">
          <div className="flex items-center space-x-3 px-3 py-3">
            <AvatarIcon avatarURL="" size={24} />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {userDataManager.userData?.name || "User Name"}
              </span>
              <span className="text-xs text-muted-foreground">
                {userDataManager.userData?.email || "user@example.com"}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </Collapsible>
  );
}
