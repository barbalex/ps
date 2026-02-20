import { createFileRoute } from "@tanstack/react-router";

import { CheckFilter } from "../../../../../../../../../formsAndLists/check/Filter.tsx";

const from =
  "/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/filter";

export const Route = createFileRoute(
  "/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/filter",
)({
  component: () => <CheckFilter from={from} level={1} />,
});
