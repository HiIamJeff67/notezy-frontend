import { BasicPreviewWidgets } from "@/components/widgets/basic/basic";
import { Widget } from "@/components/widgets/widget";
import { useLanguage, useUser } from "@/hooks";
import { MaxTriggerValue } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface WidgetContextType {
  hasChanged: boolean;
  getWidgets: () => Widget[];
  getWidgetsLength: () => number;
  append: (widget: Widget) => void;
  replace: (index: number, widget: Widget) => void;
  update: (
    index: number,
    field: keyof Widget,
    newValue: Widget[keyof Widget]
  ) => void;
  updateByWidget: (
    widget: Widget,
    field: keyof Widget,
    newValue: Widget[keyof Widget]
  ) => void;
  remove: (index: number) => void;
  reset: (newWidgets: Widget[]) => void;
  sync: (syncWidgets?: Widget[]) => void;
}

export const WidgetContext = createContext<WidgetContextType | undefined>(
  undefined
);

interface WidgetProviderProps {
  children: React.ReactNode;
}

export const WidgetProvider = ({ children }: WidgetProviderProps) => {
  const languageManager = useLanguage();
  const userManager = useUser();

  const [_, setUpdateTrigger] = useState(0);
  const widgetsRef = useRef<Widget[]>([]);
  const hasChangedRef = useRef<boolean>(false);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  useEffect(() => {
    const initializeWidgets = async () => {
      if (userManager.userData !== null) {
        const widgetsEncoded = LocalStorageManipulator.getItemByKey(
          LocalStorageKey.dashboardWidgets,
          userManager.userData?.publicId
        );
        if (widgetsEncoded !== null) {
          try {
            widgetsRef.current = (
              JSON.parse(widgetsEncoded).map((widgetEncoded: any) => ({
                ...widgetEncoded,
                component: BasicPreviewWidgets[widgetEncoded.name]?.component,
              })) as Partial<Widget>[]
            ).filter(widget => widget.component !== undefined) as Widget[];
            forceUpdate();
          } catch (error) {
            toast.error(languageManager.tError(error));
          }
        }
      }
    };

    initializeWidgets();
  }, [userManager.userData, languageManager, forceUpdate]);

  const getWidgets = useCallback(() => widgetsRef.current, []);

  const getWidgetsLength = useCallback(() => widgetsRef.current.length, []);

  const append = useCallback(
    (widget: Widget) => {
      widgetsRef.current.push(widget);
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const replace = useCallback(
    (index: number, widget: Widget) => {
      if (index < 0 || index >= widgetsRef.current.length) return;
      widgetsRef.current[index] = widget;
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const update = useCallback(
    (index: number, field: keyof Widget, newValue: Widget[keyof Widget]) => {
      if (index < 0 || index >= widgetsRef.current.length) return;
      widgetsRef.current[index] = {
        ...widgetsRef.current[index],
        [field]: newValue,
      };
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const updateByWidget = useCallback(
    (widget: Widget, field: keyof Widget, newValue: Widget[keyof Widget]) => {
      const targetIndex = widgetsRef.current.findIndex(w => w.id === widget.id);

      if (targetIndex !== -1) {
        widgetsRef.current[targetIndex] = {
          ...widgetsRef.current[targetIndex],
          [field]: newValue,
        };
        hasChangedRef.current = true;
        forceUpdate();
      }
    },
    [forceUpdate]
  );

  const remove = useCallback(
    (index: number) => {
      widgetsRef.current = widgetsRef.current.filter((_, i) => i !== index);
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const reset = useCallback(
    (newWidgets: Widget[]) => {
      widgetsRef.current = newWidgets;
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const sync = useCallback(
    (syncWidgets?: Widget[]) => {
      const targetWidgets =
        syncWidgets !== undefined ? syncWidgets : widgetsRef.current;

      const sortedWidgets = targetWidgets.sort((a: Widget, b: Widget) =>
        a.position.topFrameCount === b.position.topFrameCount
          ? a.position.leftFrameCount - b.position.leftFrameCount
          : a.position.topFrameCount - b.position.topFrameCount
      );

      widgetsRef.current = sortedWidgets;
      console.log("userData", userManager.userData?.publicId);

      LocalStorageManipulator.setItem(
        LocalStorageKey.dashboardWidgets,
        JSON.stringify(sortedWidgets),
        userManager.userData?.publicId
      );

      if (hasChangedRef.current) {
        toast.success("Successfully save the widgets");
      }

      hasChangedRef.current = false;
      forceUpdate();
    },
    [userManager.userData, forceUpdate]
  );

  return (
    <WidgetContext.Provider
      value={{
        hasChanged: hasChangedRef.current,
        getWidgets,
        getWidgetsLength,
        append,
        replace,
        update,
        updateByWidget,
        remove,
        reset,
        sync,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};
