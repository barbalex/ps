import { createFileRoute } from "@tanstack/react-router";

import { SubprojectReportFilter } from "../../../../../../../formsAndLists/subprojectReport/Filter.tsx";

const from =
  "/data/projects/$projectId_/subprojects/$subprojectId_/reports/filter";

export const Route = createFileRoute(
  "/data/projects/$projectId_/subprojects/$subprojectId_/reports/filter",
)({
  component: () => <SubprojectReportFilter from={from} />,
});
