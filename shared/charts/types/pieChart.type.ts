export interface PieChartSlice<TMeta = unknown> {
  id: string;
  label: string;
  value: number;
  color?: string;
  meta?: TMeta;
}

export interface PieChartData<TMeta = unknown> {
  slices: PieChartSlice<TMeta>[];
}

