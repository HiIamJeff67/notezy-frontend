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
