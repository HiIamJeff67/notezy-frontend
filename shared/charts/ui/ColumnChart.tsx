import * as React from "react";
import {
  DEFAULT_VIEWBOX_HEIGHT,
  DEFAULT_VIEWBOX_WIDTH,
  getChartColor,
} from "../constants/chart.constant";
import { getCartesianValues, getInnerChartDomain, mergeChartMargin } from "../data";
import {
  buildLinearTicks,
  createBandScale,
  createLinearDomain,
  createLinearScale,
  isFiniteChartValue,
} from "../scales";
import type {
  CartesianChartData,
  CartesianChartDatum,
  ChartAxisValue,
  ChartActive,
  ChartDomain,
  ChartMargin,
  ChartTooltipContext,
} from "../types";
import {
  ChartFrame,
  formatAxisValue,
  formatNumber,
  type TooltipPosition,
} from "./ChartFrame";

export interface ColumnChartProps<TMeta = unknown> {
  data: CartesianChartData<TMeta>;
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
  width?: number | string;
  ariaLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  tooltip?: (context: ChartTooltipContext<TMeta>) => React.ReactNode;
  onActiveChange?: (active: ChartActive<TMeta> | null) => void;
  margin?: Partial<ChartMargin>;
  valueDomain?: ChartDomain;
  formatX?: (value: ChartAxisValue) => string;
  formatY?: (value: number) => string;
  maxXAxisLabels?: number;
}

export function ColumnChart<TMeta = unknown>({
  data,
  margin,
  valueDomain,
  className,
  style,
  height,
  width,
  ariaLabel = "Column chart",
  loading,
  emptyMessage,
  showLegend = true,
  showGrid = true,
  tooltip,
  onActiveChange,
  formatX = formatAxisValue,
  formatY = formatNumber,
  maxXAxisLabels = 8,
}: ColumnChartProps<TMeta>) {
  const [active, setActive] = React.useState<ChartActive<TMeta> | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    React.useState<TooltipPosition | null>(null);
  const mergedMargin = mergeChartMargin(margin);
  const inner = getInnerChartDomain(
    DEFAULT_VIEWBOX_WIDTH,
    DEFAULT_VIEWBOX_HEIGHT,
    mergedMargin
  );
  const groupScale = createBandScale(
    data.data.map((datum) => datum.id),
    inner.x,
    0.28
  );
  const seriesScale = createBandScale(
    data.series.map((series) => series.id),
    [0, groupScale.bandwidth],
    0.16
  );
  const domain = valueDomain ?? createLinearDomain(getCartesianValues(data));
  const yScale = createLinearScale(domain, inner.y);
  const zeroY = yScale(0);
  const ticks = buildLinearTicks(domain);
  const legendItems = data.series.map((series, index) => ({
    id: series.id,
    label: series.label,
    color: getChartColor(index, series.color),
  }));
  const xLabelEvery = Math.max(1, Math.ceil(data.data.length / maxXAxisLabels));
  const isEmpty =
    data.series.length === 0 ||
    data.data.length === 0 ||
    getCartesianValues(data).every((value) => !isFiniteChartValue(value));

  const setActiveColumn = (
    datum: CartesianChartDatum<TMeta>,
    seriesIndex: number,
    x: number,
    y: number
  ) => {
    const series = data.series[seriesIndex];
    const value = datum.values[series.id];

    if (!isFiniteChartValue(value)) {
      return;
    }

    const nextActive: ChartActive<TMeta> = {
      kind: "column",
      label: datum.label ?? formatX(datum.x),
      value,
      color: getChartColor(seriesIndex, series.color),
      seriesId: series.id,
      seriesLabel: series.label,
      datumId: datum.id,
      x: datum.x,
      meta: datum.meta,
    };

    setActive(nextActive);
    setTooltipPosition({ x, y });
    onActiveChange?.(nextActive);
  };

  const clearActive = () => {
    setActive(null);
    setTooltipPosition(null);
    onActiveChange?.(null);
  };

  return (
    <ChartFrame
      active={active}
      ariaLabel={ariaLabel}
      className={className}
      emptyMessage={emptyMessage}
      height={height}
      isEmpty={isEmpty}
      legendItems={legendItems}
      loading={loading}
      showLegend={showLegend}
      style={style}
      tooltip={tooltip}
      tooltipPosition={tooltipPosition}
      width={width}
    >
      <g onMouseLeave={clearActive}>
        {showGrid &&
          ticks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  x1={inner.x[0]}
                  x2={inner.x[1]}
                  y1={y}
                  y2={y}
                />
                <text
                  fill="var(--muted-foreground)"
                  fontSize={11}
                  textAnchor="end"
                  x={mergedMargin.left - 8}
                  y={y + 4}
                >
                  {formatY(tick)}
                </text>
              </g>
            );
          })}
        {data.data.map((datum, index) => {
          if (index % xLabelEvery !== 0) {
            return null;
          }

          const x = groupScale.getPosition(datum.id) + groupScale.bandwidth / 2;

          return (
            <text
              fill="var(--muted-foreground)"
              fontSize={11}
              key={datum.id}
              textAnchor="middle"
              x={x}
              y={DEFAULT_VIEWBOX_HEIGHT - 10}
            >
              {datum.label ?? formatX(datum.x)}
            </text>
          );
        })}
        {data.data.map((datum) =>
          data.series.map((series, seriesIndex) => {
            const value = datum.values[series.id];

            if (!isFiniteChartValue(value)) {
              return null;
            }

            const color = getChartColor(seriesIndex, series.color);
            const x =
              groupScale.getPosition(datum.id) + seriesScale.getPosition(series.id);
            const y = yScale(value);
            const rectY = Math.min(y, zeroY);
            const rectHeight = Math.abs(zeroY - y);
            const centerX = x + seriesScale.bandwidth / 2;

            return (
              <rect
                aria-label={`${series.label}: ${
                  datum.label ?? formatX(datum.x)
                } ${formatY(value)}`}
                fill={color}
                height={rectHeight}
                key={`${datum.id}-${series.id}`}
                onBlur={clearActive}
                onFocus={() => setActiveColumn(datum, seriesIndex, centerX, rectY)}
                onMouseEnter={() =>
                  setActiveColumn(datum, seriesIndex, centerX, rectY)
                }
                opacity={active?.datumId === datum.id ? 1 : 0.86}
                role="img"
                rx={3}
                tabIndex={0}
                width={seriesScale.bandwidth}
                x={x}
                y={rectY}
              />
            );
          })
        )}
      </g>
    </ChartFrame>
  );
}
