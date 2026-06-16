import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
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
import { useLanguage, useStationRoutine } from "@/hooks";

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
  const routineTaskNode = stationRoutineManager.getRoutineTaskById(routineTaskId);
  const [values, setValues] = useState<{
    title: string;
    purpose: RoutineTaskPurpose;
    payload: string;
    priority: number;
    maxAttempts: number;
  }>({
    title: "",
    purpose: RoutineTaskPurpose.CreateBlockPack,
    payload: "{}",
    priority: 0,
    maxAttempts: 1,
  });

  useEffect(() => {
    if (!isOpen || !routineTaskNode) return;
    setValues({
      title: routineTaskNode.title,
      purpose: routineTaskNode.purpose,
      payload: JSON.stringify(routineTaskNode.payload ?? {}, null, 2),
      priority: routineTaskNode.priority,
      maxAttempts: routineTaskNode.maxAttempts,
    });
  }, [isOpen, routineTaskNode]);

  const saveRoutineTask = async () => {
    const title = values.title.trim();
    if (title.length === 0) return;

    try {
      await stationRoutineManager.updateRoutineTask(routineTaskId, {
        title,
        purpose: values.purpose,
        payload:
          values.payload.trim().length === 0 ? {} : JSON.parse(values.payload),
        priority: values.priority,
        maxAttempts: values.maxAttempts,
      });
      toast.success("Routine task updated");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  if (!routineTaskNode) return null;

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
              "{routineTaskNode.title}"
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
                onChange={event =>
                  setValues(current => ({
                    ...current,
                    title: event.currentTarget.value,
                  }))
                }
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
                  onChange={event =>
                    setValues(current => ({
                      ...current,
                      priority: Math.max(0, event.currentTarget.valueAsNumber),
                    }))
                  }
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
                  onChange={event =>
                    setValues(current => ({
                      ...current,
                      maxAttempts: Math.min(
                        20,
                        Math.max(1, event.currentTarget.valueAsNumber)
                      ),
                    }))
                  }
                />
              </div>
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
                onChange={event =>
                  setValues(current => ({
                    ...current,
                    payload: event.currentTarget.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-3 text-sm">
              <span className="text-muted-foreground">Current status</span>
              <span className="font-medium">{routineTaskNode.status}</span>
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
            <Button
              type="submit"
              className="w-full"
              disabled={
                stationRoutineManager.isUpdatingRoutineTask ||
                values.title.trim().length === 0
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
      </SheetContent>
    </Sheet>
  );
};

export default RoutineTaskInspector;
