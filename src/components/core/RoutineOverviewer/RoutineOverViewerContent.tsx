import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { CheckIcon, SquarePen } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import { ProgressiveBackground } from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useBackgroundImages,
  useModal,
  useResizeSidebar,
  useStationRoutine,
} from "@/hooks";
import AddChartDialog from "./RoutineCharts/AddChartDialog";
import type {
  NewRoutineOverviewChart,
  RoutineOverviewChart,
  RoutineOverviewChartComponentId,
} from "./RoutineCharts/chartWidget.type";
import { CHART_DEFINITIONS } from "./RoutineCharts/chartWidget.type";
import RoutineOverviewerCharts from "./RoutineOverviewerCharts";

import RoutineScopeBar from "./RoutineScopeBar";
import RoutineTable from "./RoutineTable";
import RoutineTaskTable from "./RoutineTaskTable";
import TimeRails from "./TimeRails/TimeRails";

function dedupeChartComponentIds(componentIds: string[]) {
  return Array.from(new Set(componentIds));
}

function createChartsFromComponentIds(componentIds: string[]) {
  return dedupeChartComponentIds(componentIds)
    .map(componentId => {
      const definition =
        CHART_DEFINITIONS[componentId as RoutineOverviewChartComponentId];
      if (!definition) return null;

      return {
        ...definition.chart,
        id: definition.id,
      } as RoutineOverviewChart;
    })
    .filter((chart): chart is RoutineOverviewChart => chart !== null);
}

function getChartComponentIds(charts: RoutineOverviewChart[]) {
  return dedupeChartComponentIds(charts.map(chart => chart.id));
}

function getChartDefinitionId(chart: NewRoutineOverviewChart) {
  return Object.values(CHART_DEFINITIONS).find(
    definition =>
      definition.chart.domain === chart.domain &&
      definition.chart.chartType === chart.chartType
  )?.id;
}

type RoutineOverviewerContentProps = {
  showCharts?: boolean;
  showStationScope?: boolean;
};

