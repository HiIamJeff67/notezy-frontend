import {
  AllRoutineTaskStatuses,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import { ClipboardList, SquarePen } from "lucide-react";
import { useMemo, useState } from "react";
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
  const [status, setStatus] = useState<RoutineTaskStatus | "All">("All");
  const [routineId, setRoutineId] = useState<UUID | "All" | "Unlinked">("All");
  const [scheduledAfter, setScheduledAfter] = useState<Date | undefined>();
  const [scheduledBefore, setScheduledBefore] = useState<Date | undefined>();

  const routineIdsByTaskId = useMemo(() => {
    const map = new Map<UUID, UUID[]>();
    for (const routine of stationRoutineManager.visibleRoutines) {
      for (const routineTask of routine.routineTasks) {
        map.set(routineTask.id, [
          ...(map.get(routineTask.id) ?? []),
          routine.id,
        ]);
      }
    }
    return map;
  }, [stationRoutineManager.visibleRoutines]);

  const filteredRoutineTasks = useMemo(() => {
    return stationRoutineManager.visibleRoutineTasks.filter(routineTask => {
      if (status !== "All" && routineTask.status !== status) return false;

      const linkedRoutineIds = routineIdsByTaskId.get(routineTask.id) ?? [];
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
    routineIdsByTaskId,
    scheduledAfter,
    scheduledBefore,
    stationRoutineManager.visibleRoutineTasks,
    status,
  ]);

  return (
    <section className="@container flex max-h-[480px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card/70 backdrop-blur-sm">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border/80 px-3 py-2 @max-[760px]:flex-col @max-[760px]:items-start">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            Routine Task Table
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredRoutineTasks.length}
            <span className="px-0.5">|</span>
            {stationRoutineManager.visibleRoutineTasks.length}
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

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Table className="table-fixed text-xs">
          <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-card">
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
              const linkedRoutines = (
                routineIdsByTaskId.get(routineTask.id) ?? []
              ).flatMap(linkedRoutineId => {
                const routine =
                  stationRoutineManager.getRoutineById(linkedRoutineId);
                return routine ? [routine] : [];
              });

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
                  No routine tasks match the current filters.
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
