import {
  useVisualizeMyRoutineTaskActualEndedAtCount,
  useVisualizeMyRoutineTaskActualStartedAtCount,
  useVisualizeMyRoutineTaskPurposeCount,
  useVisualizeMyRoutineTaskScheduledAtCount,
  useVisualizeMyRoutineTaskStatusCount,
} from "@shared/api/hooks/routineTask.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { IntChart } from "@shared/charts/components";
import { hasPositiveChartValue } from "@shared/charts/util";
import { ChartWidgetFrame } from "./ChartWidgetFrame";
import type { RoutineTaskChartType } from "./chartWidget.type";

const options = [
  { value: "statusCount", label: "Status counts" },
  { value: "purposeCount", label: "Purpose counts" },
  { value: "scheduledAtCount", label: "Scheduled times" },
  { value: "actualStartedAtCount", label: "Actual starts" },
  { value: "actualEndedAtCount", label: "Actual ends" },
] satisfies { value: RoutineTaskChartType; label: string }[];

interface RoutineTaskChartWidgetProps {
  chartType: RoutineTaskChartType;
  onChartTypeChange: (chartType: RoutineTaskChartType) => void;
  onRemove: () => void;
  queryRange: { startAt: Date; endAt: Date };
  timeHourUnit: number;
}

const RoutineTaskChartWidget = ({
  chartType,
  onChartTypeChange,
  onRemove,
  queryRange,
  timeHourUnit,
}: RoutineTaskChartWidgetProps) => {
  const permission = AccessControlPermission.Owner;
  const timeParam = {
    permission,
    timeHourUnit,
    queryRangeStartedAt: queryRange.startAt,
    queryRangeEndedAt: queryRange.endAt,
  };
  const statusQuery = useVisualizeMyRoutineTaskStatusCount(
    { param: { permission } },
    { enabled: chartType === "statusCount" }
  );
  const purposeQuery = useVisualizeMyRoutineTaskPurposeCount(
    { param: { permission } },
    { enabled: chartType === "purposeCount" }
  );
  const scheduledQuery = useVisualizeMyRoutineTaskScheduledAtCount(
    { param: timeParam },
    { enabled: chartType === "scheduledAtCount" }
  );
  const actualStartedQuery = useVisualizeMyRoutineTaskActualStartedAtCount(
    { param: timeParam },
    { enabled: chartType === "actualStartedAtCount" }
  );
  const actualEndedQuery = useVisualizeMyRoutineTaskActualEndedAtCount(
    { param: timeParam },
    { enabled: chartType === "actualEndedAtCount" }
  );

  const query =
    chartType === "statusCount"
      ? statusQuery
      : chartType === "purposeCount"
        ? purposeQuery
        : chartType === "scheduledAtCount"
          ? scheduledQuery
          : chartType === "actualStartedAtCount"
            ? actualStartedQuery
            : actualEndedQuery;
  const points = query.data?.data.data ?? [];
  const displayPoints =
    query.isError || !hasPositiveChartValue(points) ? [] : points;
  const data = { data: displayPoints };
  const series = {
    id: "routineTaskCount",
    label: "Routine tasks",
    color: "var(--chart-3)",
  };
  const chartKind =
    chartType === "statusCount"
      ? "bar"
      : chartType === "purposeCount"
        ? "column"
        : "line";
  const errorText =
    chartType === "statusCount"
      ? "Unable to load task status"
      : chartType === "purposeCount"
        ? "Unable to load task purposes"
        : "Unable to load routine tasks";

  return (
    <ChartWidgetFrame
      title="Routine Task"
      value={chartType}
      options={options}
      onValueChange={onChartTypeChange}
      onRemove={onRemove}
    >
      <IntChart
        ariaLabel={`Routine task ${chartType}`}
        chartType={chartKind}
        data={data}
        emptyMessage={query.isError ? errorText : "No data"}
        height={280}
        loading={query.isPending}
        series={series}
        showLegend={false}
      />
    </ChartWidgetFrame>
  );
};

export default RoutineTaskChartWidget;
