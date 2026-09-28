import { describe, expect, it } from 'vitest'

import { createTestDb } from './helpers/createTestDb.ts'
import { dependencyLevels } from '../src/modules/syncStages.ts'

describe('syncStages', () => {
  it('levels all synced tables FK-safe: parents before children', async () => {
    const { db } = await createTestDb()
    // every non-history public table stands in for the shape tables (a
    // superset — the invariant must hold for the real subset all the more)
    const res = await db.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '%_history'
      ORDER BY table_name
    `)
    const tables = res.rows.map((r) => r.table_name)
    expect(tables.length).toBeGreaterThan(30)

    const levels = await dependencyLevels(db, tables)

    // every table placed exactly once
    const flat = levels.flat()
    expect(new Set(flat).size).toBe(tables.length)
    expect([...flat].sort()).toEqual([...tables].sort())

    // every FK edge points to an earlier level
    const levelIndexOf = new Map<string, number>()
    levels.forEach((level, index) => {
      for (const table of level) levelIndexOf.set(table, index)
    })
    const fkRes = await db.query<{ table_name: string; references_table: string }>(`
      SELECT tc.table_name, ccu.table_name AS references_table
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_schema = tc.constraint_schema
        AND kcu.constraint_name = tc.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_schema = tc.constraint_schema
        AND ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `)
    const edges = fkRes.rows.filter(
      (r) =>
        r.table_name !== r.references_table &&
        levelIndexOf.has(r.table_name) &&
        levelIndexOf.has(r.references_table),
    )
    expect(edges.length).toBeGreaterThan(50)
    for (const edge of edges) {
      // strict parents-first; same level is only legal inside a reference
      // cycle (projects ↔ units, projects ↔ lists ↔ units)
      const parentIdx = levelIndexOf.get(edge.references_table)!
      const childIdx = levelIndexOf.get(edge.table_name)!
      const sameLevelCycle =
        parentIdx === childIdx &&
        ['projects', 'units', 'lists'].includes(edge.references_table) &&
        ['projects', 'units', 'lists'].includes(edge.table_name)
      expect(
        parentIdx < childIdx || sameLevelCycle,
        `${edge.references_table} must sync before ${edge.table_name} (or share a cycle level)`,
      ).toBe(true)
    }
  })

  it('produces several levels for the app schema', async () => {
    const { db } = await createTestDb()
    const res = await db.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '%_history'
    `)
    const levels = await dependencyLevels(
      db,
      res.rows.map((r) => r.table_name),
    )
    expect(levels.length).toBeGreaterThan(3)
    // directory roots first, data rows later
    const levelIndexOf2 = new Map<string, number>()
    levels.forEach((level, index) => {
      for (const table of level) levelIndexOf2.set(table, index)
    })
    expect(levelIndexOf2.get('users')).toBeLessThan(levelIndexOf2.get('subprojects'))
    expect(levelIndexOf2.get('subprojects')).toBeLessThan(levelIndexOf2.get('places'))
    expect(levelIndexOf2.get('places')).toBeLessThan(levelIndexOf2.get('checks'))
    expect(levelIndexOf2.get('checks')).toBeLessThan(levelIndexOf2.get('check_taxa'))
  })
})
