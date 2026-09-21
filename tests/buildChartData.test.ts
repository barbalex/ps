import { describe, expect, it } from 'vitest'

import { buildData } from '../src/formsAndLists/chart/Chart/buildData/index.ts'
import { createTestDb } from './helpers/createTestDb.ts'
import type Charts from '../src/models/public/Charts.ts'
import type ChartSubjects from '../src/models/public/ChartSubjects.ts'

/**
 * Builds chart data against a real in-memory Postgres loaded with the app's
 * schema, mirroring the three chart kinds of the apflora yearly report:
 * 1. (checked) places per year — count_rows on places and checks
 * 2. places per status — count_rows_by_distinct_field_values
 * 3. summed quantities per population — sum_values_of_field on check_taxa
 */

const thisYear = new Date().getFullYear()

const setup = async () => {
  const { db, ids } = await createTestDb()

  // own subproject so the helper's fixture places don't leak into the counts
  const subprojectId = '21000000-0000-7000-8000-000000000001'
  // one unit for quantities
  const unitId = '70000000-0000-7000-8000-000000000001'
  // two populations (level 1), each with two tpop-like children (level 2)
  const pop1 = '30000000-0000-7000-8000-000000001001'
  const pop2 = '30000000-0000-7000-8000-000000001002'
  const tpop1a = '30000000-0000-7000-8000-000000001011'
  const tpop1b = '30000000-0000-7000-8000-000000001012'
  const tpop2a = '30000000-0000-7000-8000-000000001021'

  await db.exec(`
    INSERT INTO units (unit_id, name) VALUES
      ('${unitId}', 'Triebe total');

    INSERT INTO subprojects (subproject_id, project_id, name) VALUES
      ('${subprojectId}', '${ids.project}', 'Chart Subproject');

    INSERT INTO places (place_id, subproject_id, parent_id, level, name, since, data) VALUES
      ('${pop1}', '${subprojectId}', NULL, 1, 'Pop One', 2010,
        '{"status":"angesiedelt, aktuell"}'),
      ('${pop2}', '${subprojectId}', NULL, 1, 'Pop Two', 2015,
        '{"status":"ursprünglich, erloschen"}'),
      ('${tpop1a}', '${subprojectId}', '${pop1}', 2, 'Pop One / a', 2010,
        '{"status":"angesiedelt, aktuell"}'),
      ('${tpop1b}', '${subprojectId}', '${pop1}', 2, 'Pop One / b', null,
        '{"status":"angersiedelt fake"}'),
      ('${tpop2a}', '${subprojectId}', '${pop2}', 2, 'Pop Two / a', 2015,
        '{"status":"ursprünglich, erloschen"}');

    -- grouping labels come from places.label
    UPDATE places SET label = name
    WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL;

    -- checks: tpop1a checked twice in ${thisYear - 1} (counts once),
    -- tpop1b once in ${thisYear - 1}, tpop2a once in ${thisYear}
    INSERT INTO checks (check_id, place_id, date) VALUES
      ('80000000-0000-7000-8000-0000000000a1', '${tpop1a}', '${thisYear - 1}-06-01'),
      ('80000000-0000-7000-8000-0000000000a2', '${tpop1a}', '${thisYear - 1}-09-01'),
      ('80000000-0000-7000-8000-0000000000b1', '${tpop1b}', '${thisYear - 1}-07-01'),
      ('80000000-0000-7000-8000-0000000000c1', '${tpop2a}', '${thisYear}-06-01');

    -- quantities in check_taxa: 100 in ${thisYear - 1} for pop1, 7 in ${thisYear} for pop2
    INSERT INTO check_taxa (check_taxon_id, check_id, unit_id, quantity_numeric) VALUES
      ('90000000-0000-7000-8000-0000000000a1', '80000000-0000-7000-8000-0000000000a1', '${unitId}', 40),
      ('90000000-0000-7000-8000-0000000000a2', '80000000-0000-7000-8000-0000000000a2', '${unitId}', 60),
      ('90000000-0000-7000-8000-0000000000c1', '80000000-0000-7000-8000-0000000000c1', '${unitId}', 7);

    INSERT INTO charts (chart_id, subproject_id, name) VALUES
      ('a1000000-0000-7000-8000-000000000001', '${subprojectId}', 'Test Chart');
  `)

  return { db, subprojectId, unitId, pop1, pop2, tpop1a }
}

const chartRow = {
  chart_id: 'a1000000-0000-7000-8000-000000000001',
} as unknown as Charts

const subject = (overrides: Partial<ChartSubjects>) =>
  ({
    chart_subject_id: 'b1000000-0000-7000-8000-000000000001',
    name: 'subject',
    ...overrides,
  }) as unknown as ChartSubjects

