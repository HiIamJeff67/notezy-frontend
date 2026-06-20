import { RoutineTaskStatus } from "@shared/api/interfaces/enums";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import { SquarePen, Trash2 } from "lucide-react";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useModal, useStationRoutine } from "@/hooks";

interface RoutineTaskMenuItemProps {
  routineTask: RoutineTaskNode;
}

const RoutineTaskMenuItem = ({ routineTask }: RoutineTaskMenuItemProps) => {
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const statusDotClassName =
    routineTask.status === RoutineTaskStatus.Success
      ? "bg-emerald-500"
      : routineTask.status === RoutineTaskStatus.Fail ||
          routineTask.status === RoutineTaskStatus.Cancel
        ? "bg-destructive"
        : routineTask.status === RoutineTaskStatus.Running
          ? "bg-sky-500"
          : routineTask.status === RoutineTaskStatus.Pause
            ? "bg-amber-500"
            : "bg-muted-foreground";

  return (
    <SidebarMenuSubItem>
      <ContextMenu>
        <HoverCard openDelay={250} closeDelay={100}>
          <HoverCardTrigger asChild>
            <ContextMenuTrigger asChild>
              <SidebarMenuSubButton
                size="sm"
                isActive={
                  stationRoutineManager.selectedRoutineTaskId === routineTask.id
                }
                className="cursor-pointer select-none"
                onClick={() =>
                  stationRoutineManager.selectRoutineTask(routineTask.id)
                }
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${statusDotClassName}`}
                />
                <span>{routineTask.title}</span>
              </SidebarMenuSubButton>
            </ContextMenuTrigger>
          </HoverCardTrigger>
          <HoverCardContent
            side="right"
            align="start"
            sideOffset={8}
            collisionPadding={12}
            className="z-[120] w-72 rounded-sm p-3"
          >
            <div className="flex min-w-0 flex-col gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {routineTask.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {routineTask.status} · {routineTask.purpose}
                </p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                <div className="flex min-w-20 flex-col gap-1">
                  <span className="text-muted-foreground">Priority</span>
                  <span>{routineTask.priority}</span>
                </div>
                <div className="flex min-w-20 flex-col gap-1">
                  <span className="text-muted-foreground">Attempts</span>
                  <span>
                    {routineTask.attempts} / {routineTask.maxAttempts}
                  </span>
                </div>
                <div className="flex w-full flex-col gap-1">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span>{routineTask.scheduledAt.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <ContextMenuContent className="min-w-36">
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                stationRoutineManager.selectRoutineTask(routineTask.id);
                stationRoutineManager.openInspector({
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
                  onDeleted: stationRoutineManager.refresh,
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
