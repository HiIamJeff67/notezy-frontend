import { useGetMyRoutineTaskById } from "@shared/api/hooks/routineTask.hook";
import {
  AllRoutinePeriods,
  RoutinePeriod,
  RoutineTaskPurpose,
  UserPlan,
} from "@shared/api/interfaces/enums";
import { PlanLimitations } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import ContainableSelect from "@/components/commons/ContainableSelect/ContainableSelect";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage, useStationRoutine, useUser } from "@/hooks";
import InspectorLoadingCover from "./InspectorLoadingCover";

const RoutineTaskPayloadEditor = lazy(
  () =>
    import(
      "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/RoutineTaskPayloadEditor"
    )
);

interface RoutineTaskInspectorProps {
  routineTaskId: UUID;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineTaskInspector = ({
  routineTaskId,
  isOpen,
  onClose,
}: RoutineTaskInspectorProps) => {
  const languageManager = useLanguage();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();
  const getRoutineTaskQuerier = useGetMyRoutineTaskById();

  const routineTaskNode =
    stationRoutineManager.getRoutineTaskById(routineTaskId);

  const [isLoadingRoutineTaskDetail, setIsLoadingRoutineTaskDetail] =
    useState(false);
  const [values, setValues] = useState<{
    title: string;
    purpose: RoutineTaskPurpose;
    payload: string;
    priority: number;
    maxAttempts: number;
    nextScheduledAt: Date;
    scheduledAt: Date;
    period: RoutinePeriod | null;
    costUnit: number;
  }>({
    title: "",
    purpose: RoutineTaskPurpose.CreateBlockPack,
    payload: "{}",
    priority: 0,
    maxAttempts: 1,
    nextScheduledAt: new Date(),
    scheduledAt: new Date(),
    period: null,
    costUnit: 0,
  });
  const [isPayloadEditorOpen, setIsPayloadEditorOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setValues({
      title: "",
      purpose: RoutineTaskPurpose.CreateBlockPack,
      payload: "{}",
      priority: 0,
      maxAttempts: 1,
      nextScheduledAt: new Date(),
      scheduledAt: new Date(),
      period: null,
      costUnit: 0,
    });
    setIsPayloadEditorOpen(false);

    setIsLoadingRoutineTaskDetail(true);
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    getRoutineTaskQuerier
      .fetch({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          routineTaskId,
        },
      })
      .then(response => {
        if (cancelled || !response.data) return;
        const parentRoutine = stationRoutineManager.getRoutineById(
          response.data.routineId as UUID
        );
        const routineTaskNode: RoutineTaskNode = {
          id: response.data.id as UUID,
          routineId: response.data.routineId as UUID,
          stationId: parentRoutine?.stationId ?? ("" as UUID),
          title: response.data.title,
          purpose: response.data.purpose,
          costUnit: response.data.costUnit,
          payload: response.data.payload,
          priority: response.data.priority,
          status: response.data.status,
          attempts: response.data.attempts,
          maxAttempts: response.data.maxAttempts,
          period: response.data.period,
          nextScheduledAt: response.data.nextScheduledAt,
          scheduledAt: response.data.scheduledAt,
          actualStartedAt: response.data.actualStartedAt,
          actualEndedAt: response.data.actualEndedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        };
        stationRoutineManager.upsertRoutineTaskNode(routineTaskNode);
        setValues({
          title: response.data.title,
          purpose: response.data.purpose,
          payload: JSON.stringify(response.data.payload ?? {}, null, 2),
          priority: response.data.priority,
          maxAttempts: response.data.maxAttempts,
          nextScheduledAt: response.data.nextScheduledAt,
          scheduledAt: response.data.scheduledAt,
          period: response.data.period,
          costUnit: response.data.costUnit,
        });
      })
      .catch(error => {
        if (!cancelled) toast.error(languageManager.tError(error));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoutineTaskDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, routineTaskId]);

  const estimatedPayloadCostUnit = useMemo(() => {
    try {
      const parsedPayload =
        values.payload.trim().length === 0 ? {} : JSON.parse(values.payload);
      return Math.ceil(
        new Blob([JSON.stringify(parsedPayload ?? {})]).size / 1024
      );
    } catch {
      return null;
    }
  }, [values.payload]);

  const routineTaskCostUnitCount = Number(
    userManager.userAccount?.routineTaskCostUnitCount ?? 0
  );
  const maxRoutineTaskCostUnitCount =
    PlanLimitations[userManager.userData?.plan ?? UserPlan.Free]
      .maxRoutineTaskCostUnitCount;
  const estimatedRoutineTaskCostUnitDelta =
    (estimatedPayloadCostUnit ?? values.costUnit) - values.costUnit;
  const estimatedUsageAfterUpdate =
    routineTaskCostUnitCount + estimatedRoutineTaskCostUnitDelta;
  const isRoutineTaskCostUnitExceeded =
    userManager.userAccount !== null &&
    estimatedPayloadCostUnit !== null &&
    estimatedUsageAfterUpdate > maxRoutineTaskCostUnitCount;

  const saveRoutineTask = async () => {
    const title = values.title.trim();
    if (title.length === 0) return;
    let payload: unknown;
    try {
      payload =
        values.payload.trim().length === 0 ? {} : JSON.parse(values.payload);
    } catch {
      toast.error("Payload must be valid JSON.");
      return;
    }
    if (
      new TextEncoder().encode(JSON.stringify(payload ?? {})).length >
      16_777_216
    ) {
      toast.error("Payload must be smaller than 16 MiB.");
      return;
    }
    if (isRoutineTaskCostUnitExceeded) {
      toast.error(
        "Routine task payload quota exceeded. Reduce the template size or upgrade your plan."
      );
      return;
    }

    try {
      await stationRoutineManager.updateRoutineTask(
        routineTaskId,
        {
          title,
          purpose: values.purpose,
          payload,
          priority: values.priority,
          maxAttempts: values.maxAttempts,
          nextScheduledAt: values.nextScheduledAt,
          ...(values.period === null ? {} : { period: values.period }),
        },
        {
          Period: values.period === null,
        }
      );
      userManager.updateUserAccount({
        routineTaskCostUnitCount: estimatedUsageAfterUpdate,
      });
      void userManager.fetchUserAccount(
        LocalStorageManipulator.getItemByKey(LocalStorageKey.accessToken)
      );
      toast.success("Routine task updated");
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
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isUpdatingRoutineTask) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="z-[110] flex h-full w-full flex-col gap-0 bg-muted p-0 sm:max-w-md"
      >
        <div className="relative flex h-full min-h-0 w-full flex-col">
          <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
            <SheetTitle className="flex min-w-0 items-center gap-2">
              <span className="shrink-0">Edit routine task of</span>
              <span className="min-w-0 truncate text-foreground">
                "{values.title || "Routine task"}"
              </span>
            </SheetTitle>
            <SheetDescription>
              Configure the action this routine task will execute.
            </SheetDescription>
          </SheetHeader>
          <form
            autoComplete="off"
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={async event => {
              event.preventDefault();
              await saveRoutineTask();
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-inspector-title">Title</Label>
                <Input
                  id="routine-task-inspector-title"
                  value={values.title}
                  autoComplete="off"
                  maxLength={128}
                  autoFocus
                  onChange={event => {
                    const title = event.currentTarget.value;
                    setValues(current => ({
                      ...current,
                      title,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Purpose</Label>
                <ContainableSelect
                  value={values.purpose}
                  onValueChange={purpose =>
                    setValues(current => ({
                      ...current,
                      purpose: purpose as RoutineTaskPurpose,
                    }))
                  }
                  contentClassName="bg-muted"
                  valueLabel={values.purpose.replace(
                    /^(Create|Append|Update|Reset)(.+)$/,
                    "$1．$2"
                  )}
                >
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
                </ContainableSelect>
              </div>

              <div className="flex gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label htmlFor="routine-task-inspector-priority">
                    Priority
                  </Label>
                  <Input
                    id="routine-task-inspector-priority"
                    type="number"
                    min={0}
                    value={values.priority}
                    onChange={event => {
                      const priority = event.currentTarget.valueAsNumber;
                      setValues(current => ({
                        ...current,
                        priority: Math.max(0, priority),
                      }));
                    }}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label htmlFor="routine-task-inspector-attempts">
                    Max attempts
                  </Label>
                  <Input
                    id="routine-task-inspector-attempts"
                    type="number"
                    min={1}
                    max={20}
                    value={values.maxAttempts}
                    onChange={event => {
                      const maxAttempts = event.currentTarget.valueAsNumber;
                      setValues(current => ({
                        ...current,
                        maxAttempts: Math.min(20, Math.max(1, maxAttempts)),
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Next scheduled at</Label>
                <DatePicker
                  value={values.nextScheduledAt}
                  onValueChange={nextScheduledAt => {
                    if (!nextScheduledAt) return;
                    nextScheduledAt.setSeconds(0, 0);
                    setValues(current => ({
                      ...current,
                      nextScheduledAt,
                    }));
                  }}
                  placeholder="Select next execution time"
                />
                <span className="text-xs text-muted-foreground">
                  Next expected run time:{" "}
                  {values.nextScheduledAt.toLocaleString()}. Updating it will
                  not force an immediate rerun if the backend system schedule is
                  later.
                </span>
                <span className="text-xs text-muted-foreground">
                  System claimable time: {values.scheduledAt.toLocaleString()}.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Recurring</Label>
                <ContainableSelect
                  value={values.period ?? "OneShot"}
                  onValueChange={period =>
                    setValues(current => ({
                      ...current,
                      period:
                        period === "OneShot" ? null : (period as RoutinePeriod),
                    }))
                  }
                  contentClassName="bg-muted"
                  options={[
                    { value: "OneShot", label: "One-shot" },
                    ...AllRoutinePeriods.map(routinePeriod => ({
                      value: routinePeriod,
                      label: routinePeriod,
                    })),
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-inspector-payload">Payload</Label>
                <div
                  id="routine-task-inspector-payload"
                  className="max-h-64 overflow-y-auto rounded-sm border bg-background/45 p-3"
                >
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                    {values.payload}
                  </pre>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => setIsPayloadEditorOpen(true)}
                >
                  Edit payload
                </Button>
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
                    : `This routine task will use about ${estimatedPayloadCostUnit} CostUnits after save.`}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-3 text-sm">
                <span className="text-muted-foreground">Current status</span>
                <span className="font-medium">
                  {routineTaskNode?.status ?? "Loading"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-3 text-sm">
                <span className="text-muted-foreground">Cost unit</span>
                <span className="font-medium tabular-nums">
                  {values.costUnit}
                </span>
              </div>
            </div>

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  stationRoutineManager.isUpdatingRoutineTask ||
                  isLoadingRoutineTaskDetail ||
                  values.title.trim().length === 0 ||
                  estimatedPayloadCostUnit === null ||
                  isRoutineTaskCostUnitExceeded
                }
              >
                {stationRoutineManager.isUpdatingRoutineTask && <Spinner />}
                Save
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={stationRoutineManager.isUpdatingRoutineTask}
                onClick={onClose}
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
          {isPayloadEditorOpen && (
            <Suspense fallback={null}>
              <RoutineTaskPayloadEditor
                isOpen={isPayloadEditorOpen}
                purpose={values.purpose}
                initialPayload={values.payload}
                onClose={() => setIsPayloadEditorOpen(false)}
                onConfirm={payload => {
                  setValues(current => ({
                    ...current,
                    payload,
                  }));
                }}
              />
            </Suspense>
          )}
          <InspectorLoadingCover
            label="Loading"
            show={isLoadingRoutineTaskDetail}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoutineTaskInspector;
