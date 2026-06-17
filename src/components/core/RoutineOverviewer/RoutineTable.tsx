import {
  AllRoutineStatuses,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import { ClipboardClock, SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import WideBookmarkIcon from "@/components/icons/WideBookmarkIcon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const RoutineTable = () => {
  const stationRoutineManager = useStationRoutine();
  const [status, setStatus] = useState<RoutineStatus | "All">("All");
  const [startsAfter, setStartsAfter] = useState<Date | undefined>();
  const [endsBefore, setEndsBefore] = useState<Date | undefined>();
  const [showUnscheduled, setShowUnscheduled] = useState<boolean>(true);

  const filteredRoutines = useMemo(() => {
    return stationRoutineManager.visibleRoutines.filter(routine => {
      if (status !== "All" && routine.status !== status) return false;

      const isScheduled =
        routine.scheduledStartAt instanceof Date &&
        routine.scheduledEndAt instanceof Date &&
        !Number.isNaN(routine.scheduledStartAt.getTime()) &&
        !Number.isNaN(routine.scheduledEndAt.getTime());

      if (!isScheduled) return showUnscheduled;
      if (startsAfter && routine.scheduledEndAt < startsAfter) {
        return false;
      }
      if (endsBefore && routine.scheduledStartAt > endsBefore) {
        return false;
      }
      return true;
    });
  }, [
    endsBefore,
    showUnscheduled,
    startsAfter,
    stationRoutineManager.visibleRoutines,
    status,
  ]);

  return (
    <section className="@container flex max-h-[640px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card/70 backdrop-blur-sm">
      <div className="flex min-h-11 select-none items-center justify-between gap-3 border-b border-border/80 px-3 py-2 @max-[760px]:items-start @max-[760px]:flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardClock className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            Routine Table
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredRoutines.length}
            <span className="px-0.5">|</span>
            {stationRoutineManager.visibleRoutines.length}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 @max-[760px]:w-full @max-[760px]:justify-start">
          <Select
            value={status}
            onValueChange={value => setStatus(value as RoutineStatus | "All")}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-32 rounded-sm bg-background/60 text-xs @max-[520px]:w-24"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All status</SelectItem>
              {AllRoutineStatuses.map(routineStatus => (
                <SelectItem key={routineStatus} value={routineStatus}>
                  {routineStatus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            value={startsAfter}
            onValueChange={setStartsAfter}
            placeholder="Starts after"
            className="h-8 w-40 px-3 text-xs @max-[520px]:w-10 @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
            contentClassName="bg-card"
          />
          <DatePicker
            value={endsBefore}
            onValueChange={setEndsBefore}
            placeholder="Ends before"
            className="h-8 w-40 px-3 text-xs @max-[520px]:w-10 @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
            contentClassName="bg-card"
          />
          <label className="flex h-8 items-center gap-2 rounded-sm bg-transparent px-2 text-xs text-muted-foreground">
            <Checkbox
              checked={showUnscheduled}
              onCheckedChange={checked => setShowUnscheduled(checked === true)}
            />
            <span className="@max-[520px]:sr-only">Unscheduled</span>
          </label>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Table className="table-fixed">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-card">
            <TableRow className="bg-muted/15">
              <TableHead className="w-[18%] px-3">Routine</TableHead>
              <TableHead className="w-[14%] px-3">Station</TableHead>
              <TableHead className="w-[12%] px-3">Status</TableHead>
              <TableHead className="w-[22%] px-3">Schedule</TableHead>
              <TableHead className="w-[22%] px-3">Tags</TableHead>
              <TableHead className="w-[7%] px-3">Tasks</TableHead>
              <TableHead className="w-[5%] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutines.map(routine => {
              const station = stationRoutineManager.getStationById(
                routine.stationId
              );
              const routineTags = routine.routineTagIds.flatMap(
                routineTagId => {
                  const routineTag =
                    stationRoutineManager.getRoutineTagById(routineTagId);
                  return routineTag ? [routineTag] : [];
                }
              );
              const isScheduled =
                routine.scheduledStartAt instanceof Date &&
                routine.scheduledEndAt instanceof Date &&
                !Number.isNaN(routine.scheduledStartAt.getTime()) &&
                !Number.isNaN(routine.scheduledEndAt.getTime());

              return (
                <TableRow key={routine.id}>
                  <TableCell className="relative overflow-hidden px-3 py-3">
                    {routine.isPinned && (
                      <WideBookmarkIcon
                        className="pointer-events-none absolute top-0 left-2 size-5 fill-foreground/20 text-muted-foreground drop-shadow-sm"
                        aria-label="Pinned routine"
                      />
                    )}
                    <div className="flex min-w-0 items-center">
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-normal font-medium leading-snug [overflow-wrap:anywhere]">
                          {routine.title}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <span className="break-words">
                      {station?.name ?? "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3">{routine.status}</TableCell>
                  <TableCell className="px-3 py-3">
                    {isScheduled ? (
                      <div className="flex flex-col text-xs">
                        <span className="break-words">
                          {routine.scheduledStartAt.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {routine.scheduledEndAt.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unscheduled
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex min-w-0 flex-wrap gap-1">
                      {routine.routineTagIds.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Untagged
                        </span>
                      ) : routineTags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {routine.routineTagIds.length} tag
                          {routine.routineTagIds.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        routineTags.map(routineTag => (
                          <span
                            key={routineTag.id}
                            className="inline-flex h-5 items-center gap-1 rounded-sm border border-border/60 px-1.5 text-xs"
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: routineTag.color }}
                            />
                            {routineTag.name}
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {routine.routineTasks.length}
                  </TableCell>
                  <TableCell className="px-2 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-sm"
                      onClick={() =>
                        stationRoutineManager.openInspector({
                          type: "routine",
                          id: routine.id,
                        })
                      }
                    >
                      <SquarePen className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRoutines.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No routines match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default RoutineTable;
