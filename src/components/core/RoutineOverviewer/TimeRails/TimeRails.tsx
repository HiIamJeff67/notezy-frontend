import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { cn } from "@shared/util/utils";
import type { UUID } from "crypto";
import { CalendarClock, CalendarDays } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStationRoutine, useUser } from "@/hooks";
import RoutineTrain from "./RoutineTrain";
import TimeRailsStationBar from "./TimeRailsStationBar";

const DayBufferHours = 24;
const WeekVisibleDays = 7;
const WeekBufferDays = 12;

export type TimeRailsStation = {
  station: StationNode;
  routines: RoutineNode[];
  routineRailIndexes: Record<UUID, number>;
  railCount: number;
};

const TimeRails = () => {
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();

  const previousScaleRef = useRef(stationRoutineManager.timeRailScale);
  const timeRailsBodyRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pendingScrollAdjustmentRef = useRef<number | null>(null);
  const pendingWheelDeltaRef = useRef<number>(0);
  const viewportUpdateAnimationRef = useRef<number | null>(null);
  const shouldSuppressRoutineOpenRef = useRef<boolean>(false);
  const shouldCenterDayScrollRef = useRef<boolean>(false);
  const shouldCenterWeekScrollRef = useRef<boolean>(true);
  const shouldCenterMonthScrollRef = useRef<boolean>(false);
  const hasLoadedStationPositionsRef = useRef<boolean>(false);
  const stationPositionsPublicIdRef = useRef<string | undefined>(undefined);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [weekTickWidth, setWeekTickWidth] = useState<number>(120);
  const [stationPositions, setStationPositions] = useState<UUID[]>([]);
  const [resizingColumn, setResizingColumn] = useState<{
    key: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [resizingRoutine, setResizingRoutine] = useState<{
    routineId: UUID;
    edge: "start" | "end";
    startClientX: number;
    originalStartAt: Date;
    originalEndAt: Date;
    originalLeft: number;
    originalWidth: number;
  } | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [viewportWindow, setViewportWindow] = useState<{
    startAt: Date;
    endAt: Date;
  } | null>(null);
  const [routineResizePreview, setRoutineResizePreview] = useState<
    Partial<
      Record<
        UUID,
        {
          scheduledStartAt: Date;
          scheduledEndAt: Date;
        }
      >
    >
  >({});

  const orderedTimeRailStations = useMemo(() => {
    const positionMap = new Map<UUID, number>();
    stationPositions.forEach((stationId, index) => {
      positionMap.set(stationId, index);
    });

    return [...stationRoutineManager.timeRailStations].sort((a, b) => {
      return (
        (positionMap.get(a.station.id) ?? Number.MAX_SAFE_INTEGER) -
        (positionMap.get(b.station.id) ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }, [stationPositions, stationRoutineManager.timeRailStations]);

  useEffect(() => {
    const stationIds = stationRoutineManager.timeRailStations.map(
      timeRailStation => timeRailStation.station.id
    );
    const publicId = userManager.userData?.publicId;
    if (stationIds.length === 0 || !publicId) return;

    setStationPositions(previousStationPositions => {
      const currentStationIdSet = new Set(stationIds);
      let baseStationPositions = previousStationPositions;

      if (stationPositionsPublicIdRef.current !== publicId) {
        stationPositionsPublicIdRef.current = publicId;
        hasLoadedStationPositionsRef.current = false;
        baseStationPositions = [];
      }

      if (!hasLoadedStationPositionsRef.current) {
        const storedStationPositionsEncoded =
          LocalStorageManipulator.getItemByKey(
            LocalStorageKey.timeRailsStationIndexes,
            publicId
          );
        let storedStationPositions: unknown = null;

        try {
          storedStationPositions =
            typeof storedStationPositionsEncoded === "string"
              ? JSON.parse(storedStationPositionsEncoded)
              : storedStationPositionsEncoded;
        } catch (error) {
          console.error("failed to parse TimeRails station indexes", error);
        }

        if (!Array.isArray(storedStationPositions)) {
          baseStationPositions = [];
        } else {
          baseStationPositions = storedStationPositions.filter(
            stationId =>
              typeof stationId === "string" &&
              currentStationIdSet.has(stationId as UUID)
          ) as UUID[];
        }

        hasLoadedStationPositionsRef.current = true;
      }

      const nextStationPositions = [
        ...baseStationPositions.filter(stationId =>
          currentStationIdSet.has(stationId)
        ),
        ...stationIds.filter(
          stationId => !baseStationPositions.includes(stationId)
        ),
      ];

      if (
        nextStationPositions.length === previousStationPositions.length &&
        nextStationPositions.every(
          (stationId, index) => stationId === previousStationPositions[index]
        )
      ) {
        return previousStationPositions;
      }

      LocalStorageManipulator.setItem(
        LocalStorageKey.timeRailsStationIndexes,
        nextStationPositions,
        publicId
      );
      return nextStationPositions;
    });
  }, [stationRoutineManager.timeRailStations, userManager.userData?.publicId]);

  useEffect(() => {
    return () => {
      if (viewportUpdateAnimationRef.current !== null) {
        window.cancelAnimationFrame(viewportUpdateAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousScale = previousScaleRef.current;
    if (previousScale === stationRoutineManager.timeRailScale) {
      return;
    }
    previousScaleRef.current = stationRoutineManager.timeRailScale;

    const visibleDate = new Date(stationRoutineManager.timeWindow.startAt);
    if (previousScale === "day") {
      visibleDate.setDate(visibleDate.getDate() + 1);
    }
    if (previousScale === "week") {
      visibleDate.setDate(visibleDate.getDate() + 6);
    }
    if (previousScale === "month") {
      visibleDate.setMonth(visibleDate.getMonth() + 1, 1);
    }
    visibleDate.setHours(0, 0, 0, 0);

    const nextStartAt = new Date(visibleDate);
    const nextEndAt = new Date(nextStartAt);

    if (stationRoutineManager.timeRailScale === "day") {
      nextStartAt.setHours(nextStartAt.getHours() - DayBufferHours);
      nextEndAt.setTime(nextStartAt.getTime());
      nextEndAt.setHours(nextEndAt.getHours() + DayBufferHours * 3);
      shouldCenterDayScrollRef.current = true;
    }
    if (stationRoutineManager.timeRailScale === "week") {
      nextStartAt.setDate(
        nextStartAt.getDate() - WeekBufferDays - Math.floor(WeekVisibleDays / 2)
      );
      nextEndAt.setTime(nextStartAt.getTime());
      nextEndAt.setDate(
        nextEndAt.getDate() + WeekVisibleDays + WeekBufferDays * 2
      );
      shouldCenterWeekScrollRef.current = true;
    }
    if (stationRoutineManager.timeRailScale === "month") {
      nextStartAt.setDate(1);
      nextStartAt.setMonth(nextStartAt.getMonth() - 1);
      nextEndAt.setTime(nextStartAt.getTime());
      nextEndAt.setMonth(nextEndAt.getMonth() + 3, 1);
      shouldCenterMonthScrollRef.current = true;
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
        ? weekTickWidth
        : 56;
  const tickMetrics = useMemo(() => {
    let left = 0;
    return ticks.map(tick => {
      const width = Math.max(32, columnWidths[tick.getTime()] ?? tickWidth);
      const metric = { tick, left, width };
      left += width;
      return metric;
    });
  }, [columnWidths, tickWidth, ticks]);
  const contentWidth = Math.max(
    tickMetrics.reduce((totalWidth, tickMetric) => {
      return totalWidth + tickMetric.width;
    }, 0),
    640
  );

  const getDatePosition = (date: Date) => {
    if (tickMetrics.length === 0) return 0;
    const dateTime = date.getTime();

    for (let index = 0; index < tickMetrics.length; index++) {
      const tickMetric = tickMetrics[index];
      const nextTick =
        tickMetrics[index + 1]?.tick.getTime() ?? timeWindowEndMs;
      if (dateTime >= tickMetric.tick.getTime() && dateTime <= nextTick) {
        const tickDuration = Math.max(nextTick - tickMetric.tick.getTime(), 1);
        return (
          tickMetric.left +
          ((dateTime - tickMetric.tick.getTime()) / tickDuration) *
            tickMetric.width
        );
      }
    }

    if (dateTime < tickMetrics[0].tick.getTime()) return 0;
    return contentWidth;
  };

  const getDateFromPosition = useCallback(
    (position: number) => {
      if (tickMetrics.length === 0) {
        return new Date(timeWindowStartMs);
      }

      const clampedPosition = Math.min(contentWidth, Math.max(0, position));
      for (let index = 0; index < tickMetrics.length; index++) {
        const tickMetric = tickMetrics[index];
        const nextTickTime =
          tickMetrics[index + 1]?.tick.getTime() ?? timeWindowEndMs;
        const tickRight = tickMetric.left + tickMetric.width;

        if (
          clampedPosition >= tickMetric.left &&
          clampedPosition <= tickRight
        ) {
          const positionRatio =
            (clampedPosition - tickMetric.left) / tickMetric.width;
          return new Date(
            tickMetric.tick.getTime() +
              positionRatio * (nextTickTime - tickMetric.tick.getTime())
          );
        }
      }

      return new Date(timeWindowEndMs);
    },
    [contentWidth, tickMetrics, timeWindowEndMs, timeWindowStartMs]
  );

  const updateViewportWindow = useCallback(
    (scrollContainer: HTMLDivElement) => {
      if (viewportUpdateAnimationRef.current !== null) {
        window.cancelAnimationFrame(viewportUpdateAnimationRef.current);
      }

      viewportUpdateAnimationRef.current = window.requestAnimationFrame(() => {
        viewportUpdateAnimationRef.current = null;
        const nextStartAt = getDateFromPosition(scrollContainer.scrollLeft);
        const nextEndAt = getDateFromPosition(
          scrollContainer.scrollLeft + scrollContainer.clientWidth
        );

        if (stationRoutineManager.timeRailScale === "day") {
          nextStartAt.setHours(nextStartAt.getHours() - 1);
          nextEndAt.setHours(nextEndAt.getHours() + 1);
        }
        if (stationRoutineManager.timeRailScale === "week") {
          nextStartAt.setDate(nextStartAt.getDate() - 1);
          nextEndAt.setDate(nextEndAt.getDate() + 1);
        }
        if (stationRoutineManager.timeRailScale === "month") {
          nextStartAt.setMonth(nextStartAt.getMonth() - 1);
          nextEndAt.setMonth(nextEndAt.getMonth() + 1);
        }

        setViewportWindow(previousViewportWindow => {
          if (
            previousViewportWindow &&
            previousViewportWindow.startAt.getTime() ===
              nextStartAt.getTime() &&
            previousViewportWindow.endAt.getTime() === nextEndAt.getTime()
          ) {
            return previousViewportWindow;
          }

          return {
            startAt: nextStartAt,
            endAt: nextEndAt,
          };
        });
      });
    },
    [getDateFromPosition, stationRoutineManager.timeRailScale]
  );

  const routineVisibilityWindow = useMemo(() => {
    if (viewportWindow) {
      return viewportWindow;
    }

    const startAt = new Date(stationRoutineManager.timeWindow.startAt);
    const endAt = new Date(startAt);

    if (stationRoutineManager.timeRailScale === "day") {
      startAt.setHours(startAt.getHours() + DayBufferHours - 1);
      endAt.setTime(startAt.getTime());
      endAt.setHours(endAt.getHours() + 26);
    }
    if (stationRoutineManager.timeRailScale === "week") {
      startAt.setDate(startAt.getDate() + WeekBufferDays - 1);
      endAt.setTime(startAt.getTime());
      endAt.setDate(endAt.getDate() + WeekVisibleDays + 2);
    }
    if (stationRoutineManager.timeRailScale === "month") {
      startAt.setMonth(startAt.getMonth(), 1);
      endAt.setTime(startAt.getTime());
      endAt.setMonth(endAt.getMonth() + 3, 1);
    }

    return {
      startAt,
      endAt,
    };
  }, [
    stationRoutineManager.timeRailScale,
    stationRoutineManager.timeWindow.startAt,
    viewportWindow,
  ]);

  const renderedTimeRailStations = useMemo(() => {
    return orderedTimeRailStations.map(timeRailStation => {
      const visibleRoutines = timeRailStation.routines.filter(routine => {
        const preview = routineResizePreview[routine.id];
        const scheduledStartAt =
          preview?.scheduledStartAt ?? routine.scheduledStartAt;
        const scheduledEndAt =
          preview?.scheduledEndAt ?? routine.scheduledEndAt;

        return (
          scheduledStartAt < routineVisibilityWindow.endAt &&
          scheduledEndAt > routineVisibilityWindow.startAt
        );
      });
      const routineLayouts = new Map<
        UUID,
        { left: number; width: number; railIndex: number }
      >();
      const routineVisualLayouts = visibleRoutines
        .map(routine => {
          const preview = routineResizePreview[routine.id];
          const scheduledStartAt =
            preview?.scheduledStartAt ?? routine.scheduledStartAt;
          const scheduledEndAt =
            preview?.scheduledEndAt ?? routine.scheduledEndAt;
          const routineStartMs = Math.max(
            scheduledStartAt.getTime(),
            timeWindowStartMs
          );
          const routineEndMs = Math.min(
            scheduledEndAt.getTime(),
            timeWindowEndMs
          );
          let left = getDatePosition(new Date(routineStartMs));
          let width = Math.max(
            getDatePosition(new Date(routineEndMs)) - left,
            36
          );

          if (stationRoutineManager.timeRailScale !== "day") {
            const routineStartDay = new Date(scheduledStartAt);
            routineStartDay.setHours(0, 0, 0, 0);
            const routineEndDay = new Date(scheduledEndAt);
            routineEndDay.setHours(0, 0, 0, 0);

            if (routineStartDay.getTime() === routineEndDay.getTime()) {
              const dayLeft = getDatePosition(routineStartDay);
              const dayRight = getDatePosition(
                new Date(routineStartDay.getTime() + 24 * 60 * 60 * 1000)
              );
              width = Math.min(width, Math.max(dayRight - left - 4, 18));
              if (left + width > dayRight - 4) {
                left = Math.max(dayLeft + 4, dayRight - width - 4);
              }
            }
          }

          return {
            routine,
            left,
            width,
            scheduledEndAt,
          };
        })
        .sort((a, b) => {
          if (a.left !== b.left) return a.left - b.left;
          return a.scheduledEndAt.getTime() - b.scheduledEndAt.getTime();
        });

      const railRightPositions: number[] = [];
      for (const routineVisualLayout of routineVisualLayouts) {
        const visualRight =
          routineVisualLayout.left + routineVisualLayout.width + 6;
        const targetRailIndex = railRightPositions.findIndex(
          railRightPosition => railRightPosition <= routineVisualLayout.left
        );
        const railIndex =
          targetRailIndex === -1 ? railRightPositions.length : targetRailIndex;

        railRightPositions[railIndex] = visualRight;
        routineLayouts.set(routineVisualLayout.routine.id, {
          left: routineVisualLayout.left,
          width: routineVisualLayout.width,
          railIndex,
        });
      }

      return {
        ...timeRailStation,
        routines: visibleRoutines,
        railCount: Math.max(railRightPositions.length, 1),
        routineLayouts,
      };
    });
  }, [
    contentWidth,
    orderedTimeRailStations,
    routineVisibilityWindow,
    routineResizePreview,
    stationRoutineManager.timeRailScale,
    tickMetrics,
    timeWindowEndMs,
    timeWindowStartMs,
  ]);

  const moveStationPosition = (
    draggedStationId: UUID,
    targetStationId: UUID
  ) => {
    if (!draggedStationId || draggedStationId === targetStationId) {
      return;
    }

    setStationPositions(previousStationPositions => {
      const publicId = userManager.userData?.publicId;
      const nextStationPositions = [...previousStationPositions];
      const draggedIndex = nextStationPositions.indexOf(draggedStationId);
      const targetIndex = nextStationPositions.indexOf(targetStationId);
      if (draggedIndex === -1 || targetIndex === -1) {
        return previousStationPositions;
      }

      nextStationPositions.splice(draggedIndex, 1);
      nextStationPositions.splice(targetIndex, 0, draggedStationId);
      if (publicId) {
        LocalStorageManipulator.setItem(
          LocalStorageKey.timeRailsStationIndexes,
          nextStationPositions,
          publicId
        );
      }
      return nextStationPositions;
    });
  };

  useEffect(() => {
    if (!resizingColumn) return;

    const handlePointerMove = (event: PointerEvent) => {
      const nextWidth = Math.max(
        32,
        resizingColumn.startWidth + event.clientX - resizingColumn.startX
      );
      setColumnWidths(previousColumnWidths => ({
        ...previousColumnWidths,
        [resizingColumn.key]: nextWidth,
      }));
    };
    const handlePointerUp = () => {
      setResizingColumn(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizingColumn]);

  useEffect(() => {
    if (!resizingRoutine) return;

    const minRoutineDurationMs = 15 * 60 * 1000;

    const getResizedRoutineRange = (clientX: number) => {
      const deltaX = clientX - resizingRoutine.startClientX;

      if (resizingRoutine.edge === "start") {
        const nextStartAt = getDateFromPosition(
          resizingRoutine.originalLeft + deltaX
        );
        const latestStartAt = new Date(
          resizingRoutine.originalEndAt.getTime() - minRoutineDurationMs
        );

        return {
          scheduledStartAt:
            nextStartAt > latestStartAt ? latestStartAt : nextStartAt,
          scheduledEndAt: resizingRoutine.originalEndAt,
        };
      }

      const nextEndAt = getDateFromPosition(
        resizingRoutine.originalLeft + resizingRoutine.originalWidth + deltaX
      );
      const earliestEndAt = new Date(
        resizingRoutine.originalStartAt.getTime() + minRoutineDurationMs
      );

      return {
        scheduledStartAt: resizingRoutine.originalStartAt,
        scheduledEndAt: nextEndAt < earliestEndAt ? earliestEndAt : nextEndAt,
      };
    };

    const clearRoutinePreview = () => {
      setRoutineResizePreview(previousRoutineResizePreview => {
        const nextRoutineResizePreview = { ...previousRoutineResizePreview };
        delete nextRoutineResizePreview[resizingRoutine.routineId];
        return nextRoutineResizePreview;
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const nextRange = getResizedRoutineRange(event.clientX);
      setRoutineResizePreview(previousRoutineResizePreview => ({
        ...previousRoutineResizePreview,
        [resizingRoutine.routineId]: nextRange,
      }));
    };

    const handlePointerUp = (event: PointerEvent) => {
      const nextRange = getResizedRoutineRange(event.clientX);
      const didChange =
        nextRange.scheduledStartAt.getTime() !==
          resizingRoutine.originalStartAt.getTime() ||
        nextRange.scheduledEndAt.getTime() !==
          resizingRoutine.originalEndAt.getTime();

      setResizingRoutine(null);
      window.setTimeout(() => {
        shouldSuppressRoutineOpenRef.current = false;
      }, 0);
      if (!didChange) {
        clearRoutinePreview();
        return;
      }

      setRoutineResizePreview(previousRoutineResizePreview => ({
        ...previousRoutineResizePreview,
        [resizingRoutine.routineId]: nextRange,
      }));
      void stationRoutineManager
        .updateRoutine(resizingRoutine.routineId, nextRange)
        .finally(clearRoutinePreview);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    getDateFromPosition,
    resizingRoutine,
    stationRoutineManager.updateRoutine,
  ]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (
      stationRoutineManager.timeRailScale !== "week" ||
      !scrollContainer ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      setWeekTickWidth(Math.max(120, (entry.contentRect.width - 160) / 7));
      shouldCenterWeekScrollRef.current = true;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [stationRoutineManager.timeRailScale]);

  useEffect(() => {
    if (
      !["day", "week", "month"].includes(stationRoutineManager.timeRailScale) ||
      !scrollContainerRef.current
    ) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;

    if (pendingScrollAdjustmentRef.current !== null) {
      scrollContainer.scrollLeft += pendingScrollAdjustmentRef.current;
      pendingScrollAdjustmentRef.current = null;

      if (pendingWheelDeltaRef.current !== 0) {
        const maxScrollLeft =
          scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollContainer.scrollLeft = Math.min(
          maxScrollLeft,
          Math.max(0, scrollContainer.scrollLeft + pendingWheelDeltaRef.current)
        );
        pendingWheelDeltaRef.current = 0;
      }

      updateViewportWindow(scrollContainer);
      return;
    }

    const shouldCenterDayScroll = shouldCenterDayScrollRef.current;
    const shouldCenterWeekScroll = shouldCenterWeekScrollRef.current;
    const shouldCenterMonthScroll = shouldCenterMonthScrollRef.current;

    if (shouldCenterDayScrollRef.current) {
      scrollContainer.scrollLeft = tickWidth * DayBufferHours;
      shouldCenterDayScrollRef.current = false;
    }
    if (shouldCenterWeekScrollRef.current) {
      scrollContainer.scrollLeft = tickWidth * WeekBufferDays;
      shouldCenterWeekScrollRef.current = false;
    }
    if (shouldCenterMonthScrollRef.current) {
      const firstMonthEndAt = new Date(
        stationRoutineManager.timeWindow.startAt
      );
      firstMonthEndAt.setMonth(firstMonthEndAt.getMonth() + 1, 1);
      scrollContainer.scrollLeft =
        ((firstMonthEndAt.getTime() -
          stationRoutineManager.timeWindow.startAt.getTime()) /
          (24 * 60 * 60 * 1000)) *
        tickWidth;
      shouldCenterMonthScrollRef.current = false;
    }

    window.requestAnimationFrame(() => {
      if (shouldCenterDayScroll) {
        scrollContainer.scrollLeft = tickWidth * DayBufferHours;
      }
      if (shouldCenterWeekScroll) {
        scrollContainer.scrollLeft = tickWidth * WeekBufferDays;
      }
      if (shouldCenterMonthScroll) {
        const firstMonthEndAt = new Date(
          stationRoutineManager.timeWindow.startAt
        );
        firstMonthEndAt.setMonth(firstMonthEndAt.getMonth() + 1, 1);
        scrollContainer.scrollLeft =
          ((firstMonthEndAt.getTime() -
            stationRoutineManager.timeWindow.startAt.getTime()) /
            (24 * 60 * 60 * 1000)) *
          tickWidth;
      }
      updateViewportWindow(scrollContainer);
    });
  }, [
    renderedTimeRailStations.length,
    stationRoutineManager.timeRailScale,
    stationRoutineManager.timeWindow.startAt,
    tickWidth,
    updateViewportWindow,
  ]);

  const moveTimeWindowByScroll = useCallback(
    (direction: "previous" | "next") => {
      const nextStartAt = new Date(stationRoutineManager.timeWindow.startAt);
      const nextEndAt = new Date(nextStartAt);

      if (stationRoutineManager.timeRailScale === "day") {
        nextStartAt.setHours(
          nextStartAt.getHours() + (direction === "previous" ? -1 : 1)
        );
        nextEndAt.setTime(nextStartAt.getTime());
        nextEndAt.setHours(nextEndAt.getHours() + DayBufferHours * 3);
        pendingScrollAdjustmentRef.current =
          direction === "previous" ? tickWidth : -tickWidth;
      }
      if (stationRoutineManager.timeRailScale === "week") {
        nextStartAt.setDate(
          nextStartAt.getDate() + (direction === "previous" ? -1 : 1)
        );
        nextEndAt.setTime(nextStartAt.getTime());
        nextEndAt.setDate(
          nextEndAt.getDate() + WeekVisibleDays + WeekBufferDays * 2
        );
        pendingScrollAdjustmentRef.current =
          direction === "previous" ? tickWidth : -tickWidth;
      }
      if (stationRoutineManager.timeRailScale === "month") {
        const shiftedMonthStartAt = new Date(nextStartAt);
        if (direction === "previous") {
          shiftedMonthStartAt.setMonth(shiftedMonthStartAt.getMonth() - 1, 1);
        }
        const shiftedMonthEndAt = new Date(shiftedMonthStartAt);
        shiftedMonthEndAt.setMonth(shiftedMonthEndAt.getMonth() + 1, 1);

        nextStartAt.setMonth(
          nextStartAt.getMonth() + (direction === "previous" ? -1 : 1),
          1
        );
        nextEndAt.setTime(nextStartAt.getTime());
        nextEndAt.setMonth(nextEndAt.getMonth() + 3, 1);
        pendingScrollAdjustmentRef.current =
          ((shiftedMonthEndAt.getTime() - shiftedMonthStartAt.getTime()) /
            (24 * 60 * 60 * 1000)) *
          tickWidth *
          (direction === "previous" ? 1 : -1);
      }

      stationRoutineManager.setTimeWindow({
        startAt: nextStartAt,
        endAt: nextEndAt,
      });
    },
    [
      stationRoutineManager.setTimeWindow,
      stationRoutineManager.timeRailScale,
      stationRoutineManager.timeWindow.startAt,
      tickWidth,
    ]
  );

  useEffect(() => {
    const timeRailsBody = timeRailsBodyRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!timeRailsBody || !scrollContainer) return;

    const handleWheel = (event: WheelEvent) => {
      if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) {
        return;
      }

      const scrollDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (scrollDelta === 0) return;

      event.preventDefault();
      const edgeThreshold =
        stationRoutineManager.timeRailScale === "day"
          ? tickWidth * 12
          : stationRoutineManager.timeRailScale === "week"
            ? tickWidth * 4
            : tickWidth * 4;
      const maxScrollLeft =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const rawNextScrollLeft = scrollContainer.scrollLeft + scrollDelta;
      const nextScrollLeft = Math.min(
        maxScrollLeft,
        Math.max(0, rawNextScrollLeft)
      );

      if (
        pendingScrollAdjustmentRef.current === null &&
        scrollDelta < 0 &&
        nextScrollLeft <= edgeThreshold
      ) {
        const leftEdgeScrollLeft = Math.min(edgeThreshold, maxScrollLeft);
        scrollContainer.scrollLeft = leftEdgeScrollLeft;
        pendingWheelDeltaRef.current = rawNextScrollLeft - leftEdgeScrollLeft;
        updateViewportWindow(scrollContainer);
        moveTimeWindowByScroll("previous");
        return;
      }

      if (
        pendingScrollAdjustmentRef.current === null &&
        scrollDelta > 0 &&
        maxScrollLeft - nextScrollLeft <= edgeThreshold
      ) {
        const rightEdgeScrollLeft = Math.max(0, maxScrollLeft - edgeThreshold);
        scrollContainer.scrollLeft = rightEdgeScrollLeft;
        pendingWheelDeltaRef.current = rawNextScrollLeft - rightEdgeScrollLeft;
        updateViewportWindow(scrollContainer);
        moveTimeWindowByScroll("next");
        return;
      }

      scrollContainer.scrollLeft = nextScrollLeft;
      updateViewportWindow(scrollContainer);
    };

    timeRailsBody.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      timeRailsBody.removeEventListener("wheel", handleWheel);
    };
  }, [
    moveTimeWindowByScroll,
    renderedTimeRailStations.length,
    stationRoutineManager.timeRailScale,
    tickWidth,
    updateViewportWindow,
  ]);

  const navigateToDate = (date: Date) => {
    const nextStartAt = new Date(date);
    nextStartAt.setHours(0, 0, 0, 0);
    const nextEndAt = new Date(nextStartAt);

    if (stationRoutineManager.timeRailScale === "day") {
      nextStartAt.setHours(nextStartAt.getHours() - DayBufferHours);
      nextEndAt.setTime(nextStartAt.getTime());
      nextEndAt.setHours(nextEndAt.getHours() + DayBufferHours * 3);
      shouldCenterDayScrollRef.current = true;
    }
    if (stationRoutineManager.timeRailScale === "week") {
      nextStartAt.setDate(
        nextStartAt.getDate() - WeekBufferDays - Math.floor(WeekVisibleDays / 2)
      );
      nextEndAt.setTime(nextStartAt.getTime());
      nextEndAt.setDate(
        nextEndAt.getDate() + WeekVisibleDays + WeekBufferDays * 2
      );
      shouldCenterWeekScrollRef.current = true;
    }
    if (stationRoutineManager.timeRailScale === "month") {
      nextStartAt.setDate(1);
      nextStartAt.setMonth(nextStartAt.getMonth() - 1);
      nextEndAt.setTime(nextStartAt.getTime());
      nextEndAt.setMonth(nextEndAt.getMonth() + 3, 1);
      shouldCenterMonthScrollRef.current = true;
    }

    stationRoutineManager.setTimeWindow({
      startAt: nextStartAt,
      endAt: nextEndAt,
    });
  };

  const visibleDayAt = new Date(stationRoutineManager.timeWindow.startAt);
  visibleDayAt.setHours(visibleDayAt.getHours() + DayBufferHours);
  const visibleWeekStartAt = new Date(stationRoutineManager.timeWindow.startAt);
  visibleWeekStartAt.setDate(visibleWeekStartAt.getDate() + WeekBufferDays);
  const visibleWeekEndAt = new Date(visibleWeekStartAt);
  visibleWeekEndAt.setDate(visibleWeekEndAt.getDate() + WeekVisibleDays - 1);
  const visibleWeekCenterAt = new Date(
    stationRoutineManager.timeWindow.startAt
  );
  visibleWeekCenterAt.setDate(
    visibleWeekCenterAt.getDate() +
      WeekBufferDays +
      Math.floor(WeekVisibleDays / 2)
  );
  const visibleMonthStartAt = new Date(
    stationRoutineManager.timeWindow.startAt
  );
  visibleMonthStartAt.setMonth(visibleMonthStartAt.getMonth() + 1, 1);
  const visibleMonthEndAt = new Date(visibleMonthStartAt);
  visibleMonthEndAt.setMonth(visibleMonthEndAt.getMonth() + 1, 0);

  return (
    <section
      className="
        @container flex max-h-[520px] w-full min-w-0 shrink-0 flex-col
        overflow-hidden rounded-md border border-border/60 bg-card/70 backdrop-blur-sm
      "
    >
      <div className="flex min-h-11 select-none items-center justify-between gap-3 border-b border-border/80 px-3 py-2 @max-[680px]:flex-col @max-[680px]:items-start">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">TimeRails</span>
          <span className="truncate text-xs text-muted-foreground">
            {stationRoutineManager.timeRailScale === "day"
              ? visibleDayAt.toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : stationRoutineManager.timeRailScale === "week"
                ? `${visibleWeekStartAt.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} - ${visibleWeekEndAt.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : `${visibleMonthStartAt.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} - ${visibleMonthEndAt.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-sm px-3 text-xs"
              >
                <CalendarDays className="size-3.5" />
                {stationRoutineManager.timeRailScale === "week"
                  ? visibleWeekStartAt
                      .toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })
                      .concat(" - ")
                      .concat(
                        visibleWeekEndAt.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })
                      )
                  : stationRoutineManager.timeRailScale === "day"
                    ? visibleDayAt.toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })
                    : visibleMonthStartAt.toLocaleDateString([], {
                        month: "short",
                        year: "numeric",
                      })}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto rounded-sm p-0">
              <Calendar
                mode="single"
                selected={
                  stationRoutineManager.timeRailScale === "week"
                    ? visibleWeekCenterAt
                    : stationRoutineManager.timeRailScale === "day"
                      ? visibleDayAt
                      : visibleMonthStartAt
                }
                onSelect={date => {
                  if (!date) return;
                  navigateToDate(date);
                  setIsDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-sm px-3 text-xs"
            onClick={() => navigateToDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      <div
        ref={timeRailsBodyRef}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {renderedTimeRailStations.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No stations match the current scope.
          </div>
        ) : (
          <div className="flex min-w-0">
            <TimeRailsStationBar
              stations={renderedTimeRailStations}
              onMove={moveStationPosition}
            />
            <div
              ref={scrollContainerRef}
              className="hide-scrollbar min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-contain"
              onScroll={event => {
                updateViewportWindow(event.currentTarget);
                if (pendingScrollAdjustmentRef.current !== null) return;

                const { clientWidth, scrollLeft, scrollWidth } =
                  event.currentTarget;
                if (scrollWidth <= clientWidth + tickWidth) return;
                const rightDistance = scrollWidth - clientWidth - scrollLeft;
                const edgeThreshold =
                  stationRoutineManager.timeRailScale === "day"
                    ? tickWidth * 12
                    : stationRoutineManager.timeRailScale === "week"
                      ? tickWidth * 4
                      : tickWidth * 4;
                if (scrollLeft < edgeThreshold) {
                  moveTimeWindowByScroll("previous");
                } else if (rightDistance < edgeThreshold) {
                  moveTimeWindowByScroll("next");
                }
              }}
            >
              <div style={{ width: contentWidth }}>
                <div
                  className="sticky top-0 z-10 select-none border-b border-border/60 bg-card"
                  style={{ width: contentWidth }}
                >
                  <div
                    className="relative h-10"
                    style={{ width: contentWidth }}
                  >
                    {tickMetrics.map(tickMetric => (
                      <div
                        key={tickMetric.tick.getTime()}
                        className={cn(
                          "absolute top-0 flex h-full items-center border-l px-2 text-xs text-muted-foreground",
                          stationRoutineManager.timeRailScale === "month" &&
                            tickMetric.tick.getDay() === 0
                            ? "border-border"
                            : "border-border/50"
                        )}
                        style={{
                          left: tickMetric.left,
                          width: tickMetric.width,
                        }}
                      >
                        {stationRoutineManager.timeRailScale === "day"
                          ? tickMetric.tick.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : stationRoutineManager.timeRailScale === "week"
                            ? tickMetric.tick.toLocaleDateString([], {
                                weekday: "short",
                                day: "numeric",
                              })
                            : tickMetric.tick.toLocaleDateString([], {
                                day: "numeric",
                              })}
                        <div
                          className="absolute top-0 right-0 h-full w-2 cursor-col-resize"
                          onPointerDown={event => {
                            event.preventDefault();
                            event.currentTarget.setPointerCapture(
                              event.pointerId
                            );
                            setResizingColumn({
                              key: tickMetric.tick.getTime(),
                              startX: event.clientX,
                              startWidth: tickMetric.width,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {renderedTimeRailStations.map(timeRailStation => {
                  const rowHeight = Math.max(
                    timeRailStation.railCount * 38 + 18,
                    56
                  );

                  return (
                    <div
                      className="relative border-t border-border/60"
                      key={timeRailStation.station.id}
                      style={{
                        height: rowHeight,
                        width: contentWidth,
                      }}
                    >
                      {tickMetrics.map(tickMetric => (
                        <div
                          className="pointer-events-none absolute top-0 h-full border-l border-dashed border-border/45"
                          key={tickMetric.tick.getTime()}
                          style={{ left: tickMetric.left }}
                        />
                      ))}
                      {timeRailStation.routines.length === 0 && (
                        <div className="sticky left-0 z-10 flex h-full w-40 items-center px-3 text-xs text-muted-foreground">
                          No routines
                        </div>
                      )}
                      {timeRailStation.routines.map(routine => {
                        const routineLayout =
                          timeRailStation.routineLayouts.get(routine.id);
                        if (!routineLayout) return null;

                        return (
                          <RoutineTrain
                            key={routine.id}
                            routine={routine}
                            left={routineLayout.left}
                            top={10 + routineLayout.railIndex * 38}
                            width={routineLayout.width}
                            stationName={timeRailStation.station.name}
                            isResizing={
                              resizingRoutine?.routineId === routine.id
                            }
                            onOpen={() => {
                              if (shouldSuppressRoutineOpenRef.current) {
                                return;
                              }
                              stationRoutineManager.openInspector({
                                type: "routine",
                                id: routine.id,
                              });
                            }}
                            onResizeStart={(edge, event) => {
                              shouldSuppressRoutineOpenRef.current = true;
                              setResizingRoutine({
                                routineId: routine.id,
                                edge,
                                startClientX: event.clientX,
                                originalStartAt: new Date(
                                  routine.scheduledStartAt
                                ),
                                originalEndAt: new Date(routine.scheduledEndAt),
                                originalLeft: routineLayout.left,
                                originalWidth: routineLayout.width,
                              });
                            }}
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
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TimeRails;
