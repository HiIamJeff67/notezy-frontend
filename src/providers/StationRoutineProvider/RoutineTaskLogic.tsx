import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineTaskStatus as GraphQLRoutineTaskStatus,
  SearchRoutineTaskSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTasksLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutineTasks";
import {
  useCreateRoutineTaskByStationId,
  useGetAllMyRoutineTasksByStationIds,
  usePauseMyRoutineTaskById,
  useResumeMyRoutineTaskById,
  useUpdateMyRoutineTaskById,
} from "@shared/api/hooks/routineTask.hook";
import {
  RoutinePeriod,
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import type { UpdateMyRoutineTaskByIdRequest } from "@shared/api/interfaces/routineTask.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useState } from "react";

interface UseRoutineTaskLogicProps {
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  forceUpdate: () => void;
}

export const useRoutineTaskLogic = ({
  stationsRef,
  forceUpdate,
}: UseRoutineTaskLogicProps) => {
  const createRoutineTaskMutator = useCreateRoutineTaskByStationId();
  const getAllRoutineTasksByStationIdsQuerier =
    useGetAllMyRoutineTasksByStationIds();
  const updateRoutineTaskMutator = useUpdateMyRoutineTaskById();
  const pauseRoutineTaskMutator = usePauseMyRoutineTaskById();
  const resumeRoutineTaskMutator = useResumeMyRoutineTaskById();

  const [selectedRoutineTaskId, selectRoutineTask] = useState<UUID | null>(
    null
  );

  const [
    executeSearch,
    {
      data: searchRoutineTasksData,
      loading: isSearchingRoutineTasks,
      variables: searchRoutineTasksVariables,
      fetchMore: fetchMoreRoutineTasks,
    },
  ] = useSearchRoutineTasksLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const getAllRoutineTasksByStationId = useCallback(
    async (stationId: UUID): Promise<RoutineTaskNode[]> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await getAllRoutineTasksByStationIdsQuerier.fetch({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          stationIds: [stationId],
        },
      });
      if (response.success === false) throw response.exception;

      stationNode.routineTasks = response.data.map(routineTask => {
        const existingRoutineTask = stationNode.routineTasks.find(
          stationRoutineTask => stationRoutineTask.id === routineTask.id
        );
        const routineTaskNode: RoutineTaskNode = {
          id: routineTask.id as UUID,
          stationId: routineTask.stationId as UUID,
          title: routineTask.title,
          purpose: routineTask.purpose,
          costUnit: routineTask.costUnit,
          payload: existingRoutineTask?.payload ?? {},
          priority: routineTask.priority,
          status: routineTask.status,
          attempts: routineTask.attempts,
          maxAttempts: routineTask.maxAttempts,
          period: routineTask.period,
          nextScheduledAt: routineTask.nextScheduledAt,
          scheduledAt: routineTask.scheduledAt,
          actualStartedAt: routineTask.actualStartedAt,
          actualEndedAt: routineTask.actualEndedAt,
          updatedAt: routineTask.updatedAt,
          createdAt: routineTask.createdAt,
        };
        if (existingRoutineTask) {
          Object.assign(existingRoutineTask, routineTaskNode);
          return existingRoutineTask;
        }
        return routineTaskNode;
      });
      stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );

      for (const routineNode of stationNode.routines) {
        routineNode.routineTasks = routineNode.routineTaskIds
          .map(routineTaskId =>
            stationNode.routineTasks.find(
              routineTask => routineTask.id === routineTaskId
            )
          )
          .filter(
            (routineTask): routineTask is RoutineTaskNode =>
              routineTask !== undefined
          );
        routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
          leftRoutineTask.title.localeCompare(rightRoutineTask.title)
        );
      }

      forceUpdate();
      return stationNode.routineTasks;
    },
    [forceUpdate, getAllRoutineTasksByStationIdsQuerier, stationsRef]
  );

  const searchRoutineTasksByStationId = useCallback(
    async (
      stationId: UUID,
      query: string = "",
      after?: string,
      preserveRoutineLinks: boolean = false
    ): Promise<{
      hasNextPage: boolean;
      endEncodedSearchCursor: string | null;
    }> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        toast.error(
          "You're only available to see routine tasks when you're online."
        );
        return {
          hasNextPage: false,
          endEncodedSearchCursor: null,
        };
      }

      const result = await executeSearch({
        variables: {
          input: {
            query,
            after,
            first: MaxSearchLimit,
            stationId,
            sortBy: SearchRoutineTaskSortBy.Title,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }).retain();
      const searchEdges = result.data?.searchRoutineTasks.searchEdges ?? [];
      const searchedRoutineTasks = searchEdges.map(edge => {
        const node = edge.node as unknown as {
          id: UUID;
          stationId: UUID;
          title: string;
          purpose: string;
          costUnit: number;
          priority: number;
          status: GraphQLRoutineTaskStatus;
          attempts: number;
          maxAttempts: number;
          period: GraphQLRoutinePeriod | null;
          nextScheduledAt?: Date | string | number;
          scheduledAt: Date | string | number;
          actualStartedAt: Date | string | number | null;
          actualEndedAt: Date | string | number | null;
          updatedAt: Date | string | number;
          createdAt: Date | string | number;
          routineIds?: UUID[];
        };
        const existingRoutineTask = stationNode.routineTasks.find(
          routineTask => routineTask.id === node.id
        );
        const routineTaskNode: RoutineTaskNode = {
          id: node.id,
          stationId: node.stationId,
          title: node.title,
          purpose: node.purpose.replace(
            "RoutineTaskPurpose_",
            ""
          ) as RoutineTaskPurpose,
          payload: existingRoutineTask?.payload ?? {},
          costUnit: node.costUnit,
          priority: node.priority,
          status:
            node.status === GraphQLRoutineTaskStatus.RoutineTaskStatusWaiting
              ? RoutineTaskStatus.Waiting
              : node.status ===
                  GraphQLRoutineTaskStatus.RoutineTaskStatusRunning
                ? RoutineTaskStatus.Running
                : node.status ===
                    GraphQLRoutineTaskStatus.RoutineTaskStatusPause
                  ? RoutineTaskStatus.Pause
                  : RoutineTaskStatus.Idle,
          attempts: node.attempts,
          maxAttempts: node.maxAttempts,
          period:
            node.period === GraphQLRoutinePeriod.RoutinePeriodDaily
              ? RoutinePeriod.Daily
              : node.period === GraphQLRoutinePeriod.RoutinePeriodWeekly
                ? RoutinePeriod.Weekly
                : node.period === GraphQLRoutinePeriod.RoutinePeriodMonthly
                  ? RoutinePeriod.Monthly
                  : null,
          nextScheduledAt: new Date(node.nextScheduledAt ?? node.scheduledAt),
          scheduledAt: new Date(node.scheduledAt),
          actualStartedAt:
            node.actualStartedAt === null
              ? null
              : new Date(node.actualStartedAt),
          actualEndedAt:
            node.actualEndedAt === null ? null : new Date(node.actualEndedAt),
          updatedAt: new Date(node.updatedAt),
          createdAt: new Date(node.createdAt),
        };
        if (existingRoutineTask) {
          Object.assign(existingRoutineTask, routineTaskNode);
          return {
            routineTask: existingRoutineTask,
            linkedRoutineIds: node.routineIds ?? [],
          };
        }
        return {
          routineTask: routineTaskNode,
          linkedRoutineIds: node.routineIds ?? [],
        };
      });
      const searchedRoutineTaskNodes = searchedRoutineTasks.map(
        searchedRoutineTask => searchedRoutineTask.routineTask
      );
      stationNode.routineTasks =
        after === undefined
          ? [
              ...searchedRoutineTaskNodes,
              ...stationNode.routineTasks.filter(
                routineTask =>
                  !searchedRoutineTaskNodes.some(
                    searchedRoutineTask =>
                      searchedRoutineTask.id === routineTask.id
                  )
              ),
            ]
          : [
              ...stationNode.routineTasks.filter(
                routineTask =>
                  !searchedRoutineTaskNodes.some(
                    searchedRoutineTask =>
                      searchedRoutineTask.id === routineTask.id
                  )
              ),
              ...searchedRoutineTaskNodes,
            ];
      stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );
      const searchedRoutineTaskIds = new Set(
        searchedRoutineTaskNodes.map(routineTask => routineTask.id)
      );
      if (!preserveRoutineLinks) {
        for (const routineNode of stationNode.routines) {
          routineNode.routineTasks = routineNode.routineTasks.filter(
            routineTask => !searchedRoutineTaskIds.has(routineTask.id)
          );
        }
        for (const searchedRoutineTask of searchedRoutineTasks) {
          for (const linkedRoutineId of searchedRoutineTask.linkedRoutineIds) {
            const routineNode = stationNode.routines.find(
              routine => routine.id === linkedRoutineId
            );
            if (!routineNode) continue;
            routineNode.routineTaskIds = Array.from(
              new Set([
                ...routineNode.routineTaskIds,
                searchedRoutineTask.routineTask.id,
              ])
            );
            routineNode.routineTasks = [
              ...routineNode.routineTasks.filter(
                routineTask =>
                  routineTask.id !== searchedRoutineTask.routineTask.id
              ),
              searchedRoutineTask.routineTask,
            ];
            routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
              leftRoutineTask.title.localeCompare(rightRoutineTask.title)
            );
          }
        }
      }
      forceUpdate();
      return {
        hasNextPage:
          result.data?.searchRoutineTasks.searchPageInfo.hasNextPage ?? false,
        endEncodedSearchCursor:
          result.data?.searchRoutineTasks.searchPageInfo
            .endEncodedSearchCursor ?? null,
      };
    },
    [executeSearch, forceUpdate, stationsRef]
  );

  const loadMoreRoutineTaskCandidates = useCallback(async (): Promise<void> => {
    const connection = searchRoutineTasksData?.searchRoutineTasks;
    const pageInfo = connection?.searchPageInfo;
    const input = searchRoutineTasksVariables?.input;
    if (
      !pageInfo?.hasNextPage ||
      !pageInfo.endEncodedSearchCursor ||
      !input?.stationId
    ) {
      return;
    }

    await searchRoutineTasksByStationId(
      input.stationId as UUID,
      input.query,
      pageInfo.endEncodedSearchCursor,
      true
    );
  }, [
    searchRoutineTasksByStationId,
    searchRoutineTasksData,
    searchRoutineTasksVariables,
  ]);

  const loadMoreRoutineTasks = useCallback(async (): Promise<void> => {
    const connection = searchRoutineTasksData?.searchRoutineTasks;
    const pageInfo = connection?.searchPageInfo;
    const input = searchRoutineTasksVariables?.input;
    if (
      !pageInfo?.hasNextPage ||
      !pageInfo.endEncodedSearchCursor ||
      !input?.stationId
    ) {
      return;
    }

    await searchRoutineTasksByStationId(
      input.stationId as UUID,
      input.query,
      pageInfo.endEncodedSearchCursor
    );
  }, [
    searchRoutineTasksByStationId,
    searchRoutineTasksData,
    searchRoutineTasksVariables,
  ]);

  const createRoutineTask = useCallback(
    async (
      stationId: UUID,
      title: string,
      purpose: RoutineTaskPurpose,
      nextScheduledAt: Date,
      period: RoutinePeriod | null = null,
      payload: unknown = {},
      priority: number = 0,
      maxAttempts: number = 1
    ): Promise<RoutineTaskNode> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await createRoutineTaskMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          stationId,
          title,
          purpose,
          payload,
          priority,
          maxAttempts,
          nextScheduledAt,
          period,
        },
      });
      if (response.success === false) throw response.exception;

      const routineTaskNode: RoutineTaskNode = {
        id: response.data.id as UUID,
        stationId,
        title,
        purpose,
        costUnit: Math.ceil(
          new Blob([JSON.stringify(payload ?? {})]).size / 1024
        ),
        payload,
        priority,
        status: RoutineTaskStatus.Idle,
        attempts: 0,
        maxAttempts,
        period,
        nextScheduledAt,
        scheduledAt: nextScheduledAt,
        actualStartedAt: null,
        actualEndedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      };
      stationNode.routineTasks.push(routineTaskNode);
      stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );
      forceUpdate();
      return routineTaskNode;
    },
    [createRoutineTaskMutator, forceUpdate, stationsRef]
  );

  const duplicateRoutineTask = useCallback(
    async (routineTaskId: UUID): Promise<RoutineTaskNode> => {
      let sourceRoutineTask: RoutineTaskNode | undefined;
      for (const stationNode of stationsRef.current.values()) {
        sourceRoutineTask = stationNode.routineTasks.find(
          routineTask => routineTask.id === routineTaskId
        );
        if (sourceRoutineTask) break;
      }
      if (!sourceRoutineTask) throw new Error("routine task does not exist");

      return await createRoutineTask(
        sourceRoutineTask.stationId,
        `${sourceRoutineTask.title} Copy`,
        sourceRoutineTask.purpose,
        sourceRoutineTask.nextScheduledAt,
        sourceRoutineTask.period,
        sourceRoutineTask.payload,
        sourceRoutineTask.priority,
        sourceRoutineTask.maxAttempts
      );
    },
    [createRoutineTask, stationsRef]
  );

  const upsertRoutineTaskNode = useCallback(
    (routineTaskNode: RoutineTaskNode): RoutineTaskNode => {
      const stationNode = stationsRef.current.get(routineTaskNode.stationId);
      if (!stationNode) return routineTaskNode;

      const existingRoutineTask = stationNode.routineTasks.find(
        stationRoutineTask => stationRoutineTask.id === routineTaskNode.id
      );
      if (existingRoutineTask) {
        Object.assign(existingRoutineTask, routineTaskNode);
      } else {
        stationNode.routineTasks.push(routineTaskNode);
      }
      stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );

      const persistedRoutineTask = existingRoutineTask ?? routineTaskNode;
      for (const routineNode of stationNode.routines) {
        if (!routineNode.routineTaskIds.includes(persistedRoutineTask.id)) {
          continue;
        }

        routineNode.routineTasks = [
          ...routineNode.routineTasks.filter(
            routineTask => routineTask.id !== persistedRoutineTask.id
          ),
          persistedRoutineTask,
        ];
        routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
          leftRoutineTask.title.localeCompare(rightRoutineTask.title)
        );
      }

      forceUpdate();
      return persistedRoutineTask;
    },
    [forceUpdate, stationsRef]
  );

  const updateRoutineTask = useCallback(
    async (
      routineTaskId: UUID,
      values: UpdateMyRoutineTaskByIdRequest["body"]["values"],
      setNull?: UpdateMyRoutineTaskByIdRequest["body"]["setNull"]
    ): Promise<RoutineTaskNode> => {
      const routineTaskNodes = new Set<RoutineTaskNode>();
      for (const stationNode of stationsRef.current.values()) {
        const stationRoutineTaskNode = stationNode.routineTasks.find(
          stationRoutineTask => stationRoutineTask.id === routineTaskId
        );
        if (stationRoutineTaskNode) {
          routineTaskNodes.add(stationRoutineTaskNode);
        }
        for (const routineNode of stationNode.routines) {
          const routineTaskNode = routineNode.routineTasks.find(
            routineTask => routineTask.id === routineTaskId
          );
          if (routineTaskNode) routineTaskNodes.add(routineTaskNode);
        }
      }
      if (routineTaskNodes.size === 0) {
        throw new Error("routine task does not exist");
      }

      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await updateRoutineTaskMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineTaskId,
          values,
          setNull,
        },
      });
      if (response.success === false) throw response.exception;

      for (const routineTaskNode of routineTaskNodes) {
        Object.assign(routineTaskNode, values);
        if (
          values.nextScheduledAt !== undefined &&
          routineTaskNode.scheduledAt < values.nextScheduledAt
        ) {
          routineTaskNode.scheduledAt = values.nextScheduledAt;
        }
        if (values.payload !== undefined) {
          routineTaskNode.costUnit = Math.ceil(
            new Blob([JSON.stringify(values.payload ?? {})]).size / 1024
          );
        }
        if (setNull?.Period) routineTaskNode.period = null;
        routineTaskNode.updatedAt = response.data.updatedAt;
      }
      for (const stationNode of stationsRef.current.values()) {
        stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
          leftRoutineTask.title.localeCompare(rightRoutineTask.title)
        );
        for (const routineNode of stationNode.routines) {
          routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
            leftRoutineTask.title.localeCompare(rightRoutineTask.title)
          );
        }
      }
      forceUpdate();
      return routineTaskNodes.values().next().value as RoutineTaskNode;
    },
    [forceUpdate, stationsRef, updateRoutineTaskMutator]
  );

  const pauseRoutineTask = useCallback(
    async (routineTaskId: UUID): Promise<void> => {
      const routineTaskNodes = new Set<RoutineTaskNode>();
      for (const stationNode of stationsRef.current.values()) {
        const stationRoutineTaskNode = stationNode.routineTasks.find(
          stationRoutineTask => stationRoutineTask.id === routineTaskId
        );
        if (stationRoutineTaskNode)
          routineTaskNodes.add(stationRoutineTaskNode);
        for (const routineNode of stationNode.routines) {
          const routineTaskNode = routineNode.routineTasks.find(
            routineTask => routineTask.id === routineTaskId
          );
          if (routineTaskNode) routineTaskNodes.add(routineTaskNode);
        }
      }
      if (routineTaskNodes.size === 0) {
        throw new Error("routine task does not exist");
      }

      const snapshots = [...routineTaskNodes].map(routineTaskNode => ({
        routineTaskNode,
        status: routineTaskNode.status,
        updatedAt: routineTaskNode.updatedAt,
      }));
      for (const routineTaskNode of routineTaskNodes) {
        routineTaskNode.status = RoutineTaskStatus.Pause;
        routineTaskNode.updatedAt = new Date();
      }
      forceUpdate();

      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      try {
        const response = await pauseRoutineTaskMutator.mutateAsync({
          header: {
            userAgent: navigator.userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: { routineTaskId },
        });
        if (response.success === false) throw response.exception;

        for (const routineTaskNode of routineTaskNodes) {
          routineTaskNode.updatedAt = response.data.updatedAt;
        }
        forceUpdate();
      } catch (error) {
        for (const snapshot of snapshots) {
          snapshot.routineTaskNode.status = snapshot.status;
          snapshot.routineTaskNode.updatedAt = snapshot.updatedAt;
        }
        forceUpdate();
        throw error;
      }
    },
    [forceUpdate, pauseRoutineTaskMutator, stationsRef]
  );

  const resumeRoutineTask = useCallback(
    async (routineTaskId: UUID): Promise<void> => {
      const routineTaskNodes = new Set<RoutineTaskNode>();
      for (const stationNode of stationsRef.current.values()) {
        const stationRoutineTaskNode = stationNode.routineTasks.find(
          stationRoutineTask => stationRoutineTask.id === routineTaskId
        );
        if (stationRoutineTaskNode)
          routineTaskNodes.add(stationRoutineTaskNode);
        for (const routineNode of stationNode.routines) {
          const routineTaskNode = routineNode.routineTasks.find(
            routineTask => routineTask.id === routineTaskId
          );
          if (routineTaskNode) routineTaskNodes.add(routineTaskNode);
        }
      }
      if (routineTaskNodes.size === 0) {
        throw new Error("routine task does not exist");
      }

      const snapshots = [...routineTaskNodes].map(routineTaskNode => ({
        routineTaskNode,
        status: routineTaskNode.status,
        updatedAt: routineTaskNode.updatedAt,
      }));
      for (const routineTaskNode of routineTaskNodes) {
        routineTaskNode.status = RoutineTaskStatus.Idle;
        routineTaskNode.updatedAt = new Date();
      }
      forceUpdate();

      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      try {
        const response = await resumeRoutineTaskMutator.mutateAsync({
          header: {
            userAgent: navigator.userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: { routineTaskId },
        });
        if (response.success === false) throw response.exception;

        for (const routineTaskNode of routineTaskNodes) {
          routineTaskNode.updatedAt = response.data.updatedAt;
        }
        forceUpdate();
      } catch (error) {
        for (const snapshot of snapshots) {
          snapshot.routineTaskNode.status = snapshot.status;
          snapshot.routineTaskNode.updatedAt = snapshot.updatedAt;
        }
        forceUpdate();
        throw error;
      }
    },
    [forceUpdate, resumeRoutineTaskMutator, stationsRef]
  );

  return {
    selectedRoutineTaskId,
    selectRoutineTask,
    executeSearchRoutineTasks: executeSearch,
    searchRoutineTasksData,
    isSearchingRoutineTasks,
    fetchMoreRoutineTasks,
    getAllRoutineTasksByStationId,
    searchRoutineTasksByStationId,
    loadMoreRoutineTaskCandidates,
    loadMoreRoutineTasks,
    createRoutineTask,
    duplicateRoutineTask,
    upsertRoutineTaskNode,
    isCreatingRoutineTask: createRoutineTaskMutator.isPending,
    updateRoutineTask,
    isUpdatingRoutineTask: updateRoutineTaskMutator.isPending,
    pauseRoutineTask,
    isPausingRoutineTask: pauseRoutineTaskMutator.isPending,
    resumeRoutineTask,
    isResumingRoutineTask: resumeRoutineTaskMutator.isPending,
  };
};
