// PGlite discovers live-query dependencies via view → table references, not
// by inspecting functions. Include this CTE in queries using the shared SQL
// write-access helpers so directory and role changes trigger a fresh result.
export const roleDependencies = `role_dependencies AS (
  SELECT 1 FROM users, project_users, project_roles, subproject_roles, place_roles WHERE false
)`
