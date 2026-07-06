import {
  AllRoutinePeriods,
  RoutinePeriod,
  RoutineTaskPurpose,
  UserPlan,
} from "@shared/api/interfaces/enums";
import { CreateRoutineTaskByRoutineIdRequestSchema } from "@shared/api/interfaces/routineTask.interface";
import { PlanLimitations } from "@shared/constants";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage, useStationRoutine, useUser } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";
import CreateRoutineTaskDialogSkeleton from "./CreateRoutineTaskDialogSkeleton";

const RoutineTaskPayloadEditor = lazy(
  () =>
    import(
      "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/RoutineTaskPayloadEditor"
    )
);

interface CreateRoutineTaskDialogProps extends ModalProps {
  routineId: UUID;
  stationName?: string;
  routineTitle?: string;
  onCreated?: (routineTaskId: UUID) => void | Promise<void>;
}

const CreateRoutineTaskDialog = ({
  isOpen,
  onClose,
  routineId,
  stationName,
  routineTitle,
  onCreated,
}: CreateRoutineTaskDialogProps) => {
  const languageManager = useLanguage();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();
  const payloadPreviewRef = useRef<HTMLPreElement>(null);

  const [title, setTitle] = useState<string>("");
  const [purpose, setPurpose] = useState<RoutineTaskPurpose>(
    RoutineTaskPurpose.CreateBlockPack
  );
  const [payload, setPayload] = useState<string>("{}");
  const [priority, setPriority] = useState<string>("0");
  const [maxAttempts, setMaxAttempts] = useState<string>("1");
  const [nextScheduledAt, setNextScheduledAt] = useState<Date | undefined>();
  const [period, setPeriod] = useState<RoutinePeriod | null>(null);
  const [payloadError, setPayloadError] = useState<string>("");
  const [isPayloadEditorOpen, setIsPayloadEditorOpen] =
    useState<boolean>(false);
  const [isPayloadExpanded, setIsPayloadExpanded] = useState<boolean>(false);
  const [isPayloadOverflowing, setIsPayloadOverflowing] =
    useState<boolean>(false);
  const [payloadTextareaHeight, setPayloadTextareaHeight] =
    useState<number>(160);
  const [isOpening, setIsOpening] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) return;
    setTitle("");
    setPurpose(RoutineTaskPurpose.CreateBlockPack);
    setPayload("{}");
    setPriority("0");
    setMaxAttempts("1");
    setNextScheduledAt(undefined);
    setPeriod(null);
    setPayloadError("");
    setIsPayloadEditorOpen(false);
    setIsPayloadExpanded(false);
    setIsPayloadOverflowing(false);
    setPayloadTextareaHeight(160);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setIsOpening(true);
    const frame = window.requestAnimationFrame(() => setIsOpening(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    const payloadPreview = payloadPreviewRef.current;
    if (!payloadPreview) return;

    const isOverflowing = payloadPreview.scrollHeight > 164;
    setIsPayloadOverflowing(isOverflowing);

    if (!isOverflowing && isPayloadExpanded) {
      setIsPayloadExpanded(false);
      setPayloadTextareaHeight(160);
      return;
    }

    setPayloadTextareaHeight(
      isPayloadExpanded ? Math.max(160, payloadPreview.scrollHeight) : 160
    );
  }, [isOpen, isPayloadExpanded, payload]);

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

  const validation = useMemo(() => {
    try {
      return CreateRoutineTaskByRoutineIdRequestSchema.safeParse({
        body: {
          routineId,
          title: title.trim(),
          purpose,
          payload: JSON.parse(payload),
          priority: Number(priority),
          maxAttempts: Number(maxAttempts),
          period,
          nextScheduledAt,
        },
      });
    } catch {
      return null;
    }
  }, [
    maxAttempts,
    nextScheduledAt,
    payload,
    period,
    priority,
    purpose,
    routineId,
    title,
  ]);

  const createRoutineTask = async () => {
    if (validation === null) {
      setPayloadError("Payload must be valid JSON.");
      return;
    }
    if (!validation.success) {
      setPayloadError(
        validation.error.issues[0]?.message ?? "Invalid payload."
      );
      return;
    }
    setPayloadError("");

    if (isRoutineTaskCostUnitExceeded) {
      toast.error(
        "Routine task payload quota exceeded. Reduce the template size or upgrade your plan."
      );
      return;
    }

    try {
      const routineTaskNode = await stationRoutineManager.createRoutineTask(
        validation.data.body.routineId as UUID,
        validation.data.body.title,
        validation.data.body.purpose,
        validation.data.body.nextScheduledAt,
        validation.data.body.period ?? null,
        validation.data.body.payload,
        validation.data.body.priority ?? 0,
        validation.data.body.maxAttempts ?? 1
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
      <DialogContent className="max-h-[90vh] overflow-visible rounded-sm bg-muted sm:max-w-2xl [&_[data-slot=select-trigger]]:border-border [&_[data-slot=select-trigger]]:bg-card/45 [&_[data-slot=select-trigger]]:hover:bg-card/60 [&_[data-slot=select-trigger]]:focus-visible:bg-card/60 [&_[data-slot=select-trigger]]:focus-visible:ring-1 [&_[data-slot=select-trigger]]:focus-visible:ring-inset [&_[data-slot=select-trigger]]:focus-visible:ring-offset-0 [&_button]:focus-visible:ring-inset [&_button]:focus-visible:ring-offset-0 [&_input]:border-border [&_input]:bg-card/45 [&_input]:hover:bg-card/60 [&_input]:focus-visible:bg-card/60 [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-inset [&_input]:focus-visible:ring-offset-0 [&_textarea]:border-border [&_textarea]:bg-card/45 [&_textarea]:hover:bg-card/60 [&_textarea]:focus-visible:bg-card/60 [&_textarea]:focus-visible:ring-1 [&_textarea]:focus-visible:ring-inset [&_textarea]:focus-visible:ring-offset-0">
        <DialogHeader>
          <DialogTitle>Create routine task</DialogTitle>
          <DialogDescription>
            Configure an executable task
            {routineTitle
              ? ` for ${routineTitle}`
              : stationName
                ? ` for ${stationName}`
                : ""}
            . Routine tasks require a network connection.
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex max-h-[calc(90vh-112px)] flex-col gap-4 overflow-y-auto px-1 pb-4"
          onSubmit={async event => {
            event.preventDefault();
            await createRoutineTask();
          }}
        >
          {isOpening ? (
            <CreateRoutineTaskDialogSkeleton />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-title">Title</Label>
                <Input
                  id="routine-task-title"
                  value={title}
                  autoComplete="off"
                  maxLength={128}
                  autoFocus
                  onChange={event => setTitle(event.currentTarget.value)}
                  placeholder="ex. Create the daily note"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-[1.35] flex-col gap-2">
                  <Label>Purpose</Label>
                  <Select
                    value={purpose}
                    onValueChange={value =>
                      setPurpose(value as RoutineTaskPurpose)
                    }
                  >
                    <SelectTrigger className="w-full rounded-sm">
                      <SelectValue>
                        {purpose.replace(
                          /^(Create|Append|Update|Reset)(.+)$/,
                          "$1．$2"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[160] bg-card">
                      <SelectGroup>
                        <SelectLabel>Create</SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.CreateRootShelf}>
                          RootShelf
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.CreateSubShelf}>
                          SubShelf
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.CreateBlockPack}>
                          BlockPack
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.CreateRoutine}>
                          Routine
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Append</SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.AppendBlock}>
                          Block
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Update</SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.UpdateRootShelf}>
                          RootShelf
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateSubShelf}>
                          SubShelf
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateBlockPack}>
                          BlockPack
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateBlock}>
                          Block
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateRoutine}>
                          Routine
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Reset</SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.ResetRootShelf}>
                          RootShelf
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.ResetSubShelf}>
                          SubShelf
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.ResetBlockPack}>
                          BlockPack
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.ResetBlock}>
                          Block
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex min-w-36 flex-1 flex-col gap-2">
                  <Label>Recurring</Label>
                  <Select
                    value={period ?? "OneShot"}
                    onValueChange={value =>
                      setPeriod(
                        value === "OneShot" ? null : (value as RoutinePeriod)
                      )
                    }
                  >
                    <SelectTrigger className="w-full rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[160] bg-card">
                      <SelectItem value="OneShot">One-shot</SelectItem>
                      {AllRoutinePeriods.map(routinePeriod => (
                        <SelectItem key={routinePeriod} value={routinePeriod}>
                          {routinePeriod}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Next scheduled at</Label>
                <DatePicker
                  value={nextScheduledAt}
                  onValueChange={value => {
                    if (!value) return;
                    value.setSeconds(0, 0);
                    setNextScheduledAt(value);
                  }}
                  placeholder="Select next execution time"
                  className="bg-card/45 hover:bg-card/60"
                  contentClassName="bg-card"
                />
                {nextScheduledAt && (
                  <span className="text-xs text-muted-foreground">
                    Next expected run time: {nextScheduledAt.toLocaleString()}.
                    Updating this later will not force an immediate rerun if the
                    system schedule is already later.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-payload">Payload</Label>
                <div
                  id="routine-task-payload"
                  role="button"
                  tabIndex={0}
                  aria-invalid={payloadError.length > 0}
                  className={`group relative cursor-pointer overflow-hidden border bg-card/45 ${
                    isPayloadOverflowing ? "rounded-b-none" : "rounded-b-sm"
                  }`}
                  style={{ height: payloadTextareaHeight }}
                  onClick={async () => {
                    try {
                      const clipboardText =
                        await navigator.clipboard.readText();
                      setPayload(
                        JSON.stringify(JSON.parse(clipboardText), null, 2)
                      );
                      setPayloadError("");
                      toast.success("Payload imported from clipboard");
                    } catch {
                      setPayloadError("Clipboard must contain valid JSON.");
                      toast.error("Clipboard must contain valid JSON.");
                    }
                  }}
                  onPaste={event => {
                    event.preventDefault();
                    try {
                      setPayload(
                        JSON.stringify(
                          JSON.parse(event.clipboardData.getData("text")),
                          null,
                          2
                        )
                      );
                      setPayloadError("");
                      toast.success("Payload imported from clipboard");
                    } catch {
                      setPayloadError("Pasted content must be valid JSON.");
                      toast.error("Pasted content must be valid JSON.");
                    }
                  }}
                  onDragOver={event => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={event => {
                    event.preventDefault();
                    const droppedFile = event.dataTransfer.files[0];
                    if (droppedFile) {
                      void droppedFile
                        .text()
                        .then(droppedText => {
                          setPayload(
                            JSON.stringify(JSON.parse(droppedText), null, 2)
                          );
                          setPayloadError("");
                          toast.success("Payload imported from file");
                        })
                        .catch(() => {
                          setPayloadError(
                            "Dropped file must contain valid JSON."
                          );
                          toast.error("Dropped file must contain valid JSON.");
                        });
                      return;
                    }

                    try {
                      setPayload(
                        JSON.stringify(
                          JSON.parse(event.dataTransfer.getData("text")),
                          null,
                          2
                        )
                      );
                      setPayloadError("");
                      toast.success("Payload imported");
                    } catch {
                      setPayloadError("Dropped content must be valid JSON.");
                      toast.error("Dropped content must be valid JSON.");
                    }
                  }}
                >
                  <pre
                    ref={payloadPreviewRef}
                    className={`h-full whitespace-pre-wrap break-words p-3 font-mono text-xs ${
                      isPayloadExpanded ? "overflow-hidden" : "overflow-y-auto"
                    }`}
                  >
                    {payload}
                  </pre>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-card/35 px-6 text-center text-foreground text-xs opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                    <span className="rounded-sm bg-card/70 px-3 py-1.5 shadow-sm">
                      Click to import JSON from clipboard, paste JSON, or drag a
                      JSON file here.
                    </span>
                  </div>
                </div>
                {isPayloadOverflowing && (
                  <button
                    type="button"
                    className="flex h-8 items-center justify-center gap-1 rounded-b-sm border border-t-0 bg-card/45 text-xs text-muted-foreground transition-colors hover:bg-card/65 hover:text-foreground"
                    onClick={() =>
                      setIsPayloadExpanded(
                        previousIsPayloadExpanded => !previousIsPayloadExpanded
                      )
                    }
                  >
                    {isPayloadExpanded ? (
                      <ChevronUpIcon className="size-3.5" />
                    ) : (
                      <ChevronDownIcon className="size-3.5" />
                    )}
                    {isPayloadExpanded ? "Collapse payload" : "Expand payload"}
                  </button>
                )}
                <div className="flex items-start justify-between gap-3 rounded-sm border bg-card/45 px-3 py-2">
                  <div className="flex min-w-0 flex-col gap-1">
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
                      <span className="text-destructive text-xs">
                        {payloadError}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setIsPayloadEditorOpen(true)}
                  >
                    Edit payload
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex w-full flex-col gap-2 sm:w-40 sm:shrink-0">
                  <Label htmlFor="routine-task-priority">Priority</Label>
                  <Input
                    id="routine-task-priority"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={priority}
                    autoComplete="off"
                    onChange={event => setPriority(event.currentTarget.value)}
                  />
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-40 sm:shrink-0">
                  <Label htmlFor="routine-task-max-attempts">
                    Max attempts
                  </Label>
                  <Input
                    id="routine-task-max-attempts"
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={maxAttempts}
                    autoComplete="off"
                    onChange={event =>
                      setMaxAttempts(event.currentTarget.value)
                    }
                  />
                </div>
              </div>
            </>
          )}

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
                validation?.success !== true ||
                isRoutineTaskCostUnitExceeded
              }
            >
              {stationRoutineManager.isCreatingRoutineTask && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </form>
        {isPayloadEditorOpen && (
          <Suspense fallback={null}>
            <RoutineTaskPayloadEditor
              isOpen={isPayloadEditorOpen}
              purpose={purpose}
              initialPayload={payload}
              onClose={() => setIsPayloadEditorOpen(false)}
              onConfirm={nextPayload => {
                setPayload(nextPayload);
                setPayloadError("");
              }}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineTaskDialog;
