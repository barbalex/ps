import { createFileRoute } from "@tanstack/react-router";

import { PlaceUserFilter } from "../../../../../../../../../formsAndLists/placeUser/Filter.tsx";

const from =
  "/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/filter";

export const Route = createFileRoute(
  "/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/filter",
)({
  component: () => <PlaceUserFilter from={from} level={1} />,
});
