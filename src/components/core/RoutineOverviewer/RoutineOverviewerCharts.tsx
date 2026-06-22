import { ChartNoAxesCombined } from "lucide-react";
import type { RoutineOverviewChart } from "./RoutineCharts/chartWidget.type";
import OverallChartWidget from "./RoutineCharts/OverallChartWidget";
import RoutineChartWidget from "./RoutineCharts/RoutineChartWidget";
import RoutineTaskChartWidget from "./RoutineCharts/RoutineTaskChartWidget";

interface RoutineOverviewerChartsProps {
  charts: RoutineOverviewChart[];
  onChartChange: (chart: RoutineOverviewChart) => void;
  onChartRemove: (chartId: string) => void;
  onOpenAddChart: () => void;
  queryRange: { startAt: Date; endAt: Date };
  timeHourUnit: number;
}

const RoutineOverviewerCharts = ({
  charts,
  onChartChange,
  onChartRemove,
  onOpenAddChart,
  queryRange,
  timeHourUnit,
}: RoutineOverviewerChartsProps) => (
  <section className="w-full min-w-0 rounded-md border border-border/60 bg-card/70 backdrop-blur-sm">
    <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <h2 className="text-sm font-medium text-foreground">Charts</h2>
      <span className="text-xs tabular-nums text-muted-foreground">
        {charts.length}
      </span>
    </header>
    {charts.length === 0 ? (
      <button
        className="m-4 flex min-h-40 w-[calc(100%-2rem)] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/70 bg-background/35 p-6 text-muted-foreground transition hover:border-primary/55 hover:bg-accent/45 hover:text-foreground"
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

export default RoutineOverviewerCharts;
