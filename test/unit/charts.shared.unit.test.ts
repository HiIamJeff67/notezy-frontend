import {
  createSingleSeriesCartesianData,
  getCartesianValues,
  getInnerChartDomain,
  mergeChartMargin,
} from "@shared/charts/data";
import {
  createBandScale,
  createLinearDomain,
  createLinearScale,
} from "@shared/charts/scales";

describe("Charts Core Unit Tests", () => {
  describe("createLinearDomain", () => {
    test("should include zero and add padding by default", () => {
      const domain = createLinearDomain([10, 20], { paddingRatio: 0.1 });

      expect(domain[0]).toBe(-2);
      expect(domain[1]).toBe(22);
    });

    test("should fallback when values are empty", () => {
      expect(createLinearDomain([null, undefined])).toEqual([0, 1]);
    });

    test("should expand single-value domains", () => {
      const domain = createLinearDomain([5, 5], { includeZero: false });

      expect(domain[0]).toBeLessThan(5);
      expect(domain[1]).toBeGreaterThan(5);
    });
  });

  describe("createLinearScale", () => {
    test("should map values from domain to range", () => {
      const scale = createLinearScale([0, 100], [0, 200]);

      expect(scale(0)).toBe(0);
      expect(scale(50)).toBe(100);
      expect(scale(100)).toBe(200);
    });
  });

  describe("createBandScale", () => {
    test("should allocate stable band positions", () => {
      const scale = createBandScale(["a", "b"], [0, 100], 0.2);

      expect(scale.bandwidth).toBe(40);
      expect(scale.getPosition("a")).toBe(5);
      expect(scale.getPosition("b")).toBe(55);
    });
  });

  describe("createSingleSeriesCartesianData", () => {
    test("should normalize simple x/y points into cartesian chart data", () => {
      const data = createSingleSeriesCartesianData(
        { id: "count", label: "Count" },
        [
          { id: "day-1", x: "Mon", y: 2 },
          { id: "day-2", x: "Tue", y: null },
        ]
      );

      expect(data.series).toEqual([{ id: "count", label: "Count" }]);
      expect(getCartesianValues(data)).toEqual([2, null]);
    });
  });

  describe("chart layout data", () => {
    test("should merge chart margin defaults", () => {
      expect(mergeChartMargin({ left: 80 })).toEqual({
        top: 16,
        right: 20,
        bottom: 36,
        left: 80,
      });
    });

    test("should calculate inner chart domains", () => {
      expect(
        getInnerChartDomain(200, 100, {
          top: 10,
          right: 20,
          bottom: 30,
          left: 40,
        })
      ).toEqual({
        x: [40, 180],
        y: [70, 10],
        width: 140,
        height: 60,
      });
    });
  });
});
