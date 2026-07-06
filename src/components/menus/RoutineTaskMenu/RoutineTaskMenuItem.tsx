import { RoutineTaskStatus } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import {
  Copy,
  HistoryIcon,
  Pause,
  Play,
  SquarePen,
  Trash2,
} from "lucide-react";
import ContextMenuCopyItems from "@/components/commons/ContextMenuCopyItems/ContextMenuCopyItems";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
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
import { useLanguage, useModal, useStationRoutine } from "@/hooks";

interface RoutineTaskMenuItemProps {
  routineTask: RoutineTaskNode;
}

const RoutineTaskMenuItem = ({ routineTask }: RoutineTaskMenuItemProps) => {
  const languageManager = useLanguage();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const statusDotClassName =
    routineTask.status === RoutineTaskStatus.Running
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
            className="z-[90] w-72 rounded-sm p-3 text-xs"
          >
            <HoverDetailCard
              title={routineTask.title}
              subtitle="Routine Task"
              id={routineTask.id}
              rows={[
                { field: "Status", value: routineTask.status },
                { field: "Purpose", value: routineTask.purpose },
                { field: "Priority", value: routineTask.priority },
                {
                  field: "Attempts",
                  value: `${routineTask.attempts} / ${routineTask.maxAttempts}`,
                },
                {
                  field: "Next",
                  value: new Date(routineTask.nextScheduledAt).toLocaleString(),
                },
                {
                  field: "System",
                  value: new Date(routineTask.scheduledAt).toLocaleString(),
                },
              ]}
            />
          </HoverCardContent>
        </HoverCard>
        <ContextMenuContent className="min-w-36">
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() =>
                modalManager.open("RoutineTaskRecordDialog", {
                  routineTitle: routineTask.title,
                  routineTaskIds: [routineTask.id],
                })
              }
            >
              <HistoryIcon className="mr-2 size-4" />
              View all records
            </ContextMenuItem>
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
              Open in Inspector
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuLabel>Add</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                void stationRoutineManager
                  .duplicateRoutineTask(routineTask.id)
                  .catch(error => toast.error(languageManager.tError(error)));
              }}
            >
              <Copy className="mr-2 size-4" />
              Duplicate
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuLabel>Edit</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuCopyItems
              id={routineTask.id}
              name={routineTask.title}
              nameLabel="Title"
            />
            {routineTask.status === RoutineTaskStatus.Idle ? (
              <ContextMenuItem
                onClick={() => {
                  void stationRoutineManager
                    .pauseRoutineTask(routineTask.id)
                    .catch(error => toast.error(languageManager.tError(error)));
                }}
              >
                <Pause className="mr-2 size-4" />
                Pause
              </ContextMenuItem>
            ) : null}
            {routineTask.status === RoutineTaskStatus.Pause ? (
              <ContextMenuItem
                onClick={() => {
                  void stationRoutineManager
                    .resumeRoutineTask(routineTask.id)
                    .catch(error => toast.error(languageManager.tError(error)));
                }}
              >
                <Play className="mr-2 size-4" />
                Resume
              </ContextMenuItem>
            ) : null}
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
