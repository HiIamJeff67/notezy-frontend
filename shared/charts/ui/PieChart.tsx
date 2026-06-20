import * as React from "react";
import {
  DEFAULT_VIEWBOX_HEIGHT,
  DEFAULT_VIEWBOX_WIDTH,
  getChartColor,
} from "../constants/chart.constant";
import type {
  ChartActive,
  ChartTooltipContext,
  PieChartData,
} from "../types";
import {
  ChartFrame,
  formatNumber,
  type TooltipPosition,
} from "./ChartFrame";

export interface PieChartProps<TMeta = unknown> {
  data: PieChartData<TMeta>;
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
  width?: number | string;
  ariaLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  tooltip?: (context: ChartTooltipContext<TMeta>) => React.ReactNode;
  onActiveChange?: (active: ChartActive<TMeta> | null) => void;
  innerRadiusRatio?: number;
  formatValue?: (value: number) => string;
}

export function PieChart<TMeta = unknown>({
  data,
  className,
  style,
  height,
  width,
  ariaLabel = "Pie chart",
  loading,
  emptyMessage,
  showLegend = true,
  tooltip,
  onActiveChange,
  innerRadiusRatio = 0,
  formatValue = formatNumber,
}: PieChartProps<TMeta>) {
  const [active, setActive] = React.useState<ChartActive<TMeta> | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    React.useState<TooltipPosition | null>(null);
  const centerX = DEFAULT_VIEWBOX_WIDTH / 2;
  const centerY = DEFAULT_VIEWBOX_HEIGHT / 2;
  const radius = Math.min(DEFAULT_VIEWBOX_WIDTH, DEFAULT_VIEWBOX_HEIGHT) * 0.36;
  const innerRadius = radius * Math.min(Math.max(innerRadiusRatio, 0), 0.85);
  const geometries = buildPieSliceGeometries(data.slices);
  const geometryById = new Map(geometries.map((geometry) => [geometry.id, geometry]));
  const legendItems = data.slices.map((slice, index) => ({
    id: slice.id,
    label: slice.label,
    color: getChartColor(index, slice.color),
  }));
  const isEmpty = geometries.length === 0;

  const setActiveSlice = (sliceIndex: number) => {
    const slice = data.slices[sliceIndex];
    const geometry = geometryById.get(slice.id);

    if (!geometry) {
      return;
    }

    const color = getChartColor(sliceIndex, slice.color);
    const middleAngle = (geometry.startAngle + geometry.endAngle) / 2;
    const tooltipPoint = polarToCartesian(
      centerX,
      centerY,
      radius * 0.78,
      middleAngle
    );
    const nextActive: ChartActive<TMeta> = {
      kind: "pie-slice",
      label: slice.label,
      value: geometry.value,
      color,
      sliceId: slice.id,
      meta: slice.meta,
    };

    setActive(nextActive);
    setTooltipPosition(tooltipPoint);
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
        {data.slices.map((slice, index) => {
          const geometry = geometryById.get(slice.id);

          if (!geometry) {
            return null;
          }

          const color = getChartColor(index, slice.color);

          return (
            <path
              aria-label={`${slice.label}: ${formatValue(geometry.value)}`}
              d={describeArcPath(
                centerX,
                centerY,
                radius,
                geometry.startAngle,
                geometry.endAngle,
                innerRadius
              )}
              fill={color}
              key={slice.id}
              onBlur={clearActive}
              onFocus={() => setActiveSlice(index)}
              onMouseEnter={() => setActiveSlice(index)}
              opacity={active?.sliceId === slice.id ? 1 : 0.88}
              role="img"
              stroke="var(--background)"
              strokeWidth={2}
              tabIndex={0}
            />
          );
        })}
        {innerRadius > 0 && (
          <text
            fill="var(--muted-foreground)"
            fontSize={12}
            textAnchor="middle"
            x={centerX}
            y={centerY + 4}
          >
            {formatValue(
              geometries.reduce((total, geometry) => total + geometry.value, 0)
            )}
          </text>
        )}
      </g>
    </ChartFrame>
  );
}

interface PieSliceGeometry {
  id: string;
  startAngle: number;
  endAngle: number;
  value: number;
  percentage: number;
}

function buildPieSliceGeometries(
  slices: Array<{ id: string; value: number }>
): PieSliceGeometry[] {
  const positiveSlices = slices.map((slice) => ({
    ...slice,
    value: Math.max(0, Number.isFinite(slice.value) ? slice.value : 0),
  }));
  const total = positiveSlices.reduce((sum, slice) => sum + slice.value, 0);

  if (total <= 0) {
    return [];
  }

  let currentAngle = -90;

  return positiveSlices.map((slice) => {
    const angle = (slice.value / total) * 360;
    const geometry = {
      id: slice.id,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      value: slice.value,
      percentage: slice.value / total,
    };

    currentAngle += angle;
    return geometry;
  });
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArcPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  innerRadius = 0
) {
  const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  if (innerRadius <= 0) {
    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  }

  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);

  return [
    `M ${start.x} ${start.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}
