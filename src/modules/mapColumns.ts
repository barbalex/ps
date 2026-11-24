// Per-table row transforms for the electric sync client; not part of the
// server-validated shape definition. change.value is the change row (see
// MapColumnsFn in @electric-sql/pglite-sync)

// electric sends partial update messages carrying only the changed columns
// (e.g. goal_reports' label/updated_at after a trigger bumps them) — the
// mapping must pass through exactly those keys. rebuilding the row with
// undefined for missing columns wrote NULLs on apply: created_at is NOT
// NULL and goal_id/data were wiped on every partial update (undoing a goal
// delete then broke on "null value in column created_at"). the data
// normalization stays: electric delivers jsonb in shapes electric can't
// insert as-is ('' or non-object strings)
export const mapColumnsByTable: Record<
  string,
  (change: { value: Record<string, unknown> }) => Record<string, unknown>
> = {
  goal_reports: (change) => {
    const value = change.value ?? {}
    const mapped: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      mapped[key] =
        key === 'data' ?
          !val ?
            '{}'
          : typeof val === 'string' && !val.trim().startsWith('{') ?
            JSON.stringify(val)
          : val
        : val
    }
    return mapped
  },
}
