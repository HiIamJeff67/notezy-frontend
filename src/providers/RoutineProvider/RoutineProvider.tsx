import {
  useCreateRoutineByStationId,
  useLinkRoutineItemById,
  useLinkRoutineTagById,
  useLinkRoutineTaskById,
  useUpdateMyRoutineById,
} from "@shared/api/hooks/routine.hook";
import { RoutineStatus, RoutineTaskStatus } from "@shared/api/interfaces/enums";
import type {
  CreateRoutineByStationIdRequest,
  CreateRoutineByStationIdResponse,
  LinkRoutineItemByIdRequest,
  LinkRoutineItemByIdResponse,
  LinkRoutineTagByIdRequest,
  LinkRoutineTagByIdResponse,
  LinkRoutineTaskByIdRequest,
  LinkRoutineTaskByIdResponse,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutineByIdResponse,
} from "@shared/api/interfaces/routine.interface";
import { MaxTriggerValue } from "@shared/constants/triggerLimitations.constant";
import type { RoutineMeta } from "@shared/types/routineMeta.type";
import type {
  RoutineLoadState,
  RoutineProviderData,
  RoutineScope,
  RoutineStationRail,
  RoutineStatusSummary,
  RoutineTimeRailScale,
  RoutineTimeWindow,
  RoutineViewMode,
} from "@shared/types/routineProvider.type";
import type { RoutineTagMeta } from "@shared/types/routineTagMeta.type";
import type { RoutineTaskMeta } from "@shared/types/routineTaskMeta.type";
import type { StationMeta } from "@shared/types/stationMeta.type";
import type { UUID } from "crypto";
import React, { createContext, useCallback, useRef, useState } from "react";

export interface RoutineContextType {
  state: RoutineLoadState;
  viewMode: RoutineViewMode;
  activeStationId: UUID | null;
  stations: StationMeta[];
  routineTags: RoutineTagMeta[];
  routineTasks: RoutineTaskMeta[];
  routines: RoutineMeta[];
  activeStation: StationMeta | null;
  activeStationRoutines: RoutineMeta[];
  activeStationRoutineTasks: RoutineTaskMeta[];
  activeStationRoutineTags: RoutineTagMeta[];
  visibleStations: StationMeta[];
  visibleRoutines: RoutineMeta[];
  visibleRoutineTags: RoutineTagMeta[];
  timeRailStations: RoutineStationRail[];
  unscheduledRoutines: RoutineMeta[];
  scope: RoutineScope;
  timeWindow: RoutineTimeWindow;
  timeRailScale: RoutineTimeRailScale;
  statusSummary: RoutineStatusSummary;
  selectedStationId: UUID | null;
  selectedRoutineId: UUID | null;
  selectedRoutineTagId: UUID | null;
  selectedRoutineTaskId: UUID | null;
  setRoutineData: (data: RoutineProviderData) => void;
  loadOverview: () => Promise<void>;
  loadStation: (stationId: UUID) => Promise<void>;
  refreshOverview: () => Promise<void>;
  setViewMode: (viewMode: RoutineViewMode) => void;
  setActiveStationId: (stationId: UUID | null) => void;
  setScopeQuery: (query: string) => void;
  setStationScope: (stationIds: UUID[]) => void;
  setRoutineTagScope: (routineTagIds: UUID[]) => void;
  toggleStationScope: (stationId: UUID) => void;
  toggleRoutineTagScope: (routineTagId: UUID) => void;
  toggleUntaggedRoutines: () => void;
  resetScope: () => void;
  setTimeWindow: (timeWindow: RoutineTimeWindow) => void;
  moveTimeWindow: (direction: "previous" | "next") => void;
  setTimeRailScale: (scale: RoutineTimeRailScale) => void;
  selectStation: (stationId: UUID | null) => void;
  selectRoutine: (routineId: UUID | null) => void;
  selectRoutineTag: (routineTagId: UUID | null) => void;
  selectRoutineTask: (routineTaskId: UUID | null) => void;
  createRoutineByStationId: (
    request: CreateRoutineByStationIdRequest
  ) => Promise<CreateRoutineByStationIdResponse>;
  updateRoutineById: (
    request: UpdateMyRoutineByIdRequest
  ) => Promise<UpdateMyRoutineByIdResponse>;
  linkRoutineTagById: (
    request: LinkRoutineTagByIdRequest
  ) => Promise<LinkRoutineTagByIdResponse>;
  linkRoutineTaskById: (
    request: LinkRoutineTaskByIdRequest
  ) => Promise<LinkRoutineTaskByIdResponse>;
  linkRoutineItemById: (
    request: LinkRoutineItemByIdRequest
  ) => Promise<LinkRoutineItemByIdResponse>;
}

