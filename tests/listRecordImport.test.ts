import { afterAll, beforeAll, expect, it } from 'vitest'
import {
  columnsFor,
  prepareRecords,
  readRecordSheet,
} from '../src/modules/listRecordImport.ts'
import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

it('preserves CSV identifiers and requires a decision for an unknown column', async () => {
  const sheet = await readRecordSheet(
    new File(['name,start_year,site_code\nZürich,2025,003'], 'sites.csv'),
  )
  const columns = columnsFor('subprojects')
  expect(
    prepareRecords(sheet, columns, ['name', 'start_year', '']).errors,
  ).not.toEqual([])
  expect(
    prepareRecords(sheet, columns, ['name', 'start_year', 'extra']),
  ).toEqual({
    rows: [{ name: 'Zürich', start_year: 2025, data: { site_code: '003' } }],
    errors: [],
  })
  expect(
    prepareRecords(sheet, columns, ['name', 'start_year', 'name']).errors,
  ).not.toEqual([])
  await expect(
    readRecordSheet(new File(['name,name\nA,B'], 'bad.csv')),
  ).rejects.toThrow('unique')
})

it('reports the source row and column of invalid dates and unavailable list values', () => {
  const prepared = prepareRecords(
    [['when', 'code'], [], ['2025-02-29', 'B']],
    [
      { name: 'when', type: 'date', custom: true },
      { name: 'code', type: 'text', custom: true, choices: ['A'] },
    ],
    ['data.when', 'data.code'],
  )
  expect(prepared.errors).toEqual([
    expect.stringContaining('#3 · when'),
    expect.stringContaining('#3 · code'),
  ])
})

let fixture: TestFixture
beforeAll(async () => {
  fixture = await createTestDb([
    '12_writePermissionTriggers.sql',
    '21_import_list_records.sql',
  ])
})
afterAll(async () => fixture?.db.close())
it('checks designer role and hierarchy, creates both levels, and rolls back an invalid batch', async () => {
  const { db, ids } = fixture
  const claim = (user_id: string) =>
    db.query("SELECT set_config('request.jwt.claims',$1,false)", [
      JSON.stringify({ role: 'app_user', user_id }),
    ])
  const insert = (
    rows: unknown[],
    sub: string | null,
    parent: string | null = null,
  ) =>
    db.query('SELECT import_list_records($1,$2,$3,$4) AS n', [
      ids.project,
      sub,
      parent,
      JSON.stringify(rows),
    ])
  await claim(ids.writer)
  await expect(insert([{ name: 'No' }], ids.subproject)).rejects.toMatchObject({
    code: '42501',
  })
  await claim(ids.designer)
  expect((await insert([{ name: 'New subproject' }], null)).rows).toMatchObject(
    [
      {
        n: [
          {
            name: 'New subproject',
            subproject_id: expect.any(String),
            project_id: ids.project,
          },
        ],
      },
    ],
  )
  await insert([{ name: 'Imported 1' }], ids.subproject)
  await insert(
    [{ name: 'Imported 2', data: { code: '001' } }],
    ids.subproject,
    ids.place,
  )
  expect(
    (
      await db.query(
        "SELECT level,parent_id,data FROM places WHERE name LIKE 'Imported%' ORDER BY level",
      )
    ).rows,
  ).toEqual([
    { level: 1, parent_id: null, data: null },
    { level: 2, parent_id: ids.place, data: { code: '001' } },
  ])
  await expect(insert([{ name: 'No' }], ids.place, ids.place)).rejects.toThrow(
    'Subproject',
  )
  await expect(
    insert([{ name: 'Never committed' }, { since: 'invalid' }], ids.subproject),
  ).rejects.toThrow()
  await expect(
    insert([{ place_id: ids.place }], ids.subproject),
  ).rejects.toThrow('unsupported column')
  expect(
    (await db.query("SELECT place_id FROM places WHERE name='Never committed'"))
      .rows,
  ).toEqual([])
})
