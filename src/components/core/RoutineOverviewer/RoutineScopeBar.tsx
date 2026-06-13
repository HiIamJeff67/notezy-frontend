import { cn } from "@shared/util/utils";
import {
  ClipboardClock,
  ClipboardIcon,
  ClipboardList,
  Search,
  Tags,
} from "lucide-react";
import TrainStationIcon from "@/components/icons/TrainStationIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRoutine } from "@/hooks";

const RoutineScopeBar = () => {
  const routineManager = useRoutine();

  return (
    <div
      className="
        flex h-full w-full min-w-0 items-center justify-between gap-4
        border-b border-border/40 bg-background/75 px-3 backdrop-blur-md
      "
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <div className="relative h-8 w-[220px] shrink-0">
          <Search className="-translate-y-1/2 pointer-events-none absolute left-2.5 top-1/2 size-4 text-muted-foreground" />
          <Input
            value={routineManager.scope.query}
            onChange={event =>
              routineManager.setScopeQuery(event.currentTarget.value)
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
          <TrainStationIcon
            size={16}
            className="shrink-0 text-muted-foreground"
          />
          <ToggleGroup
            type="multiple"
            value={routineManager.scope.stationIds}
            onValueChange={values =>
              routineManager.setStationScope(
                values as typeof routineManager.scope.stationIds
              )
            }
            className="min-w-0 max-w-[28vw] justify-start overflow-x-auto"
          >
            {routineManager.stations.map(station => (
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
                onClick={() => routineManager.selectStation(station.id)}
              >
                <span className="flex max-w-28 items-center gap-1 truncate">
                  {station.icon ? (
                    <span className="shrink-0">{station.icon}</span>
                  ) : (
                    <TrainStationIcon size={14} />
                  )}
                  <span className="truncate">{station.name}</span>
                </span>
              </ToggleGroupItem>
            ))}
            {routineManager.stations.length === 0 && (
              <span className="whitespace-nowrap px-2 text-xs text-muted-foreground">
                All stations
              </span>
            )}
          </ToggleGroup>
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/60" />

        <div className="flex min-w-0 items-center gap-1.5">
          <Tags className="size-4 shrink-0 text-muted-foreground" />
          <ToggleGroup
            type="multiple"
            value={routineManager.scope.routineTagIds}
            onValueChange={values =>
              routineManager.setRoutineTagScope(
                values as typeof routineManager.scope.routineTagIds
              )
            }
            className="min-w-0 max-w-[22vw] justify-start overflow-x-auto"
          >
            {routineManager.routineTags.map(routineTag => (
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
                onClick={() => routineManager.selectRoutineTag(routineTag.id)}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: routineTag.color }}
                />
                <span className="max-w-24 truncate">{routineTag.name}</span>
              </ToggleGroupItem>
            ))}
            {routineManager.routineTags.length === 0 && (
              <span className="whitespace-nowrap px-2 text-xs text-muted-foreground">
                All tags
              </span>
            )}
          </ToggleGroup>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 shrink-0 rounded-sm border-border/60 bg-background/40 px-2 text-xs",
              routineManager.scope.showUntaggedRoutines &&
                "border-primary/50 bg-primary/10"
            )}
            onClick={routineManager.toggleUntaggedRoutines}
          >
            Untagged
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <StatusPill
            icon={<TrainStationIcon size={14} />}
            label={routineManager.statusSummary.totalStations.toString()}
            title="Stations"
          />
          <StatusPill
            icon={<ClipboardClock className="size-3.5" />}
            label={routineManager.statusSummary.totalRoutines.toString()}
            title="Routines"
          />
          <StatusPill
            icon={<Tags className="size-3.5" />}
            label={routineManager.statusSummary.totalRoutineTags.toString()}
            title="Routine tags"
          />
          <StatusPill
            icon={<ClipboardList className="size-3.5" />}
            label={routineManager.statusSummary.totalRoutineTasks.toString()}
            title="Routine tasks"
          />
        </div>

        <ToggleGroup
          type="single"
          value={routineManager.timeRailScale}
          onValueChange={value => {
            if (value === "day" || value === "week" || value === "month") {
              routineManager.setTimeRailScale(value);
            }
          }}
          className="rounded-sm border border-border/60 bg-background/40 p-0.5"
        >
          <ToggleGroupItem
            value="day"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            Daily
          </ToggleGroupItem>
          <ToggleGroupItem
            value="week"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            Weekly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="month"
            size="sm"
            className="h-6 rounded-sm px-2 text-xs"
          >
            Monthly
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

const StatusPill = ({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) => {
  return (
    <div
      className="flex h-7 items-center gap-1 rounded-sm border border-border/50 bg-background/40 px-2"
      title={title}
      aria-label={`${title}: ${label}`}
    >
      {icon}
      <span className="tabular-nums">{label}</span>
    </div>
  );
};

export default RoutineScopeBar;
