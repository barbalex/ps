import { createFileRoute } from "@tanstack/react-router";

import { ListFilter } from "../../../../../formsAndLists/list/Filter.tsx";

const from = "/data/projects/$projectId_/lists/filter";

export const Route = createFileRoute("/data/projects/$projectId_/lists/filter")(
  {
    component: () => <ListFilter from={from} />,
  },
);
