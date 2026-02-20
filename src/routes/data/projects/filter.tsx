import { createFileRoute } from "@tanstack/react-router";

import { ProjectFilter } from "../../../formsAndLists/project/Filter.tsx";

const from = "/data/projects/filter";

export const Route = createFileRoute(from)({
  component: () => <ProjectFilter from={from} />,
});
