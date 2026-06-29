import {
  AllRoutinePeriods,
  RoutinePeriod,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import MonthlyDayPicker from "@/components/commons/MonthlyDayPicker/MonthlyDayPicker";
import TimePicker from "@/components/commons/TimePicker/TimePicker";
import WeekdayPicker from "@/components/commons/WeekdayPicker/WeekdayPicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useStationRoutine } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface CreateRoutineDialogProps extends ModalProps {
  stationId: UUID;
  stationName?: string;
  onCreated?: (routineId: UUID) => void | Promise<void>;
}

const CreateRoutineDialog = ({
  isOpen,
  onClose,
  stationId,
  stationName,
  onCreated,
}: CreateRoutineDialogProps) => {
  const languageManager = useLanguage();
  const stationRoutineManager = useStationRoutine();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [hasCustomSchedule, setHasCustomSchedule] = useState<boolean>(false);
  const [scheduledStartAt, setScheduledStartAt] = useState<Date | undefined>(
    undefined
  );
  const [scheduledEndAt, setScheduledEndAt] = useState<Date | undefined>(
    undefined
  );
  const [period, setPeriod] = useState<RoutinePeriod | null>(null);
  const [weekdayRange, setWeekdayRange] = useState<{
    start: number;
    end: number;
  }>({ start: 1, end: 1 });
  const [monthlyDayRange, setMonthlyDayRange] = useState<{
    start: number;
    end: number;
  }>({ start: 1, end: 1 });
  const [isPinned, setIsPinned] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) return;
    setTitle("");
    setDescription("");
    setHasCustomSchedule(false);
    setScheduledStartAt(undefined);
    setScheduledEndAt(undefined);
    setPeriod(null);
    setWeekdayRange({ start: 1, end: 1 });
    setMonthlyDayRange({ start: 1, end: 1 });
    setIsPinned(false);
  }, [isOpen]);

  const hasInvalidSchedule =
    hasCustomSchedule &&
    period !== RoutinePeriod.Weekly &&
    period !== RoutinePeriod.Monthly &&
    (!scheduledStartAt ||
      !scheduledEndAt ||
      (period === RoutinePeriod.Daily
        ? scheduledEndAt.getHours() * 60 + scheduledEndAt.getMinutes() <=
          scheduledStartAt.getHours() * 60 + scheduledStartAt.getMinutes()
        : scheduledEndAt <= scheduledStartAt));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isCreatingRoutine) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-visible rounded-sm bg-muted sm:max-w-2xl [&_[data-slot=select-trigger]]:focus-visible:ring-1 [&_[data-slot=select-trigger]]:focus-visible:ring-inset [&_[data-slot=select-trigger]]:focus-visible:ring-offset-0 [&_button]:focus-visible:ring-inset [&_button]:focus-visible:ring-offset-0 [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-inset [&_input]:focus-visible:ring-offset-0 [&_textarea]:focus-visible:ring-1 [&_textarea]:focus-visible:ring-inset [&_textarea]:focus-visible:ring-offset-0">
        <DialogHeader>
          <DialogTitle>Create routine</DialogTitle>
          <DialogDescription>
            Add a routine{stationName ? ` to ${stationName}` : ""}. Without a
            custom schedule, the default one-hour time window is used.
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();
            const trimmedTitle = title.trim();
            if (trimmedTitle.length === 0 || hasInvalidSchedule) return;

            try {
              let nextScheduledStartAt = scheduledStartAt;
              let nextScheduledEndAt = scheduledEndAt;

              if (period === RoutinePeriod.Weekly) {
                nextScheduledStartAt = new Date(
                  2026,
                  0,
                  4 + weekdayRange.start
                );
                nextScheduledStartAt.setHours(0, 0, 0, 0);
                nextScheduledEndAt = new Date(2026, 0, 4 + weekdayRange.end);
                nextScheduledEndAt.setHours(23, 59, 0, 0);
              }

              if (period === RoutinePeriod.Monthly) {
                nextScheduledStartAt = new Date(2026, 0, monthlyDayRange.start);
                nextScheduledStartAt.setHours(0, 0, 0, 0);
                nextScheduledEndAt = new Date(2026, 0, monthlyDayRange.end);
                nextScheduledEndAt.setHours(23, 59, 0, 0);
              }

              if (
                period === RoutinePeriod.Daily &&
                scheduledStartAt &&
                scheduledEndAt
              ) {
                const today = new Date();
                nextScheduledStartAt = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                  scheduledStartAt.getHours(),
                  scheduledStartAt.getMinutes(),
                  0,
                  0
                );
                nextScheduledEndAt = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                  scheduledEndAt.getHours(),
                  scheduledEndAt.getMinutes(),
                  0,
                  0
                );
              }

              const routineNode = await stationRoutineManager.createRoutine(
                stationId,
                {
                  title: trimmedTitle,
                  description: description.trim(),
                  status: RoutineStatus.Scheduled,
                  isPinned,
                  ...((hasCustomSchedule ||
                    period === RoutinePeriod.Weekly ||
                    period === RoutinePeriod.Monthly) &&
                  nextScheduledStartAt &&
                  nextScheduledEndAt
                    ? {
                        scheduledStartAt: nextScheduledStartAt,
                        scheduledEndAt: nextScheduledEndAt,
                        timezone:
                          Intl.DateTimeFormat().resolvedOptions().timeZone,
                      }
                    : {}),
                  period,
                }
              );
              await onCreated?.(routineNode.id);
              toast.success("Routine created");
              onClose();
            } catch (error) {
              toast.error(languageManager.tError(error));
            }
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-title">Title</Label>
            <Input
              id="routine-title"
              value={title}
              autoComplete="off"
              maxLength={128}
              autoFocus
              onChange={event => setTitle(event.currentTarget.value)}
              placeholder="What this routine is aimed to do"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-description">Description</Label>
            <Textarea
              id="routine-description"
              value={description}
              maxLength={1024}
              onChange={event => setDescription(event.currentTarget.value)}
              className="min-h-24 resize-none"
              placeholder="Describe the detail about this routine"
            />
          </div>

          <div className="flex items-center justify-between border-y py-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="routine-custom-schedule">Custom schedule</Label>
              <span className="text-muted-foreground text-xs">
                Set an explicit start and end time.
              </span>
            </div>
            <Switch
              id="routine-custom-schedule"
              checked={
                hasCustomSchedule ||
                period === RoutinePeriod.Weekly ||
                period === RoutinePeriod.Monthly
              }
              disabled={
                period === RoutinePeriod.Weekly ||
                period === RoutinePeriod.Monthly
              }
              onCheckedChange={setHasCustomSchedule}
            />
          </div>

          {(hasCustomSchedule ||
            period === RoutinePeriod.Weekly ||
            period === RoutinePeriod.Monthly) && (
            <>
              {period === RoutinePeriod.Weekly ? (
                <div className="flex flex-col gap-2">
                  <Label>Weekdays</Label>
                  <WeekdayPicker
                    value={weekdayRange}
                    onValueChange={setWeekdayRange}
                  />
                </div>
              ) : period === RoutinePeriod.Monthly ? (
                <div className="flex flex-col gap-2">
                  <Label>Month days</Label>
                  <MonthlyDayPicker
                    value={monthlyDayRange}
                    onValueChange={setMonthlyDayRange}
                  />
                  <span className="text-xs text-muted-foreground">
                    Limited to day 1 - 28 to keep every month valid.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Label>Starts</Label>
                    {period === RoutinePeriod.Daily ? (
                      <TimePicker
                        value={scheduledStartAt}
                        onValueChange={setScheduledStartAt}
                        placeholder="Select start time"
                      />
                    ) : (
                      <DatePicker
                        value={scheduledStartAt}
                        onValueChange={setScheduledStartAt}
                        placeholder="Select start date and time"
                      />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Label>Ends</Label>
                    {period === RoutinePeriod.Daily ? (
                      <TimePicker
                        value={scheduledEndAt}
                        onValueChange={setScheduledEndAt}
                        isInvalid={hasInvalidSchedule}
                        placeholder="Select end time"
                      />
                    ) : (
                      <DatePicker
                        value={scheduledEndAt}
                        onValueChange={setScheduledEndAt}
                        disabled={
                          scheduledStartAt
                            ? { before: scheduledStartAt }
                            : undefined
                        }
                        isInvalid={hasInvalidSchedule}
                        placeholder="Select end date and time"
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className="flex w-full flex-col gap-2 sm:w-56 sm:shrink-0">
              <Label>Repeat</Label>
              <Select
                value={period ?? "none"}
                onValueChange={value => {
                  const nextPeriod =
                    value === "none" ? null : (value as RoutinePeriod);
                  setPeriod(nextPeriod);
                  if (
                    nextPeriod === RoutinePeriod.Weekly ||
                    nextPeriod === RoutinePeriod.Monthly
                  ) {
                    setHasCustomSchedule(true);
                  }
                }}
              >
                <SelectTrigger className="w-full rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[160]">
                  <SelectItem value="none">Does not repeat</SelectItem>
                  {AllRoutinePeriods.map(routinePeriod => (
                    <SelectItem key={routinePeriod} value={routinePeriod}>
                      {routinePeriod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label
              htmlFor="routine-pinned"
              className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm"
            >
              <Checkbox
                id="routine-pinned"
                checked={isPinned}
                onCheckedChange={checked => setIsPinned(checked === true)}
              />
              <span>Pin</span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={stationRoutineManager.isCreatingRoutine}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                stationRoutineManager.isCreatingRoutine ||
                title.trim().length === 0 ||
                hasInvalidSchedule
              }
            >
              {stationRoutineManager.isCreatingRoutine && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineDialog;
