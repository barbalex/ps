import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import { filterStringFromFilter } from '../src/modules/filterStringFromFilter.ts'
import type { TableRowFilter } from '../src/store.ts'

/**
 * Tests the column side of table views: field groups.
 * - a view without a row filter shows all rows (filter is optional)
 * - a view with a field group resolves the group's field_ids (the join
 *   check/WithAll runs)
 * - the form renderer shows exactly the group's fields, in form order
 * - the filtered_views -> table_views healing renames old databases
 */

let fixture: TestFixture

beforeAll(async () => {
  fixture = await createTestDb()
})

afterAll(async () => {
  await fixture?.db.close()
})

const VIEW_NO_FILTER = '74000000-0000-7000-8000-000000000001'
const VIEW_WITH_GROUP = '74000000-0000-7000-8000-000000000002'
const GROUP = '75000000-0000-7000-8000-000000000001'

const FIELD_TYR = '76000000-0000-7000-8000-000000000001'
const FIELD_TYP = '76000000-0000-7000-8000-000000000002'
const FIELD_LR_DELARZE = '76000000-0000-7000-8000-000000000003'
const FIELD_KRAUTSCHICHT = '76000000-0000-7000-8000-000000000004'

/** the SQL useTableChecksNavData builds for a view's checks list */
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
    ORDER BY check_id
  `
}

describe('table views with field groups', () => {
  beforeAll(async () => {
    const { db, ids } = fixture

    // check fields: one outside the group (tyr, typ), three inside
    await db.exec(`
      INSERT INTO fields(field_id, project_id, table_name, name, field_label) VALUES
        ('${FIELD_TYR}', '${ids.project}', 'checks', 'tyr', 'Tabellen-Y'),
        ('${FIELD_TYP}', '${ids.project}', 'checks', 'typ', 'Typ'),
        ('${FIELD_LR_DELARZE}', '${ids.project}', 'checks', 'lr_delarze', 'Lebensraum (Delarze)'),
        ('${FIELD_KRAUTSCHICHT}', '${ids.project}', 'checks', 'krautschicht', 'Krautschicht');
      INSERT INTO field_sorts(project_id, table_name, sorted_field_ids) VALUES
        ('${ids.project}', 'checks', ARRAY['${FIELD_TYP}', '${FIELD_TYR}', '${FIELD_LR_DELARZE}', '${FIELD_KRAUTSCHICHT}']::uuid[]);
    `)

    // field group "Biotop": the biotope fields, stored in form order
    await db.exec(`
      INSERT INTO field_groups(field_group_id, project_id, table_name, name, sorted_field_ids) VALUES
        ('${GROUP}', '${ids.project}', 'checks', 'Biotop', '${JSON.stringify([FIELD_LR_DELARZE, FIELD_KRAUTSCHICHT])}'::jsonb);
    `)

    await db.exec(`
      INSERT INTO table_views(table_view_id, project_id, table_name, name_singular_de, name_plural_de, filter, field_group_id, sort) VALUES
        ('${VIEW_NO_FILTER}', '${ids.project}', 'checks', 'Kontrolle', 'Kontrollen', NULL, NULL, 3),
        ('${VIEW_WITH_GROUP}', '${ids.project}', 'checks', 'Biotop-Kontrolle', 'Biotop-Kontrollen', NULL, '${GROUP}', 4);
    `)

    await db.exec(`
      INSERT INTO checks(check_id, place_id, date, data) VALUES
        ('77000000-0000-7000-8000-000000000001', '${ids.place}', '2024-01-01', '{"typ":"Kontrolle"}'::jsonb),
        ('77000000-0000-7000-8000-000000000002', '${ids.place}', '2024-01-02', '{"typ":"Freiwilligen-Kontrolle"}'::jsonb);
    `)
  })

  it('a view without a row filter shows all rows', async () => {
    const { db, ids } = fixture
    const res = await db.query<{ id: string }>(
      viewChecksSql(ids.place, ((
        await db.query<{ filter: unknown }>(
          `SELECT filter FROM table_views WHERE table_view_id = $1`,
          [VIEW_NO_FILTER],
        )
      ).rows[0]?.filter ?? []) as TableRowFilter[]),
    )
    expect(res.rows.length).toBe(2)
  })

  it('a view with a field group resolves the group (the join check/WithAll runs)', async () => {
    const { db } = fixture
    const res = await db.query<{ sorted_field_ids: string[] | null }>(
      `SELECT fg.sorted_field_ids
       FROM table_views tv
       LEFT JOIN field_groups fg ON fg.field_group_id = tv.field_group_id
       WHERE tv.table_view_id = $1`,
      [VIEW_WITH_GROUP],
    )
    expect(res.rows[0]?.sorted_field_ids).toEqual([
      FIELD_LR_DELARZE,
      FIELD_KRAUTSCHICHT,
    ])
  })

  it('the form renderer shows exactly the group’s fields, in form order', async () => {
    const { db, ids } = fixture
    // the query the Jsonb form renderer runs (fields in field_sorts order)
    const res = await db.query<{ field_id: string; name: string }>(
      `SELECT fields.field_id, fields.name
       FROM fields
       LEFT JOIN unnest(
           ARRAY(SELECT sorted_field_ids FROM field_sorts WHERE table_name = fields.table_name and project_id = fields.project_id)
         ) WITH ORDINALITY t(field_id, ord) USING (field_id)
       WHERE fields.table_name = 'checks'
         and fields.project_id = $1
       ORDER BY t.ord`,
      [ids.project],
    )
    const fieldIds = [FIELD_LR_DELARZE, FIELD_KRAUTSCHICHT]
    // the filtering Jsonb applies when a view restricts the fields
    const shown = res.rows.filter((f) => fieldIds.includes(f.field_id))
    expect(shown.map((f) => f.name)).toEqual(['lr_delarze', 'krautschicht'])
  })

  it('deleting a field group nulls the referencing view (ON DELETE SET NULL)', async () => {
    const { db } = fixture
    await db.query(`DELETE FROM field_groups WHERE field_group_id = $1`, [
      GROUP,
    ])
    const res = await db.query<{ field_group_id: string | null }>(
      `SELECT field_group_id FROM table_views WHERE table_view_id = $1`,
      [VIEW_WITH_GROUP],
    )
    expect(res.rows[0]?.field_group_id).toBeNull()
  })
})

describe('single-row views on subprojects', () => {
  it('the view page resolves the field group and is bound to its table', async () => {
    const { db, ids } = fixture

    // fields of the subprojects table
    await db.exec(`
      INSERT INTO fields(field_id, project_id, table_name, name, field_label) VALUES
        ('7a000000-0000-7000-8000-000000000001', '${ids.project}', 'subprojects', 'bearbeitung', 'Bearbeitung'),
        ('7a000000-0000-7000-8000-000000000002', '${ids.project}', 'subprojects', 'idealbiotop_boden', 'Idealbiotop: Boden');
      INSERT INTO field_groups(field_group_id, project_id, table_name, name, sorted_field_ids) VALUES
        ('7b000000-0000-7000-8000-000000000001', '${ids.project}', 'subprojects', 'Idealbiotop', '${JSON.stringify(['7a000000-0000-7000-8000-000000000002'])}'::jsonb);
      INSERT INTO table_views(table_view_id, project_id, table_name, name_singular_de, name_plural_de, filter, field_group_id, sort) VALUES
        ('7c000000-0000-7000-8000-000000000001', '${ids.project}', 'subprojects', 'Idealbiotop', 'Idealbiotop', NULL, '7b000000-0000-7000-8000-000000000001', 1);
      UPDATE subprojects SET data = '{"bearbeitung":"kein AP","idealbiotop_boden":"kalkreich"}'::jsonb WHERE subproject_id = '${ids.subproject}';
    `)

    // the query the subproject view page runs (SubprojectTableView)
    const res = await db.query<{
      sorted_field_ids: string[] | null
    }>(
      `SELECT fg.sorted_field_ids
       FROM table_views tv
       LEFT JOIN field_groups fg ON fg.field_group_id = tv.field_group_id
       WHERE tv.table_view_id = $1 AND tv.table_name = 'subprojects'`,
      ['7c000000-0000-7000-8000-000000000001'],
    )
    expect(res.rows[0]?.sorted_field_ids).toEqual([
      '7a000000-0000-7000-8000-000000000002',
    ])

    // the restricted form shows only the group's field of the row's data
    const dataRes = await db.query<{ data: Record<string, unknown> }>(
      `SELECT data FROM subprojects WHERE subproject_id = $1`,
      [ids.subproject],
    )
    const data = dataRes.rows[0]?.data ?? {}
    const shown = Object.keys(data).filter((key) =>
      (res.rows[0]?.sorted_field_ids ?? []).some(
        (fieldId) => fieldId === '7a000000-0000-7000-8000-000000000002',
      ) && key === 'idealbiotop_boden',
    )
    expect(shown).toEqual(['idealbiotop_boden'])

    // a view of another table never belongs under a subproject
    const wrongTable = await db.query<{ sorted_field_ids: string[] | null }>(
      `SELECT fg.sorted_field_ids
       FROM table_views tv
       LEFT JOIN field_groups fg ON fg.field_group_id = tv.field_group_id
       WHERE tv.table_view_id = $1 AND tv.table_name = 'subprojects'`,
      [VIEW_WITH_GROUP],
    )
    expect(wrongTable.rows.length).toBe(0)
  })
})

describe('healing: filtered_views -> table_views', () => {
  it('renames an old database and preserves data', async () => {
    const { db, ids } = fixture

    // simulate a database from before the rename
    await db.exec(`
      DROP TABLE table_views;
      ALTER TABLE place_levels DROP COLUMN IF EXISTS table_views;
      CREATE TABLE filtered_views(
        filtered_view_id uuid PRIMARY KEY,
        project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED,
        table_name text DEFAULT NULL,
        name_plural_de text DEFAULT NULL,
        filter jsonb DEFAULT NULL,
        sort integer DEFAULT 0,
        label text GENERATED ALWAYS AS (coalesce(nullif(name_plural_de, ''), filtered_view_id::text)) STORED,
        sys_period tstzrange DEFAULT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by text DEFAULT NULL
      );
      ALTER TABLE place_levels ADD COLUMN filtered_views jsonb DEFAULT NULL;
      INSERT INTO place_levels(place_level_id, project_id, level, name_plural_de, filtered_views)
        SELECT '79000000-0000-7000-8000-000000000001', '${ids.project}', 2, 'Teil-Population', '{"78000000-0000-7000-8000-000000000001":true}'::jsonb
        WHERE NOT EXISTS (SELECT 1 FROM place_levels WHERE project_id = '${ids.project}');
      INSERT INTO filtered_views(filtered_view_id, project_id, table_name, name_plural_de, filter) VALUES
        ('78000000-0000-7000-8000-000000000001', '${ids.project}', 'checks', 'Alte Ansicht', '[{"data.typ":{"$eq":"Kontrolle"}}]'::jsonb);
      UPDATE place_levels SET filtered_views = '{"78000000-0000-7000-8000-000000000001":true}'::jsonb WHERE project_id = '${ids.project}';
    `)

    // the healing SqlInitializer runs on existing databases
    const healSql = readFileSync(
      new URL('../src/sql/healFilteredViewsRename.sql', import.meta.url),
      'utf8',
    )
    await db.exec(healSql)

    // table and column are renamed, data preserved
    const views = await db.query<{
      table_view_id: string
      name_plural_de: string
      filter: unknown
      field_group_id: string | null
    }>(
      `SELECT table_view_id, name_plural_de, filter, field_group_id FROM table_views WHERE project_id = $1`,
      [ids.project],
    )
    expect(views.rows.length).toBe(1)
    expect(views.rows[0]?.table_view_id).toBe(
      '78000000-0000-7000-8000-000000000001',
    )
    expect(views.rows[0]?.name_plural_de).toBe('Alte Ansicht')
    expect(views.rows[0]?.filter).toEqual([
      { 'data.typ': { $eq: 'Kontrolle' } },
    ])
    // the new column exists (added by the healing)
    expect(views.rows[0]?.field_group_id).toBeNull()

    // the generated label follows the renamed id column
    const label = await db.query<{ label: string }>(
      `SELECT label FROM table_views WHERE project_id = $1`,
      [ids.project],
    )
    expect(label.rows[0]?.label).toBe('Alte Ansicht')

    // place_levels.column is renamed, map preserved
    const placeLevel = await db.query<{ table_views: Record<string, boolean> }>(
      `SELECT table_views FROM place_levels WHERE project_id = $1`,
      [ids.project],
    )
    expect(placeLevel.rows[0]?.table_views).toEqual({
      '78000000-0000-7000-8000-000000000001': true,
    })

    // old names are gone
    const oldTable = await db.query<{ exists: boolean }>(
      `SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'filtered_views') AS exists`,
    )
    expect(oldTable.rows[0]?.exists).toBe(false)

    // idempotent: running the healing again changes nothing
    await db.exec(healSql)
    const stillThere = await db.query<{ count: number }>(
      `SELECT count(*) AS count FROM table_views WHERE project_id = $1`,
      [ids.project],
    )
    expect(Number(stillThere.rows[0]?.count)).toBe(1)
  })
})
