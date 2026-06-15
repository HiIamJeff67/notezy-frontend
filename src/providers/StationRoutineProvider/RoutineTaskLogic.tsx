import {
  RoutineTaskPurpose as GraphQLRoutineTaskPurpose,
  RoutineTaskStatus as GraphQLRoutineTaskStatus,
  SearchRoutineTaskSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTasksLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutineTasks";
import {
  useCreateRoutineTaskByStationId,
  useUpdateMyRoutineTaskById,
} from "@shared/api/hooks/routineTask.hook";
import {
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import type { UpdateMyRoutineTaskByIdRequest } from "@shared/api/interfaces/routineTask.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
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
  const updateRoutineTaskMutator = useUpdateMyRoutineTaskById();

  const [selectedRoutineTaskId, selectRoutineTask] = useState<UUID | null>(
    null
  );

  const [executeSearchRoutineTasks, routineTaskSearch] =
    useSearchRoutineTasksLazyQuery();

  const searchRoutineTasksByStationId = useCallback(
    async (stationId: UUID, query: string = ""): Promise<void> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      const result = await executeSearchRoutineTasks({
        variables: {
          input: {
            query,
            first: MaxSearchLimit,
            stationId,
            sortBy: SearchRoutineTaskSortBy.Title,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }).retain();
      const searchEdges = result.data?.searchRoutineTasks.searchEdges ?? [];
      stationNode.routineTasks = searchEdges.map(edge => {
        const node = edge.node as unknown as {
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
        };
        const existingRoutineTask = stationNode.routineTasks.find(
          routineTask => routineTask.id === node.id
        );
        const routineTaskNode: RoutineTaskNode = {
          id: node.id,
          stationId: node.stationId,
          title: node.title,
          purpose:
            node.purpose ===
            GraphQLRoutineTaskPurpose.RoutineTaskPurposeCreateBlockPack
              ? RoutineTaskPurpose.CreateBlockPack
              : node.purpose ===
                  GraphQLRoutineTaskPurpose.RoutineTaskPurposeDeleteBlockPack
                ? RoutineTaskPurpose.DeleteBlockPack
                : node.purpose ===
                    GraphQLRoutineTaskPurpose.RoutineTaskPurposeCreateBlock
                  ? RoutineTaskPurpose.CreateBlock
                  : node.purpose ===
                      GraphQLRoutineTaskPurpose.RoutineTaskPurposeUpdateBlock
                    ? RoutineTaskPurpose.UpdateBlock
                    : RoutineTaskPurpose.DeleteBlock,
          payload: node.payload,
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
                  : node.status ===
                      GraphQLRoutineTaskStatus.RoutineTaskStatusCancel
                    ? RoutineTaskStatus.Cancel
                    : node.status ===
                        GraphQLRoutineTaskStatus.RoutineTaskStatusSuccess
                      ? RoutineTaskStatus.Success
                      : node.status ===
                          GraphQLRoutineTaskStatus.RoutineTaskStatusFail
                        ? RoutineTaskStatus.Fail
                        : RoutineTaskStatus.Idle,
          attempts: node.attempts,
          maxAttempts: node.maxAttempts,
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
          return existingRoutineTask;
        }
        return routineTaskNode;
      });
      forceUpdate();
    },
    [executeSearchRoutineTasks, forceUpdate, stationsRef]
  );

  const createRoutineTask = useCallback(
    async (
      stationId: UUID,
      title: string,
      purpose: RoutineTaskPurpose,
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
        },
      });
      if (response.success === false) throw response.exception;

      const routineTaskNode: RoutineTaskNode = {
        id: response.data.id as UUID,
        stationId,
        title,
        purpose,
        payload,
        priority,
        status: RoutineTaskStatus.Idle,
        attempts: 0,
        maxAttempts,
        scheduledAt: response.data.createdAt,
        actualStartedAt: null,
        actualEndedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      };
      stationNode.routineTasks.push(routineTaskNode);
      forceUpdate();
      return routineTaskNode;
    },
    [createRoutineTaskMutator, forceUpdate, stationsRef]
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
        routineTaskNode.updatedAt = response.data.updatedAt;
      }
      forceUpdate();
      return routineTaskNodes.values().next().value as RoutineTaskNode;
    },
    [forceUpdate, stationsRef, updateRoutineTaskMutator]
  );

  return {
    selectedRoutineTaskId,
    selectRoutineTask,
    routineTaskSearch,
    searchRoutineTasksByStationId,
    createRoutineTask,
    isCreatingRoutineTask: createRoutineTaskMutator.isPending,
    updateRoutineTask,
    isUpdatingRoutineTask: updateRoutineTaskMutator.isPending,
  };
};
