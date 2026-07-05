import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import { Skeleton } from "@/components/ui/skeleton";
import RoutineOverviewerChartsSkeleton from "./RoutineOverviewerChartsSkeleton";
import RoutineScopeBarSkeleton from "./RoutineScopeBarSkeleton";
import RoutineTableSkeleton from "./RoutineTableSkeleton";
import RoutineTaskRecordTableSkeleton from "./RoutineTaskRecordTableSkeleton";
import RoutineTaskTableSkeleton from "./RoutineTaskTableSkeleton";
import TimeRailsSkeleton from "./TimeRails/TimeRailsSkeleton";

const RoutineOverviewerContentSkeleton = ({
  showCharts = true,
  headerLeft = 0,
}: {
  showCharts?: boolean;
  headerLeft?: number | string;
}) => (
  <div className="flex h-full min-h-0 w-full flex-col items-start overflow-hidden bg-cover bg-center bg-no-repeat">
    <header
      className="fixed top-0 right-0 z-20 h-10 border-background/10 bg-background/75 backdrop-blur-md"
      style={{ left: headerLeft }}
    >
      <RoutineScopeBarSkeleton />
    </header>
    <div className="custom-scrollbar flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto pt-10">
      <div className="relative z-10 h-60 w-full shrink-0">
        <GridBackground className="relative z-10 h-full w-full shrink-0">
          <div className="absolute right-0 bottom-0 m-2">
            <Skeleton className="size-8 rounded-full" />
          </div>
        </GridBackground>
      </div>
      <div className="flex w-full flex-col gap-4 overflow-x-hidden p-4">
        <TimeRailsSkeleton />
        {showCharts && <RoutineOverviewerChartsSkeleton />}
        <RoutineTableSkeleton />
        <RoutineTaskTableSkeleton />
        <RoutineTaskRecordTableSkeleton />
      </div>
    </div>
  </div>
);

export default RoutineOverviewerContentSkeleton;
