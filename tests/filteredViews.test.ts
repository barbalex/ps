import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import { filterStringFromFilter } from '../src/modules/filterStringFromFilter.ts'
import type { TableRowFilter } from '../src/store.ts'

/**
 * Tests the data logic behind filtered views on checks:
 * - the view's stored filter (same format as user table row filters)
 *   compiles to SQL that selects exactly the view's rows
 * - $eq matches exactly: "Kontrolle" must not match "Freiwilligen-Kontrolle"
 * - new rows created through a view get the values filtered for
 *   (data.* keys land in the jsonb data column, column keys on the row)
 */

let fixture: TestFixture

beforeAll(async () => {
  fixture = await createTestDb()
})

afterAll(async () => {
  await fixture?.db.close()
})

const VIEW_FELD = '70000000-0000-7000-8000-000000000001'
const VIEW_FREIW = '70000000-0000-7000-8000-000000000002'
const CHECK_FELD = '71000000-0000-7000-8000-000000000001'
const CHECK_FREIW = '71000000-0000-7000-8000-000000000002'
const CHECK_NO_TYP = '71000000-0000-7000-8000-000000000003'
const CHECK_OTHER_PLACE = '71000000-0000-7000-8000-000000000004'

const setupData = async () => {
  const { db, ids } = fixture

  // level-2 place level with plain checks disabled and two views enabled
  await db.exec(`
    INSERT INTO place_levels(place_level_id, project_id, level, name_singular_de, name_plural_de, checks, filtered_views) VALUES
      ('73000000-0000-7000-8000-000000000001', '${ids.project}', 2, 'Teil-Population', 'Teil-Populationen', false, '${JSON.stringify(
        { [VIEW_FELD]: true, [VIEW_FREIW]: true },
      )}'::jsonb);
  `)

  await db.exec(`
    INSERT INTO filtered_views(filtered_view_id, project_id, table_name, name_singular_de, name_plural_de, filter, sort) VALUES
      ('${VIEW_FELD}', '${ids.project}', 'checks', 'Feld-Kontrolle', 'Feld-Kontrollen', '${JSON.stringify(
        [{ 'data.typ': { $eq: 'Kontrolle' } }],
      )}'::jsonb, 1),
      ('${VIEW_FREIW}', '${ids.project}', 'checks', 'Freiwilligen-Kontrolle', 'Freiwilligen-Kontrollen', '${JSON.stringify(
        [{ 'data.typ': { $eq: 'Freiwilligen-Kontrolle' } }],
      )}'::jsonb, 2);
  `)

  await db.exec(`
    INSERT INTO checks(check_id, place_id, date, data) VALUES
      ('${CHECK_FELD}', '${ids.place}', '2024-01-01', '${JSON.stringify({
        typ: 'Kontrolle',
      })}'::jsonb),
      ('${CHECK_FREIW}', '${ids.place}', '2024-01-02', '${JSON.stringify({
        typ: 'Freiwilligen-Kontrolle',
      })}'::jsonb),
      ('${CHECK_NO_TYP}', '${ids.place}', '2024-01-03', NULL),
      ('${CHECK_OTHER_PLACE}', '${ids.otherPlace}', '2024-01-04', '${JSON.stringify(
        { typ: 'Kontrolle' },
      )}'::jsonb);
  `)
}

/** the SQL useFilteredChecksNavData builds for a view's checks list */
const viewChecksSql = (
  placeId: string,
  viewFilter: TableRowFilter[],
  userFilter: TableRowFilter[] = [],
) => {
  const viewFilterString = filterStringFromFilter(viewFilter)
  const filterString = filterStringFromFilter(userFilter)
  const hasViewFilter = !!viewFilterString
  const isFiltered = !!filterString
  return `
    SELECT check_id AS id
    FROM checks
    WHERE place_id = '${placeId}'
      ${hasViewFilter ? `AND (${viewFilterString})` : ''}
      ${isFiltered ? `AND (${filterString})` : ''}
    ORDER BY label
  `
}

