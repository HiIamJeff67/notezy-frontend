import type {
  CartesianChartData,
  CartesianChartDatum,
  ChartAxisValue,
  ChartNumericValue,
  ChartSeries,
} from "../types";

export interface SingleSeriesPoint<TMeta = unknown> {
  id: string;
  x: ChartAxisValue;
  y: ChartNumericValue;
  label?: string;
  meta?: TMeta;
}

export function createSingleSeriesCartesianData<TMeta = unknown>(
  series: ChartSeries,
  points: SingleSeriesPoint<TMeta>[]
): CartesianChartData<TMeta> {
  return {
    series: [series],
    data: points.map<CartesianChartDatum<TMeta>>((point) => ({
      id: point.id,
      x: point.x,
      label: point.label,
      values: {
        [series.id]: point.y,
      },
      meta: point.meta,
    })),
  };
}

export function getCartesianValues<TMeta = unknown>(
  data: CartesianChartData<TMeta>
) {
  return data.data.flatMap((datum) =>
    data.series.map((series) => datum.values[series.id])
  );
}

