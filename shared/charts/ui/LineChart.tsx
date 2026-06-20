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

export interface LineChartProps<TMeta = unknown> {
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

export function LineChart<TMeta = unknown>({
  data,
  margin,
  valueDomain,
  className,
  style,
  height,
  width,
  ariaLabel = "Line chart",
  loading,
  emptyMessage,
  showLegend = true,
  showGrid = true,
  tooltip,
  onActiveChange,
  formatX = formatAxisValue,
  formatY = formatNumber,
  maxXAxisLabels = 8,
}: LineChartProps<TMeta>) {
  const [active, setActive] = React.useState<ChartActive<TMeta> | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    React.useState<TooltipPosition | null>(null);
  const mergedMargin = mergeChartMargin(margin);
  const inner = getInnerChartDomain(
    DEFAULT_VIEWBOX_WIDTH,
    DEFAULT_VIEWBOX_HEIGHT,
    mergedMargin
  );
  const xScale = createBandScale(
    data.data.map((datum) => datum.id),
    inner.x,
    0.12
  );
  const domain = valueDomain ?? createLinearDomain(getCartesianValues(data));
  const yScale = createLinearScale(domain, inner.y);
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

  const setActivePoint = (
    datum: CartesianChartDatum<TMeta>,
    seriesIndex: number,
    pointX: number,
    pointY: number
  ) => {
    const series = data.series[seriesIndex];
    const value = datum.values[series.id];

    if (!isFiniteChartValue(value)) {
      return;
    }

    const nextActive: ChartActive<TMeta> = {
      kind: "line-point",
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
    setTooltipPosition({ x: pointX, y: pointY });
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

          const x = xScale.getPosition(datum.id) + xScale.bandwidth / 2;

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
        {data.series.map((series, seriesIndex) => {
          const color = getChartColor(seriesIndex, series.color);
          const points = data.data.map((datum) => {
            const x = xScale.getPosition(datum.id) + xScale.bandwidth / 2;
            const value = datum.values[series.id];
            return {
              x,
              y: isFiniteChartValue(value) ? yScale(value) : null,
            };
          });
          let path = "";
          let segmentStarted = false;

          points.forEach((point) => {
            if (!isFiniteChartValue(point.y)) {
              segmentStarted = false;
              return;
            }

            if (!segmentStarted) {
              path += `M ${point.x} ${point.y}`;
              segmentStarted = true;
              return;
            }

            path += ` L ${point.x} ${point.y}`;
          });

          return (
            <g key={series.id}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
              {data.data.map((datum) => {
                const value = datum.values[series.id];

                if (!isFiniteChartValue(value)) {
                  return null;
                }

                const x = xScale.getPosition(datum.id) + xScale.bandwidth / 2;
                const y = yScale(value);

                return (
                  <circle
                    aria-label={`${series.label}: ${
                      datum.label ?? formatX(datum.x)
                    } ${formatY(value)}`}
                    cx={x}
                    cy={y}
                    fill="var(--background)"
                    key={`${datum.id}-${series.id}`}
                    onBlur={clearActive}
                    onFocus={() => setActivePoint(datum, seriesIndex, x, y)}
                    onMouseEnter={() => setActivePoint(datum, seriesIndex, x, y)}
                    r={4}
                    role="img"
                    stroke={color}
                    strokeWidth={2}
                    tabIndex={0}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </ChartFrame>
  );
}
