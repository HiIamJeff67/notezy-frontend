import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineTaskPurpose as GraphQLRoutineTaskPurpose,
  RoutineTaskStatus as GraphQLRoutineTaskStatus,
  SearchRoutineTaskSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTasksLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutineTasks";
import {
  AllRoutineTaskStatuses,
  RoutinePeriod,
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { UUID } from "crypto";
import { ClipboardList, SquarePen } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStationRoutine } from "@/hooks";

const RoutineTaskTable = () => {
  const stationRoutineManager = useStationRoutine();
  const [executeSearchRoutineTasks] = useSearchRoutineTasksLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });
  const [routineTasks, setRoutineTasks] = useState<
    Array<
      RoutineTaskNode & {
        linkedRoutineIds: UUID[];
        linkedRoutines: Array<{ id: UUID; tagIds: UUID[] }>;
      }
    >
  >([]);
  const [routineTaskTotalCount, setRoutineTaskTotalCount] = useState<number>(0);
  const [routineTaskSearchCursor, setRoutineTaskSearchCursor] = useState<
    string | null
  >(null);
  const [hasMoreRoutineTasks, setHasMoreRoutineTasks] = useState<boolean>(true);
  const [isSearchingRoutineTasks, setIsSearchingRoutineTasks] =
    useState<boolean>(false);
  const isSearchingRoutineTasksRef = useRef<boolean>(false);
  const [status, setStatus] = useState<RoutineTaskStatus | "All">("All");
  const [routineId, setRoutineId] = useState<UUID | "All" | "Unlinked">("All");
  const [scheduledAfter, setScheduledAfter] = useState<Date | undefined>();
  const [scheduledBefore, setScheduledBefore] = useState<Date | undefined>();
  const effectiveStationIds =
    stationRoutineManager.viewMode === "station" &&
    stationRoutineManager.activeStationId
      ? [stationRoutineManager.activeStationId]
      : stationRoutineManager.presence.stationIds;
  const stationPresenceSignature = effectiveStationIds.join("|");
  const routineTagPresenceSignature =
    stationRoutineManager.presence.routineTagIds.join("|");

  const searchRoutineTasks = useCallback(
    async (reset: boolean): Promise<void> => {
      if (isSearchingRoutineTasksRef.current) return;
      if (!reset && (!hasMoreRoutineTasks || !routineTaskSearchCursor)) return;
      if (
        stationRoutineManager.stations.length > 0 &&
        effectiveStationIds.length === 0
      ) {
        if (reset) {
          setRoutineTasks([]);
          setRoutineTaskTotalCount(0);
          setRoutineTaskSearchCursor(null);
          setHasMoreRoutineTasks(false);
        }
        return;
      }

      isSearchingRoutineTasksRef.current = true;
      setIsSearchingRoutineTasks(true);
      try {
        const shouldQueryBySingleStation =
          stationRoutineManager.stations.length > 0 &&
          effectiveStationIds.length === 1;
        const result = await executeSearchRoutineTasks({
          variables: {
            input: {
              query: stationRoutineManager.presence.query,
              after: reset ? undefined : (routineTaskSearchCursor ?? undefined),
              first: reset ? 20 : 10,
              stationId: shouldQueryBySingleStation
                ? effectiveStationIds[0]
                : undefined,
              sortBy: SearchRoutineTaskSortBy.Title,
              sortOrder: SearchSortOrder.Asc,
            },
          },
        }).retain();
        const selectedStationIds = new Set(effectiveStationIds);
        const searchedRoutineTasks = (
          result.data?.searchRoutineTasks.searchEdges ?? []
        )
          .map(edge => {
            const node = edge.node as unknown as {
              id: UUID;
              stationId: UUID;
              title: string;
              purpose: GraphQLRoutineTaskPurpose;
              costUnit: number;
              priority: number;
              status: GraphQLRoutineTaskStatus;
              attempts: number;
              maxAttempts: number;
              period: GraphQLRoutinePeriod | null;
              scheduledAt: Date | string | number;
              actualStartedAt: Date | string | number | null;
              actualEndedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              routines?: Array<{ id: UUID; tagIds?: UUID[] }>;
            };
            if (
              stationRoutineManager.stations.length > 0 &&
              !selectedStationIds.has(node.stationId)
            ) {
              return null;
            }
            const routineTask: RoutineTaskNode & {
              linkedRoutineIds: UUID[];
              linkedRoutines: Array<{ id: UUID; tagIds: UUID[] }>;
            } = {
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
              payload: {},
              costUnit: node.costUnit,
              priority: node.priority,
              status:
                node.status ===
                GraphQLRoutineTaskStatus.RoutineTaskStatusWaiting
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
              period:
                node.period === GraphQLRoutinePeriod.RoutinePeriodDaily
                  ? RoutinePeriod.Daily
                  : node.period === GraphQLRoutinePeriod.RoutinePeriodWeekly
                    ? RoutinePeriod.Weekly
                    : node.period === GraphQLRoutinePeriod.RoutinePeriodMonthly
                      ? RoutinePeriod.Monthly
                      : null,
              scheduledAt: new Date(node.scheduledAt),
              actualStartedAt:
                node.actualStartedAt === null
                  ? null
                  : new Date(node.actualStartedAt),
              actualEndedAt:
                node.actualEndedAt === null
                  ? null
                  : new Date(node.actualEndedAt),
              updatedAt: new Date(node.updatedAt),
              createdAt: new Date(node.createdAt),
              linkedRoutineIds: (node.routines ?? []).map(
                routine => routine.id
              ),
              linkedRoutines: (node.routines ?? []).map(routine => ({
                id: routine.id,
                tagIds: routine.tagIds ?? [],
              })),
            };
            return routineTask;
          })
          .filter(
            (
              routineTask
            ): routineTask is RoutineTaskNode & {
              linkedRoutineIds: UUID[];
              linkedRoutines: Array<{ id: UUID; tagIds: UUID[] }>;
            } => routineTask !== null
          );
        setRoutineTasks(previousRoutineTasks => {
          if (reset) return searchedRoutineTasks;
          const searchedRoutineTaskIds = new Set(
            searchedRoutineTasks.map(routineTask => routineTask.id)
          );
          return [
            ...previousRoutineTasks.filter(
              routineTask => !searchedRoutineTaskIds.has(routineTask.id)
            ),
            ...searchedRoutineTasks,
          ];
        });
        setRoutineTaskTotalCount(
          result.data?.searchRoutineTasks.totalCount ?? 0
        );
        setRoutineTaskSearchCursor(
          result.data?.searchRoutineTasks.searchPageInfo
            .endEncodedSearchCursor ?? null
        );
        setHasMoreRoutineTasks(
          result.data?.searchRoutineTasks.searchPageInfo.hasNextPage ?? false
        );
      } finally {
        isSearchingRoutineTasksRef.current = false;
        setIsSearchingRoutineTasks(false);
      }
    },
    [
      executeSearchRoutineTasks,
      stationPresenceSignature,
      hasMoreRoutineTasks,
      routineTaskSearchCursor,
      stationRoutineManager.presence.query,
      stationRoutineManager.stations.length,
      stationRoutineManager.viewMode,
    ]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void searchRoutineTasks(true);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [stationRoutineManager.presence.query, stationPresenceSignature]);

  const filteredRoutineTasks = useMemo(() => {
    return routineTasks.filter(routineTask => {
      if (status !== "All" && routineTask.status !== status) return false;

      const selectedRoutineTagIds = new Set(
        stationRoutineManager.presence.routineTagIds
      );
      const isAllRoutineTagsVisible =
        stationRoutineManager.routineTags.length === selectedRoutineTagIds.size;
      const shouldFilterByRoutineTags =
        stationRoutineManager.routineTags.length > 0 &&
        (!isAllRoutineTagsVisible ||
          !stationRoutineManager.presence.showUntaggedRoutines);
      if (shouldFilterByRoutineTags) {
        const isRoutineTaskPresent = routineTask.linkedRoutines.some(
          routine => {
            if (routine.tagIds.length === 0) {
              return stationRoutineManager.presence.showUntaggedRoutines;
            }
            if (isAllRoutineTagsVisible) return true;
            return routine.tagIds.some(routineTagId =>
              selectedRoutineTagIds.has(routineTagId)
            );
          }
        );
        if (!isRoutineTaskPresent) return false;
      }

      const linkedRoutineIds = routineTask.linkedRoutineIds;
      if (routineId === "Unlinked" && linkedRoutineIds.length > 0) {
        return false;
      }
      if (
        routineId !== "All" &&
        routineId !== "Unlinked" &&
        !linkedRoutineIds.includes(routineId)
      ) {
        return false;
      }

      if (scheduledAfter && routineTask.scheduledAt < scheduledAfter) {
        return false;
      }
      if (scheduledBefore && routineTask.scheduledAt > scheduledBefore) {
        return false;
      }
      return true;
    });
  }, [
    routineId,
    routineTagPresenceSignature,
    routineTasks,
    scheduledAfter,
    scheduledBefore,
    stationRoutineManager.presence.showUntaggedRoutines,
    stationRoutineManager.routineTags.length,
    status,
  ]);

  return (
    <section className="@container flex max-h-[480px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card/70 backdrop-blur-sm">
      <div className="flex min-h-11 select-none items-center justify-between gap-3 border-b border-border/80 px-3 py-2 @max-[760px]:flex-col @max-[760px]:items-start">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            Routine Task Table
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredRoutineTasks.length}
            <span className="px-0.5">|</span>
            {routineTaskTotalCount}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 @max-[760px]:w-full @max-[760px]:justify-start">
          <Select
            value={status}
            onValueChange={value =>
              setStatus(value as RoutineTaskStatus | "All")
            }
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-32 rounded-sm bg-background/60 text-xs @max-[520px]:w-24"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All status</SelectItem>
              {AllRoutineTaskStatuses.map(routineTaskStatus => (
                <SelectItem key={routineTaskStatus} value={routineTaskStatus}>
                  {routineTaskStatus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={routineId}
            onValueChange={value =>
              setRoutineId(value as UUID | "All" | "Unlinked")
            }
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-44 rounded-sm bg-background/60 text-xs @max-[520px]:w-28"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All routines</SelectItem>
              <SelectItem value="Unlinked">Unlinked</SelectItem>
              {stationRoutineManager.visibleRoutines.map(routine => (
                <SelectItem key={routine.id} value={routine.id}>
                  {routine.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            value={scheduledAfter}
            onValueChange={setScheduledAfter}
            placeholder="Scheduled after"
            className="h-8 w-40 text-xs @max-[520px]:w-10 @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
            contentClassName="bg-card"
          />
          <DatePicker
            value={scheduledBefore}
            onValueChange={setScheduledBefore}
            placeholder="Scheduled before"
            className="h-8 w-40 text-xs @max-[520px]:w-10 @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
            contentClassName="bg-card"
          />
        </div>
      </div>

      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={event => {
          if (isSearchingRoutineTasks || !hasMoreRoutineTasks) return;

          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.55) return;
          void searchRoutineTasks(false);
        }}
      >
        <Table className="table-fixed text-xs">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-card">
            <TableRow className="bg-muted/15">
              <TableHead className="h-9 w-[19%] px-2">Task</TableHead>
              <TableHead className="h-9 w-[10%] px-2">Station</TableHead>
              <TableHead className="h-9 w-[9%] px-2">Status</TableHead>
              <TableHead className="h-9 w-[13%] px-2">Purpose</TableHead>
              <TableHead className="h-9 w-[17%] px-2">Routine</TableHead>
              <TableHead className="h-9 w-[15%] px-2">Scheduled</TableHead>
              <TableHead className="h-9 w-[9%] px-2 text-center">
                Attempts
              </TableHead>
              <TableHead className="h-9 w-[8%] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutineTasks.map(routineTask => {
              const station = stationRoutineManager.getStationById(
                routineTask.stationId
              );
              const linkedRoutines = routineTask.linkedRoutineIds.flatMap(
                linkedRoutineId => {
                  const routine =
                    stationRoutineManager.getRoutineById(linkedRoutineId);
                  return routine ? [routine] : [];
                }
              );

              return (
                <TableRow key={routineTask.id}>
                  <TableCell className="px-2 py-2.5">
                    <div className="min-w-0">
                      <p className="whitespace-normal font-medium leading-snug [overflow-wrap:anywhere]">
                        {routineTask.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="break-words">
                      {station?.name ?? "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {routineTask.status}
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="break-words">{routineTask.purpose}</span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <div className="flex min-w-0 flex-wrap gap-1">
                      {linkedRoutines.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Unlinked
                        </span>
                      ) : (
                        linkedRoutines.map(routine => (
                          <span
                            key={routine.id}
                            className="inline-flex h-5 max-w-full items-center rounded-sm border border-border/60 px-1.5"
                          >
                            <span className="truncate">{routine.title}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="break-words">
                      {routineTask.scheduledAt.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-center tabular-nums">
                    {routineTask.attempts} / {routineTask.maxAttempts}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 rounded-sm"
                      onClick={() =>
                        stationRoutineManager.openInspector({
                          type: "routineTask",
                          id: routineTask.id,
                        })
                      }
                    >
                      <SquarePen className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRoutineTasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {isSearchingRoutineTasks
                    ? "Loading routine tasks..."
                    : "No routine tasks match the current filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default RoutineTaskTable;
