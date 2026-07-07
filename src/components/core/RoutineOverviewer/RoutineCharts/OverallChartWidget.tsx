import { useVisualizeMyTotalCount } from "@shared/api/hooks/station.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { IntChart } from "@shared/charts/components";
import { hasPositiveChartValue } from "@shared/charts/util";
import { ChartWidgetFrame } from "./ChartWidgetFrame";
import type { OverallChartType } from "./RoutineCharts";

interface OverallChartWidgetProps {
  chartType: OverallChartType;
  onChartTypeChange: (chartType: OverallChartType) => void;
  onRemove: () => void;
}

const OverallChartWidget = ({
  chartType,
  onChartTypeChange,
  onRemove,
}: OverallChartWidgetProps) => {
  const query = useVisualizeMyTotalCount({
    param: { permission: AccessControlPermission.Owner },
  });
  const points = query.data?.data.data ?? [];
  const displayPoints =
    query.isError || !hasPositiveChartValue(points) ? [] : points;

  return (
    <ChartWidgetFrame
      title="Overall"
      value={chartType}
      options={[{ value: "totalCount", label: "Total counts" }]}
      onValueChange={onChartTypeChange}
      onRemove={onRemove}
    >
      <IntChart
        ariaLabel="Workspace total counts"
        chartType="column"
        data={{ data: displayPoints }}
        emptyMessage={query.isError ? "Unable to load totals" : "No data"}
        height={280}
        loading={query.isPending}
        series={{
          id: "totalCount",
          label: "Total",
          color: "var(--chart-1)",
        }}
        showLegend={false}
      />
    </ChartWidgetFrame>
  );
};

export default OverallChartWidget;
