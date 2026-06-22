import type { CSSProperties, ReactNode } from "react";
import type {
  ChartActive,
  ChartMargin,
  ChartSeries,
  ChartTooltipContext,
  ChartValueMode,
  TwoDimensionalChartType,
  TwoDimensionalData,
} from "../types";
import { toCartesianChartData, toPieChartData } from "../util";
import { BarChart } from "./BarChart";
import { ColumnChart } from "./ColumnChart";
import { LineChart } from "./LineChart";
import { PieChart } from "./PieChart";

interface BaseChartProps<TMeta = unknown> {
  data: TwoDimensionalData<TMeta>;
  chartType: TwoDimensionalChartType;
  series: ChartSeries;
  className?: string;
  style?: CSSProperties;
  height?: number | string;
  width?: number | string;
  ariaLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  tooltip?: (context: ChartTooltipContext<TMeta>) => ReactNode;
  onActiveChange?: (active: ChartActive<TMeta> | null) => void;
  margin?: Partial<ChartMargin>;
  valueDomain?: [number, number];
  formatX?: (value: string) => string;
  formatY?: (value: number) => string;
  maxXAxisLabels?: number;
  valueMode?: ChartValueMode;
  innerRadiusRatio?: number;
}

export function Chart<TMeta = unknown>({
  data,
  chartType,
  series,
  innerRadiusRatio,
  valueMode,
  ...props
}: BaseChartProps<TMeta>) {
  if (chartType === "pie") {
    return (
      <PieChart
        {...props}
        data={toPieChartData(data)}
        innerRadiusRatio={innerRadiusRatio}
        valueMode={valueMode}
      />
    );
  }

  const cartesianData = toCartesianChartData(data, series);

  if (chartType === "bar") {
    return <BarChart {...props} data={cartesianData} valueMode={valueMode} />;
  }

  if (chartType === "column") {
    return (
      <ColumnChart {...props} data={cartesianData} valueMode={valueMode} />
    );
  }

  return <LineChart {...props} data={cartesianData} />;
}
