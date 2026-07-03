import {
  useVisualizeMyRoutinePeriodCount,
  useVisualizeMyRoutineScheduledEndAtCount,
  useVisualizeMyRoutineScheduledStartAtCount,
  useVisualizeMyRoutineStatusCount,
} from "@shared/api/hooks/routine.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { IntChart } from "@shared/charts/components";
import { hasPositiveChartValue } from "@shared/charts/util";
import { ChartWidgetFrame } from "./ChartWidgetFrame";
import type { RoutineChartType } from "./chartWidget.type";

const options = [
  { value: "statusCount", label: "Status counts" },
  { value: "periodCount", label: "Period counts" },
  { value: "scheduledStartAtCount", label: "Scheduled starts" },
  { value: "scheduledEndAtCount", label: "Scheduled ends" },
] satisfies { value: RoutineChartType; label: string }[];

interface RoutineChartWidgetProps {
  chartType: RoutineChartType;
  onChartTypeChange: (chartType: RoutineChartType) => void;
  onRemove: () => void;
  queryRange: { startAt: Date; endAt: Date };
  timeHourUnit: number;
}

const RoutineChartWidget = ({
  chartType,
  onChartTypeChange,
  onRemove,
  queryRange,
  timeHourUnit,
}: RoutineChartWidgetProps) => {
  const permission = AccessControlPermission.Owner;
  const statusQuery = useVisualizeMyRoutineStatusCount(
    { param: { permission } },
    { enabled: chartType === "statusCount" }
  );
  const periodQuery = useVisualizeMyRoutinePeriodCount(
    { param: { permission } },
    { enabled: chartType === "periodCount" }
  );
  const scheduledStartQuery = useVisualizeMyRoutineScheduledStartAtCount(
    {
      param: {
        permission,
        timeHourUnit,
        queryRangeStartedAt: queryRange.startAt,
        queryRangeEndedAt: queryRange.endAt,
      },
    },
    { enabled: chartType === "scheduledStartAtCount" }
  );
  const scheduledEndQuery = useVisualizeMyRoutineScheduledEndAtCount(
    {
      param: {
        permission,
        timeHourUnit,
        queryRangeStartedAt: queryRange.startAt,
        queryRangeEndedAt: queryRange.endAt,
      },
    },
    { enabled: chartType === "scheduledEndAtCount" }
  );

  const query =
    chartType === "statusCount"
      ? statusQuery
      : chartType === "periodCount"
        ? periodQuery
        : chartType === "scheduledStartAtCount"
          ? scheduledStartQuery
          : scheduledEndQuery;
  const points = query.data?.data.data ?? [];
  const displayPoints =
    query.isError || !hasPositiveChartValue(points) ? [] : points;
  const data = { data: displayPoints };
  const series = {
    id: "routineCount",
    label: "Routines",
    color: "var(--chart-2)",
  };
  const chartKind =
    chartType === "statusCount"
      ? "pie"
      : chartType === "periodCount"
        ? "column"
        : "line";
  const errorText =
    chartType === "statusCount"
      ? "Unable to load routine status"
      : chartType === "periodCount"
        ? "Unable to load routine periods"
        : "Unable to load routines";

  return (
    <ChartWidgetFrame
      title="Routine"
      value={chartType}
      options={options}
      onValueChange={onChartTypeChange}
      onRemove={onRemove}
    >
      <IntChart
        ariaLabel={`Routine ${chartType}`}
        chartType={chartKind}
        data={data}
        emptyMessage={query.isError ? errorText : "No data"}
        height={280}
        innerRadiusRatio={0.48}
        loading={query.isPending}
        series={series}
        showLegend={chartKind === "pie"}
      />
    </ChartWidgetFrame>
  );
};

export default RoutineChartWidget;
