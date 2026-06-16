import {
  SupportedIcon as GraphQLSupportedIcon,
  SearchSortOrder,
  SearchStationSortBy,
} from "@shared/api/graphql/generated/graphql";
import { useSearchStationsLazyQuery } from "@shared/api/graphql/hooks/useSearchStations";
import {
  useCreateStation,
  useDeleteMyStationById,
  useUpdateMyStationById,
} from "@shared/api/hooks/station.hook";
import {
  AccessControlPermission,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import type { UpdateMyStationByIdRequest } from "@shared/api/interfaces/station.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useEffect, useState } from "react";

interface UseStationLogicProps {
  inputRef: RefObject<HTMLInputElement | null>;
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  routineTagsRef: RefObject<LRUCache<UUID, RoutineTagNode>>;
  forceUpdate: () => void;
  expandRoutinesByStationId: (stationId: UUID) => Promise<void>;
  selectedRoutineId: UUID | null;
  selectRoutine: (routineId: UUID | null) => void;
}

export const useStationLogic = ({
  inputRef,
  stationsRef,
  routineTagsRef,
  forceUpdate,
  expandRoutinesByStationId,
  selectedRoutineId,
  selectRoutine,
}: UseStationLogicProps) => {
  const createStationMutator = useCreateStation();
  const deleteStationMutator = useDeleteMyStationById();
  const updateStationMutator = useUpdateMyStationById();

  const [selectedStationId, selectStation] = useState<UUID | null>(null);
  const [editingStationNode, setEditingStationNode] =
    useState<StationNode | null>(null);
  const [editStationName, setEditStationName] = useState<string>("");
  const [originalStationName, setOriginalStationName] = useState<string>("");
  const [searchStationsInput, setSearchStationsInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });

  const [
    executeSearch,
    {
      data: searchStationsData,
      loading: isSearchingStations,
      fetchMore: fetchMoreStations,
    },
  ] = useSearchStationsLazyQuery();

  const toggleStation = useCallback(
    async (stationId: UUID, reset: boolean = false) => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      if (reset || stationNode.isOpen) {
        stationNode.isOpen = false;
        forceUpdate();
        return;
      }

      stationNode.isOpen = true;
      forceUpdate();
      await expandRoutinesByStationId(stationId);
    },
    [expandRoutinesByStationId, forceUpdate, stationsRef]
  );

  const createStation = useCallback(
    async (
      name: string,
      description: string = "",
      icon: SupportedIcon | null = null,
      headerBackgroundURL: string | null = null
    ): Promise<StationNode> => {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await createStationMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          name,
          description,
          icon,
          headerBackgroundURL,
        },
      });
      if (response.success === false) throw response.exception;

      const stationNode: StationNode = {
        id: response.data.id as UUID,
        name,
        description,
        icon,
        headerBackgroundURL,
        permission: AccessControlPermission.Owner,
        routineCount: 0,
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
        isOpen: false,
        routines: [],
        routineTasks: [],
      };
      stationsRef.current.set(stationNode.id, stationNode);
      forceUpdate();
      return stationNode;
    },
    [createStationMutator, forceUpdate, stationsRef]
  );

  const updateStation = useCallback(
    async (
      stationId: UUID,
      values: UpdateMyStationByIdRequest["body"]["values"],
      setNull?: UpdateMyStationByIdRequest["body"]["setNull"]
    ): Promise<StationNode> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await updateStationMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          stationId,
          values,
          setNull,
        },
      });
      if (response.success === false) throw response.exception;

      Object.assign(stationNode, values);
      if (setNull?.icon) stationNode.icon = null;
      if (setNull?.headerBackgroundURL) {
        stationNode.headerBackgroundURL = null;
      }
      stationNode.updatedAt = response.data.updatedAt;
      forceUpdate();
      return stationNode;
    },
    [forceUpdate, stationsRef, updateStationMutator]
  );

  const deleteStation = useCallback(
    async (stationId: UUID) => {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await deleteStationMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          stationId,
        },
      });
      if (response.success === false) throw response.exception;

      const stationNode = stationsRef.current.get(stationId);
      if (stationNode) {
        const deletedRoutineIds = new Set(
          stationNode.routines.map(routine => routine.id)
        );
        for (const routineTagNode of routineTagsRef.current.values()) {
          const previousRoutineCount = routineTagNode.routines.length;
          routineTagNode.routines = routineTagNode.routines.filter(
            routine => !deletedRoutineIds.has(routine.id)
          );
          routineTagNode.routineCount = Math.max(
            0,
            routineTagNode.routineCount -
              (previousRoutineCount - routineTagNode.routines.length)
          );
        }
      }

      stationsRef.current.delete(stationId);
      if (selectedStationId === stationId) selectStation(null);
      if (
        stationNode?.routines.some(routine => routine.id === selectedRoutineId)
      ) {
        selectRoutine(null);
      }
      forceUpdate();
      return response;
    },
    [
      deleteStationMutator,
      forceUpdate,
      routineTagsRef,
      selectRoutine,
      selectedRoutineId,
      selectedStationId,
      stationsRef,
    ]
  );

  const isStationEditing = useCallback(
    (stationId: UUID) =>
      !!editingStationNode && editingStationNode.id === stationId,
    [editingStationNode]
  );

  const isNewStationName = useCallback(
    () =>
      editStationName.trim().length > 0 &&
      editStationName.trim() !== originalStationName,
    [editStationName, originalStationName]
  );

  const startRenamingStation = useCallback((stationNode: StationNode) => {
    setEditingStationNode(stationNode);
    setOriginalStationName(stationNode.name);
    setEditStationName(stationNode.name);
  }, []);

  const cancelRenamingStation = useCallback(() => {
    setEditingStationNode(null);
    setOriginalStationName("");
    setEditStationName("");
  }, []);

  const renameEditingStation = useCallback(async (): Promise<void> => {
    if (!editingStationNode) return;

    try {
      if (!isNewStationName()) return;

      const name = editStationName.trim();
      await updateStation(editingStationNode.id, { name });
    } finally {
      setEditingStationNode(null);
      setOriginalStationName("");
      setEditStationName("");
    }
  }, [editStationName, editingStationNode, isNewStationName, updateStation]);

  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingStationNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingStation();
      }
    };

    if (editingStationNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingStationNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingStationNode, renameEditingStation]);

  useEffect(() => {
    const searchEdges = searchStationsData?.searchStations?.searchEdges ?? [];
    for (const edge of searchEdges) {
      const node = edge.node as unknown as {
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
      const existingStation = stationsRef.current.get(node.id);
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

      stationsRef.current.set(node.id, {
        id: node.id,
        name: node.name,
        description: node.description,
        icon,
        headerBackgroundURL: node.headerBackgroundURL,
        permission: node.permission as unknown as AccessControlPermission,
        routineCount: node.routineCount,
        deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt),
        updatedAt: new Date(node.updatedAt),
        createdAt: new Date(node.createdAt),
        isOpen: existingStation?.isOpen ?? false,
        routines: existingStation?.routines ?? [],
        routineTasks: existingStation?.routineTasks ?? [],
      });
    }
    if (searchEdges.length > 0) forceUpdate();
  }, [forceUpdate, searchStationsData, stationsRef]);

  const searchStations = useCallback(async (): Promise<void> => {
    await executeSearch({
      variables: {
        input: {
          query: searchStationsInput.query,
          first: MaxSearchLimit,
          sortBy: SearchStationSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
    }).retain();
  }, [executeSearch, searchStationsInput.query]);

  const loadMoreStations = useCallback(async (): Promise<void> => {
    const connection = searchStationsData?.searchStations;
    const pageInfo = connection?.searchPageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endEncodedSearchCursor) return;

    await fetchMoreStations({
      variables: {
        input: {
          query: searchStationsInput.query,
          first: MaxSearchLimit,
          after: pageInfo.endEncodedSearchCursor,
          sortBy: SearchStationSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
      updateQuery: (previousData, { fetchMoreResult }) => ({
        ...fetchMoreResult,
        searchStations: {
          ...fetchMoreResult.searchStations,
          searchEdges: [
            ...(previousData.searchStations?.searchEdges ?? []),
            ...(fetchMoreResult.searchStations?.searchEdges ?? []),
          ],
        },
      }),
    });
  }, [fetchMoreStations, searchStationsData, searchStationsInput.query]);

  return {
    selectedStationId,
    selectStation,
    editStationName,
    setEditStationName,
    isStationEditing,
    isAnyStationEditing: editingStationNode !== null,
    isNewStationName,
    startRenamingStation,
    cancelRenamingStation,
    renameEditingStation,
    searchStationsInput,
    setSearchStationsInput,
    executeSearchStations: executeSearch,
    searchStationsData,
    isSearchingStations,
    fetchMoreStations,
    searchStations,
    loadMoreStations,
    toggleStation,
    createStation,
    isCreatingStation: createStationMutator.isPending,
    updateStation,
    isUpdatingStation: updateStationMutator.isPending,
    deleteStation,
    isDeletingStation: deleteStationMutator.isPending,
  };
};
