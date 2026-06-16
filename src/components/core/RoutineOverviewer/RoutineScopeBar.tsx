import { ClipboardClock, ClipboardList, Search, Tags } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import TrainStationIcon from "@/components/icons/TrainStationIcon";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useStationRoutine } from "@/hooks";

const RoutineScopeBar = () => {
  const stationRoutineManager = useStationRoutine();

  return (
    <div
      className="
        @container
        flex h-full w-full min-w-0 items-center justify-between gap-4
        border-b border-border/40 bg-background/75 px-3 backdrop-blur-md
      "
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden @max-[600px]:hidden">
        <div className="relative h-8 w-[220px] min-w-0 max-w-full">
          <Search className="-translate-y-1/2 pointer-events-none absolute left-2.5 top-1/2 size-4 text-muted-foreground" />
          <Input
            value={stationRoutineManager.presence.query}
            onChange={event =>
              stationRoutineManager.setPresenceQuery(event.currentTarget.value)
            }
            placeholder="Search routines"
            className="
              h-8 rounded-sm border-border/60 bg-background/60 pl-8
              text-sm shadow-none
            "
          />
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HoverCard openDelay={250} closeDelay={150}>
            <HoverCardTrigger asChild>
              <StatusPill
                icon={<TrainStationIcon size={14} />}
                presentCount={stationRoutineManager.visibleStations.length}
                totalCount={stationRoutineManager.statusSummary.totalStations}
                title="Stations"
              />
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-72 rounded-sm p-0">
              <div className="border-b px-3 py-2.5">
                <p className="text-sm font-medium">Present stations</p>
                <p className="text-xs text-muted-foreground">
                  {stationRoutineManager.presence.stationIds.length} of{" "}
                  {stationRoutineManager.stations.length} stations are shown
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto p-1.5">
                {stationRoutineManager.stations.map(station => (
                  <label
                    key={station.id}
                    className="flex h-9 cursor-default items-center gap-2 rounded-sm px-2 hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={stationRoutineManager.presence.stationIds.includes(
                        station.id
                      )}
                      onCheckedChange={() =>
                        stationRoutineManager.toggleStationPresence(station.id)
                      }
                    />
                    {station.icon ? (
                      <span className="shrink-0 text-sm">{station.icon}</span>
                    ) : (
                      <TrainStationIcon size={14} />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {station.name}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {station.routineCount}
                    </span>
                  </label>
                ))}
                {stationRoutineManager.stations.length === 0 && (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No stations
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
          <StatusPill
            icon={<ClipboardClock className="size-3.5" />}
            presentCount={stationRoutineManager.visibleRoutines.length}
            totalCount={stationRoutineManager.statusSummary.totalRoutines}
            title="Routines"
          />
          <HoverCard openDelay={250} closeDelay={150}>
            <HoverCardTrigger asChild>
              <StatusPill
                icon={<Tags className="size-3.5" />}
                presentCount={stationRoutineManager.visibleRoutineTags.length}
                totalCount={stationRoutineManager.statusSummary.totalRoutineTags}
                title="Routine tags"
              />
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-72 rounded-sm p-0">
              <div className="border-b px-3 py-2.5">
                <p className="text-sm font-medium">Present routine tags</p>
                <p className="text-xs text-muted-foreground">
                  {stationRoutineManager.presence.routineTagIds.length} of{" "}
                  {stationRoutineManager.routineTags.length} tags are shown
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto p-1.5">
                {stationRoutineManager.routineTags.map(routineTag => (
                  <label
                    key={routineTag.id}
                    className="flex h-9 cursor-default items-center gap-2 rounded-sm px-2 hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={stationRoutineManager.presence.routineTagIds.includes(
                        routineTag.id
                      )}
                      onCheckedChange={() =>
                        stationRoutineManager.toggleRoutineTagPresence(routineTag.id)
                      }
                    />
                    <span
                      className="size-2.5 shrink-0 rounded-full border border-foreground/15"
                      style={{ backgroundColor: routineTag.color }}
                    />
                    {routineTag.icon && (
                      <span className="shrink-0 text-sm">
                        {routineTag.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {routineTag.name}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {routineTag.routineCount}
                    </span>
                  </label>
                ))}
                {stationRoutineManager.routineTags.length === 0 && (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No routine tags
                  </p>
                )}
                <Separator className="my-1.5" />
                <label className="flex h-9 cursor-default items-center gap-2 rounded-sm px-2 hover:bg-accent/50">
                  <Checkbox
                    checked={stationRoutineManager.presence.showUntaggedRoutines}
                    onCheckedChange={stationRoutineManager.toggleUntaggedRoutines}
                  />
                  <span className="text-sm">Untagged routines</span>
                </label>
              </div>
            </HoverCardContent>
          </HoverCard>
          <StatusPill
            icon={<ClipboardList className="size-3.5" />}
            presentCount={stationRoutineManager.visibleRoutineTasks.length}
            totalCount={stationRoutineManager.statusSummary.totalRoutineTasks}
            title="Routine tasks"
          />
        </div>

        <ToggleGroup
          type="single"
          value={stationRoutineManager.timeRailScale}
          onValueChange={value => {
            if (value === "day" || value === "week" || value === "month") {
              stationRoutineManager.setTimeRailScale(value);
            }
          }}
          className="rounded-sm border border-border/60 bg-background/40 p-0.5"
        >
          <ToggleGroupItem
            value="day"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            <span className="@max-[480px]:hidden">Daily</span>
            <span className="hidden @max-[480px]:inline">D</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="week"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            <span className="@max-[480px]:hidden">Weekly</span>
            <span className="hidden @max-[480px]:inline">W</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="month"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            <span className="@max-[480px]:hidden">Monthly</span>
            <span className="hidden @max-[480px]:inline">M</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

const StatusPill = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    icon: ReactNode;
    presentCount: number;
    totalCount: number;
    title: string;
  }
>(({ icon, presentCount, totalCount, title, ...props }, ref) => (
  <div
    ref={ref}
    {...props}
    className="flex h-7 items-center gap-1 rounded-sm border border-border/50 bg-background/40 px-2"
    aria-label={`${title}: ${presentCount} of ${totalCount} present`}
  >
    {icon}
    <div className="tabular-nums">
      <span className="@max-[480px]:hidden">{presentCount}</span>
      <span className="px-0.5 @max-[480px]:hidden">|</span>
      {totalCount}
    </div>
  </div>
));
StatusPill.displayName = "StatusPill";

export default RoutineScopeBar;
