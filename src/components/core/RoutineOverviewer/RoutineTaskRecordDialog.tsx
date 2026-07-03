import {
  SearchRoutineTaskRecordSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTaskRecordsLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutineTaskRecords";
import {
  AllRoutineTaskPurposes,
  AllRoutineTaskRecordStatuses,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type RoutineTaskRecordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineTitle: string;
  routineTaskIds: UUID[];
};

const RoutineTaskRecordDialog = ({
  open,
  onOpenChange,
  routineTitle,
  routineTaskIds,
}: RoutineTaskRecordDialogProps) => {
  const stationRoutineManager = useStationRoutine();
  const [executeSearch, recordSearch] = useSearchRoutineTaskRecordsLazyQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [status, setStatus] = useState<RoutineTaskRecordStatus | "All">("All");
  const [purpose, setPurpose] = useState<RoutineTaskPurpose | "All">("All");
  const [scheduledAfter, setScheduledAfter] = useState<Date | undefined>();
  const [scheduledBefore, setScheduledBefore] = useState<Date | undefined>();
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = useRef(false);
  const signature = routineTaskIds.join("|");
  const records =
    routineTaskIds.length === 0
      ? []
      : ((recordSearch.data?.searchRoutineTaskRecords?.searchEdges ?? []).map(
          edge => {
            const node = edge.node as any;
            return {
              id: node.id as UUID,
              routineTaskId: node.routineTaskId as UUID,
              purpose: node.purpose.replace(
                "RoutineTaskPurpose_",
                ""
              ) as RoutineTaskPurpose,
              status: node.status.replace(
                "RoutineTaskRecordStatus_",
                ""
              ) as RoutineTaskRecordStatus,
              errorCode:
                node.errorCode?.replace("RoutineTaskRecordErrorCode_", "") ??
                null,
              costUnit: node.costUnit as number,
              totalAttempts: node.totalAttempts as number,
              scheduledAt: new Date(node.scheduledAt),
              actualEndedAt:
                node.actualEndedAt === null
                  ? null
                  : new Date(node.actualEndedAt),
            };
          }
        ) ?? []);

  const searchRecords = useCallback(
    async (reset: boolean) => {
      if (!open || routineTaskIds.length === 0 || isSearchingRef.current) {
        return;
      }
      if (!reset && (!hasMore || !cursor)) return;

      isSearchingRef.current = true;
      setIsSearching(true);
      try {
        const variables = {
          input: {
            routineTaskIds,
            query: "",
            after: reset ? undefined : (cursor ?? undefined),
            first: reset ? 20 : 10,
            sortBy: SearchRoutineTaskRecordSortBy.ScheduledAt,
            sortOrder: SearchSortOrder.Desc,
          },
        };

        if (reset) {
          const result = await executeSearch({ variables }).retain();
          setCursor(
            result.data?.searchRoutineTaskRecords.searchPageInfo
              .endEncodedSearchCursor ?? null
          );
          setHasMore(
            result.data?.searchRoutineTaskRecords.searchPageInfo.hasNextPage ??
              false
          );
          return;
        }

        const result = await recordSearch.fetchMore({
          variables,
          updateQuery: (previous, { fetchMoreResult }) => {
            if (!fetchMoreResult) return previous;
            const ids = new Set(
              previous.searchRoutineTaskRecords.searchEdges.map(edge => {
                const node = edge.node as any;
                return node.id;
              })
            );
            return {
              ...fetchMoreResult,
              searchRoutineTaskRecords: {
                ...fetchMoreResult.searchRoutineTaskRecords,
                searchEdges: [
                  ...previous.searchRoutineTaskRecords.searchEdges,
                  ...fetchMoreResult.searchRoutineTaskRecords.searchEdges.filter(
                    edge => {
                      const node = edge.node as any;
                      return !ids.has(node.id);
                    }
                  ),
                ],
              },
            };
          },
        });
        setCursor(
          result.data?.searchRoutineTaskRecords?.searchPageInfo
            .endEncodedSearchCursor ?? null
        );
        setHasMore(
          result.data?.searchRoutineTaskRecords?.searchPageInfo.hasNextPage ??
            false
        );
      } finally {
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    },
    [cursor, executeSearch, hasMore, open, recordSearch.fetchMore, signature]
  );

  useEffect(() => {
    if (!open) return;
    void searchRecords(true);
  }, [open, signature]);

  const filteredRecords = records.filter(record => {
    if (status !== "All" && record.status !== status) return false;
    if (purpose !== "All" && record.purpose !== purpose) return false;
    if (scheduledAfter && record.scheduledAt < scheduledAfter) return false;
    if (scheduledBefore && record.scheduledAt > scheduledBefore) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[82vh] flex-col gap-0 overflow-visible rounded-md bg-muted p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-12">
          <DialogTitle>Routine task records</DialogTitle>
          <DialogDescription className="truncate">
            {routineTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-border px-4 py-3">
          <Select
            value={status}
            onValueChange={value =>
              setStatus(value as RoutineTaskRecordStatus | "All")
            }
          >
            <SelectTrigger className="h-8 w-32 rounded-sm text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All status</SelectItem>
              {AllRoutineTaskRecordStatuses.map(recordStatus => (
                <SelectItem key={recordStatus} value={recordStatus}>
                  {recordStatus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={purpose}
            onValueChange={value =>
              setPurpose(value as RoutineTaskPurpose | "All")
            }
          >
            <SelectTrigger className="h-8 w-40 rounded-sm text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All purpose</SelectItem>
              {AllRoutineTaskPurposes.map(taskPurpose => (
                <SelectItem key={taskPurpose} value={taskPurpose}>
                  {taskPurpose}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            value={scheduledAfter}
            onValueChange={setScheduledAfter}
            placeholder="Scheduled after"
            className="h-8 w-40 text-xs"
            contentClassName="z-[220] bg-card"
          />
          <DatePicker
            value={scheduledBefore}
            onValueChange={setScheduledBefore}
            placeholder="Scheduled before"
            className="h-8 w-40 text-xs"
            contentClassName="z-[220] bg-card"
          />
        </div>
        <div
          className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4"
          onScroll={event => {
            if (isSearching || !hasMore) return;
            const { clientHeight, scrollHeight, scrollTop } =
              event.currentTarget;
            if (scrollTop + clientHeight < scrollHeight * 0.65) return;
            void searchRecords(false);
          }}
        >
          <Table className="table-fixed text-xs">
            <TableHeader className="select-none">
              <TableRow>
                <TableHead className="w-[20%]">Task</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[18%]">Purpose</TableHead>
                <TableHead className="w-[18%]">Scheduled</TableHead>
                <TableHead className="w-[18%]">Ended</TableHead>
                <TableHead className="w-[7%] text-center">Cost</TableHead>
                <TableHead className="w-[7%] text-center">Attempts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map(record => {
                const task = stationRoutineManager.getRoutineTaskById(
                  record.routineTaskId
                );
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <span className="line-clamp-2">
                        {task?.title ?? record.routineTaskId}
                      </span>
                    </TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>
                      <span className="line-clamp-2">{record.purpose}</span>
                    </TableCell>
                    <TableCell>{record.scheduledAt.toLocaleString()}</TableCell>
                    <TableCell>
                      {record.actualEndedAt?.toLocaleString() ?? "None"}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {record.costUnit}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {record.totalAttempts}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    {routineTaskIds.length === 0
                      ? "This routine has no linked routine tasks."
                      : isSearching
                        ? "Loading routine task records..."
                        : "No routine task records match the current filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoutineTaskRecordDialog;