describe('filtered views on checks', () => {
  beforeAll(setupData)

  it('$eq filters exactly: Kontrolle does not match Freiwilligen-Kontrolle', async () => {
    const { db, ids } = fixture

    const feld = await db.query<{ id: string }>(
      viewChecksSql(ids.place, [{ 'data.typ': { $eq: 'Kontrolle' } }]),
    )
    expect(feld.rows.map((r) => r.id)).toEqual([CHECK_FELD])

    const freiw = await db.query<{ id: string }>(
      viewChecksSql(ids.place, [{ 'data.typ': { $eq: 'Freiwilligen-Kontrolle' } }]),
    )
    expect(freiw.rows.map((r) => r.id)).toEqual([CHECK_FREIW])
  })

  it('$ne filters like apf2 EK: everything except Freiwilligen-Kontrolle, including Ausgangszustand and null', async () => {
    const { db, ids } = fixture
    const ek = await db.query<{ id: string }>(
      viewChecksSql(ids.place, [
        { 'data.typ': { $ne: 'Freiwilligen-Kontrolle' } },
      ]),
    )
    expect(ek.rows.map((r) => r.id).sort()).toEqual(
      [CHECK_FELD, CHECK_NO_TYP].sort(),
    )
  })

  it('labels rows in apf2 manner: 4-digit year, then the label_by fields', async () => {
    const { db, ids } = fixture
    // the label expression useFilteredChecksNavData builds for label_by ["typ"]
    const labelSql = `coalesce(lpad(extract(year from checks.date)::text, 4, '0'), '(kein Jahr)') || ': ' || coalesce(checks.data->>'typ', '(kein Typ)')`
    const res = await db.query<{ id: string; label: string }>(
      `SELECT check_id AS id, ${labelSql} AS label FROM checks WHERE place_id = $1 ORDER BY label`,
      [ids.place],
    )
    const labels = Object.fromEntries(res.rows.map((r) => [r.id, r.label]))
    expect(labels[CHECK_FELD]).toBe('2024: Kontrolle')
    expect(labels[CHECK_FREIW]).toBe('2024: Freiwilligen-Kontrolle')
    expect(labels[CHECK_NO_TYP]).toBe('2024: (kein Typ)')
  })

  it('a plain string filter would wrongly match both types (why views use $eq)', async () => {
    const { db, ids } = fixture
    // ilike %Kontrolle% matches Freiwilligen-Kontrolle as well
    const both = await db.query<{ id: string }>(
      viewChecksSql(ids.place, [{ 'data.typ': 'Kontrolle' }]),
    )
    expect(both.rows.map((r) => r.id).sort()).toEqual(
      [CHECK_FELD, CHECK_FREIW].sort(),
    )
  })

  it('the user filter narrows within the view', async () => {
    const { db, ids } = fixture
    const rows = await db.query<{ id: string }>(
      viewChecksSql(
        ids.place,
        [{ 'data.typ': { $eq: 'Kontrolle' } }],
        // one OR-group: conditions are AND-ed within the group
        [{ 'data.typ': { $eq: 'Kontrolle' }, date: '2024-01-02' }],
      ),
    )
    expect(rows.rows).toEqual([])
  })

  it('place_levels.filtered_views is read as a map of enabled views', async () => {
    const { db, ids } = fixture
    const res = await db.query<{
      filtered_view_id: string
      enabled: boolean
    }>(
      `SELECT fv.filtered_view_id,
        coalesce((pl.filtered_views ->> fv.filtered_view_id::text)::boolean, false) AS enabled
      FROM filtered_views fv
      CROSS JOIN place_levels pl
      WHERE fv.project_id = $1 AND pl.project_id = $1 AND pl.level = 2
      ORDER BY fv.sort`,
      [ids.project],
    )
    expect(res.rows).toEqual([
      { filtered_view_id: VIEW_FELD, enabled: true },
      { filtered_view_id: VIEW_FREIW, enabled: true },
    ])
  })

  it('new rows created through a view set the filtered-for values (data keys into jsonb, column keys onto the row)', async () => {
    const { db, ids } = fixture

    // the value extraction getDataFromFilteredView performs on the view filter
    const viewFilter = ((
      await db.query<{ filter: unknown }>(
        `SELECT filter FROM filtered_views WHERE filtered_view_id = $1`,
        [VIEW_FREIW],
      )
    ).rows[0]?.filter ?? []) as TableRowFilter[]
    const firstOrCondition = viewFilter[0] ?? {}
    const entry = Object.entries(firstOrCondition)[0]!
    const value =
      entry[1] !== null &&
      typeof entry[1] === 'object' &&
      '$eq' in (entry[1] as object)
        ? (entry[1] as { $eq: unknown }).$eq
        : entry[1]
    const data: Record<string, unknown> = {}
    const columns: Record<string, unknown> = {}
    for (const [key, wrappedValue] of Object.entries(firstOrCondition)) {
      const v =
        wrappedValue !== null &&
        typeof wrappedValue === 'object' &&
        '$eq' in wrappedValue
          ? (wrappedValue as { $eq: unknown }).$eq
          : wrappedValue
      if (v === null || v === undefined) continue
      if (key.startsWith('data.')) data[key.substring(5)] = v
      else columns[key] = v
    }
    expect(data).toEqual({ typ: 'Freiwilligen-Kontrolle' })
    expect(columns).toEqual({})
    expect(value).toBe('Freiwilligen-Kontrolle')

    // createCheck inserts data.* values into the jsonb column
    const newCheckId = '72000000-0000-7000-8000-000000000001'
    await db.query(
      `INSERT INTO checks (check_id, place_id, date, relevant_for_reports, data)
       VALUES ($1, $2, current_date, true, $3)`,
      [newCheckId, ids.place, JSON.stringify(data)],
    )
    const created = await db.query<{ data: { typ?: string } }>(
      `SELECT data FROM checks WHERE check_id = $1`,
      [newCheckId],
    )
    expect(created.rows[0]?.data?.typ).toBe('Freiwilligen-Kontrolle')

    // the new row shows up in the view's list
    const rows = await db.query<{ id: string }>(
      viewChecksSql(ids.place, viewFilter),
    )
    expect(rows.rows.map((r) => r.id).sort()).toEqual(
      [CHECK_FREIW, newCheckId].sort(),
    )
  })
})