const RoutineOverviewerContent = ({
  showCharts = true,
  showStationScope = true,
}: RoutineOverviewerContentProps) => {
  const modalManager = useModal();
  const backgroundImagesManager = useBackgroundImages();
  const sidebarManager = useSidebar();
  const resizableSidebarManager = useResizeSidebar();
  const stationRoutineManager = useStationRoutine();

  const [isHeaderBackgroundImageEditing, setIsHeaderBackgroundImageEditing] =
    useState<boolean>(false);
  const [isAddChartDialogOpen, setIsAddChartDialogOpen] =
    useState<boolean>(false);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number>(16 / 9);

  const headerBackgroundImageRef = useRef<HTMLDivElement>(null);
  const chartComponentIdsRef = useRef<string[]>([]);
  const [charts, setCharts] = useState<RoutineOverviewChart[]>([]);
  const chartTimeHourUnit =
    stationRoutineManager.timeRailScale === "day" ? 1 : 24;

  useEffect(() => {
    const storedCharts = createChartsFromComponentIds(
      LocalStorageManipulator.getItemByKey(
        LocalStorageKey.routineOverviewCharts
      ) ?? []
    );
    const storedComponentIds = getChartComponentIds(storedCharts);

    chartComponentIdsRef.current = storedComponentIds;
    setCharts(storedCharts);
    LocalStorageManipulator.setItem(
      LocalStorageKey.routineOverviewCharts,
      storedComponentIds
    );
  }, []);

  const setChartsAndPersist = (
    getNextCharts: (
      currentCharts: RoutineOverviewChart[]
    ) => RoutineOverviewChart[]
  ) => {
    setCharts(currentCharts => {
      const nextCharts = createChartsFromComponentIds(
        getChartComponentIds(getNextCharts(currentCharts))
      );
      const nextComponentIds = getChartComponentIds(nextCharts);

      chartComponentIdsRef.current = nextComponentIds;
      LocalStorageManipulator.setItem(
        LocalStorageKey.routineOverviewCharts,
        nextComponentIds
      );

      return nextCharts;
    });
  };

  const addChart = (chart: NewRoutineOverviewChart) => {
    setChartsAndPersist(currentCharts => {
      const componentId = getChartDefinitionId(chart);
      if (!componentId) return currentCharts;

      const hasChart = currentCharts.some(
        currentChart => currentChart.id === componentId
      );
      if (hasChart) return currentCharts;

      return [
        ...currentCharts,
        { ...chart, id: componentId } as RoutineOverviewChart,
      ];
    });
  };

  const updateChart = (nextChart: RoutineOverviewChart) => {
    setChartsAndPersist(currentCharts => {
      const nextComponentId = getChartDefinitionId(nextChart);
      if (!nextComponentId) return currentCharts;

      const hasDuplicate = currentCharts.some(
        chart => chart.id !== nextChart.id && chart.id === nextComponentId
      );
      if (hasDuplicate) return currentCharts;

      return currentCharts.map(chart =>
        chart.id === nextChart.id
          ? ({ ...nextChart, id: nextComponentId } as RoutineOverviewChart)
          : chart
      );
    });
  };

  const removeChart = (chartId: string) => {
    setChartsAndPersist(currentCharts =>
      currentCharts.filter(chart => chart.id !== chartId)
    );
  };

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [backgroundImagesManager.currentBackgroundImage]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-start overflow-hidden bg-cover bg-center bg-no-repeat">
      <header
        className="
          fixed top-0 right-0 z-20 h-10
          flex shrink-0 justify-between items-center 
          gap-2 bg-background/75 backdrop-blur-md border-background/10
        "
        style={{
          left: sidebarManager.isMobile
            ? 0
            : sidebarManager.open
              ? resizableSidebarManager.width
              : "var(--sidebar-width-icon)",
          transition: "left 0.2s",
        }}
      >
        <RoutineScopeBar
          onOpenAddChart={() => setIsAddChartDialogOpen(true)}
          showAddChart={showCharts}
          showStationStatus={showStationScope}
        />
      </header>
      <div className="custom-scrollbar flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto pt-10">
        <div className="relative z-10 h-60 w-full shrink-0">
          {isHeaderBackgroundImageEditing ? (
            <Button
              variant="ghost"
              className="
                fixed right-0 justify-center items-center
                rounded-full shadow-lg w-8 h-8 m-2
                transition z-100
              "
              onClick={() => setIsHeaderBackgroundImageEditing(false)}
            >
              <CheckIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="
                absolute right-0 bottom-0 justify-center items-center
                rounded-full shadow-lg w-8 h-8 m-2
                transition z-100
              "
              onClick={() => setIsHeaderBackgroundImageEditing(true)}
            >
              <SquarePen />
            </Button>
          )}
          {backgroundImagesManager.currentBackgroundImage === null ? (
            <GridBackground className="w-full h-full shrink-0 relative z-10">
              {isHeaderBackgroundImageEditing && (
                <ModifyImageHover
                  className="absolute"
                  imageSrc=""
                  imageAlt="Dashboard background image"
                  onClick={() =>
                    modalManager.open("SelectBackgroundImageDialog", {
                      cropperAspectRatio: cropperAspectRatio,
                    })
                  }
                  hoverText="點擊以變更背景圖片"
                />
              )}
            </GridBackground>
          ) : (
            <ProgressiveBackground
              ref={headerBackgroundImageRef}
              className="w-full h-full shrink-0 border-none relative z-10"
            >
              {isHeaderBackgroundImageEditing && (
                <ModifyImageHover
                  className="absolute inset-0"
                  imageAlt="Dashboard background image"
                  onClick={() =>
                    modalManager.open("SelectBackgroundImageDialog", {
                      cropperAspectRatio: cropperAspectRatio,
                    })
                  }
                  hoverText="點擊以變更背景圖片"
                />
              )}
            </ProgressiveBackground>
          )}
        </div>
        <div className="flex w-full flex-col gap-4 overflow-x-hidden p-4">
          <TimeRails />
          {showCharts && (
            <RoutineOverviewerCharts
              charts={charts}
              onChartChange={updateChart}
              onChartRemove={removeChart}
              onOpenAddChart={() => setIsAddChartDialogOpen(true)}
              queryRange={stationRoutineManager.timeWindow}
              timeHourUnit={chartTimeHourUnit}
            />
          )}
          <RoutineTable />
          <RoutineTaskTable />
        </div>
      </div>
      {showCharts && (
        <AddChartDialog
          activeChartComponentIds={getChartComponentIds(charts)}
          onAddChart={addChart}
          onOpenChange={setIsAddChartDialogOpen}
          open={isAddChartDialogOpen}
        />
      )}
    </div>
  );
};

export default RoutineOverviewerContent;
