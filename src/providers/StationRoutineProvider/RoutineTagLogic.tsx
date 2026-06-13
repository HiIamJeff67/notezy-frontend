import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineStatus as GraphQLRoutineStatus,
  SupportedIcon as GraphQLSupportedIcon,
  SearchRoutineTagSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTagsLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutineTags";
import {
  useCreateRoutineTag,
  useUpdateMyRoutineTagById,
} from "@shared/api/hooks/routineTag.hook";
import {
  RoutinePeriod,
  RoutineStatus,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useEffect, useState } from "react";

interface UseRoutineTagLogicProps {
  inputRef: RefObject<HTMLInputElement | null>;
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  routineTagsRef: RefObject<LRUCache<UUID, RoutineTagNode>>;
  forceUpdate: () => void;
}

export const useRoutineTagLogic = ({
  inputRef,
  stationsRef,
  routineTagsRef,
  forceUpdate,
}: UseRoutineTagLogicProps) => {
  const createRoutineTagMutator = useCreateRoutineTag();
  const updateRoutineTagMutator = useUpdateMyRoutineTagById();

  const [selectedRoutineTagId, selectRoutineTag] = useState<UUID | null>(null);
  const [editingRoutineTagNode, setEditingRoutineTagNode] =
    useState<RoutineTagNode | null>(null);
  const [originalRoutineTagName, setOriginalRoutineTagName] =
    useState<string>("");
  const [editRoutineTagName, setEditRoutineTagName] = useState<string>("");
  const [searchRoutineTagsInput, setSearchRoutineTagsInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });

  const [executeSearchRoutineTags, routineTagSearch] =
    useSearchRoutineTagsLazyQuery();

  const expandRoutinesByTagId = useCallback(
    async (routineTagId: UUID): Promise<void> => {
      const routineTagNode = routineTagsRef.current.get(routineTagId);
      if (!routineTagNode) throw new Error("routine tag does not exist");

      const result = await executeSearchRoutineTags({
        variables: {
          input: {
            query: routineTagNode.name,
            first: MaxSearchLimit,
            sortBy: SearchRoutineTagSortBy.Name,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }).retain();
      const edge = result.data?.searchRoutineTags.searchEdges.find(
        currentEdge =>
          (currentEdge.node as unknown as { id: UUID }).id === routineTagId
      );
      if (!edge) return;

      const node = edge.node as unknown as {
        routines: Array<{
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
        }>;
      };

      routineTagNode.routines = node.routines.map(nodeRoutine => {
        const stationNode = stationsRef.current.get(nodeRoutine.stationId);
        const existingRoutine = stationNode?.routines.find(
          routine => routine.id === nodeRoutine.id
        );
        if (existingRoutine) {
          existingRoutine.routineTagIds = Array.from(
            new Set([...existingRoutine.routineTagIds, routineTagId])
          );
          return existingRoutine;
        }

        const routineNode: RoutineNode = {
          id: nodeRoutine.id,
          stationId: nodeRoutine.stationId,
          title: nodeRoutine.title,
          description: nodeRoutine.description,
          status:
            nodeRoutine.status === GraphQLRoutineStatus.RoutineStatusCompleted
              ? RoutineStatus.Completed
              : nodeRoutine.status ===
                  GraphQLRoutineStatus.RoutineStatusInProgress
                ? RoutineStatus.InProgress
                : nodeRoutine.status ===
                    GraphQLRoutineStatus.RoutineStatusOverDue
                  ? RoutineStatus.OverDue
                  : RoutineStatus.Scheduled,
          isPinned: nodeRoutine.isPinned,
          scheduledStartAt: new Date(nodeRoutine.scheduledStartAt),
          scheduledEndAt: new Date(nodeRoutine.scheduledEndAt),
          period:
            nodeRoutine.period === GraphQLRoutinePeriod.RoutinePeriodDaily
              ? RoutinePeriod.Daily
              : nodeRoutine.period === GraphQLRoutinePeriod.RoutinePeriodWeekly
                ? RoutinePeriod.Weekly
                : nodeRoutine.period ===
                    GraphQLRoutinePeriod.RoutinePeriodMonthly
                  ? RoutinePeriod.Monthly
                  : nodeRoutine.period ===
                      GraphQLRoutinePeriod.RoutinePeriodYearly
                    ? RoutinePeriod.Yearly
                    : null,
          timezone: nodeRoutine.timezone,
          deletedAt:
            nodeRoutine.deletedAt === null
              ? null
              : new Date(nodeRoutine.deletedAt),
          updatedAt: new Date(nodeRoutine.updatedAt),
          createdAt: new Date(nodeRoutine.createdAt),
          isOpen: false,
          routineTagIds: [routineTagId],
          routineTasks: [],
        };
        if (stationNode) stationNode.routines.push(routineNode);
        return routineNode;
      });
      forceUpdate();
    },
    [executeSearchRoutineTags, forceUpdate, routineTagsRef, stationsRef]
  );

  const toggleRoutineTag = useCallback(
    async (routineTagId: UUID, reset = false) => {
      const routineTagNode = routineTagsRef.current.get(routineTagId);
      if (!routineTagNode) throw new Error("routine tag does not exist");

      if (reset || routineTagNode.isOpen) {
        routineTagNode.isOpen = false;
        forceUpdate();
        return;
      }

      routineTagNode.isOpen = true;
      forceUpdate();
      await expandRoutinesByTagId(routineTagId);
    },
    [expandRoutinesByTagId, forceUpdate, routineTagsRef]
  );

  const createRoutineTag = useCallback(
    async (
      name: string,
      color: string,
      icon: SupportedIcon | null
    ): Promise<RoutineTagNode> => {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await createRoutineTagMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          name,
          color,
          icon,
        },
      });
      if (response.success === false) throw response.exception;

      const routineTagNode: RoutineTagNode = {
        id: response.data.id as UUID,
        name,
        color,
        icon,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
        routines: [],
        isOpen: false,
      };
      routineTagsRef.current.set(routineTagNode.id, routineTagNode);
      forceUpdate();
      return routineTagNode;
    },
    [createRoutineTagMutator, forceUpdate, routineTagsRef]
  );

  const isRoutineTagEditing = useCallback(
    (routineTagId: UUID) => editingRoutineTagNode?.id === routineTagId,
    [editingRoutineTagNode]
  );

  const isNewRoutineTagName = useCallback(
    () =>
      editRoutineTagName.trim().length > 0 &&
      editRoutineTagName.trim() !== originalRoutineTagName,
    [editRoutineTagName, originalRoutineTagName]
  );

  const startRenamingRoutineTag = useCallback(
    (routineTagNode: RoutineTagNode) => {
      setEditingRoutineTagNode(routineTagNode);
      setOriginalRoutineTagName(routineTagNode.name);
      setEditRoutineTagName(routineTagNode.name);
    },
    []
  );

  const cancelRenamingRoutineTag = useCallback(() => {
    setEditingRoutineTagNode(null);
    setOriginalRoutineTagName("");
    setEditRoutineTagName("");
  }, []);

  const renameEditingRoutineTag = useCallback(async (): Promise<void> => {
    if (!editingRoutineTagNode) return;

    try {
      if (!isNewRoutineTagName()) return;

      const name = editRoutineTagName.trim();
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await updateRoutineTagMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineTagId: editingRoutineTagNode.id,
          values: {
            name,
          },
        },
      });
      if (response.success === false) throw response.exception;

      editingRoutineTagNode.name = name;
      editingRoutineTagNode.updatedAt = response.data.updatedAt;
      forceUpdate();
    } finally {
      setEditingRoutineTagNode(null);
      setOriginalRoutineTagName("");
      setEditRoutineTagName("");
    }
  }, [
    editRoutineTagName,
    editingRoutineTagNode,
    forceUpdate,
    isNewRoutineTagName,
    updateRoutineTagMutator,
  ]);

  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingRoutineTagNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingRoutineTag();
      }
    };

    if (editingRoutineTagNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingRoutineTagNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingRoutineTagNode, renameEditingRoutineTag]);

  useEffect(() => {
    const searchEdges =
      routineTagSearch.data?.searchRoutineTags?.searchEdges ?? [];
    for (const edge of searchEdges) {
      const node = edge.node as unknown as {
        id: UUID;
        name: string;
        color: string;
        icon: GraphQLSupportedIcon | null;
        updatedAt: Date | string | number;
        createdAt: Date | string | number;
      };
      const existingRoutineTag = routineTagsRef.current.get(node.id);
      const icon = (() => {
        switch (node.icon) {
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
      routineTagsRef.current.set(node.id, {
        id: node.id,
        name: node.name,
        color: node.color,
        icon,
        updatedAt: new Date(node.updatedAt),
        createdAt: new Date(node.createdAt),
        routines: existingRoutineTag?.routines ?? [],
        isOpen: existingRoutineTag?.isOpen ?? false,
      });
    }
    if (searchEdges.length > 0) forceUpdate();
  }, [forceUpdate, routineTagSearch.data, routineTagsRef]);

  const searchRoutineTags = useCallback(async (): Promise<void> => {
    await executeSearchRoutineTags({
      variables: {
        input: {
          query: searchRoutineTagsInput.query,
          first: MaxSearchLimit,
          sortBy: SearchRoutineTagSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
    }).retain();
  }, [executeSearchRoutineTags, searchRoutineTagsInput.query]);

  const loadMoreRoutineTags = useCallback(async (): Promise<void> => {
    const connection = routineTagSearch.data?.searchRoutineTags;
    const pageInfo = connection?.searchPageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endEncodedSearchCursor) return;

    await routineTagSearch.fetchMore({
      variables: {
        input: {
          query: searchRoutineTagsInput.query,
          first: MaxSearchLimit,
          after: pageInfo.endEncodedSearchCursor,
          sortBy: SearchRoutineTagSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
      updateQuery: (previousData, { fetchMoreResult }) => ({
        ...fetchMoreResult,
        searchRoutineTags: {
          ...fetchMoreResult.searchRoutineTags,
          searchEdges: [
            ...(previousData.searchRoutineTags?.searchEdges ?? []),
            ...(fetchMoreResult.searchRoutineTags?.searchEdges ?? []),
          ],
        },
      }),
    });
  }, [routineTagSearch, searchRoutineTagsInput.query]);

  return {
    selectedRoutineTagId,
    selectRoutineTag,
    editRoutineTagName,
    setEditRoutineTagName,
    isRoutineTagEditing,
    isAnyRoutineTagEditing: editingRoutineTagNode !== null,
    isNewRoutineTagName,
    startRenamingRoutineTag,
    cancelRenamingRoutineTag,
    renameEditingRoutineTag,
    searchRoutineTagsInput,
    setSearchRoutineTagsInput,
    routineTagSearch,
    searchRoutineTags,
    loadMoreRoutineTags,
    expandRoutinesByTagId,
    toggleRoutineTag,
    createRoutineTag,
    isCreatingRoutineTag: createRoutineTagMutator.isPending,
  };
};
