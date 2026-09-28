import type { PGlite } from '@electric-sql/pglite'

/**
 * Groups the synced tables into FK-safe application levels: every table's
 * foreign-key parents (among the synced tables) sit in an earlier level, so
 * the levels can be applied parents-first during the initial sync. pglite
 * enforces foreign keys at the commit of every apply transaction and
 * Electric streams shapes concurrently without cross-shape ordering
 * guarantees — a child row that arrives before its parent aborts the whole
 * sync. Self-references (places.parent_id → place_id) are ignored: uuidv7
 * ids are time-ordered, so parents practically sort before their children
 * within a shape's own snapshot. Reference cycles (projects ↔ units) cannot
 * be ordered — their tables share a level and rely on the deferred
 * constraints plus the single apply transaction of one flush batch.
 */
export const dependencyLevels = async (
  db: Pick<PGlite, 'query'>,
  tables: string[],
): Promise<string[][]> => {
  const tableSet = new Set(tables)
  const res = await db.query<{
    table_name: string
    references_table: string
  }>(`
    SELECT tc.table_name, ccu.table_name AS references_table
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON kcu.constraint_schema = tc.constraint_schema
      AND kcu.constraint_name = tc.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_schema = tc.constraint_schema
      AND ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `)

  const parentsOf = new Map<string, Set<string>>(
    tables.map((table) => [table, new Set<string>()]),
  )
  for (const { table_name, references_table } of res.rows) {
    if (!tableSet.has(table_name)) continue
    if (!tableSet.has(references_table)) continue
    if (table_name === references_table) continue
    parentsOf.get(table_name)!.add(references_table)
  }

  // the schema contains reference cycles (projects ↔ units,
  // projects ↔ lists): strongly connected components are leveled as a
  // unit — their mutual references rely on the deferred foreign keys and
  // on the adapter applying one flush batch in a single transaction
  const sccOf = stronglyConnectedComponents(tables, parentsOf)
  const sccParents = new Map<number, Set<number>>()
  for (const table of tables) {
    const scc = sccOf.get(table)!
    const parents = sccParents.get(scc) ?? new Set<number>()
    for (const parent of parentsOf.get(table)!) {
      const parentScc = sccOf.get(parent)!
      if (parentScc !== scc) parents.add(parentScc)
    }
    sccParents.set(scc, parents)
  }

  const sccLevel = new Map<number, number>()
  const levelOfScc = (scc: number): number => {
    const cached = sccLevel.get(scc)
    if (cached != null) return cached
    // -1 while recursing: cycles were condensed away, this only guards
    // against pathological graphs
    sccLevel.set(scc, -1)
    const level =
      1 +
      Math.max(
        0,
        ...[...(sccParents.get(scc) ?? [])].map((parent) => levelOfScc(parent)),
      )
    sccLevel.set(scc, level)
    return level
  }
  for (const scc of new Set(sccOf.values())) levelOfScc(scc)

  const byLevel = new Map<number, string[]>()
  for (const table of tables) {
    const level = sccLevel.get(sccOf.get(table)!)!
    const levelTables = byLevel.get(level) ?? []
    levelTables.push(table)
    byLevel.set(level, levelTables)
  }
  return [...byLevel.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, levelTables]) => levelTables)
}

/** Tarjan's algorithm over the child→parents graph, returns table → scc id */
const stronglyConnectedComponents = (
  tables: string[],
  parentsOf: Map<string, Set<string>>,
) => {
  const sccOf = new Map<string, number>()
  let index = 0
  let sccId = 0
  const indices = new Map<string, number>()
  const lowlinks = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []

  const strongConnect = (table: string) => {
    indices.set(table, index)
    lowlinks.set(table, index)
    index++
    stack.push(table)
    onStack.add(table)
    for (const parent of parentsOf.get(table) ?? []) {
      if (!indices.has(parent)) {
        strongConnect(parent)
        lowlinks.set(
          table,
          Math.min(lowlinks.get(table)!, lowlinks.get(parent)!),
        )
      } else if (onStack.has(parent)) {
        lowlinks.set(table, Math.min(lowlinks.get(table)!, indices.get(parent)!))
      }
    }
    if (lowlinks.get(table) === indices.get(table)) {
      while (true) {
        const member = stack.pop()!
        onStack.delete(member)
        sccOf.set(member, sccId)
        if (member === table) break
      }
      sccId++
    }
  }
  for (const table of tables) {
    if (!indices.has(table)) strongConnect(table)
  }
  return sccOf
}

/** resolves once the sync object reports every one of its shapes up to date */
export const untilUpToDate = (
  sync: { isUpToDate: boolean },
  label: string,
  timeoutMs = 5 * 60 * 1000,
): Promise<void> =>
  new Promise((resolve) => {
    if (sync.isUpToDate) return resolve()
    const startedAt = Date.now()
    const timer = setInterval(() => {
      if (sync.isUpToDate) {
        clearInterval(timer)
        return resolve()
      }
      if (Date.now() - startedAt > timeoutMs) {
        // a hung stream must not block the later levels (and their data)
        // forever — continue unordered and let the FK recovery handle a
        // possible collision
        console.warn(`syncStages: stage ${label} not up to date after ${timeoutMs / 1000}s, continuing`)
        clearInterval(timer)
        resolve()
      }
    }, 500)
  })
