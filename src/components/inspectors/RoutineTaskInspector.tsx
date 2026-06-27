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
import { useEffect, useMemo, useState } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import RoutineTaskPayloadEditor from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditor/RoutineTaskPayloadEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useStationRoutine, useUser } from "@/hooks";

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
    scheduledAt: Date;
    period: RoutinePeriod | null;
    costUnit: number;
  }>({
    title: "",
    purpose: RoutineTaskPurpose.CreateBlockPack,
    payload: "{}",
    priority: 0,
    maxAttempts: 1,
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
        const routineTaskNode: RoutineTaskNode = {
          id: response.data.id as UUID,
          stationId: response.data.stationId as UUID,
          title: response.data.title,
          purpose: response.data.purpose,
          costUnit: response.data.costUnit,
          payload: response.data.payload,
          priority: response.data.priority,
          status: response.data.status,
          attempts: response.data.attempts,
          maxAttempts: response.data.maxAttempts,
          period: response.data.period,
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

  useEffect(() => {
    if (!isOpen || userManager.userAccount) return;
    void userManager.fetchUserAccount(
      LocalStorageManipulator.getItemByKey(LocalStorageKey.accessToken)
    );
  }, [isOpen, userManager.fetchUserAccount, userManager.userAccount]);

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
          scheduledAt: values.scheduledAt,
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
          {isLoadingRoutineTaskDetail && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner />
              Loading routine task details
            </div>
          )}
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
              <Select
                value={values.purpose}
                onValueChange={purpose =>
                  setValues(current => ({
                    ...current,
                    purpose: purpose as RoutineTaskPurpose,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted">
                  <SelectItem value={RoutineTaskPurpose.CreateBlockPack}>
                    Create block pack
                  </SelectItem>
                  <SelectItem value={RoutineTaskPurpose.DeleteBlockPack}>
                    Delete block pack
                  </SelectItem>
                  <SelectItem value={RoutineTaskPurpose.CreateBlock}>
                    Create block
                  </SelectItem>
                  <SelectItem value={RoutineTaskPurpose.UpdateBlock}>
                    Update block
                  </SelectItem>
                  <SelectItem value={RoutineTaskPurpose.DeleteBlock}>
                    Delete block
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Scheduled at</Label>
              <DatePicker
                value={values.scheduledAt}
                onValueChange={scheduledAt => {
                  if (!scheduledAt) return;
                  scheduledAt.setSeconds(0, 0);
                  setValues(current => ({
                    ...current,
                    scheduledAt,
                  }));
                }}
                placeholder="Select first execution time"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Recurring</Label>
              <Select
                value={values.period ?? "OneShot"}
                onValueChange={period =>
                  setValues(current => ({
                    ...current,
                    period:
                      period === "OneShot" ? null : (period as RoutinePeriod),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted">
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
              <Label htmlFor="routine-task-inspector-payload">
                Payload (JSON)
              </Label>
              <Textarea
                id="routine-task-inspector-payload"
                value={values.payload}
                spellCheck={false}
                className="min-h-64 max-h-96 resize-y overflow-y-auto font-mono text-xs"
                onChange={event => {
                  const payload = event.currentTarget.value;
                  setValues(current => ({
                    ...current,
                    payload,
                  }));
                }}
              />
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
      </SheetContent>
    </Sheet>
  );
};

export default RoutineTaskInspector;
