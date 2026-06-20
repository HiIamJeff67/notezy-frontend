import type { ChartDomain, ChartMargin } from "../types";
import { DEFAULT_CHART_MARGIN } from "../constants/chart.constant";

export function mergeChartMargin(margin?: Partial<ChartMargin>): ChartMargin {
  return {
    ...DEFAULT_CHART_MARGIN,
    ...margin,
  };
}

export function getInnerChartDomain(
  width: number,
  height: number,
  margin: ChartMargin
): { x: ChartDomain; y: ChartDomain; width: number; height: number } {
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  return {
    x: [margin.left, margin.left + innerWidth],
    y: [margin.top + innerHeight, margin.top],
    width: innerWidth,
    height: innerHeight,
  };
}

