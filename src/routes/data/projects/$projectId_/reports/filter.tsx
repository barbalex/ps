import { createFileRoute } from "@tanstack/react-router";

import { ProjectReportFilter } from "../../../../../formsAndLists/projectReport/Filter.tsx";

const from = "/data/projects/$projectId_/reports/filter";

export const Route = createFileRoute(
  "/data/projects/$projectId_/reports/filter",
)({
  component: () => <ProjectReportFilter from={from} />,
});