export const RoutineContext = createContext<RoutineContextType | undefined>(
  undefined
);

export const RoutineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const createRoutineMutator = useCreateRoutineByStationId();
  const updateRoutineMutator = useUpdateMyRoutineById();
  const linkRoutineTagMutator = useLinkRoutineTagById();
  const linkRoutineTaskMutator = useLinkRoutineTaskById();
  const linkRoutineItemMutator = useLinkRoutineItemById();

  const initialStartAt = new Date();
  initialStartAt.setHours(0, 0, 0, 0);
  const initialEndAt = new Date(initialStartAt);
  initialEndAt.setDate(initialEndAt.getDate() + 7);

  const stationsRef = useRef<StationMeta[]>([]);
  const routineTagsRef = useRef<RoutineTagMeta[]>([]);
  const routineTasksRef = useRef<RoutineTaskMeta[]>([]);
  const scopeRef = useRef<RoutineScope>({
    stationIds: [],
    routineTagIds: [],
    showUntaggedRoutines: true,
    query: "",
  });

  const [_, setUpdateTrigger] = useState<number>(0);
  const [state, setState] = useState<RoutineLoadState>("idle");
  const [viewMode, setViewMode] = useState<RoutineViewMode>("overview");
  const [activeStationId, setActiveStationId] = useState<UUID | null>(null);
  const [timeWindow, setTimeWindow] = useState<RoutineTimeWindow>({
    startAt: initialStartAt,
    endAt: initialEndAt,
  });
  const [timeRailScale, setTimeRailScale] =
    useState<RoutineTimeRailScale>("week");
  const [selectedStationId, selectStation] = useState<UUID | null>(null);
  const [selectedRoutineId, selectRoutine] = useState<UUID | null>(null);
  const [selectedRoutineTagId, selectRoutineTag] = useState<UUID | null>(null);
  const [selectedRoutineTaskId, selectRoutineTask] = useState<UUID | null>(
    null
  );

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  const setRoutineData = useCallback(
    (data: RoutineProviderData) => {
      stationsRef.current = data.stations;
      routineTagsRef.current = data.routineTags;
      routineTasksRef.current = data.routineTasks;
      scopeRef.current = {
        stationIds: data.stations.map(station => station.id),
        routineTagIds: data.routineTags.map(routineTag => routineTag.id),
        showUntaggedRoutines: true,
        query: "",
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const loadOverview = useCallback(async () => {
    setViewMode("overview");
    setActiveStationId(null);
    setState("loading");
    setState("idle");
  }, []);

  const loadStation = useCallback(async (stationId: UUID) => {
    setViewMode("station");
    setActiveStationId(stationId);
    setState("loading");
    setState("idle");
  }, []);

  const refreshOverview = useCallback(async () => {
    setState("syncing");
    await loadOverview();
    setState("idle");
  }, [loadOverview]);

  const setScopeQuery = useCallback(
    (query: string) => {
      scopeRef.current = { ...scopeRef.current, query };
      forceUpdate();
    },
    [forceUpdate]
  );

  const setStationScope = useCallback(
    (stationIds: UUID[]) => {
      scopeRef.current = { ...scopeRef.current, stationIds };
      forceUpdate();
    },
    [forceUpdate]
  );

  const setRoutineTagScope = useCallback(
    (routineTagIds: UUID[]) => {
      scopeRef.current = { ...scopeRef.current, routineTagIds };
      forceUpdate();
    },
    [forceUpdate]
  );

  const toggleStationScope = useCallback(
    (stationId: UUID) => {
      scopeRef.current = {
        ...scopeRef.current,
        stationIds: scopeRef.current.stationIds.includes(stationId)
          ? scopeRef.current.stationIds.filter(id => id !== stationId)
          : [...scopeRef.current.stationIds, stationId],
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const toggleRoutineTagScope = useCallback(
    (routineTagId: UUID) => {
      scopeRef.current = {
        ...scopeRef.current,
        routineTagIds: scopeRef.current.routineTagIds.includes(routineTagId)
          ? scopeRef.current.routineTagIds.filter(id => id !== routineTagId)
          : [...scopeRef.current.routineTagIds, routineTagId],
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const toggleUntaggedRoutines = useCallback(() => {
    scopeRef.current = {
      ...scopeRef.current,
      showUntaggedRoutines: !scopeRef.current.showUntaggedRoutines,
    };
    forceUpdate();
  }, [forceUpdate]);

  const resetScope = useCallback(() => {
    scopeRef.current = {
      stationIds: stationsRef.current.map(station => station.id),
      routineTagIds: routineTagsRef.current.map(routineTag => routineTag.id),
      showUntaggedRoutines: true,
      query: "",
    };
    forceUpdate();
  }, [forceUpdate]);

  const moveTimeWindow = useCallback(
    (direction: "previous" | "next") => {
      const multiplier = direction === "previous" ? -1 : 1;
      const nextStartAt = new Date(timeWindow.startAt);
      const nextEndAt = new Date(timeWindow.endAt);

      if (timeRailScale === "day") {
        nextStartAt.setDate(nextStartAt.getDate() + multiplier);
        nextEndAt.setDate(nextEndAt.getDate() + multiplier);
      }
      if (timeRailScale === "week") {
        nextStartAt.setDate(nextStartAt.getDate() + multiplier * 7);
        nextEndAt.setDate(nextEndAt.getDate() + multiplier * 7);
      }
      if (timeRailScale === "month") {
        nextStartAt.setMonth(nextStartAt.getMonth() + multiplier);
        nextEndAt.setMonth(nextEndAt.getMonth() + multiplier);
      }

      setTimeWindow({ startAt: nextStartAt, endAt: nextEndAt });
    },
    [timeRailScale, timeWindow]
  );

  const routines = stationsRef.current.flatMap(station => station.routines);
  const activeStation =
    stationsRef.current.find(station => station.id === activeStationId) ?? null;
  const activeStationRoutines = activeStation
    ? routines.filter(routine => routine.stationId === activeStation.id)
    : [];
  const activeStationRoutineTasks = activeStation
    ? routineTasksRef.current.filter(
        routineTask => routineTask.stationId === activeStation.id
      )
    : [];
  const activeStationRoutineTagIds = new Set(
    activeStationRoutines.flatMap(routine => routine.routineTagIds)
  );
  const activeStationRoutineTags = routineTagsRef.current.filter(routineTag =>
    activeStationRoutineTagIds.has(routineTag.id)
  );
  const visibleRoutineTags = routineTagsRef.current.filter(routineTag =>
    scopeRef.current.routineTagIds.includes(routineTag.id)
  );
  const visibleStations = stationsRef.current.filter(station =>
    scopeRef.current.stationIds.includes(station.id)
  );
  const query = scopeRef.current.query.trim().toLowerCase();
  const selectedStationIds = new Set(scopeRef.current.stationIds);
  const selectedRoutineTagIds = new Set(scopeRef.current.routineTagIds);
  const isAllRoutineTagsVisible =
    routineTagsRef.current.length === selectedRoutineTagIds.size;
  const visibleRoutines = routines.filter(routine => {
    if (!selectedStationIds.has(routine.stationId)) return false;
    if (query.length > 0) {
      const searchableText =
        `${routine.title} ${routine.description}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }
    if (routine.routineTagIds.length === 0) {
      return scopeRef.current.showUntaggedRoutines;
    }
    if (isAllRoutineTagsVisible) return true;
    return routine.routineTagIds.some(routineTagId =>
      selectedRoutineTagIds.has(routineTagId)
    );
  });
  const timeRailStations = visibleStations.map(station => {
    const stationRoutines = visibleRoutines.filter(routine => {
      const hasValidSchedule =
        routine.scheduledStartAt instanceof Date &&
        routine.scheduledEndAt instanceof Date &&
        !Number.isNaN(routine.scheduledStartAt.getTime()) &&
        !Number.isNaN(routine.scheduledEndAt.getTime());

      if (!hasValidSchedule) return false;

      return (
        routine.stationId === station.id &&
        routine.scheduledStartAt < timeWindow.endAt &&
        routine.scheduledEndAt > timeWindow.startAt
      );
    });
    const sortedRoutines = [...stationRoutines].sort(
      (a, b) => a.scheduledStartAt.getTime() - b.scheduledStartAt.getTime()
    );
    const railEndTimes: Date[] = [];
    const routineRailIndexes: Record<UUID, number> = {};

    for (const routine of sortedRoutines) {
      const targetRailIndex = railEndTimes.findIndex(
        endAt => endAt <= routine.scheduledStartAt
      );
      const railIndex =
        targetRailIndex === -1 ? railEndTimes.length : targetRailIndex;
      routineRailIndexes[routine.id] = railIndex;
      railEndTimes[railIndex] = routine.scheduledEndAt;
    }

    return {
      station,
      routines: sortedRoutines,
      routineRailIndexes,
      railCount: Math.max(railEndTimes.length, 1),
    };
  });
  const unscheduledRoutines = visibleRoutines.filter(routine => {
    return !(
      routine.scheduledStartAt instanceof Date &&
      routine.scheduledEndAt instanceof Date &&
      !Number.isNaN(routine.scheduledStartAt.getTime()) &&
      !Number.isNaN(routine.scheduledEndAt.getTime())
    );
  });
  const statusSummary: RoutineStatusSummary = {
    totalStations: stationsRef.current.length,
    totalRoutineTags: routineTagsRef.current.length,
    totalRoutines: routines.length,
    visibleRoutines: visibleRoutines.length,
    scheduledRoutines: visibleRoutines.length - unscheduledRoutines.length,
    unscheduledRoutines: unscheduledRoutines.length,
    overdueRoutines: visibleRoutines.filter(
      routine => routine.status === RoutineStatus.OverDue
    ).length,
    activeTasks: routineTasksRef.current.filter(routineTask =>
      [
        RoutineTaskStatus.Idle,
        RoutineTaskStatus.Waiting,
        RoutineTaskStatus.Running,
      ].includes(routineTask.status)
    ).length,
  };

  const contextValue: RoutineContextType = {
    state,
    viewMode,
    activeStationId,
    stations: stationsRef.current,
    routineTags: routineTagsRef.current,
    routineTasks: routineTasksRef.current,
    routines,
    activeStation,
    activeStationRoutines,
    activeStationRoutineTasks,
    activeStationRoutineTags,
    visibleStations,
    visibleRoutines,
    visibleRoutineTags,
    timeRailStations,
    unscheduledRoutines,
    scope: scopeRef.current,
    timeWindow,
    timeRailScale,
    statusSummary,
    selectedStationId,
    selectedRoutineId,
    selectedRoutineTagId,
    selectedRoutineTaskId,
    setRoutineData,
    loadOverview,
    loadStation,
    refreshOverview,
    setViewMode,
    setActiveStationId,
    setScopeQuery,
    setStationScope,
    setRoutineTagScope,
    toggleStationScope,
    toggleRoutineTagScope,
    toggleUntaggedRoutines,
    resetScope,
    setTimeWindow,
    moveTimeWindow,
    setTimeRailScale,
    selectStation,
    selectRoutine,
    selectRoutineTag,
    selectRoutineTask,
    createRoutineByStationId: createRoutineMutator.mutateAsync,
    updateRoutineById: updateRoutineMutator.mutateAsync,
    linkRoutineTagById: linkRoutineTagMutator.mutateAsync,
    linkRoutineTaskById: linkRoutineTaskMutator.mutateAsync,
    linkRoutineItemById: linkRoutineItemMutator.mutateAsync,
  };

  return <RoutineContext value={contextValue}>{children}</RoutineContext>;
};
