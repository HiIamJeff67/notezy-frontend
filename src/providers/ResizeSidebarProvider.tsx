import { useSidebar } from "@/components/ui/sidebar";
import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { clamp } from "@/util/math";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ResizeSidebarOptions = {
  side?: "left" | "right";
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
};

const DEFAULTS = {
  minWidth: 256,
  maxWidth: 512,
  defaultWidth: 256,
} as const;

type ResizeSidebarContextValue = {
  width: number;
  setWidth: (next: number) => void;
  sidebarStyle: CSSProperties;
  insetStyle: CSSProperties;
  onMouseDown: (e: ReactMouseEvent) => void;
  onDoubleClick: () => void;
  limits: { minWidth: number; maxWidth: number };
};

export const ResizeSidebarContext =
  createContext<ResizeSidebarContextValue | null>(null);

export function ResizeSidebarProvider({
  children,
  options = {},
}: {
  children: React.ReactNode;
  options?: ResizeSidebarOptions;
}) {
  const {
    side = "left",
    minWidth = DEFAULTS.minWidth,
    maxWidth = DEFAULTS.maxWidth,
    defaultWidth = DEFAULTS.defaultWidth,
  } = options;

  const sidebarManager = useSidebar();
  const [width, setWidth] = useState<number>(defaultWidth);

  useEffect(() => {
    const saved = LocalStorageManipulator.getItemByKey(
      LocalStorageKeys.sidebarWidth
    );
    if (saved) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed)) {
        setWidth(clamp(parsed, minWidth, maxWidth));
        return;
      }
    }
    setWidth(clamp(defaultWidth, minWidth, maxWidth));
  }, [minWidth, maxWidth, defaultWidth]);

  const persist = useCallback(
    (next: number) => {
      const clamped = clamp(next, minWidth, maxWidth);
      setWidth(clamped);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.sidebarWidth,
        String(clamped)
      );
    },
    [minWidth, maxWidth]
  );

  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      const move = (ev: MouseEvent) => {
        const x = ev.clientX;
        persist(side === "left" ? x : window.innerWidth - x);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      };
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [persist, side]
  );

  const onDoubleClick = useCallback(() => {
    persist(defaultWidth);
  }, [persist, defaultWidth]);

  const clampedWidth = useMemo(
    () => clamp(width, minWidth, maxWidth),
    [width, minWidth, maxWidth]
  );

  const sidebarStyle = useMemo(
    () =>
      ({
        "--sidebar-width": `${clampedWidth}px`,
      } as CSSProperties),
    [clampedWidth]
  );

  const insetStyle = useMemo(
    () =>
      ({
        paddingLeft: `calc(${clampedWidth}px - ${defaultWidth}px)`,
      } as CSSProperties),
    [clampedWidth, defaultWidth, sidebarManager?.open]
  );

  const value = useMemo(
    () => ({
      width: width,
      setWidth: persist,
      sidebarStyle: sidebarStyle,
      insetStyle: insetStyle,
      onMouseDown: onMouseDown,
      onDoubleClick: onDoubleClick,
      limits: { minWidth, maxWidth },
    }),
    [
      width,
      persist,
      sidebarStyle,
      onMouseDown,
      onDoubleClick,
      minWidth,
      maxWidth,
    ]
  );

  return (
    <ResizeSidebarContext.Provider value={value}>
      {children}
    </ResizeSidebarContext.Provider>
  );
}
