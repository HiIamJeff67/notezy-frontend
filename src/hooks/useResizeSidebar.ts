import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { clamp } from "@/util/math";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
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
  minWidth: 256, // 16 rem
  maxWidth: 512, // 32 rem
  defaultWidth: 256, // 16 rem
} as const;

export function useResizeSidebar(options: ResizeSidebarOptions = {}) {
  const {
    side = "left",
    minWidth = DEFAULTS.minWidth,
    maxWidth = DEFAULTS.maxWidth,
    defaultWidth = DEFAULTS.defaultWidth,
  } = options;

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

  const style = useMemo(
    () =>
      ({
        "--sidebar-width": `${clamp(width, minWidth, maxWidth)}px`,
      } as CSSProperties),
    [width, minWidth, maxWidth]
  );

  return {
    width,
    setWidth: persist,
    style,
    onMouseDown,
    onDoubleClick,
    limits: { minWidth, maxWidth },
  };
}
