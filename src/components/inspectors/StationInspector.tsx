import type { SupportedIcon } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useRoutine } from "@/hooks";

interface StationInspectorProps {
  stationId: UUID;
  isOpen: boolean;
  onClose: () => void;
}

const StationInspector = ({
  stationId,
  isOpen,
  onClose,
}: StationInspectorProps) => {
  const languageManager = useLanguage();
  const routineManager = useRoutine();
  const stationNode = routineManager.getStationById(stationId);
  const [values, setValues] = useState<{
    name: string;
    description: string;
    icon: SupportedIcon | null;
    headerBackgroundURL: string;
  }>({
    name: "",
    description: "",
    icon: null,
    headerBackgroundURL: "",
  });

  useEffect(() => {
    if (!isOpen || !stationNode) return;
    setValues({
      name: stationNode.name,
      description: stationNode.description,
      icon: stationNode.icon,
      headerBackgroundURL: stationNode.headerBackgroundURL ?? "",
    });
  }, [isOpen, stationNode]);

  const saveStation = async () => {
    const name = values.name.trim();
    const description = values.description.trim();
    const headerBackgroundURL = values.headerBackgroundURL.trim();
    if (name.length === 0) return;

    try {
      await routineManager.updateStation(
        stationId,
        {
          name,
          description,
          ...(values.icon === null ? {} : { icon: values.icon }),
          ...(headerBackgroundURL.length === 0 ? {} : { headerBackgroundURL }),
        },
        {
          icon: values.icon === null,
          headerBackgroundURL: headerBackgroundURL.length === 0,
        }
      );
      toast.success("Station updated");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  if (!stationNode) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !routineManager.isUpdatingStation) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="z-[110] flex h-full w-full flex-col gap-0 bg-muted p-0 sm:max-w-md"
      >
        <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
          <SheetTitle className="flex min-w-0 items-center gap-2">
            <span className="shrink-0">Edit station of</span>
            <span className="min-w-0 truncate text-foreground">
              "{stationNode.name}"
            </span>
          </SheetTitle>
          <SheetDescription>
            Update how this station is named and presented.
          </SheetDescription>
        </SheetHeader>

        <form
          autoComplete="off"
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={async event => {
            event.preventDefault();
            await saveStation();
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="station-inspector-name">Name</Label>
              <Input
                id="station-inspector-name"
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="station-inspector-description">Description</Label>
              <Textarea
                id="station-inspector-description"
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

            <div className="flex items-end gap-4">
              <div className="flex shrink-0 flex-col gap-2">
                <Label>Icon</Label>
                <SupportedIconTable
                  value={values.icon}
                  onValueChange={icon =>
                    setValues(current => ({ ...current, icon }))
                  }
                  disabled={routineManager.isUpdatingStation}
                  className="bg-muted"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label htmlFor="station-inspector-background">
                  Background URL
                </Label>
                <Input
                  id="station-inspector-background"
                  type="url"
                  value={values.headerBackgroundURL}
                  autoComplete="off"
                  placeholder="https://"
                  onChange={event =>
                    setValues(current => ({
                      ...current,
                      headerBackgroundURL: event.currentTarget.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
            <Button
              type="submit"
              className="w-full"
              disabled={
                routineManager.isUpdatingStation ||
                values.name.trim().length === 0
              }
            >
              {routineManager.isUpdatingStation && <Spinner />}
              Save
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={routineManager.isUpdatingStation}
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

export default StationInspector;
