import { BasicPreviewWidgets, Widget } from "@/components/widgets/widget";
import { useLanguage, useUser } from "@/hooks";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface WidgetContextType {
  widgets: Widget[];
  hasChanged: boolean;
  append: (widget: Widget) => void;
  replace: (index: number, widget: Widget) => void;
  update: (
    index: number,
    field: keyof Widget,
    newValue: Widget[keyof Widget]
  ) => void;
  remove: (index: number) => void;
  reset: () => void;
  sync: () => void;
}

export const WidgetContext = createContext<WidgetContextType | undefined>(
  undefined
);

interface WidgetProviderProps {
  children: React.ReactNode;
}

const WidgetProvider = ({ children }: WidgetProviderProps) => {
  const languageManager = useLanguage();
  const userManager = useUser();

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  useEffect(() => {
    const initializeWidgets = async () => {
      const widgetsEncoded = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.dashboardWidgets,
        userManager.userData?.publicId
      );
      if (widgetsEncoded !== null) {
        try {
          setWidgets(
            (
              JSON.parse(widgetsEncoded).map((widgetEncoded: any) => ({
                ...widgetEncoded,
                component: BasicPreviewWidgets[widgetEncoded.name]?.component,
              })) as Partial<Widget>[]
            ).filter(widget => widget.component !== undefined) as Widget[]
          );
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }
    };

    initializeWidgets();
  }, [userManager.userData]);

  const append = useCallback((widget: Widget) => {
    setWidgets(prev => [...prev, widget]);
    setHasChanged(true);
  }, []);

  const replace = useCallback((index: number, widget: Widget) => {
    setWidgets(prev =>
      prev.map((prevWidget, i) => (i === index ? widget : prevWidget))
    );
    setHasChanged(true);
  }, []);

  const update = useCallback(
    (index: number, field: keyof Widget, newValue: Widget[keyof Widget]) => {
      setWidgets(prev =>
        prev.map((widget, i) =>
          i === index ? { ...widget, [field]: newValue } : widget
        )
      );
      setHasChanged(true);
    },
    []
  );

  const remove = useCallback((index: number) => {
    setWidgets(prev => prev.filter((_, i) => i !== index));
    setHasChanged(true);
  }, []);

  const reset = useCallback(() => {
    setWidgets([]);
    setHasChanged(true);
  }, []);

  const sync = useCallback(() => {
    LocalStorageManipulator.setItem(
      LocalStorageKey.dashboardWidgets,
      JSON.stringify(widgets),
      userManager.userData?.publicId
    );
    if (hasChanged) toast.success("Successfully save the widgets");
    setHasChanged(false);
  }, [widgets]);

  return (
    <WidgetContext.Provider
      value={{
        widgets: widgets,
        hasChanged: hasChanged,
        append: append,
        replace: replace,
        update: update,
        remove: remove,
        reset: reset,
        sync: sync,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

export default WidgetProvider;
