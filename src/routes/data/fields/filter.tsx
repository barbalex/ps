import { createFileRoute } from "@tanstack/react-router";

import { FieldFilter } from "../../../formsAndLists/field/Filter.tsx";

const from = "/data/fields/filter";

export const Route = createFileRoute(from)({
  component: () => <FieldFilter from={from} />,
});
