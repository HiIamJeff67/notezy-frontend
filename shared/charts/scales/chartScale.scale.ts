import type { ChartDomain, ChartNumericValue } from "../types";

export interface BandScale {
  bandwidth: number;
  step: number;
  getPosition: (id: string) => number;
}

export function isFiniteChartValue(value: ChartNumericValue): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function getFiniteChartValues(values: ChartNumericValue[]) {
  return values.filter(isFiniteChartValue);
}

export function createLinearDomain(
  values: ChartNumericValue[],
  options: {
    includeZero?: boolean;
    paddingRatio?: number;
    fallback?: ChartDomain;
  } = {}
): ChartDomain {
  const {
    includeZero = true,
    paddingRatio = 0.08,
    fallback = [0, 1],
  } = options;
  const finiteValues = getFiniteChartValues(values);

  if (finiteValues.length === 0) {
    return fallback;
  }

  let min = Math.min(...finiteValues);
  let max = Math.max(...finiteValues);

  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }

  if (min === max) {
    const offset = Math.abs(min || 1) * 0.1;
    return [min - offset, max + offset];
  }

  const padding = (max - min) * paddingRatio;
  return [min - padding, max + padding];
}

export function createLinearScale(domain: ChartDomain, range: ChartDomain) {
  const domainSpan = domain[1] - domain[0];

  if (domainSpan === 0) {
    return () => (range[0] + range[1]) / 2;
  }

  return (value: number) =>
    range[0] + ((value - domain[0]) / domainSpan) * (range[1] - range[0]);
}

export function createBandScale(
  ids: string[],
  range: ChartDomain,
  padding = 0.2
): BandScale {
  const [start, end] = range;
  const count = ids.length;
  const size = Math.max(0, end - start);

  if (count === 0 || size === 0) {
    return {
      bandwidth: 0,
      step: 0,
      getPosition: () => start,
    };
  }

  const safePadding = Math.min(Math.max(padding, 0), 0.9);
  const step = size / count;
  const bandwidth = step * (1 - safePadding);
  const offset = (step - bandwidth) / 2;
  const positions = new Map<string, number>();

  ids.forEach((id, index) => {
    positions.set(id, start + index * step + offset);
  });

  return {
    bandwidth,
    step,
    getPosition: (id: string) => positions.get(id) ?? start,
  };
}

export function buildLinearTicks(domain: ChartDomain, count = 5) {
  const safeCount = Math.max(2, Math.floor(count));
  const span = domain[1] - domain[0];

  if (span === 0) {
    return [domain[0]];
  }

  const step = span / (safeCount - 1);
  return Array.from({ length: safeCount }, (_, index) => domain[0] + step * index);
}
