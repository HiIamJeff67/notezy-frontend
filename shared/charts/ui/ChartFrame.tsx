import * as React from "react";
import {
  DEFAULT_VIEWBOX_HEIGHT,
  DEFAULT_VIEWBOX_WIDTH,
} from "../constants/chart.constant";
import type { ChartActive, ChartTooltipContext } from "../types";

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
}

export interface TooltipPosition {
  x: number;
  y: number;
}

interface ChartFrameProps<TMeta = unknown> {
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
  width?: number | string;
  ariaLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  tooltip?: (context: ChartTooltipContext<TMeta>) => React.ReactNode;
  isEmpty: boolean;
  legendItems?: ChartLegendItem[];
  active?: ChartActive<TMeta> | null;
  tooltipPosition?: TooltipPosition | null;
  children: React.ReactNode;
}

export function formatAxisValue(value: string | number | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

export function formatNumber(value: number) {
  return Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
}

export function ChartFrame<TMeta = unknown>({
  className,
  style,
  height = 280,
  width = "100%",
  ariaLabel = "Chart",
  loading = false,
  emptyMessage = "No chart data",
  showLegend = true,
  legendItems = [],
  active,
  tooltip,
  tooltipPosition,
  isEmpty,
  children,
}: ChartFrameProps<TMeta>) {
  const frameClassName = [
    "relative flex min-h-0 min-w-0 flex-col overflow-hidden text-foreground",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const shouldShowState = loading || isEmpty;

  return (
    <div
      className={frameClassName}
      style={{
        width,
        height,
        ...style,
      }}
    >
      <div className="relative min-h-0 min-w-0 flex-1">
        <svg
          aria-label={ariaLabel}
          className="block size-full overflow-visible"
          role="img"
          viewBox={`0 0 ${DEFAULT_VIEWBOX_WIDTH} ${DEFAULT_VIEWBOX_HEIGHT}`}
        >
          {!shouldShowState && children}
        </svg>
        {shouldShowState && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {loading ? "Loading chart" : emptyMessage}
          </div>
        )}
        {!shouldShowState && active && tooltipPosition && (
          <div
            className="pointer-events-none absolute z-10 max-w-56 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
            style={{
              left: `${(tooltipPosition.x / DEFAULT_VIEWBOX_WIDTH) * 100}%`,
              top: `${(tooltipPosition.y / DEFAULT_VIEWBOX_HEIGHT) * 100}%`,
            }}
          >
            {tooltip
              ? tooltip({ active } satisfies ChartTooltipContext<TMeta>)
              : defaultTooltip(active)}
          </div>
        )}
      </div>
      {showLegend && legendItems.length > 0 && !shouldShowState && (
        <div className="mt-2 flex min-h-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {legendItems.map((item) => (
            <div key={item.id} className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function defaultTooltip<TMeta = unknown>(active: ChartActive<TMeta>) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate font-medium text-foreground">
        {active.seriesLabel
          ? `${active.seriesLabel} · ${active.label}`
          : active.label}
      </span>
      <span className="text-muted-foreground">{formatNumber(active.value)}</span>
    </div>
  );
}
