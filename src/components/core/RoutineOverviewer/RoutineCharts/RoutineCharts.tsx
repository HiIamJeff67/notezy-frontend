import { ChartNoAxesCombined } from "lucide-react";
import OverallChartWidget from "./OverallChartWidget";
import RoutineChartWidget from "./RoutineChartWidget";
import RoutineTaskChartWidget from "./RoutineTaskChartWidget";

export const CHART_DEFINITIONS = {
  "overall:totalCount": {
    id: "overall:totalCount",
    title: "Total counts",
    section: "Overall",
    chart: { domain: "overall", chartType: "totalCount" },
  },
  "routine:statusCount": {
    id: "routine:statusCount",
    title: "Status counts",
    section: "Routine",
    chart: { domain: "routine", chartType: "statusCount" },
  },
  "routine:periodCount": {
    id: "routine:periodCount",
    title: "Period counts",
    section: "Routine",
    chart: { domain: "routine", chartType: "periodCount" },
  },
  "routine:scheduledStartAtCount": {
    id: "routine:scheduledStartAtCount",
    title: "Scheduled starts",
    section: "Routine",
    chart: { domain: "routine", chartType: "scheduledStartAtCount" },
  },
  "routine:scheduledEndAtCount": {
    id: "routine:scheduledEndAtCount",
    title: "Scheduled ends",
    section: "Routine",
    chart: { domain: "routine", chartType: "scheduledEndAtCount" },
  },
  "routineTask:statusCount": {
    id: "routineTask:statusCount",
    title: "Status counts",
    section: "Routine Task",
    chart: { domain: "routineTask", chartType: "statusCount" },
  },
  "routineTask:purposeCount": {
    id: "routineTask:purposeCount",
    title: "Purpose counts",
    section: "Routine Task",
    chart: { domain: "routineTask", chartType: "purposeCount" },
  },
  "routineTask:scheduledAtCount": {
    id: "routineTask:scheduledAtCount",
    title: "Scheduled times",
    section: "Routine Task",
    chart: { domain: "routineTask", chartType: "scheduledAtCount" },
  },
  "routineTask:actualStartedAtCount": {
    id: "routineTask:actualStartedAtCount",
    title: "Actual starts",
    section: "Routine Task",
    chart: { domain: "routineTask", chartType: "actualStartedAtCount" },
  },
  "routineTask:actualEndedAtCount": {
    id: "routineTask:actualEndedAtCount",
    title: "Actual ends",
    section: "Routine Task",
    chart: { domain: "routineTask", chartType: "actualEndedAtCount" },
  },
} as const;

export type RoutineOverviewChartComponentId = keyof typeof CHART_DEFINITIONS;
export type NewRoutineOverviewChart =
  (typeof CHART_DEFINITIONS)[RoutineOverviewChartComponentId]["chart"];
export type RoutineOverviewChart = NewRoutineOverviewChart & {
  id: RoutineOverviewChartComponentId;
};
export type OverallChartType = Extract<
  NewRoutineOverviewChart,
  { domain: "overall" }
>["chartType"];
export type RoutineChartType = Extract<
  NewRoutineOverviewChart,
  { domain: "routine" }
>["chartType"];
export type RoutineTaskChartType = Extract<
  NewRoutineOverviewChart,
  { domain: "routineTask" }
>["chartType"];

interface RoutineOverviewerChartsProps {
  charts: RoutineOverviewChart[];
  onChartChange: (chart: RoutineOverviewChart) => void;
  onChartRemove: (chartId: string) => void;
  onOpenAddChart: () => void;
  queryRange: { startAt: Date; endAt: Date };
  timeHourUnit: number;
}

const RoutineCharts = ({
  charts,
  onChartChange,
  onChartRemove,
  onOpenAddChart,
  queryRange,
  timeHourUnit,
}: RoutineOverviewerChartsProps) => (
  <section className="flex w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
    <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-secondary px-4 py-3">
      <h2 className="text-sm font-medium text-foreground">Charts</h2>
      <span className="text-xs tabular-nums text-muted-foreground">
        {charts.length}
      </span>
    </header>
    {charts.length === 0 ? (
      <button
        className="m-4 flex min-h-52 w-[calc(100%-2rem)] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/70 bg-secondary p-6 text-muted-foreground transition hover:border-primary/55 hover:bg-primary/5 hover:text-foreground"
        onClick={onOpenAddChart}
        type="button"
      >
        <ChartNoAxesCombined className="size-5" />
        <span className="text-sm font-medium">Add charts</span>
      </button>
    ) : (
      <div className="grid min-w-0 grid-cols-1 gap-4 p-4 xl:grid-cols-2">
        {charts.map(chart => {
          if (chart.domain === "overall") {
            return (
              <OverallChartWidget
                chartType={chart.chartType}
                key={chart.id}
                onChartTypeChange={chartType =>
                  onChartChange({ ...chart, chartType })
                }
                onRemove={() => onChartRemove(chart.id)}
              />
            );
          }

          if (chart.domain === "routine") {
            return (
              <RoutineChartWidget
                chartType={chart.chartType}
                key={chart.id}
                onChartTypeChange={chartType =>
                  onChartChange({ ...chart, chartType })
                }
                onRemove={() => onChartRemove(chart.id)}
                queryRange={queryRange}
                timeHourUnit={timeHourUnit}
              />
            );
          }

          return (
            <RoutineTaskChartWidget
              chartType={chart.chartType}
              key={chart.id}
              onChartTypeChange={chartType =>
                onChartChange({ ...chart, chartType })
              }
              onRemove={() => onChartRemove(chart.id)}
              queryRange={queryRange}
              timeHourUnit={timeHourUnit}
            />
          );
        })}
      </div>
    )}
  </section>
);

export default RoutineCharts;
