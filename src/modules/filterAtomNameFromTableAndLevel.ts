import { snakeToCamel } from "./snakeToCamel.ts";

const tablesAbovePlaces = [
  "projects",
  "subprojects",
  "users",
  "persons",
  "lists",
  "units",
  "taxonomies",
  "widget_types",
  "widgets_for_fields",
  "accounts",
  "messages",
  "project_reports",
  "project_users",
  "wfs_services",
  "wms_services",
  "wms_layers",
  "vector_layers",
  "project_files",
  "subproject_reports",
  "goals",
  "occurrences",
  "subproject_taxa",
  "subproject_users",
  "subproject_histories",
  "occurrence_imports",
  "subproject_files",
  "charts",
];

export const filterAtomNameFromTableAndLevel = ({ table, level }) => {
  const tableIsAbovePlaces = tablesAbovePlaces.includes(table);
  const useLevel = level && !tableIsAbovePlaces;
  const atomName = `${snakeToCamel(table)}${
    useLevel ? `${level}` : ""
  }FilterAtom`;
  // console.log('filterAtomNameFromTableAndLevel', {
  //   table,
  //   level,
  //   atomName,
  //   tableIsAbovePlaces,
  //   useLevel,
  // })
  return atomName;
};
