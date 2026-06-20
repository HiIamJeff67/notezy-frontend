export type ChartAxisValue = string | number | Date;
export type ChartNumericValue = number | null | undefined;
export type ChartDomain = [number, number];

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartSeries {
  id: string;
  label: string;
  color?: string;
}

export type ChartActiveKind = "column" | "bar" | "line-point" | "pie-slice";

export interface ChartActive<TMeta = unknown> {
  kind: ChartActiveKind;
  label: string;
  value: number;
  color: string;
  seriesId?: string;
  seriesLabel?: string;
  datumId?: string;
  sliceId?: string;
  x?: ChartAxisValue;
  meta?: TMeta;
}

export interface ChartTooltipContext<TMeta = unknown> {
  active: ChartActive<TMeta>;
}

