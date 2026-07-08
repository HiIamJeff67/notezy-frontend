import { useGetMyStationById } from "@shared/api/hooks/station.hook";
import type {
  AccessControlPermission,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { getAuthorization } from "@shared/util/getAuthorization";
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
import { useLanguage, useStationRoutine } from "@/hooks";
import InspectorLoadingCover from "./InspectorLoadingCover";

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
  const stationRoutineManager = useStationRoutine();
  const getStationQuerier = useGetMyStationById();

  const [isLoadingStationDetail, setIsLoadingStationDetail] = useState(false);
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
    if (!isOpen) return;
    let cancelled = false;
    setValues({
      name: "",
      description: "",
      icon: null,
      headerBackgroundURL: "",
    });

    setIsLoadingStationDetail(true);
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    getStationQuerier
      .fetch({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          stationId,
        },
      })
      .then(response => {
        if (cancelled || response.success === false || !response.data) return;
        const stationNode: StationNode = {
          id: response.data.id as UUID,
          name: response.data.name,
          description: response.data.description,
          icon: response.data.icon,
          headerBackgroundURL: response.data.headerBackgroundURL,
          permission: response.data.permission as AccessControlPermission,
          routineCount: response.data.routineCount,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
          isOpen: false,
          isExpanded: true,
          routines: [],
          routineTasks: [],
        };
        stationRoutineManager.upsertStationNode(stationNode);
        setValues({
          name: response.data.name,
          description: response.data.description,
          icon: response.data.icon,
          headerBackgroundURL: response.data.headerBackgroundURL ?? "",
        });
      })
      .catch(error => {
        if (!cancelled) toast.error(languageManager.tError(error));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStationDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, stationId]);

  const saveStation = async () => {
    const name = values.name.trim();
    const description = values.description.trim();
    const headerBackgroundURL = values.headerBackgroundURL.trim();
    if (name.length === 0) return;

    try {
      await stationRoutineManager.updateStation(
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

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isUpdatingStation) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="z-[110] flex h-full w-full flex-col gap-0 bg-sidebar p-0 sm:max-w-md"
      >
        <div className="relative flex h-full min-h-0 w-full flex-col">
          <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
            <SheetTitle className="flex min-w-0 items-center gap-2">
              <span className="shrink-0">Edit station of</span>
              <span className="min-w-0 truncate text-foreground">
                "{values.name || "Station"}"
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
                  onChange={event => {
                    const name = event.currentTarget.value;
                    setValues(current => ({
                      ...current,
                      name,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="station-inspector-description">
                  Description
                </Label>
                <Textarea
                  id="station-inspector-description"
                  value={values.description}
                  maxLength={1024}
                  className="min-h-48 max-h-72 resize-y overflow-y-auto"
                  onChange={event => {
                    const description = event.currentTarget.value;
                    setValues(current => ({
                      ...current,
                      description,
                    }));
                  }}
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
                    disabled={stationRoutineManager.isUpdatingStation}
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
                    onChange={event => {
                      const headerBackgroundURL = event.currentTarget.value;
                      setValues(current => ({
                        ...current,
                        headerBackgroundURL,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  stationRoutineManager.isUpdatingStation ||
                  isLoadingStationDetail ||
                  values.name.trim().length === 0
                }
              >
                {stationRoutineManager.isUpdatingStation && <Spinner />}
                Save
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={stationRoutineManager.isUpdatingStation}
                onClick={onClose}
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
          <InspectorLoadingCover
            label="Loading"
            show={isLoadingStationDetail}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StationInspector;