describe('buildData', () => {
  it('counts places per year by level', async () => {
    const { db, subprojectId } = await setup()
    // level 2: tpop1a since 2010, tpop1b since null (= always), tpop2a since 2015
    const { data, series } = await buildData({
      chart: chartRow,
      subjects: [subject({
        table_name: 'places',
        table_level: '2',
        calc_method: 'count_rows',
      })],
      subproject_id: subprojectId,
      db,
    })
    expect(series).toHaveLength(1)
    const row2014 = data.find((d) => d.year === 2014)
    const row2015 = data.find((d) => d.year === 2015)
    // 2014: tpop1a + tpop1b (no since) = 2; 2015: + tpop2a = 3
    expect(row2014?.[series[0]!.key]).toBe(2)
    expect(row2015?.[series[0]!.key]).toBe(3)
  })

  it('counts distinct checked places per year, not check rows', async () => {
    const { db, subprojectId } = await setup()
    const { data, series } = await buildData({
      chart: chartRow,
      subjects: [subject({
        table_name: 'checks',
        table_level: '2',
        calc_method: 'count_rows',
      })],
      subproject_id: subprojectId,
      db,
    })
    const rowPrev = data.find((d) => d.year === thisYear - 1)
    const rowThis = data.find((d) => d.year === thisYear)
    // tpop1a was checked twice but counts once: 2 distinct places last year
    expect(rowPrev?.[series[0]!.key]).toBe(2)
    expect(rowThis?.[series[0]!.key]).toBe(1)
  })

  it('splits place counts by data-field values with one series per value', async () => {
    const { db, subprojectId } = await setup()
    const { data, series } = await buildData({
      chart: chartRow,
      subjects: [subject({
        table_name: 'places',
        table_level: '1',
        calc_method: 'count_rows_by_distinct_field_values',
        field: 'status',
      })],
      subproject_id: subprojectId,
      db,
    })
    expect(series).toHaveLength(2)
    const labels = series.map((s) => s.label).sort()
    expect(labels).toEqual([
      'angesiedelt, aktuell',
      'ursprünglich, erloschen',
    ])
    const byLabel = Object.fromEntries(series.map((s) => [s.label, s]))
    const row2014 = data.find((d) => d.year === 2014)
    const row2015 = data.find((d) => d.year === 2015)
    expect(row2014?.[byLabel['angesiedelt, aktuell']!.key]).toBe(1)
    expect(row2014?.[byLabel['ursprünglich, erloschen']!.key]).toBeUndefined()
    expect(row2015?.[byLabel['ursprünglich, erloschen']!.key]).toBe(1)
  })

  it('sums quantity values per year and per population (level 1)', async () => {
    const { db, subprojectId, unitId } = await setup()
    const { data, series } = await buildData({
      chart: chartRow,
      subjects: [subject({
        table_name: 'check_taxa',
        table_level: '1',
        calc_method: 'sum_values_of_field',
        field: 'quantity_numeric',
        value_unit: unitId,
      })],
      subproject_id: subprojectId,
      db,
    })
    // one series per population that has quantities: Pop One (100), Pop Two (7)
    expect(series).toHaveLength(2)
    // largest total first (bottom of the stack)
    expect(series[0]!.label).toBe('Pop One')
    expect(series[1]!.label).toBe('Pop Two')
    const rowPrev = data.find((d) => d.year === thisYear - 1)
    const rowThis = data.find((d) => d.year === thisYear)
    expect(rowPrev?.[series[0]!.key]).toBe(100)
    expect(rowThis?.[series[0]!.key]).toBeUndefined()
    expect(rowThis?.[series[1]!.key]).toBe(7)
  })

  it('sums into a single series without a level', async () => {
    const { db, subprojectId, unitId } = await setup()
    const { data, series } = await buildData({
      chart: chartRow,
      subjects: [subject({
        table_name: 'check_taxa',
        calc_method: 'sum_values_of_field',
        field: 'quantity_numeric',
        value_unit: unitId,
      })],
      subproject_id: subprojectId,
      db,
    })
    expect(series).toHaveLength(1)
    const rowPrev = data.find((d) => d.year === thisYear - 1)
    const rowThis = data.find((d) => d.year === thisYear)
    expect(rowPrev?.[series[0]!.key]).toBe(100)
    expect(rowThis?.[series[0]!.key]).toBe(7)
  })

  it('respects chart year ranges', async () => {
    const { db, subprojectId } = await setup()
    const { data } = await buildData({
      chart: { ...chartRow, years_since: thisYear - 1 } as Charts,
      subjects: [subject({
        table_name: 'places',
        table_level: '1',
        calc_method: 'count_rows',
      })],
      subproject_id: subprojectId,
      db,
    })
    expect(data.map((d) => d.year)).toEqual([thisYear - 1, thisYear])
  })
})
