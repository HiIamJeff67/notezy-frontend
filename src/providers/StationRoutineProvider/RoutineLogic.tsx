import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineStatus as GraphQLRoutineStatus,
  RoutineTaskPurpose as GraphQLRoutineTaskPurpose,
  RoutineTaskStatus as GraphQLRoutineTaskStatus,
  SupportedIcon as GraphQLSupportedIcon,
  SearchRoutineSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutinesLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutines";
import {
  useCreateRoutineByStationId,
  useLinkRoutineItemById,
  useLinkRoutineTagById,
  useLinkRoutineTaskById,
  useUpdateMyRoutineById,
} from "@shared/api/hooks/routine.hook";
import {
  AccessControlPermission,
  ItemType,
  RoutinePeriod,
  RoutineStatus,
  RoutineTaskPurpose,
  RoutineTaskStatus,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import type { UpdateMyRoutineByIdRequest } from "@shared/api/interfaces/routine.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useEffect, useState } from "react";

export interface CreateRoutineValues {
  title: string;
  description: string;
  status?: RoutineStatus;
  isPinned?: boolean;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  period?: RoutinePeriod | null;
  timezone?: string;
}

interface UseRoutineLogicProps {
  inputRef: RefObject<HTMLInputElement | null>;
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  routineTagsRef: RefObject<LRUCache<UUID, RoutineTagNode>>;
  forceUpdate: () => void;
}

export const useRoutineLogic = ({
  inputRef,
  stationsRef,
  routineTagsRef,
  forceUpdate,
}: UseRoutineLogicProps) => {
  const createRoutineMutator = useCreateRoutineByStationId();
  const updateRoutineMutator = useUpdateMyRoutineById();
  const linkRoutineTagMutator = useLinkRoutineTagById();
  const linkRoutineTaskMutator = useLinkRoutineTaskById();
  const linkRoutineItemMutator = useLinkRoutineItemById();

  const [selectedRoutineId, selectRoutine] = useState<UUID | null>(null);
  const [editingRoutineNode, setEditingRoutineNode] =
    useState<RoutineNode | null>(null);
  const [originalRoutineTitle, setOriginalRoutineTitle] = useState<string>("");
  const [editRoutineTitle, setEditRoutineTitle] = useState<string>("");

  const [executeSearchRoutines, routineSearch] = useSearchRoutinesLazyQuery();

  const searchRoutines = useCallback(
    async (query: string = "", stationId?: UUID): Promise<void> => {
      const result = await executeSearchRoutines({
        variables: {
          input: {
            query,
            first: MaxSearchLimit,
            stationId,
            sortBy: SearchRoutineSortBy.Title,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }).retain();
      const searchEdges = result.data?.searchRoutines.searchEdges ?? [];
      const searchedRoutinesByStationId = new Map<UUID, RoutineNode[]>();

      for (const edge of searchEdges) {
        const node = edge.node as unknown as {
          id: UUID;
          stationId: UUID;
          title: string;
          description: string;
          status: GraphQLRoutineStatus;
          isPinned: boolean;
          scheduledStartAt: Date | string | number;
          scheduledEndAt: Date | string | number;
          period: GraphQLRoutinePeriod | null;
          timezone: string;
          deletedAt: Date | string | number | null;
          updatedAt: Date | string | number;
          createdAt: Date | string | number;
          station: {
            id: UUID;
            name: string;
            description: string;
            icon: GraphQLSupportedIcon | null;
            headerBackgroundURL: string | null;
            permission: AccessControlPermission;
            routineCount: number;
            deletedAt: Date | string | number | null;
            updatedAt: Date | string | number;
            createdAt: Date | string | number;
          };
          tags: Array<{
            id: UUID;
            name: string;
            color: string;
            icon: GraphQLSupportedIcon | null;
            updatedAt: Date | string | number;
            createdAt: Date | string | number;
          }>;
          tasks: Array<{
            id: UUID;
            stationId: UUID;
            title: string;
            purpose: GraphQLRoutineTaskPurpose;
            payload: unknown;
            priority: number;
            status: GraphQLRoutineTaskStatus;
            attempts: number;
            maxAttempts: number;
            scheduledAt: Date | string | number;
            actualStartedAt: Date | string | number | null;
            actualEndedAt: Date | string | number | null;
            updatedAt: Date | string | number;
            createdAt: Date | string | number;
          }>;
        };

        let stationNode = stationsRef.current.get(node.stationId);
        if (!stationNode) {
          const stationIcon = (() => {
            switch (node.station.icon) {
              case GraphQLSupportedIcon.SupportedIconBooks:
                return SupportedIcon.Books;
              case GraphQLSupportedIcon.SupportedIconCalendar:
                return SupportedIcon.Calendar;
              case GraphQLSupportedIcon.SupportedIconCheckMark:
                return SupportedIcon.CheckMark;
              case GraphQLSupportedIcon.SupportedIconClock:
                return SupportedIcon.Clock;
              case GraphQLSupportedIcon.SupportedIconFire:
                return SupportedIcon.Fire;
              case GraphQLSupportedIcon.SupportedIconFolderOpen:
                return SupportedIcon.FolderOpen;
              case GraphQLSupportedIcon.SupportedIconGrinningFace:
                return SupportedIcon.GrinningFace;
              case GraphQLSupportedIcon.SupportedIconLightbulb:
                return SupportedIcon.Lightbulb;
              case GraphQLSupportedIcon.SupportedIconNotebook:
                return SupportedIcon.Notebook;
              case GraphQLSupportedIcon.SupportedIconPencilPaper:
                return SupportedIcon.PencilPaper;
              case GraphQLSupportedIcon.SupportedIconPin:
                return SupportedIcon.Pin;
              case GraphQLSupportedIcon.SupportedIconRedHeart:
                return SupportedIcon.RedHeart;
              case GraphQLSupportedIcon.SupportedIconRocket:
                return SupportedIcon.Rocket;
              case GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes:
                return SupportedIcon.SmilingFaceWithSmilingEyes;
              case GraphQLSupportedIcon.SupportedIconStar:
                return SupportedIcon.Star;
              default:
                return null;
            }
          })();
          stationNode = {
            id: node.station.id,
            name: node.station.name,
            description: node.station.description,
            icon: stationIcon,
            headerBackgroundURL: node.station.headerBackgroundURL,
            permission: node.station
              .permission as unknown as AccessControlPermission,
            routineCount: node.station.routineCount,
            deletedAt:
              node.station.deletedAt === null
                ? null
                : new Date(node.station.deletedAt),
            updatedAt: new Date(node.station.updatedAt),
            createdAt: new Date(node.station.createdAt),
            isOpen: false,
            routines: [],
            routineTasks: [],
          };
          stationsRef.current.set(stationNode.id, stationNode);
        }

        const routineTasks = node.tasks.map(task => {
          const existingRoutineTask = stationNode.routineTasks.find(
            routineTask => routineTask.id === task.id
          );
          const routineTask: RoutineTaskNode = {
            id: task.id,
            stationId: task.stationId,
            title: task.title,
            purpose:
              task.purpose ===
              GraphQLRoutineTaskPurpose.RoutineTaskPurposeCreateBlockPack
                ? RoutineTaskPurpose.CreateBlockPack
                : task.purpose ===
                    GraphQLRoutineTaskPurpose.RoutineTaskPurposeDeleteBlockPack
                  ? RoutineTaskPurpose.DeleteBlockPack
                  : task.purpose ===
                      GraphQLRoutineTaskPurpose.RoutineTaskPurposeCreateBlock
                    ? RoutineTaskPurpose.CreateBlock
                    : task.purpose ===
                        GraphQLRoutineTaskPurpose.RoutineTaskPurposeUpdateBlock
                      ? RoutineTaskPurpose.UpdateBlock
                      : RoutineTaskPurpose.DeleteBlock,
            payload: task.payload,
            priority: task.priority,
            status:
              task.status === GraphQLRoutineTaskStatus.RoutineTaskStatusWaiting
                ? RoutineTaskStatus.Waiting
                : task.status ===
                    GraphQLRoutineTaskStatus.RoutineTaskStatusRunning
                  ? RoutineTaskStatus.Running
                  : task.status ===
                      GraphQLRoutineTaskStatus.RoutineTaskStatusPause
                    ? RoutineTaskStatus.Pause
                    : task.status ===
                        GraphQLRoutineTaskStatus.RoutineTaskStatusCancel
                      ? RoutineTaskStatus.Cancel
                      : task.status ===
                          GraphQLRoutineTaskStatus.RoutineTaskStatusSuccess
                        ? RoutineTaskStatus.Success
                        : task.status ===
                            GraphQLRoutineTaskStatus.RoutineTaskStatusFail
                          ? RoutineTaskStatus.Fail
                          : RoutineTaskStatus.Idle,
            attempts: task.attempts,
            maxAttempts: task.maxAttempts,
            scheduledAt: new Date(task.scheduledAt),
            actualStartedAt:
              task.actualStartedAt === null
                ? null
                : new Date(task.actualStartedAt),
            actualEndedAt:
              task.actualEndedAt === null ? null : new Date(task.actualEndedAt),
            updatedAt: new Date(task.updatedAt),
            createdAt: new Date(task.createdAt),
          };

          if (existingRoutineTask) {
            Object.assign(existingRoutineTask, routineTask);
            return existingRoutineTask;
          }
          stationNode.routineTasks.push(routineTask);
          return routineTask;
        });

        const routineTagIds = node.tags.map(tag => {
          const existingRoutineTag = routineTagsRef.current.get(tag.id);
          const icon = (() => {
            switch (tag.icon) {
              case GraphQLSupportedIcon.SupportedIconBooks:
                return SupportedIcon.Books;
              case GraphQLSupportedIcon.SupportedIconCalendar:
                return SupportedIcon.Calendar;
              case GraphQLSupportedIcon.SupportedIconCheckMark:
                return SupportedIcon.CheckMark;
              case GraphQLSupportedIcon.SupportedIconClock:
                return SupportedIcon.Clock;
              case GraphQLSupportedIcon.SupportedIconFire:
                return SupportedIcon.Fire;
              case GraphQLSupportedIcon.SupportedIconFolderOpen:
                return SupportedIcon.FolderOpen;
              case GraphQLSupportedIcon.SupportedIconGrinningFace:
                return SupportedIcon.GrinningFace;
              case GraphQLSupportedIcon.SupportedIconLightbulb:
                return SupportedIcon.Lightbulb;
              case GraphQLSupportedIcon.SupportedIconNotebook:
                return SupportedIcon.Notebook;
              case GraphQLSupportedIcon.SupportedIconPencilPaper:
                return SupportedIcon.PencilPaper;
              case GraphQLSupportedIcon.SupportedIconPin:
                return SupportedIcon.Pin;
              case GraphQLSupportedIcon.SupportedIconRedHeart:
                return SupportedIcon.RedHeart;
              case GraphQLSupportedIcon.SupportedIconRocket:
                return SupportedIcon.Rocket;
              case GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes:
                return SupportedIcon.SmilingFaceWithSmilingEyes;
              case GraphQLSupportedIcon.SupportedIconStar:
                return SupportedIcon.Star;
              default:
                return null;
            }
          })();
          routineTagsRef.current.set(tag.id, {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            icon,
            updatedAt: new Date(tag.updatedAt),
            createdAt: new Date(tag.createdAt),
            routines: existingRoutineTag?.routines ?? [],
            isOpen: existingRoutineTag?.isOpen ?? false,
          });
          return tag.id;
        });

        const existingRoutine = stationNode.routines.find(
          routine => routine.id === node.id
        );
        const routineNode: RoutineNode = {
          id: node.id,
          stationId: node.stationId,
          title: node.title,
          description: node.description,
          status:
            node.status === GraphQLRoutineStatus.RoutineStatusCompleted
              ? RoutineStatus.Completed
              : node.status === GraphQLRoutineStatus.RoutineStatusInProgress
                ? RoutineStatus.InProgress
                : node.status === GraphQLRoutineStatus.RoutineStatusOverDue
                  ? RoutineStatus.OverDue
                  : RoutineStatus.Scheduled,
          isPinned: node.isPinned,
          scheduledStartAt: new Date(node.scheduledStartAt),
          scheduledEndAt: new Date(node.scheduledEndAt),
          period:
            node.period === GraphQLRoutinePeriod.RoutinePeriodDaily
              ? RoutinePeriod.Daily
              : node.period === GraphQLRoutinePeriod.RoutinePeriodWeekly
                ? RoutinePeriod.Weekly
                : node.period === GraphQLRoutinePeriod.RoutinePeriodMonthly
                  ? RoutinePeriod.Monthly
                  : node.period === GraphQLRoutinePeriod.RoutinePeriodYearly
                    ? RoutinePeriod.Yearly
                    : null,
          timezone: node.timezone,
          deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt),
          updatedAt: new Date(node.updatedAt),
          createdAt: new Date(node.createdAt),
          isOpen: existingRoutine?.isOpen ?? false,
          routineTagIds,
          routineTasks,
        };

        if (existingRoutine) {
          Object.assign(existingRoutine, routineNode);
        }
        const currentRoutine = existingRoutine ?? routineNode;
        const stationRoutines =
          searchedRoutinesByStationId.get(node.stationId) ?? [];
        stationRoutines.push(currentRoutine);
        searchedRoutinesByStationId.set(node.stationId, stationRoutines);

        for (const routineTagId of routineTagIds) {
          const routineTagNode = routineTagsRef.current.get(routineTagId);
          if (!routineTagNode) continue;
          routineTagNode.routines = [
            ...routineTagNode.routines.filter(
              routine => routine.id !== currentRoutine.id
            ),
            currentRoutine,
          ];
        }
      }

      for (const [
        searchedStationId,
        searchedRoutines,
      ] of searchedRoutinesByStationId) {
        const stationNode = stationsRef.current.get(searchedStationId);
        if (!stationNode) continue;

        stationNode.routines =
          stationId === searchedStationId
            ? searchedRoutines
            : [
                ...stationNode.routines.filter(
                  routine =>
                    !searchedRoutines.some(
                      searchedRoutine => searchedRoutine.id === routine.id
                    )
                ),
                ...searchedRoutines,
              ];
        if (stationId === searchedStationId) {
          stationNode.routineCount =
            result.data?.searchRoutines.totalCount ?? searchedRoutines.length;
        }
      }
      forceUpdate();
    },
    [executeSearchRoutines, forceUpdate, routineTagsRef, stationsRef]
  );

  const expandRoutinesByStationId = useCallback(
    async (stationId: UUID): Promise<void> => {
      if (!stationsRef.current.has(stationId)) {
        throw new Error("station does not exist");
      }
      await searchRoutines("", stationId);
    },
    [searchRoutines, stationsRef]
  );

  const toggleRoutine = useCallback(
    async (stationId: UUID, routineId: UUID, reset = false) => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      let routineNode = stationNode.routines.find(
        routine => routine.id === routineId
      );
      if (!routineNode) throw new Error("routine does not exist");

      if (reset || routineNode.isOpen) {
        routineNode.isOpen = false;
        forceUpdate();
        return;
      }

      if (routineNode.routineTasks.length === 0) {
        await expandRoutinesByStationId(stationId);
        routineNode =
          stationNode.routines.find(routine => routine.id === routineId) ??
          routineNode;
      }
      routineNode.isOpen = true;
      forceUpdate();
    },
    [expandRoutinesByStationId, forceUpdate, stationsRef]
  );

  const createRoutine = useCallback(
    async (
      stationId: UUID,
      values: CreateRoutineValues
    ): Promise<RoutineNode> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await createRoutineMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          stationId,
          title: values.title,
          description: values.description,
          status: values.status,
          isPinned: values.isPinned,
          scheduledStartAt: values.scheduledStartAt,
          scheduledEndAt: values.scheduledEndAt,
          period: values.period,
          timezone: values.timezone,
        },
      });
      if (response.success === false) throw response.exception;

      const scheduledStartAt =
        values.scheduledStartAt ?? new Date(response.data.createdAt);
      const routineNode: RoutineNode = {
        id: response.data.id as UUID,
        stationId,
        title: values.title,
        description: values.description,
        status: values.status ?? RoutineStatus.Scheduled,
        isPinned: values.isPinned ?? false,
        scheduledStartAt,
        scheduledEndAt:
          values.scheduledEndAt ??
          new Date(scheduledStartAt.getTime() + 60 * 60 * 1000),
        period: values.period ?? null,
        timezone:
          values.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
        isOpen: false,
        routineTagIds: [],
        routineTasks: [],
      };
      stationNode.routines.push(routineNode);
      stationNode.routineCount++;
      forceUpdate();
      return routineNode;
    },
    [createRoutineMutator, forceUpdate, stationsRef]
  );

  const isRoutineEditing = useCallback(
    (routineId: UUID) => editingRoutineNode?.id === routineId,
    [editingRoutineNode]
  );

  const isNewRoutineTitle = useCallback(
    () =>
      editRoutineTitle.trim().length > 0 &&
      editRoutineTitle.trim() !== originalRoutineTitle,
    [editRoutineTitle, originalRoutineTitle]
  );

  const startRenamingRoutine = useCallback((routineNode: RoutineNode) => {
    setEditingRoutineNode(routineNode);
    setOriginalRoutineTitle(routineNode.title);
    setEditRoutineTitle(routineNode.title);
  }, []);

  const cancelRenamingRoutine = useCallback(() => {
    setEditingRoutineNode(null);
    setOriginalRoutineTitle("");
    setEditRoutineTitle("");
  }, []);

  const renameEditingRoutine = useCallback(async (): Promise<void> => {
    if (!editingRoutineNode) return;

    try {
      if (!isNewRoutineTitle()) return;

      const title = editRoutineTitle.trim();
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await updateRoutineMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineId: editingRoutineNode.id,
          values: {
            title,
          },
        },
      });
      if (response.success === false) throw response.exception;

      editingRoutineNode.title = title;
      editingRoutineNode.updatedAt = response.data.updatedAt;
      forceUpdate();
    } finally {
      setEditingRoutineNode(null);
      setOriginalRoutineTitle("");
      setEditRoutineTitle("");
    }
  }, [
    editRoutineTitle,
    editingRoutineNode,
    forceUpdate,
    isNewRoutineTitle,
    updateRoutineMutator,
  ]);

  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingRoutineNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingRoutine();
      }
    };

    if (editingRoutineNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingRoutineNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingRoutineNode, renameEditingRoutine]);

  const linkRoutineTag = useCallback(
    async (routineId: UUID, routineTagId: UUID, isUnlink = false) => {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await linkRoutineTagMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineId,
          routineTagId,
          isUnlink,
        },
      });
      if (response.success === false) throw response.exception;

      let routineNode: RoutineNode | undefined;
      for (const stationNode of stationsRef.current.values()) {
        const matchingRoutine = stationNode.routines.find(
          routine => routine.id === routineId
        );
        if (matchingRoutine) {
          routineNode = matchingRoutine;
          break;
        }
      }
      if (routineNode) {
        routineNode.routineTagIds = isUnlink
          ? routineNode.routineTagIds.filter(id => id !== routineTagId)
          : Array.from(new Set([...routineNode.routineTagIds, routineTagId]));
        routineNode.updatedAt = response.data.updatedAt;
      }

      const routineTagNode = routineTagsRef.current.get(routineTagId);
      if (routineTagNode && routineNode) {
        routineTagNode.routines = isUnlink
          ? routineTagNode.routines.filter(routine => routine.id !== routineId)
          : [
              ...routineTagNode.routines.filter(
                routine => routine.id !== routineId
              ),
              routineNode,
            ];
      }
      forceUpdate();
      return response;
    },
    [forceUpdate, linkRoutineTagMutator, routineTagsRef, stationsRef]
  );

  const linkRoutineTask = useCallback(
    async (routineId: UUID, routineTaskId: UUID, isUnlink = false) => {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await linkRoutineTaskMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineId,
          routineTaskId,
          isUnlink,
        },
      });
      if (response.success === false) throw response.exception;

      let routineNode: RoutineNode | undefined;
      let routineTaskNode: RoutineTaskNode | undefined;
      for (const stationNode of stationsRef.current.values()) {
        routineNode ??= stationNode.routines.find(
          routine => routine.id === routineId
        );
        routineTaskNode ??= stationNode.routineTasks.find(
          routineTask => routineTask.id === routineTaskId
        );
      }
      if (routineNode && routineTaskNode) {
        routineNode.routineTasks = isUnlink
          ? routineNode.routineTasks.filter(
              routineTask => routineTask.id !== routineTaskId
            )
          : [
              ...routineNode.routineTasks.filter(
                routineTask => routineTask.id !== routineTaskId
              ),
              routineTaskNode,
            ];
        routineNode.updatedAt = response.data.updatedAt;
      }
      forceUpdate();
      return response;
    },
    [forceUpdate, linkRoutineTaskMutator, stationsRef]
  );

  const linkRoutineItem = useCallback(
    async (
      routineId: UUID,
      itemId: UUID,
      itemType: ItemType,
      isUnlink = false
    ) => {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await linkRoutineItemMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineId,
          itemId,
          itemType,
          isUnlink,
        },
      });
      if (response.success === false) throw response.exception;
      return response;
    },
    [linkRoutineItemMutator]
  );

  return {
    selectedRoutineId,
    selectRoutine,
    editRoutineTitle,
    setEditRoutineTitle,
    isRoutineEditing,
    isAnyRoutineEditing: editingRoutineNode !== null,
    isNewRoutineTitle,
    startRenamingRoutine,
    cancelRenamingRoutine,
    renameEditingRoutine,
    routineSearch,
    searchRoutines,
    expandRoutinesByStationId,
    toggleRoutine,
    createRoutine,
    isCreatingRoutine: createRoutineMutator.isPending,
    updateRoutineById: (request: UpdateMyRoutineByIdRequest) =>
      updateRoutineMutator.mutateAsync(request),
    linkRoutineTag,
    linkRoutineTask,
    linkRoutineItem,
  };
};
