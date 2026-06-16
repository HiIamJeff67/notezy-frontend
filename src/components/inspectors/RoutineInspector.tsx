import { RoutinePeriod, RoutineStatus } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import ContainableSelect from "@/components/commons/ContainableSelect/ContainableSelect";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import TimezoneSelector, {
  SupportedTimezones,
} from "@/components/commons/TimezoneSelector/TimezoneSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useStationRoutine } from "@/hooks";

interface RoutineInspectorProps {
  routineId: UUID;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineInspector = ({
  routineId,
  isOpen,
  onClose,
}: RoutineInspectorProps) => {
  const languageManager = useLanguage();
  const stationRoutineManager = useStationRoutine();
  const routineNode = stationRoutineManager.getRoutineById(routineId);
  const [values, setValues] = useState<{
    title: string;
    description: string;
    status: RoutineStatus;
    isPinned: boolean;
    scheduledStartAt: Date;
    scheduledEndAt: Date;
    period: RoutinePeriod | null;
    timezone: string;
  }>({
    title: "",
    description: "",
    status: RoutineStatus.Scheduled,
    isPinned: false,
    scheduledStartAt: new Date(),
    scheduledEndAt: new Date(),
    period: null,
    timezone: "",
  });

  useEffect(() => {
    if (!isOpen || !routineNode) return;
    setValues({
      title: routineNode.title,
      description: routineNode.description,
      status: routineNode.status,
      isPinned: routineNode.isPinned,
      scheduledStartAt: routineNode.scheduledStartAt,
      scheduledEndAt: routineNode.scheduledEndAt,
      period: routineNode.period,
      timezone: routineNode.timezone,
    });
  }, [isOpen, routineNode]);

  const saveRoutine = async () => {
    const title = values.title.trim();
    if (title.length === 0) return;
    if (values.scheduledEndAt <= values.scheduledStartAt) {
      toast.error("End time must be later than start time");
      return;
    }
    if (!SupportedTimezones.includes(values.timezone)) {
      toast.error("Select a supported timezone");
      return;
    }

    try {
      await stationRoutineManager.updateRoutine(
        routineId,
        {
          title,
          description: values.description.trim(),
          status: values.status,
          isPinned: values.isPinned,
          scheduledStartAt: values.scheduledStartAt,
          scheduledEndAt: values.scheduledEndAt,
          ...(values.period === null ? {} : { period: values.period }),
          timezone: values.timezone.trim(),
        },
        {
          period: values.period === null,
        }
      );
      toast.success("Routine updated");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  if (!routineNode) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isUpdatingRoutine) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="z-[110] flex h-full w-full flex-col gap-0 bg-muted p-0 sm:max-w-md"
      >
        <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
          <SheetTitle className="flex min-w-0 items-center gap-2">
            <span className="shrink-0">Edit routine of</span>
            <span className="min-w-0 truncate text-foreground">
              "{routineNode.title}"
            </span>
          </SheetTitle>
          <SheetDescription>
            Adjust this routine&apos;s schedule and working state.
          </SheetDescription>
        </SheetHeader>

        <form
          autoComplete="off"
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={async event => {
            event.preventDefault();
            await saveRoutine();
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="routine-inspector-title">Title</Label>
              <Input
                id="routine-inspector-title"
                value={values.title}
                autoComplete="off"
                maxLength={128}
                autoFocus
                onChange={event =>
                  setValues(current => ({
                    ...current,
                    title: event.currentTarget.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="routine-inspector-description">Description</Label>
              <Textarea
                id="routine-inspector-description"
                value={values.description}
                maxLength={1024}
                className="min-h-48 max-h-72 resize-y overflow-y-auto"
                onChange={event =>
                  setValues(current => ({
                    ...current,
                    description: event.currentTarget.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <ContainableSelect
                value={values.status}
                onValueChange={status =>
                  setValues(current => ({
                    ...current,
                    status: status as RoutineStatus,
                  }))
                }
                options={[
                  {
                    value: RoutineStatus.Scheduled,
                    label: "Scheduled",
                  },
                  {
                    value: RoutineStatus.InProgress,
                    label: "In progress",
                  },
                  {
                    value: RoutineStatus.Completed,
                    label: "Completed",
                  },
                  {
                    value: RoutineStatus.OverDue,
                    label: "Overdue",
                  },
                ]}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Label htmlFor="routine-inspector-pinned">Pinned</Label>
                <span className="text-xs text-muted-foreground">
                  Keep this routine prominent in routine views.
                </span>
              </div>
              <Switch
                id="routine-inspector-pinned"
                checked={values.isPinned}
                onCheckedChange={isPinned =>
                  setValues(current => ({ ...current, isPinned }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Start</Label>
              <DatePicker
                value={values.scheduledStartAt}
                onValueChange={scheduledStartAt => {
                  if (!scheduledStartAt) return;
                  setValues(current => ({
                    ...current,
                    scheduledStartAt,
                  }));
                }}
                placeholder="Select start date and time"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>End</Label>
              <DatePicker
                value={values.scheduledEndAt}
                onValueChange={scheduledEndAt => {
                  if (!scheduledEndAt) return;
                  setValues(current => ({
                    ...current,
                    scheduledEndAt,
                  }));
                }}
                disabled={{ before: values.scheduledStartAt }}
                isInvalid={values.scheduledEndAt <= values.scheduledStartAt}
                placeholder="Select end date and time"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Repeat</Label>
              <ContainableSelect
                value={values.period ?? "None"}
                onValueChange={period =>
                  setValues(current => ({
                    ...current,
                    period:
                      period === "None" ? null : (period as RoutinePeriod),
                  }))
                }
                options={[
                  {
                    value: "None",
                    label: "None",
                  },
                  {
                    value: RoutinePeriod.Daily,
                    label: "Daily",
                  },
                  {
                    value: RoutinePeriod.Weekly,
                    label: "Weekly",
                  },
                  {
                    value: RoutinePeriod.Monthly,
                    label: "Monthly",
                  },
                  {
                    value: RoutinePeriod.Yearly,
                    label: "Yearly",
                  },
                ]}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Timezone</Label>
              <TimezoneSelector
                value={values.timezone}
                onValueChange={timezone =>
                  setValues(current => ({
                    ...current,
                    timezone,
                  }))
                }
              />
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
            <Button
              type="submit"
              className="w-full"
              disabled={
                stationRoutineManager.isUpdatingRoutine ||
                values.title.trim().length === 0 ||
                !SupportedTimezones.includes(values.timezone)
              }
            >
              {stationRoutineManager.isUpdatingRoutine && <Spinner />}
              Save
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={stationRoutineManager.isUpdatingRoutine}
              onClick={onClose}
            >
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default RoutineInspector;
