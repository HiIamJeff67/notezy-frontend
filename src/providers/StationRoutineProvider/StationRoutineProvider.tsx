import { useGetAllMyRoutinesByTimeRange } from "@shared/api/hooks/routine.hook";
import { useGetAllMyRoutineTags } from "@shared/api/hooks/routineTag.hook";
import { useGetAllMyRoutineTasksByStationIds } from "@shared/api/hooks/routineTask.hook";
import { useGetAllMyStations } from "@shared/api/hooks/station.hook";
import { RoutineStatus, RoutineTaskStatus } from "@shared/api/interfaces/enums";
import type { GetAllMyRoutinesByTimeRangeResponse } from "@shared/api/interfaces/routine.interface";
import type { GetAllMyRoutineTagsResponse } from "@shared/api/interfaces/routineTag.interface";
import type { GetAllMyRoutineTasksByStationIdsResponse } from "@shared/api/interfaces/routineTask.interface";
import type { GetAllMyStationsResponse } from "@shared/api/interfaces/station.interface";
import { MaxTriggerValue } from "@shared/constants/triggerLimitations.constant";
import { LRUCache } from "@shared/lib/LRUCache";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import React, {
  createContext,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUser } from "@/hooks";
import { useRoutineLogic } from "./RoutineLogic";
import { useRoutineTagLogic } from "./RoutineTagLogic";
import { useRoutineTaskLogic } from "./RoutineTaskLogic";
import { useStationLogic } from "./StationLogic";

export interface StationRoutineInitialData {
  stations: GetAllMyStationsResponse["data"];
  routines: GetAllMyRoutinesByTimeRangeResponse["data"];
  routineTags: GetAllMyRoutineTagsResponse["data"];
  routineTasks: GetAllMyRoutineTasksByStationIdsResponse["data"];
}

export type StationRoutineInspectorTarget =
  | { type: "station"; id: UUID }
  | { type: "routine"; id: UUID }
  | { type: "routineTag"; id: UUID }
  | { type: "routineTask"; id: UUID };

interface StationRoutineBaseContext {
  inputRef: RefObject<HTMLInputElement | null>;
  routineTitleInputRef: RefObject<HTMLInputElement | null>;
  routineTagNameInputRef: RefObject<HTMLInputElement | null>;
  state: "idle" | "loading" | "syncing";
  viewMode: "overview" | "station";
  activeStationId: UUID | null;
  stations: StationNode[];
  routineTags: RoutineTagNode[];
  routineTasks: RoutineTaskNode[];
  routines: RoutineNode[];
  routinesMap: Map<UUID, RoutineNode>;
  activeStation: StationNode | null;
  activeStationRoutines: RoutineNode[];
  activeStationRoutineTasks: RoutineTaskNode[];
  activeStationRoutineTags: RoutineTagNode[];
  visibleStations: StationNode[];
  visibleRoutines: RoutineNode[];
  visibleRoutineTags: RoutineTagNode[];
  visibleRoutineTasks: RoutineTaskNode[];
  timeRailStations: {
    station: StationNode;
    routines: RoutineNode[];
    routineRailIndexes: Record<UUID, number>;
    railCount: number;
  }[];
  unscheduledRoutines: RoutineNode[];
  presence: {
    stationIds: UUID[];
    routineTagIds: UUID[];
    showUntaggedRoutines: boolean;
    query: string;
  };
  timeWindow: { startAt: Date; endAt: Date };
  timeRailScale: "day" | "week" | "month";
  statusSummary: {
    totalStations: number;
    totalRoutineTags: number;
    totalRoutines: number;
    totalRoutineTasks: number;
    visibleRoutines: number;
    scheduledRoutines: number;
    unscheduledRoutines: number;
    overdueRoutines: number;
    activeTasks: number;
  };
  getStationById: (stationId: UUID) => StationNode | undefined;
  getRoutineById: (routineId: UUID) => RoutineNode | undefined;
  getRoutineTagById: (routineTagId: UUID) => RoutineTagNode | undefined;
  getRoutineTaskById: (routineTaskId: UUID) => RoutineTaskNode | undefined;
  inspectorTarget: StationRoutineInspectorTarget | null;
  openInspector: (target: StationRoutineInspectorTarget) => void;
  closeInspector: () => void;
  setInitialData: (data: StationRoutineInitialData) => void;
  refresh: () => Promise<void>;
  setViewMode: (viewMode: "overview" | "station") => void;
  setActiveStationId: (stationId: UUID | null) => void;
  setPresenceQuery: (query: string) => void;
  setStationPresence: (stationIds: UUID[]) => void;
  setRoutineTagPresence: (routineTagIds: UUID[]) => void;
  toggleStationPresence: (stationId: UUID) => void;
  toggleRoutineTagPresence: (routineTagId: UUID) => void;
  toggleUntaggedRoutines: () => void;
  resetPresence: () => void;
  setTimeWindow: (timeWindow: { startAt: Date; endAt: Date }) => void;
  moveTimeWindow: (direction: "previous" | "next") => void;
  setTimeRailScale: (scale: "day" | "week" | "month") => void;
}

