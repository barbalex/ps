import { createFileRoute } from "@tanstack/react-router";

import { GoalFilter } from "../../../../../../../formsAndLists/goal/Filter.tsx";

const from =
  "/data/projects/$projectId_/subprojects/$subprojectId_/goals/filter";

export const Route = createFileRoute(
  "/data/projects/$projectId_/subprojects/$subprojectId_/goals/filter",
)({
  component: () => <GoalFilter from={from} />,
});
