import type { SupportedIcon } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import ColorSelector from "@/components/commons/ColorSelector/ColorSelector";
import SupportedIconTable from "@/components/commons/SupportedIconTable/SupportedIconTable";
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
import { useLanguage, useRoutine } from "@/hooks";

interface RoutineTagInspectorProps {
  routineTagId: UUID;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineTagInspector = ({
  routineTagId,
  isOpen,
  onClose,
}: RoutineTagInspectorProps) => {
  const languageManager = useLanguage();
  const routineManager = useRoutine();
  const routineTagNode = routineManager.getRoutineTagById(routineTagId);
  const [values, setValues] = useState<{
    name: string;
    color: string;
    icon: SupportedIcon | null;
  }>({
    name: "",
    color: "#64748b",
    icon: null,
  });

  useEffect(() => {
    if (!isOpen || !routineTagNode) return;
    setValues({
      name: routineTagNode.name,
      color: routineTagNode.color,
      icon: routineTagNode.icon,
    });
  }, [isOpen, routineTagNode]);

  const saveRoutineTag = async () => {
    const name = values.name.trim();
    if (name.length === 0) return;

    try {
      await routineManager.updateRoutineTag(
        routineTagId,
        {
          name,
          color: values.color,
          ...(values.icon === null ? {} : { icon: values.icon }),
        },
        {
          icon: values.icon === null,
        }
      );
      toast.success("Routine tag updated");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  if (!routineTagNode) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !routineManager.isUpdatingRoutineTag) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="z-[110] flex h-full w-full flex-col gap-0 bg-muted p-0 sm:max-w-md"
      >
        <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
          <SheetTitle className="flex min-w-0 items-center gap-2">
            <span className="shrink-0">Edit routine tag of </span>
            <span className="min-w-0 truncate text-foreground">
              "{routineTagNode.name}"
            </span>
          </SheetTitle>
          <SheetDescription>
            Change the classification used to group routines.
          </SheetDescription>
        </SheetHeader>

        <form
          autoComplete="off"
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={async event => {
            event.preventDefault();
            await saveRoutineTag();
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="routine-tag-inspector-name">Name</Label>
              <Input
                id="routine-tag-inspector-name"
                value={values.name}
                autoComplete="off"
                maxLength={128}
                autoFocus
                onChange={event =>
                  setValues(current => ({
                    ...current,
                    name: event.currentTarget.value,
                  }))
                }
              />
            </div>

            <div className="flex items-end gap-4">
              <div className="flex shrink-0 flex-col gap-2">
                <Label>Color</Label>
                <ColorSelector
                  value={values.color}
                  onValueChange={color =>
                    setValues(current => ({ ...current, color }))
                  }
                  disabled={routineManager.isUpdatingRoutineTag}
                  className="bg-muted"
                />
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <Label>Icon</Label>
                <SupportedIconTable
                  value={values.icon}
                  onValueChange={icon =>
                    setValues(current => ({ ...current, icon }))
                  }
                  disabled={routineManager.isUpdatingRoutineTag}
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
            <Button
              type="submit"
              className="w-full"
              disabled={
                routineManager.isUpdatingRoutineTag ||
                values.name.trim().length === 0
              }
            >
              {routineManager.isUpdatingRoutineTag && <Spinner />}
              Save
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={routineManager.isUpdatingRoutineTag}
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

export default RoutineTagInspector;