export type StationRoutineContextType = StationRoutineBaseContext &
  ReturnType<typeof useStationLogic> &
  ReturnType<typeof useRoutineLogic> &
  ReturnType<typeof useRoutineTagLogic> &
  ReturnType<typeof useRoutineTaskLogic>;

export const StationRoutineContext = createContext<
  StationRoutineContextType | undefined
>(undefined);

export const StationRoutineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const userManager = useUser();
  const getAllStationsQuerier = useGetAllMyStations();
  const getAllRoutinesQuerier = useGetAllMyRoutinesByTimeRange();
  const getAllRoutineTagsQuerier = useGetAllMyRoutineTags();
  const getAllRoutineTasksQuerier = useGetAllMyRoutineTasksByStationIds();

  const initialStartAt = new Date();
  initialStartAt.setHours(0, 0, 0, 0);
  const initialEndAt = new Date(initialStartAt);
  initialEndAt.setDate(initialEndAt.getDate() + 7);

  const inputRef = useRef<HTMLInputElement>(null);
  const routineTitleInputRef = useRef<HTMLInputElement>(null);
  const routineTagNameInputRef = useRef<HTMLInputElement>(null);
  const stationsRef = useRef(
    new LRUCache<UUID, StationNode>(Number.MAX_SAFE_INTEGER)
  );
  const routineTagsRef = useRef(
    new LRUCache<UUID, RoutineTagNode>(Number.MAX_SAFE_INTEGER)
  );
  const knownStationIdsRef = useRef<Set<UUID>>(new Set());
  const knownRoutineTagIdsRef = useRef<Set<UUID>>(new Set());
  const initializedUserPublicIdRef = useRef<string | null>(null);
  const presenceRef = useRef<{
    stationIds: UUID[];
    routineTagIds: UUID[];
    showUntaggedRoutines: boolean;
    query: string;
  }>({
    stationIds: [],
    routineTagIds: [],
    showUntaggedRoutines: true,
    query: "",
  });

  const [_, setUpdateTrigger] = useState<number>(0);
  const [state, setState] = useState<"idle" | "loading" | "syncing">("idle");
  const [viewMode, setViewMode] = useState<"overview" | "station">("overview");
  const [activeStationId, setActiveStationId] = useState<UUID | null>(null);
  const [inspectorTarget, setInspectorTarget] =
    useState<StationRoutineInspectorTarget | null>(null);
  const [timeWindow, setTimeWindow] = useState<{ startAt: Date; endAt: Date }>({
    startAt: initialStartAt,
    endAt: initialEndAt,
  });
  const [timeRailScale, setTimeRailScale] = useState<"day" | "week" | "month">(
    "week"
  );

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  const routineLogic = useRoutineLogic({
    inputRef: routineTitleInputRef,
    stationsRef,
    routineTagsRef,
    forceUpdate,
  });
  const stationLogic = useStationLogic({
    inputRef,
    stationsRef,
    routineTagsRef,
    forceUpdate,
    expandRoutinesByStationId: routineLogic.expandRoutinesByStationId,
    selectedRoutineId: routineLogic.selectedRoutineId,
    selectRoutine: routineLogic.selectRoutine,
  });
  const routineTagLogic = useRoutineTagLogic({
    inputRef: routineTagNameInputRef,
    stationsRef,
    routineTagsRef,
    forceUpdate,
    expandRoutinesByTagId: routineLogic.expandRoutinesByTagId,
  });
  const routineTaskLogic = useRoutineTaskLogic({
    stationsRef,
    forceUpdate,
  });

  const setInitialData = useCallback(
    (data: StationRoutineInitialData) => {
      const tasksByStationId = new Map<UUID, RoutineTaskNode[]>();
      const routinesByTagId = new Map<UUID, RoutineNode[]>();
      for (const routineTask of data.routineTasks) {
        const stationId = routineTask.stationId as UUID;
        const stationTasks = tasksByStationId.get(stationId) ?? [];
        stationTasks.push({
          id: routineTask.id as UUID,
          stationId,
          title: routineTask.title,
          purpose: routineTask.purpose,
          payload: routineTask.payload,
          priority: routineTask.priority,
          status: routineTask.status,
          attempts: routineTask.attempts,
          maxAttempts: routineTask.maxAttempts,
          scheduledAt: routineTask.scheduledAt,
          actualStartedAt: routineTask.actualStartedAt,
          actualEndedAt: routineTask.actualEndedAt,
          updatedAt: routineTask.updatedAt,
          createdAt: routineTask.createdAt,
        });
        tasksByStationId.set(stationId, stationTasks);
      }

      for (const station of data.stations) {
        const stationId = station.id as UUID;
        const existingStation = stationsRef.current.get(stationId);
        const routines = data.routines
          .filter(routine => routine.stationId === station.id)
          .map(routine => {
            const existingRoutine = existingStation?.routines.find(
              stationRoutine => stationRoutine.id === routine.id
            );
            const routineNode: RoutineNode = {
              id: routine.id as UUID,
              stationId,
              title: routine.title,
              description: routine.description,
              status: routine.status,
              isPinned: routine.isPinned,
              scheduledStartAt: routine.scheduledStartAt,
              scheduledEndAt: routine.scheduledEndAt,
              period: routine.period,
              timezone: routine.timezone,
              deletedAt: routine.deletedAt,
              updatedAt: routine.updatedAt,
              createdAt: routine.createdAt,
              isOpen: existingRoutine?.isOpen ?? false,
              routineTagIds: routine.tagIds as UUID[],
              routineTasks: existingRoutine?.routineTasks ?? [],
            };
            for (const routineTagId of routineNode.routineTagIds) {
              const tagRoutines = routinesByTagId.get(routineTagId) ?? [];
              tagRoutines.push(routineNode);
              routinesByTagId.set(routineTagId, tagRoutines);
            }
            return routineNode;
          });
        stationsRef.current.set(stationId, {
          id: stationId,
          name: station.name,
          description: station.description,
          icon: station.icon,
          headerBackgroundURL: station.headerBackgroundURL,
          permission: station.permission,
          routineCount: station.routineCount,
          deletedAt: station.deletedAt,
          updatedAt: station.updatedAt,
          createdAt: station.createdAt,
          isOpen: existingStation?.isOpen ?? false,
          routines,
          routineTasks: tasksByStationId.get(stationId) ?? [],
        });
      }

      for (const routineTag of data.routineTags) {
        const routineTagId = routineTag.id as UUID;
        const existingRoutineTag = routineTagsRef.current.get(routineTagId);
        routineTagsRef.current.set(routineTagId, {
          id: routineTagId,
          name: routineTag.name,
          color: routineTag.color,
          icon: routineTag.icon,
          updatedAt: routineTag.updatedAt,
          createdAt: routineTag.createdAt,
          routines: routinesByTagId.get(routineTagId) ?? [],
          routineCount: routinesByTagId.get(routineTagId)?.length ?? 0,
          isOpen: existingRoutineTag?.isOpen ?? false,
        });
      }
      forceUpdate();
    },
    [forceUpdate]
  );

  useEffect(() => {
    const userData = userManager.userData;
    if (!userData) return;
    if (initializedUserPublicIdRef.current === userData.publicId) return;

    initializedUserPublicIdRef.current = userData.publicId;
    let cancelled = false;
    setState("loading");
    void Promise.all([
      getAllStationsQuerier.fetch({
        param: {},
      }),
      getAllRoutineTagsQuerier.fetch({}),
    ])
      .then(async ([stationsResponse, routineTagsResponse]) => {
        if (cancelled) return;

        const stationIds = stationsResponse.data.map(
          station => station.id as UUID
        );
        const routines =
          stationIds.length === 0
            ? []
            : (
                await getAllRoutinesQuerier.fetch({
                  param: {
                    from: userData.createdAt,
                    to: new Date(),
                    stationIds,
                  },
                })
              ).data;
        if (cancelled) return;

        setInitialData({
          stations: stationsResponse.data,
          routines,
          routineTags: routineTagsResponse.data,
          routineTasks: [],
        });
      })
      .catch(error => {
        if (!cancelled) {
          initializedUserPublicIdRef.current = null;
          console.error("failed to search station routine data", error);
        }
      })
      .finally(() => {
        if (!cancelled) setState("idle");
      });

    return () => {
      cancelled = true;
    };
  }, [userManager.userData?.createdAt, userManager.userData?.publicId]);

  const stations = stationsRef.current.values();
  const routineTags = routineTagsRef.current.values();
  const stationIdsSignature = stations.map(station => station.id).join(",");
  const routineTagIdsSignature = routineTags
    .map(routineTag => routineTag.id)
    .join(",");

  useEffect(() => {
    const currentStationIds = stationsRef.current.keys() as UUID[];
    const currentRoutineTagIds = routineTagsRef.current.keys() as UUID[];
    const newStationIds = currentStationIds.filter(
      stationId => !knownStationIdsRef.current.has(stationId)
    );
    const newRoutineTagIds = currentRoutineTagIds.filter(
      routineTagId => !knownRoutineTagIdsRef.current.has(routineTagId)
    );
    const currentStationIdSet = new Set(currentStationIds);
    const currentRoutineTagIdSet = new Set(currentRoutineTagIds);

    presenceRef.current = {
      ...presenceRef.current,
      stationIds: [
        ...presenceRef.current.stationIds.filter(stationId =>
          currentStationIdSet.has(stationId)
        ),
        ...newStationIds,
      ],
      routineTagIds: [
        ...presenceRef.current.routineTagIds.filter(routineTagId =>
          currentRoutineTagIdSet.has(routineTagId)
        ),
        ...newRoutineTagIds,
      ],
    };
    knownStationIdsRef.current = currentStationIdSet;
    knownRoutineTagIdsRef.current = currentRoutineTagIdSet;
    if (newStationIds.length > 0 || newRoutineTagIds.length > 0) forceUpdate();
  }, [forceUpdate, routineTagIdsSignature, stationIdsSignature]);

  useEffect(() => {
    const stationIds = stationsRef.current.keys() as UUID[];
    if (stationIds.length === 0) return;

    let cancelled = false;
    setState("loading");
    void Promise.all([
      getAllRoutinesQuerier.fetch({
        param: {
          from: timeWindow.startAt,
          to: timeWindow.endAt,
          stationIds,
        },
      }),
      getAllRoutineTasksQuerier.fetch({
        param: {
          stationIds,
        },
      }),
    ])
      .then(([routinesResponse, routineTasksResponse]) => {
        if (cancelled) return;

        for (const stationId of stationIds) {
          const stationNode = stationsRef.current.get(stationId);
          if (!stationNode) continue;

          for (const routine of routinesResponse.data.filter(
            responseRoutine => responseRoutine.stationId === stationId
          )) {
            const existingRoutine = stationNode.routines.find(
              stationRoutine => stationRoutine.id === routine.id
            );
            const previousRoutineTagIds = existingRoutine?.routineTagIds ?? [];
            const routineNode: RoutineNode = {
              id: routine.id as UUID,
              stationId,
              title: routine.title,
              description: routine.description,
              status: routine.status,
              isPinned: routine.isPinned,
              scheduledStartAt: routine.scheduledStartAt,
              scheduledEndAt: routine.scheduledEndAt,
              period: routine.period,
              timezone: routine.timezone,
              deletedAt: routine.deletedAt,
              updatedAt: routine.updatedAt,
              createdAt: routine.createdAt,
              isOpen: existingRoutine?.isOpen ?? false,
              routineTagIds: routine.tagIds as UUID[],
              routineTasks: existingRoutine?.routineTasks ?? [],
            };
            if (existingRoutine) {
              Object.assign(existingRoutine, routineNode);
            } else {
              stationNode.routines.push(routineNode);
            }

            for (const previousRoutineTagId of previousRoutineTagIds) {
              if (routineNode.routineTagIds.includes(previousRoutineTagId)) {
                continue;
              }
              const routineTagNode =
                routineTagsRef.current.get(previousRoutineTagId);
              if (!routineTagNode) continue;
              const wasLinked = routineTagNode.routines.some(
                linkedRoutine => linkedRoutine.id === routineNode.id
              );
              routineTagNode.routines = routineTagNode.routines.filter(
                linkedRoutine => linkedRoutine.id !== routineNode.id
              );
              if (wasLinked) {
                routineTagNode.routineCount = Math.max(
                  0,
                  routineTagNode.routineCount - 1
                );
              }
            }
            for (const routineTagId of routineNode.routineTagIds) {
              const routineTagNode = routineTagsRef.current.get(routineTagId);
              if (!routineTagNode) continue;
              const wasLinked = routineTagNode.routines.some(
                linkedRoutine => linkedRoutine.id === routineNode.id
              );
              if (!wasLinked) {
                routineTagNode.routines.push(existingRoutine ?? routineNode);
                routineTagNode.routineCount++;
              }
            }
          }

          for (const routineTask of routineTasksResponse.data.filter(
            responseRoutineTask => responseRoutineTask.stationId === stationId
          )) {
            const existingRoutineTask = stationNode.routineTasks.find(
              stationRoutineTask => stationRoutineTask.id === routineTask.id
            );
            const routineTaskNode: RoutineTaskNode = {
              id: routineTask.id as UUID,
              stationId,
              title: routineTask.title,
              purpose: routineTask.purpose,
              payload: routineTask.payload,
              priority: routineTask.priority,
              status: routineTask.status,
              attempts: routineTask.attempts,
              maxAttempts: routineTask.maxAttempts,
              scheduledAt: routineTask.scheduledAt,
              actualStartedAt: routineTask.actualStartedAt,
              actualEndedAt: routineTask.actualEndedAt,
              updatedAt: routineTask.updatedAt,
              createdAt: routineTask.createdAt,
            };
            if (existingRoutineTask) {
              Object.assign(existingRoutineTask, routineTaskNode);
            } else {
              stationNode.routineTasks.push(routineTaskNode);
            }
          }
        }
        forceUpdate();
      })
      .catch(error => {
        if (!cancelled) {
          console.error("failed to load routine overview data", error);
        }
      })
      .finally(() => {
        if (!cancelled) setState("idle");
      });

    return () => {
      cancelled = true;
    };
  }, [forceUpdate, stationIdsSignature, timeWindow.endAt, timeWindow.startAt]);

  const refresh = useCallback(async () => {
    setState("syncing");
    try {
      stationsRef.current.clear();
      routineTagsRef.current.clear();
      knownStationIdsRef.current.clear();
      knownRoutineTagIdsRef.current.clear();
      presenceRef.current = {
        stationIds: [],
        routineTagIds: [],
        showUntaggedRoutines: true,
        query: presenceRef.current.query,
      };
      forceUpdate();
      const [stationsResponse, routineTagsResponse] = await Promise.all([
        getAllStationsQuerier.fetch({
          param: {},
        }),
        getAllRoutineTagsQuerier.fetch({}),
      ]);
      const stationIds = stationsResponse.data.map(
        station => station.id as UUID
      );
      const routines =
        stationIds.length === 0 || !userManager.userData
          ? []
          : (
              await getAllRoutinesQuerier.fetch({
                param: {
                  from: userManager.userData.createdAt,
                  to: new Date(),
                  stationIds,
                },
              })
            ).data;
      setInitialData({
        stations: stationsResponse.data,
        routines,
        routineTags: routineTagsResponse.data,
        routineTasks: [],
      });
    } finally {
      setState("idle");
    }
  }, [
    forceUpdate,
    getAllRoutineTagsQuerier,
    getAllRoutinesQuerier,
    getAllStationsQuerier,
    setInitialData,
    userManager.userData,
  ]);

  const setPresenceQuery = useCallback(
    (query: string) => {
      presenceRef.current = { ...presenceRef.current, query };
      forceUpdate();
    },
    [forceUpdate]
  );

  const setStationPresence = useCallback(
    (stationIds: UUID[]) => {
      presenceRef.current = { ...presenceRef.current, stationIds };
      forceUpdate();
    },
    [forceUpdate]
  );

  const setRoutineTagPresence = useCallback(
    (routineTagIds: UUID[]) => {
      presenceRef.current = { ...presenceRef.current, routineTagIds };
      forceUpdate();
    },
    [forceUpdate]
  );

  const toggleStationPresence = useCallback(
    (stationId: UUID) => {
      presenceRef.current = {
        ...presenceRef.current,
        stationIds: presenceRef.current.stationIds.includes(stationId)
          ? presenceRef.current.stationIds.filter(id => id !== stationId)
          : [...presenceRef.current.stationIds, stationId],
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const toggleRoutineTagPresence = useCallback(
    (routineTagId: UUID) => {
      presenceRef.current = {
        ...presenceRef.current,
        routineTagIds: presenceRef.current.routineTagIds.includes(routineTagId)
          ? presenceRef.current.routineTagIds.filter(id => id !== routineTagId)
          : [...presenceRef.current.routineTagIds, routineTagId],
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const toggleUntaggedRoutines = useCallback(() => {
    presenceRef.current = {
      ...presenceRef.current,
      showUntaggedRoutines: !presenceRef.current.showUntaggedRoutines,
    };
    forceUpdate();
  }, [forceUpdate]);

  const resetPresence = useCallback(() => {
    presenceRef.current = {
      stationIds: stationsRef.current.keys() as UUID[],
      routineTagIds: routineTagsRef.current.keys() as UUID[],
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

  const routinesMap = new Map<UUID, RoutineNode>();
  for (const station of stations) {
    for (const routine of station.routines) {
      routinesMap.set(routine.id, routine);
    }
  }
  for (const routineTag of routineTags) {
    for (const routine of routineTag.routines) {
      if (!routinesMap.has(routine.id)) routinesMap.set(routine.id, routine);
    }
  }
  const routines = Array.from(routinesMap.values());

  const routineTasksMap = new Map<UUID, RoutineTaskNode>();
  for (const station of stations) {
    for (const routineTask of station.routineTasks) {
      routineTasksMap.set(routineTask.id, routineTask);
    }
    for (const routine of station.routines) {
      for (const routineTask of routine.routineTasks) {
        if (!routineTasksMap.has(routineTask.id)) {
          routineTasksMap.set(routineTask.id, routineTask);
        }
      }
    }
  }
  const routineTasks = Array.from(routineTasksMap.values());

  const activeStation =
    stations.find(station => station.id === activeStationId) ?? null;
  const activeStationRoutines = activeStation?.routines ?? [];
  const activeStationRoutineTasks = activeStation?.routineTasks ?? [];
  const activeStationRoutineTagIds = new Set(
    activeStationRoutines.flatMap(routine => routine.routineTagIds)
  );
  const activeStationRoutineTags = routineTags.filter(routineTag =>
    activeStationRoutineTagIds.has(routineTag.id)
  );
  const visibleRoutineTags = routineTags.filter(routineTag =>
    presenceRef.current.routineTagIds.includes(routineTag.id)
  );
  const query = presenceRef.current.query.trim().toLowerCase();
  const selectedStationIds = new Set(
    viewMode === "station" && activeStationId
      ? [activeStationId]
      : presenceRef.current.stationIds
  );
  const visibleStations = stations.filter(station =>
    selectedStationIds.has(station.id)
  );
  const visibleRoutineTasks = routineTasks.filter(routineTask =>
    selectedStationIds.has(routineTask.stationId)
  );
  const selectedRoutineTagIds = new Set(presenceRef.current.routineTagIds);
  const isAllRoutineTagsVisible =
    routineTags.length === selectedRoutineTagIds.size;
  const visibleRoutines = routines.filter(routine => {
    if (!selectedStationIds.has(routine.stationId)) return false;
    if (query.length > 0) {
      const searchableText =
        `${routine.title} ${routine.description}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }
    if (routine.routineTagIds.length === 0) {
      return presenceRef.current.showUntaggedRoutines;
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

  const statusSummary = {
    totalStations: stations.length,
    totalRoutineTags: routineTags.length,
    totalRoutines: routines.length,
    totalRoutineTasks: routineTasks.length,
    visibleRoutines: visibleRoutines.length,
    scheduledRoutines: visibleRoutines.length - unscheduledRoutines.length,
    unscheduledRoutines: unscheduledRoutines.length,
    overdueRoutines: visibleRoutines.filter(
      routine => routine.status === RoutineStatus.OverDue
    ).length,
    activeTasks: routineTasks.filter(routineTask =>
      [
        RoutineTaskStatus.Idle,
        RoutineTaskStatus.Waiting,
        RoutineTaskStatus.Running,
      ].includes(routineTask.status)
    ).length,
  };

  const getStationById = useCallback(
    (stationId: UUID) => stationsRef.current.get(stationId),
    []
  );
  const getRoutineById = useCallback(
    (routineId: UUID) => routinesMap.get(routineId),
    [routinesMap]
  );
  const getRoutineTagById = useCallback(
    (routineTagId: UUID) => routineTagsRef.current.get(routineTagId),
    []
  );
  const getRoutineTaskById = useCallback(
    (routineTaskId: UUID) => routineTasksMap.get(routineTaskId),
    [routineTasksMap]
  );
  const openInspector = useCallback((target: StationRoutineInspectorTarget) => {
    window.setTimeout(() => {
      setInspectorTarget(target);
    }, 0);
  }, []);
  const closeInspector = useCallback(() => {
    setInspectorTarget(null);
  }, []);

  const contextValue: StationRoutineContextType = {
    inputRef,
    routineTitleInputRef,
    routineTagNameInputRef,
    state,
    viewMode,
    activeStationId,
    stations,
    routineTags,
    routineTasks,
    routines,
    routinesMap,
    activeStation,
    activeStationRoutines,
    activeStationRoutineTasks,
    activeStationRoutineTags,
    visibleStations,
    visibleRoutines,
    visibleRoutineTags,
    visibleRoutineTasks,
    timeRailStations,
    unscheduledRoutines,
    presence: presenceRef.current,
    timeWindow,
    timeRailScale,
    statusSummary,
    getStationById,
    getRoutineById,
    getRoutineTagById,
    getRoutineTaskById,
    inspectorTarget,
    openInspector,
    closeInspector,
    setInitialData,
    refresh,
    setViewMode,
    setActiveStationId,
    setPresenceQuery,
    setStationPresence,
    setRoutineTagPresence,
    toggleStationPresence,
    toggleRoutineTagPresence,
    toggleUntaggedRoutines,
    resetPresence,
    setTimeWindow,
    moveTimeWindow,
    setTimeRailScale,
    ...stationLogic,
    ...routineLogic,
    ...routineTagLogic,
    ...routineTaskLogic,
  };

  return (
    <StationRoutineContext value={contextValue}>
      {children}
    </StationRoutineContext>
  );
};
