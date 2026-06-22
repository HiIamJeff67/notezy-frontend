import { Chart } from "@shared/charts/components";
import type {
  TwoDimensionalChartType,
  TwoDimensionalData,
} from "@shared/charts/types";
import { cn } from "@shared/util/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CHART_DEFINITIONS,
  type NewRoutineOverviewChart,
} from "./chartWidget.type";

const categoricalPreviewData: TwoDimensionalData = {
  data: [
    { id: "one", x: "One", value: 8 },
    { id: "two", x: "Two", value: 14 },
    { id: "three", x: "Three", value: 10 },
  ],
};

const timePreviewData: TwoDimensionalData = {
  data: [
    { id: "mon", x: "Mon", value: 4 },
    { id: "tue", x: "Tue", value: 9 },
    { id: "wed", x: "Wed", value: 6 },
    { id: "thu", x: "Thu", value: 12 },
    { id: "fri", x: "Fri", value: 8 },
  ],
};

const piePreviewData: TwoDimensionalData = {
  data: [
    { id: "planned", x: "Planned", value: 9 },
    { id: "active", x: "Active", value: 5 },
    { id: "done", x: "Done", value: 14 },
  ],
};

interface AddChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddChart: (chart: NewRoutineOverviewChart) => void;
  activeChartComponentIds: string[];
}

const AddChartDialog = ({
  open,
  onOpenChange,
  onAddChart,
  activeChartComponentIds,
}: AddChartDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[86vh] flex-col gap-0 overflow-hidden rounded-md bg-muted p-0 sm:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-12">
        <DialogTitle>Add chart</DialogTitle>
        <DialogDescription>
          Choose a chart to add to the routine overview.
        </DialogDescription>
      </DialogHeader>
      <div className="custom-scrollbar min-h-0 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-6">
          {(["Overall", "Routine", "Routine Task"] as const).map((section) => (
            <fieldset
              className="min-w-0 rounded-md border border-border/70 px-4 pb-4"
              key={section}
            >
              <legend className="px-2 text-sm font-medium text-muted-foreground">
                {section}
              </legend>
              <div className="grid min-w-0 grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.values(CHART_DEFINITIONS)
                  .filter((definition) => definition.section === section)
                  .map((definition) => {
                    const chartType: TwoDimensionalChartType =
                      definition.id === "routine:statusCount"
                        ? "pie"
                        : definition.id === "routineTask:statusCount"
                          ? "bar"
                          : definition.chart.chartType.includes("AtCount")
                            ? "line"
                            : "column";
                    const data =
                      chartType === "pie"
                        ? piePreviewData
                        : chartType === "line"
                          ? timePreviewData
                          : categoricalPreviewData;
                    const isActive = activeChartComponentIds.includes(
                      definition.id,
                    );

                    return (
                      <button
                        className={cn(
                          "group relative z-0 flex min-w-0 cursor-pointer flex-col rounded-md border border-border/70 bg-background p-3 text-left transition-colors hover:z-10 hover:border-primary/45",
                          isActive &&
                            "cursor-not-allowed opacity-55 hover:border-border/70",
                        )}
                        disabled={isActive}
                        key={definition.id}
                        onClick={() => {
                          if (isActive) return;
                          onAddChart(definition.chart);
                          onOpenChange(false);
                        }}
                        type="button"
                      >
                        <p className="truncate text-sm font-medium">
                          {definition.title}
                        </p>
                        <div className="relative mt-2 min-w-0 overflow-visible rounded-sm border border-border/60 bg-muted/45">
                          <div className="pointer-events-none min-w-0 p-2">
                            <Chart
                              ariaLabel={`${definition.title} chart preview`}
                              chartType={chartType}
                              data={data}
                              height={118}
                              innerRadiusRatio={0.45}
                              series={{
                                id: "count",
                                label: "Count",
                                color: "var(--chart-1)",
                              }}
                              showGrid={false}
                              showLegend={false}
                              valueMode={
                                chartType === "line" ? "continuous" : "integer"
                              }
                            />
                          </div>
                          <div
                            className={cn(
                              "absolute inset-0 z-40 flex items-center justify-center rounded-sm bg-background/85 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100",
                              isActive && "opacity-100",
                            )}
                          >
                            {isActive ? "已加入" : "點擊以新增"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default AddChartDialog;
