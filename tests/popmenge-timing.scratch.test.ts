/** scratch: time buildData's versioned popMenge path with real data */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'

import { buildData } from '../src/formsAndLists/chart/Chart/buildData/index.ts'
import type Charts from '../src/models/public/Charts.ts'
import type ChartSubjects from '../src/models/public/ChartSubjects.ts'

const versions = JSON.parse(readFileSync('/tmp/ps_versions3.json', 'utf8'))
const zaehl = JSON.parse(readFileSync('/tmp/ps_zaehl3.json', 'utf8'))
const massn = JSON.parse(readFileSync('/tmp/ps_massn3.json', 'utf8'))

const dbStub = {
  query: async (sql: string) => {
    if (sql.includes('zielrelevant_einheit'))
      return { rows: [{ unit_id: 'b879f06d-9d08-77f9-8616-d139975855cd' }] }
    if (sql.includes('check_taxa')) return { rows: zaehl }
    if (sql.includes('zieleinheit_anzahl')) return { rows: massn }
    throw new Error(`unexpected query: ${sql.slice(0, 80)}`)
  },
}

describe('popMenge timing', () => {
  it('measures the versioned buildData', async () => {
    const start = performance.now()
    const { series, data } = await buildData({
      chart: { years_since: 2014, subjects_stacked: true } as unknown as Charts,
      subjects: [
        {
          chart_subject_id: 'b4000000-0000-4000-8000-000000000004',
          table_name: 'check_taxa',
          table_level: '1',
          calc_method: 'sum_values_of_field',
          field: 'quantity_numeric',
          value_unit: '935432b9-fc64-7118-8167-06f985ea181f',
        } as unknown as ChartSubjects,
      ],
      subproject_id: '017d3472-d75d-7a4f-8040-dfdd5df00bdb',
      db: dbStub as never,
      placesVersions: [...versions.places, ...versions.places_history],
      subprojectsVersions: [...versions.subprojects, ...versions.subprojects_history],
      reportYear: 2026,
    })
    const ms = Math.round(performance.now() - start)
    console.log(`buildData took ${ms}ms — series: ${series.length}, years: ${data.length}`)
    expect(series.length).toBeGreaterThan(0)
  })
})
