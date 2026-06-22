import { RoutineStatus } from "@shared/api/interfaces/enums";
import type { RoutineNode } from "@shared/types/routineNode.type";
import { cn } from "@shared/util/utils";
import { Bookmark } from "lucide-react";
import type { PointerEvent } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const RoutineTrain = ({
  routine,
  left,
  top,
  width,
  stationName,
  tagNames,
  onOpen,
  onResizeStart,
  isResizing,
}: {
  routine: RoutineNode;
  left: number;
  top: number;
  width: number;
  stationName: string;
  tagNames: string[];
  onOpen: () => void;
  onResizeStart: (
    edge: "start" | "end",
    event: PointerEvent<HTMLSpanElement>
  ) => void;
  isResizing: boolean;
}) => {
  return (
    <HoverCard openDelay={180} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            "group absolute flex h-7 min-w-0 items-center gap-1.5 overflow-hidden",
            "rounded-sm border border-input bg-muted px-2 text-left text-xs shadow-sm hover:bg-input/50",
            routine.status === RoutineStatus.Completed &&
              "text-emerald-700 dark:text-emerald-300",
            routine.status === RoutineStatus.OverDue && "text-destructive",
            "select-none",
            isResizing && "ring-1 ring-primary/50"
          )}
          style={{
            left,
            top,
            width,
          }}
          onClick={onOpen}
        >
          <span
            className="
              absolute inset-y-0 left-0 z-10 w-2 cursor-ew-resize
              border-l-2 border-primary/60 opacity-0 transition-opacity
              group-hover:opacity-100
            "
            onPointerDown={event => {
              event.preventDefault();
              event.stopPropagation();
              onResizeStart("start", event);
            }}
          />
          <span
            className="
              absolute inset-y-0 right-0 z-10 w-2 cursor-ew-resize
              border-r-2 border-primary/60 opacity-0 transition-opacity
              group-hover:opacity-100
            "
            onPointerDown={event => {
              event.preventDefault();
              event.stopPropagation();
              onResizeStart("end", event);
            }}
          />
          {routine.isPinned && (
            <Bookmark className="size-3 shrink-0 fill-muted-foreground/20 text-muted-foreground" />
          )}
          <span className="truncate">{routine.title}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        side="bottom"
        className="w-80 rounded-sm p-3"
      >
        <div className="space-y-2">
          <div>
            <p className="truncate text-sm font-medium">{routine.title}</p>
            <p className="text-xs text-muted-foreground">{stationName}</p>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Status</span>
            <span>{routine.status}</span>
            <span className="text-muted-foreground">Start</span>
            <span>{routine.scheduledStartAt.toLocaleString()}</span>
            <span className="text-muted-foreground">End</span>
            <span>{routine.scheduledEndAt.toLocaleString()}</span>
            <span className="text-muted-foreground">Tags</span>
            <span>
              {tagNames.length > 0 ? tagNames.join(", ") : "Untagged"}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default RoutineTrain;
