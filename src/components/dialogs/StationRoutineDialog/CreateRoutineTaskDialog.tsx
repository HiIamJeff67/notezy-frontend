import {
  AllRoutinePeriods,
  AllRoutineTaskPurposes,
  RoutinePeriod,
  RoutineTaskPurpose,
  UserPlan,
} from "@shared/api/interfaces/enums";
import { PlanLimitations } from "@shared/constants";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useStationRoutine, useUser } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface CreateRoutineTaskDialogProps extends ModalProps {
  stationId: UUID;
  stationName?: string;
  onCreated?: (routineTaskId: UUID) => void | Promise<void>;
}

const CreateRoutineTaskDialog = ({
  isOpen,
  onClose,
  stationId,
  stationName,
  onCreated,
}: CreateRoutineTaskDialogProps) => {
  const languageManager = useLanguage();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();

  const [title, setTitle] = useState<string>("");
  const [purpose, setPurpose] = useState<RoutineTaskPurpose>(
    RoutineTaskPurpose.CreateBlockPack
  );
  const [payload, setPayload] = useState<string>("{}");
  const [priority, setPriority] = useState<string>("0");
  const [maxAttempts, setMaxAttempts] = useState<string>("1");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>();
  const [period, setPeriod] = useState<RoutinePeriod | null>(null);
  const [payloadError, setPayloadError] = useState<string>("");

  useEffect(() => {
    if (isOpen) return;
    setTitle("");
    setPurpose(RoutineTaskPurpose.CreateBlockPack);
    setPayload("{}");
    setPriority("0");
    setMaxAttempts("1");
    setScheduledAt(undefined);
    setPeriod(null);
    setPayloadError("");
  }, [isOpen]);

  const estimatedPayloadCostUnit = useMemo(() => {
    try {
      const parsedPayload =
        payload.trim().length === 0 ? {} : JSON.parse(payload);
      return Math.ceil(
        new Blob([JSON.stringify(parsedPayload ?? {})]).size / 1024
      );
    } catch {
      return null;
    }
  }, [payload]);

  const routineTaskCostUnitCount = Number(
    userManager.userAccount?.routineTaskCostUnitCount ?? 0
  );
  const maxRoutineTaskCostUnitCount =
    PlanLimitations[userManager.userData?.plan ?? UserPlan.Free]
      .maxRoutineTaskCostUnitCount;
  const estimatedUsageAfterCreate =
    routineTaskCostUnitCount + (estimatedPayloadCostUnit ?? 0);
  const isRoutineTaskCostUnitExceeded =
    userManager.userAccount !== null &&
    estimatedPayloadCostUnit !== null &&
    estimatedUsageAfterCreate > maxRoutineTaskCostUnitCount;

  const createRoutineTask = async () => {
    const trimmedTitle = title.trim();
    const parsedPriority = Number(priority);
    const parsedMaxAttempts = Number(maxAttempts);
    if (
      trimmedTitle.length === 0 ||
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 0 ||
      !Number.isInteger(parsedMaxAttempts) ||
      parsedMaxAttempts < 1 ||
      parsedMaxAttempts > 20
    ) {
      return;
    }
    if (!scheduledAt) {
      return;
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload);
      setPayloadError("");
    } catch {
      setPayloadError("Payload must be valid JSON.");
      return;
    }
    if (
      new TextEncoder().encode(JSON.stringify(parsedPayload ?? {})).length >
      16_777_216
    ) {
      setPayloadError("Payload must be smaller than 16 MiB.");
      return;
    }
    if (isRoutineTaskCostUnitExceeded) {
      toast.error(
        "Routine task payload quota exceeded. Reduce the template size or upgrade your plan."
      );
      return;
    }

    try {
      const routineTaskNode = await stationRoutineManager.createRoutineTask(
        stationId,
        trimmedTitle,
        purpose,
        scheduledAt,
        period,
        parsedPayload,
        parsedPriority,
        parsedMaxAttempts
      );
      await onCreated?.(routineTaskNode.id);
      userManager.updateUserAccount({
        routineTaskCostUnitCount: estimatedUsageAfterCreate,
      });
      toast.success("Routine task created");
      onClose();
    } catch (error) {
      const message = languageManager.tError(error);
      toast.error(
        message.toLowerCase().includes("routine task") &&
          message.toLowerCase().includes("cost")
          ? "Routine task payload quota exceeded. Reduce the template size or upgrade your plan."
          : message
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isCreatingRoutineTask) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-visible rounded-sm bg-muted sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create routine task</DialogTitle>
          <DialogDescription>
            Configure an executable task
            {stationName ? ` for ${stationName}` : ""}. Routine tasks require a
            network connection.
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();
            await createRoutineTask();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-task-title">Title</Label>
            <Input
              id="routine-task-title"
              value={title}
              autoComplete="off"
              maxLength={128}
              autoFocus
              onChange={event => setTitle(event.currentTarget.value)}
              placeholder="Create the daily note"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Purpose</Label>
            <Select
              value={purpose}
              onValueChange={value => setPurpose(value as RoutineTaskPurpose)}
            >
              <SelectTrigger className="w-full rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[160]">
                {AllRoutineTaskPurposes.map(routineTaskPurpose => (
                  <SelectItem
                    key={routineTaskPurpose}
                    value={routineTaskPurpose}
                  >
                    {routineTaskPurpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Scheduled at</Label>
            <DatePicker
              value={scheduledAt}
              onValueChange={value => {
                if (!value) return;
                value.setSeconds(0, 0);
                setScheduledAt(value);
              }}
              placeholder="Select first execution time"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Recurring</Label>
            <Select
              value={period ?? "OneShot"}
              onValueChange={value =>
                setPeriod(value === "OneShot" ? null : (value as RoutinePeriod))
              }
            >
              <SelectTrigger className="w-full rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[160]">
                <SelectItem value="OneShot">One-shot</SelectItem>
                {AllRoutinePeriods.map(routinePeriod => (
                  <SelectItem key={routinePeriod} value={routinePeriod}>
                    {routinePeriod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-task-payload">Payload</Label>
            <Textarea
              id="routine-task-payload"
              value={payload}
              onChange={event => {
                setPayload(event.currentTarget.value);
                setPayloadError("");
              }}
              className="min-h-36 resize-y font-mono text-xs"
              aria-invalid={payloadError.length > 0}
            />
            <span className="text-xs text-muted-foreground">
              Routine task payload usage:{" "}
              {userManager.userAccount
                ? routineTaskCostUnitCount
                : "Not loaded"}{" "}
              / {maxRoutineTaskCostUnitCount} CostUnits.
            </span>
            <span
              className={`text-xs ${
                isRoutineTaskCostUnitExceeded
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {estimatedPayloadCostUnit === null
                ? "Payload must be valid JSON to estimate CostUnits."
                : `This routine task will use about ${estimatedPayloadCostUnit} CostUnits.`}
            </span>
            <span className="text-xs text-muted-foreground">
              Payload hard limit: 16 MiB.
            </span>
            {payloadError.length > 0 && (
              <span className="text-destructive text-xs">{payloadError}</span>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex w-full flex-col gap-2 sm:w-40 sm:shrink-0">
              <Label htmlFor="routine-task-priority">Priority</Label>
              <Input
                id="routine-task-priority"
                type="number"
                min={0}
                step={1}
                value={priority}
                autoComplete="off"
                onChange={event => setPriority(event.currentTarget.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-40 sm:shrink-0">
              <Label htmlFor="routine-task-max-attempts">Max attempts</Label>
              <Input
                id="routine-task-max-attempts"
                type="number"
                min={1}
                max={20}
                step={1}
                value={maxAttempts}
                autoComplete="off"
                onChange={event => setMaxAttempts(event.currentTarget.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={stationRoutineManager.isCreatingRoutineTask}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                stationRoutineManager.isCreatingRoutineTask ||
                title.trim().length === 0 ||
                !scheduledAt ||
                estimatedPayloadCostUnit === null ||
                isRoutineTaskCostUnitExceeded
              }
            >
              {stationRoutineManager.isCreatingRoutineTask && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineTaskDialog;
