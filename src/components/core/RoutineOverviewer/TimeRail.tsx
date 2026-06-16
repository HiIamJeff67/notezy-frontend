import { RoutineStatus } from "@shared/api/interfaces/enums";
import type { RoutineNode } from "@shared/types/routineNode.type";
import { cn } from "@shared/util/utils";
import {
  Bookmark,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import TrainStationIcon from "@/components/icons/TrainStationIcon";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useStationRoutine } from "@/hooks";

const TimeRail = () => {
  const stationRoutineManager = useStationRoutine();
  const previousScaleRef = useRef(stationRoutineManager.timeRailScale);

  useEffect(() => {
    if (previousScaleRef.current === stationRoutineManager.timeRailScale) {
      return;
    }
    previousScaleRef.current = stationRoutineManager.timeRailScale;

    const nextStartAt = new Date(stationRoutineManager.timeWindow.startAt);
    nextStartAt.setHours(0, 0, 0, 0);
    const nextEndAt = new Date(nextStartAt);

    if (stationRoutineManager.timeRailScale === "day") {
      nextEndAt.setDate(nextEndAt.getDate() + 1);
    }
    if (stationRoutineManager.timeRailScale === "week") {
      nextEndAt.setDate(nextEndAt.getDate() + 7);
    }
    if (stationRoutineManager.timeRailScale === "month") {
      nextStartAt.setDate(1);
      nextEndAt.setMonth(nextStartAt.getMonth() + 1, 1);
    }

    stationRoutineManager.setTimeWindow({
      startAt: nextStartAt,
      endAt: nextEndAt,
    });
  }, [
    stationRoutineManager.timeRailScale,
    stationRoutineManager.timeWindow.startAt,
    stationRoutineManager.setTimeWindow,
  ]);

  const timeWindowStartMs = stationRoutineManager.timeWindow.startAt.getTime();
  const timeWindowEndMs = stationRoutineManager.timeWindow.endAt.getTime();
  const timeWindowDurationMs = Math.max(timeWindowEndMs - timeWindowStartMs, 1);

  const ticks = useMemo(() => {
    const generatedTicks: Date[] = [];
    const cursor = new Date(stationRoutineManager.timeWindow.startAt);
    cursor.setMinutes(0, 0, 0);

    if (stationRoutineManager.timeRailScale !== "day") {
      cursor.setHours(0, 0, 0, 0);
    }

    while (cursor < stationRoutineManager.timeWindow.endAt) {
      generatedTicks.push(new Date(cursor));
      if (stationRoutineManager.timeRailScale === "day") {
        cursor.setHours(cursor.getHours() + 1);
      } else {
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return generatedTicks;
  }, [
    stationRoutineManager.timeRailScale,
    stationRoutineManager.timeWindow.endAt,
    stationRoutineManager.timeWindow.startAt,
  ]);

  const tickWidth =
    stationRoutineManager.timeRailScale === "day"
      ? 80
      : stationRoutineManager.timeRailScale === "week"
        ? 120
        : 56;
  const contentWidth = Math.max(ticks.length * tickWidth, 640);

  const moveToToday = () => {
    const nextStartAt = new Date();
    nextStartAt.setHours(0, 0, 0, 0);
    const nextEndAt = new Date(nextStartAt);

    if (stationRoutineManager.timeRailScale === "day") {
      nextEndAt.setDate(nextEndAt.getDate() + 1);
    }
    if (stationRoutineManager.timeRailScale === "week") {
      nextEndAt.setDate(nextEndAt.getDate() + 7);
    }
    if (stationRoutineManager.timeRailScale === "month") {
      nextStartAt.setDate(1);
      nextEndAt.setMonth(nextStartAt.getMonth() + 1, 1);
    }

    stationRoutineManager.setTimeWindow({
      startAt: nextStartAt,
      endAt: nextEndAt,
    });
  };

  const getTimelinePosition = (date: Date): number => {
    const offsetMs = date.getTime() - timeWindowStartMs;
    return (offsetMs / timeWindowDurationMs) * contentWidth;
  };

  const getRoutineStyle = (routine: RoutineNode) => {
    const routineStartMs = Math.max(
      routine.scheduledStartAt.getTime(),
      timeWindowStartMs
    );
    const routineEndMs = Math.min(
      routine.scheduledEndAt.getTime(),
      timeWindowEndMs
    );
    const left =
      ((routineStartMs - timeWindowStartMs) / timeWindowDurationMs) *
      contentWidth;
    const width = Math.max(
      ((routineEndMs - routineStartMs) / timeWindowDurationMs) * contentWidth,
      36
    );

    return { left, width };
  };

  return (
    <section
      className="
        @container flex max-h-[520px] w-full min-w-0 shrink-0 flex-col
        overflow-hidden rounded-md border border-border/60 bg-card/70 backdrop-blur-sm
      "
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border/80 px-3 py-2 @max-[680px]:flex-col @max-[680px]:items-start">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">TimeRails</span>
          <span className="truncate text-xs text-muted-foreground">
            {formatWindowLabel(
              stationRoutineManager.timeWindow.startAt,
              stationRoutineManager.timeWindow.endAt,
              stationRoutineManager.timeRailScale
            )}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-sm"
            onClick={() => stationRoutineManager.moveTimeWindow("previous")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-sm px-3 text-xs"
            onClick={moveToToday}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-sm"
            onClick={() => stationRoutineManager.moveTimeWindow("next")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-auto overscroll-contain">
        {stationRoutineManager.timeRailStations.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No stations match the current scope.
          </div>
        ) : (
          <div
            className="grid min-w-full"
            style={{
              gridTemplateColumns: "minmax(112px, 160px) minmax(0, 1fr)",
            }}
          >
            <div className="sticky left-0 top-0 z-20 border-r border-border/60 bg-card" />
            <div
              className="sticky top-0 z-10 border-b border-border/60 bg-card"
              style={{ width: contentWidth }}
            >
              <div className="relative h-10" style={{ width: contentWidth }}>
                {ticks.map(tick => (
                  <div
                    key={tick.getTime()}
                    className="absolute top-0 flex h-full items-center border-l border-border/50 px-2 text-xs text-muted-foreground"
                    style={{
                      left: getTimelinePosition(tick),
                      width: tickWidth,
                    }}
                  >
                    {formatTickLabel(tick, stationRoutineManager.timeRailScale)}
                  </div>
                ))}
              </div>
            </div>

            {stationRoutineManager.timeRailStations.map(timeRailStation => {
              const rowHeight = Math.max(
                timeRailStation.railCount * 38 + 18,
                56
              );

              return (
                <div className="contents" key={timeRailStation.station.id}>
                  <div
                    className="sticky left-0 z-10 flex min-w-0 items-start gap-2 border-r border-t border-border/60 bg-card px-3 py-3"
                    style={{ height: rowHeight }}
                  >
                    {timeRailStation.station.icon ? (
                      <span className="mt-0.5 shrink-0 text-sm">
                        {timeRailStation.station.icon}
                      </span>
                    ) : (
                      <TrainStationIcon
                        size={14}
                        className="mt-0.5 shrink-0 text-muted-foreground"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {timeRailStation.station.name}
                      </p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {timeRailStation.routines.length} routines
                      </p>
                    </div>
                  </div>
                  <div
                    className="
                      relative border-t border-border/60
                      bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px)]
                    "
                    style={{
                      height: rowHeight,
                      width: contentWidth,
                      backgroundSize: `${tickWidth}px 100%`,
                    }}
                  >
                    {timeRailStation.routines.length === 0 && (
                      <div className="absolute inset-0 flex items-center px-3 text-xs text-muted-foreground">
                        No scheduled routines in this window.
                      </div>
                    )}
                    {timeRailStation.routines.map(routine => {
                      const { left, width } = getRoutineStyle(routine);
                      const railIndex =
                        timeRailStation.routineRailIndexes[routine.id] ?? 0;

                      return (
                        <RoutineRailCard
                          key={routine.id}
                          routine={routine}
                          left={left}
                          top={10 + railIndex * 38}
                          width={width}
                          stationName={timeRailStation.station.name}
                          onOpen={() =>
                            stationRoutineManager.openInspector({
                              type: "routine",
                              id: routine.id,
                            })
                          }
                          tagNames={routine.routineTagIds.flatMap(
                            routineTagId => {
                              const routineTag =
                                stationRoutineManager.getRoutineTagById(
                                  routineTagId
                                );
                              return routineTag ? [routineTag.name] : [];
                            }
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const RoutineRailCard = ({
  routine,
  left,
  top,
  width,
  stationName,
  tagNames,
  onOpen,
}: {
  routine: RoutineNode;
  left: number;
  top: number;
  width: number;
  stationName: string;
  tagNames: string[];
  onOpen: () => void;
}) => {
  return (
    <HoverCard openDelay={180} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            "absolute flex h-7 min-w-0 items-center gap-1.5 overflow-hidden",
            "rounded-sm border px-2 text-left text-xs shadow-sm",
            "bg-background/90 hover:bg-secondary/70",
            getRoutineStatusClassName(routine.status)
          )}
          style={{
            left,
            top,
            width,
          }}
          onClick={onOpen}
        >
          {routine.isPinned && (
            <Bookmark className="size-3 shrink-0 fill-muted-foreground/20 text-muted-foreground" />
          )}
          <span className="truncate">{routine.title}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 rounded-sm p-3">
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

const formatWindowLabel = (
  startAt: Date,
  endAt: Date,
  scale: "day" | "week" | "month"
) => {
  if (scale === "day") {
    return startAt.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const endLabel = new Date(endAt);
  endLabel.setDate(endLabel.getDate() - 1);
  return `${startAt.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${endLabel.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
};

const formatTickLabel = (tick: Date, scale: "day" | "week" | "month") => {
  if (scale === "day") {
    return tick.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (scale === "week") {
    return tick.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
    });
  }

  return tick.toLocaleDateString([], {
    day: "numeric",
  });
};

const getRoutineStatusClassName = (status: RoutineStatus) => {
  if (status === RoutineStatus.Completed) {
    return "border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
  }
  if (status === RoutineStatus.OverDue) {
    return "border-destructive/40 text-destructive";
  }
  return "border-border/70 text-foreground";
};

export default TimeRail;
