import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import { ClipboardList, SquarePen, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useModal, useRoutine } from "@/hooks";

interface RoutineTaskMenuItemProps {
  routineTask: RoutineTaskNode;
}

const RoutineTaskMenuItem = ({ routineTask }: RoutineTaskMenuItemProps) => {
  const modalManager = useModal();
  const routineManager = useRoutine();

  return (
    <SidebarMenuSubItem>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuSubButton
            size="sm"
            isActive={routineManager.selectedRoutineTaskId === routineTask.id}
            className="cursor-pointer select-none"
            onClick={() => routineManager.selectRoutineTask(routineTask.id)}
          >
            <ClipboardList />
            <span>{routineTask.title}</span>
          </SidebarMenuSubButton>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-36">
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                routineManager.selectRoutineTask(routineTask.id);
                routineManager.openInspector({
                  type: "routineTask",
                  id: routineTask.id,
                });
              }}
            >
              <SquarePen className="mr-2 size-4" />
              Open
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuLabel>Edit</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                modalManager.open("DeleteRoutineTaskDialog", {
                  routineTaskId: routineTask.id,
                  routineTaskTitle: routineTask.title,
                  onDeleted: routineManager.refresh,
                })
              }
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </SidebarMenuSubItem>
  );
};

export default RoutineTaskMenuItem;
