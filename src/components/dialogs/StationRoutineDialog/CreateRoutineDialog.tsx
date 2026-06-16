import {
  AllRoutinePeriods,
  RoutinePeriod,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
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
  const [isPinned, setIsPinned] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) return;
    setTitle("");
    setDescription("");
    setHasCustomSchedule(false);
    setScheduledStartAt(undefined);
    setScheduledEndAt(undefined);
    setPeriod(null);
    setIsPinned(false);
  }, [isOpen]);

  const hasInvalidSchedule =
    hasCustomSchedule &&
    (!scheduledStartAt ||
      !scheduledEndAt ||
      scheduledEndAt <= scheduledStartAt);

  const createRoutine = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || hasInvalidSchedule) return;

    try {
      const routineNode = await stationRoutineManager.createRoutine(stationId, {
        title: trimmedTitle,
        description: description.trim(),
        status: RoutineStatus.Scheduled,
        isPinned,
        ...(hasCustomSchedule && scheduledStartAt && scheduledEndAt
          ? {
              scheduledStartAt,
              scheduledEndAt,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          : {}),
        period,
      });
      await onCreated?.(routineNode.id);
      toast.success("Routine created");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isCreatingRoutine) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-sm bg-muted sm:max-w-2xl">
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
            await createRoutine();
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
              checked={hasCustomSchedule}
              onCheckedChange={setHasCustomSchedule}
            />
          </div>

          {hasCustomSchedule && (
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label>Starts</Label>
                <DatePicker
                  value={scheduledStartAt}
                  onValueChange={setScheduledStartAt}
                  placeholder="Select start date and time"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label>Ends</Label>
                <DatePicker
                  value={scheduledEndAt}
                  onValueChange={setScheduledEndAt}
                  disabled={
                    scheduledStartAt ? { before: scheduledStartAt } : undefined
                  }
                  isInvalid={hasInvalidSchedule}
                  placeholder="Select end date and time"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className="flex w-full flex-col gap-2 sm:w-56 sm:shrink-0">
              <Label>Repeat</Label>
              <Select
                value={period ?? "none"}
                onValueChange={value =>
                  setPeriod(value === "none" ? null : (value as RoutinePeriod))
                }
              >
                <SelectTrigger className="w-full rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
