import { useGetMyRoutineTagById } from "@shared/api/hooks/routineTag.hook";
import type { SupportedIcon } from "@shared/api/interfaces/enums";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import { getAuthorization } from "@shared/util/getAuthorization";
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
import { useLanguage, useStationRoutine } from "@/hooks";
import RoutineTagInspectorSkeleton from "./RoutineTagInspectorSkeleton";

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
  const stationRoutineManager = useStationRoutine();
  const getRoutineTagQuerier = useGetMyRoutineTagById();

  const [isLoadingRoutineTagDetail, setIsLoadingRoutineTagDetail] =
    useState(false);
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
    if (!isOpen) return;
    let cancelled = false;
    setValues({
      name: "",
      color: "#64748b",
      icon: null,
    });

    setIsLoadingRoutineTagDetail(true);
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    getRoutineTagQuerier
      .fetch({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          routineTagId,
        },
      })
      .then(response => {
        if (cancelled || response.success === false || !response.data) return;
        const routineTagNode: RoutineTagNode = {
          id: response.data.id as UUID,
          name: response.data.name,
          color: response.data.color,
          icon: response.data.icon,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
          routines: [],
          routineCount: 0,
          isOpen: false,
        };
        stationRoutineManager.upsertRoutineTagNode(routineTagNode);
        setValues({
          name: response.data.name,
          color: response.data.color,
          icon: response.data.icon,
        });
      })
      .catch(error => {
        if (!cancelled) toast.error(languageManager.tError(error));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoutineTagDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, routineTagId]);

  const saveRoutineTag = async () => {
    const name = values.name.trim();
    if (name.length === 0) return;

    try {
      await stationRoutineManager.updateRoutineTag(
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

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isUpdatingRoutineTag) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="z-[110] flex h-full w-full flex-col gap-0 bg-muted p-0 sm:max-w-md"
      >
        <div className="relative flex h-full min-h-0 w-full flex-col">
          <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
            <SheetTitle className="flex min-w-0 items-center gap-2">
              <span className="shrink-0">Edit routine tag of </span>
              <span className="min-w-0 truncate text-foreground">
                "{values.name || "Routine tag"}"
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
            {isLoadingRoutineTagDetail ? (
              <RoutineTagInspectorSkeleton />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="routine-tag-inspector-name">Name</Label>
                  <Input
                    id="routine-tag-inspector-name"
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

                <div className="flex items-end gap-4">
                  <div className="flex shrink-0 flex-col gap-2">
                    <Label>Color</Label>
                    <ColorSelector
                      value={values.color}
                      onValueChange={color =>
                        setValues(current => ({ ...current, color }))
                      }
                      disabled={stationRoutineManager.isUpdatingRoutineTag}
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
                      disabled={stationRoutineManager.isUpdatingRoutineTag}
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            )}

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  stationRoutineManager.isUpdatingRoutineTag ||
                  isLoadingRoutineTagDetail ||
                  values.name.trim().length === 0
                }
              >
                {stationRoutineManager.isUpdatingRoutineTag && <Spinner />}
                Save
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={stationRoutineManager.isUpdatingRoutineTag}
                onClick={onClose}
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoutineTagInspector;
