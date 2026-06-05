import { cn } from "@shared/util/utils";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  ListFilter,
  RefreshCw,
  RotateCcw,
  Search,
  Tags,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRoutine } from "@/hooks";

const RoutineScopeBar = () => {
  const routineOverviewer = useRoutine();

  return (
    <div
      className="
        flex h-full w-full min-w-0 items-center justify-between gap-3
        border-b border-border/40 bg-background/75 px-3 backdrop-blur-md
      "
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="relative h-8 w-[220px] shrink-0">
          <Search className="-translate-y-1/2 pointer-events-none absolute left-2.5 top-1/2 size-4 text-muted-foreground" />
          <Input
            value={routineOverviewer.scope.query}
            onChange={event =>
              routineOverviewer.setScopeQuery(event.currentTarget.value)
            }
            placeholder="Search routines"
            className="
              h-8 rounded-sm border-border/60 bg-background/60 pl-8
              text-sm shadow-none
            "
          />
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/60" />

        <div className="flex min-w-0 items-center gap-1.5">
          <Warehouse className="size-4 shrink-0 text-muted-foreground" />
          <ToggleGroup
            type="multiple"
            value={routineOverviewer.scope.stationIds}
            onValueChange={values =>
              routineOverviewer.setStationScope(
                values as typeof routineOverviewer.scope.stationIds
              )
            }
            className="max-w-[28vw] justify-start overflow-x-auto"
          >
            {routineOverviewer.stations.map(station => (
              <ToggleGroupItem
                key={station.id}
                value={station.id}
                size="sm"
                variant="outline"
                className="
                  h-7 shrink-0 rounded-sm border-border/60 bg-background/40
                  px-2 text-xs data-[state=on]:border-primary/50
                  data-[state=on]:bg-primary/10
                "
                onClick={() => routineOverviewer.selectStation(station.id)}
              >
                <span className="max-w-28 truncate">
                  {station.icon}
                  {station.icon ? " " : ""}
                  {station.name}
                </span>
              </ToggleGroupItem>
            ))}
            {routineOverviewer.stations.length === 0 && (
              <span className="whitespace-nowrap px-2 text-xs text-muted-foreground">
                No stations
              </span>
            )}
          </ToggleGroup>
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/60" />

        <div className="flex min-w-0 items-center gap-1.5">
          <Tags className="size-4 shrink-0 text-muted-foreground" />
          <ToggleGroup
            type="multiple"
            value={routineOverviewer.scope.routineTagIds}
            onValueChange={values =>
              routineOverviewer.setRoutineTagScope(
                values as typeof routineOverviewer.scope.routineTagIds
              )
            }
            className="max-w-[22vw] justify-start overflow-x-auto"
          >
            {routineOverviewer.routineTags.map(routineTag => (
              <ToggleGroupItem
                key={routineTag.id}
                value={routineTag.id}
                size="sm"
                variant="outline"
                className="
                  h-7 shrink-0 rounded-sm border-border/60 bg-background/40
                  px-2 text-xs data-[state=on]:border-primary/50
                  data-[state=on]:bg-primary/10
                "
                onClick={() =>
                  routineOverviewer.selectRoutineTag(routineTag.id)
                }
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: routineTag.color }}
                />
                <span className="max-w-24 truncate">{routineTag.name}</span>
              </ToggleGroupItem>
            ))}
            {routineOverviewer.routineTags.length === 0 && (
              <span className="whitespace-nowrap px-2 text-xs text-muted-foreground">
                No tags
              </span>
            )}
          </ToggleGroup>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 shrink-0 rounded-sm border-border/60 bg-background/40 px-2 text-xs",
              routineOverviewer.scope.showUntaggedRoutines &&
                "border-primary/50 bg-primary/10"
            )}
            onClick={routineOverviewer.toggleUntaggedRoutines}
          >
            Untagged
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:flex">
          <StatusPill
            icon={<ListFilter className="size-3.5" />}
            label={`${routineOverviewer.statusSummary.visibleRoutines}/${routineOverviewer.statusSummary.totalRoutines}`}
          />
          <StatusPill
            icon={<CalendarClock className="size-3.5" />}
            label={routineOverviewer.statusSummary.scheduledRoutines.toString()}
          />
          <StatusPill
            icon={<CircleDashed className="size-3.5" />}
            label={routineOverviewer.statusSummary.unscheduledRoutines.toString()}
          />
          <StatusPill
            icon={<CircleAlert className="size-3.5" />}
            label={routineOverviewer.statusSummary.overdueRoutines.toString()}
          />
          <StatusPill
            icon={<CheckCircle2 className="size-3.5" />}
            label={routineOverviewer.statusSummary.activeTasks.toString()}
          />
        </div>

        <ToggleGroup
          type="single"
          value={routineOverviewer.timeRailScale}
          onValueChange={value => {
            if (value === "day" || value === "week" || value === "month") {
              routineOverviewer.setTimeRailScale(value);
            }
          }}
          className="rounded-sm border border-border/60 bg-background/40 p-0.5"
        >
          <ToggleGroupItem
            value="day"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            D
          </ToggleGroupItem>
          <ToggleGroupItem
            value="week"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            W
          </ToggleGroupItem>
          <ToggleGroupItem
            value="month"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            M
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-sm"
          onClick={routineOverviewer.resetScope}
        >
          <RotateCcw />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-sm"
          disabled={routineOverviewer.state !== "idle"}
          onClick={routineOverviewer.refreshOverview}
        >
          <RefreshCw
            className={cn(routineOverviewer.state !== "idle" && "animate-spin")}
          />
        </Button>
      </div>
    </div>
  );
};

const StatusPill = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <div className="flex h-7 items-center gap-1 rounded-sm border border-border/50 bg-background/40 px-2">
      {icon}
      <span className="tabular-nums">{label}</span>
    </div>
  );
};

export default RoutineScopeBar;
