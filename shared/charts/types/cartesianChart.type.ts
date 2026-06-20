import type {
  ChartAxisValue,
  ChartNumericValue,
  ChartSeries,
} from "./chart.type";

export interface CartesianChartDatum<TMeta = unknown> {
  id: string;
  x: ChartAxisValue;
  label?: string;
  values: Record<string, ChartNumericValue>;
  meta?: TMeta;
}

export interface CartesianChartData<TMeta = unknown> {
  series: ChartSeries[];
  data: CartesianChartDatum<TMeta>[];
}

