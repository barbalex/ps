import { createFileRoute } from "@tanstack/react-router";

import { PersonFilter } from "../../../../../formsAndLists/person/Filter.tsx";

const from = "/data/projects/$projectId_/persons/filter";

export const Route = createFileRoute(
  "/data/projects/$projectId_/persons/filter",
)({
  component: () => <PersonFilter from={from} />,
});
