import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { PostgrestClient } from '@supabase/postgrest-js'

import { onlineAtom } from '../../store.ts'
import { constants } from '../../modules/constants.ts'

/**
 * Reports for past years need the state of undated rows (subprojects,
 * places) as it was at the end of the report year. That state lives in the
 * server-side history tables (temporal_tables sys_period versioning) and is
 * not synced to the client — reports query it directly from PostgREST
 * (online only). react-query caches the versions per subproject: history is
 * immutable, so repeatedly opened reports are served from the cache.
 *
 * Historizations are dated inside the year they describe (Dec 31), so a
 * report for year Y uses the version whose sys_period contains the end of
 * that year.
 */

export type VersionedRow = { sys_period: string } & Record<string, unknown>

export type ReportVersions = {
  subprojects: VersionedRow[]
  places: VersionedRow[]
}

const PLACE_COLUMNS =
  'place_id,parent_id,subproject_id,level,name,since,until,relevant_for_reports,data,sys_period'
const SUBPROJECT_COLUMNS =
  'subproject_id,project_id,name,start_year,end_year,data,sys_period'

/** parses a Postgres timestamp like 2026-09-22 09:02:14.05421+00 */
const parseTimestamp = (value: string): number => {
  const iso = value
    .trim()
    .replace(' ', 'T')
    .replace(/([+-]\d{2})$/, '$1:00')
  // without an offset, Postgres gave us UTC
  const withZone = /[Z]|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`
  return new Date(withZone).getTime()
}

/** parses a Postgres range literal like ["2021-12-31 12:00:00+00",) */
export const parseSysPeriod = (period: string): { lower: number | null; upper: number | null } => {
  const inner = period.replace(/^[[({]/, '').replace(/[)\]}]$/, '')
  const parts = inner.split(',').map((part) => part.trim().replace(/^"|"$/g, ''))
  return {
    lower: parts[0] ? parseTimestamp(parts[0]) : null,
    upper: parts.length > 1 && parts[1] ? parseTimestamp(parts[1]) : null,
  }
}

/** the end of the report year — the instant a version must be valid at */
const yearEnd = (year: number) => new Date(Date.UTC(year, 11, 31, 12)).getTime()

/** whether this row version was the current one at the end of the year */
export const isValidAtYear = (row: VersionedRow, year: number): boolean => {
  const t = yearEnd(year)
  const { lower, upper } = parseSysPeriod(row.sys_period)
  return lower != null && lower <= t && (upper == null || upper > t)
}

/**
 * Of every row (live and historized versions mixed) keeps the version valid
 * at the end of the year, keyed by the row's id column. Rows without any
 * valid version (not yet existing / already deleted back then) drop out.
 */
export const asOfYear = <T extends VersionedRow>(
  rows: T[],
  year: number,
  idKey: keyof T,
): T[] => {
  const byId = new Map<string, T>()
  for (const row of rows) {
    if (!isValidAtYear(row, year)) continue
    byId.set(String(row[idKey]), row)
  }
  return [...byId.values()]
}

/**
 * apf2 pop_status_werte code for a status text
 * (100 ursprünglich aktuell, 101 ursprünglich erloschen, 200 angesiedelt
 * aktuell, 201 Ansaatversuch, 202 angesiedelt erloschen, 300 potentiell)
 */
export const statusCode = (status: string | null | undefined): number | null => {
  const s = (status ?? '').toLowerCase()
  if (s.startsWith('potentieller')) return 300
  if (s.includes('ansaatversuch')) return 201
  const urspruenglich = s.startsWith('ursprünglich')
  const erloschen = s.includes('erloschen')
  const aktuell = s.includes('aktuell')
  if (urspruenglich && aktuell) return 100
  if (urspruenglich && erloschen) return 101
  if (aktuell) return 200
  if (erloschen) return 202
  return null
}

export const useReportVersions = (subprojectId: string | undefined) => {
  const online = useAtomValue(onlineAtom)
  return useQuery({
    queryKey: ['reportVersions', subprojectId],
    queryFn: async ({ signal }) => {
      // dynamic: the module reads window at import time, which would break
      // the vitest (node) graph buildData is tested in
      const { fetchPostgrestToken } = await import(
        '../../modules/fetchPostgrestToken.ts'
      )
      const token = await fetchPostgrestToken()
      const client = new PostgrestClient(constants.getPostgrestUri(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const select = async (table: string, columns: string) => {
        const { data, error } = await client
          .from(table)
          .select(columns)
          .eq('subproject_id', subprojectId)
          .abortSignal(signal)
        if (error) throw new Error(`${table}: ${error.message}`)
        return data ?? []
      }
      const [subprojects, subprojectsHistory, places, placesHistory] =
        await Promise.all([
          select('subprojects', SUBPROJECT_COLUMNS),
          select('subprojects_history', SUBPROJECT_COLUMNS),
          select('places', PLACE_COLUMNS),
          select('places_history', PLACE_COLUMNS),
        ])
      return {
        subprojects: [...subprojects, ...subprojectsHistory],
        places: [...places, ...placesHistory],
      } as unknown as ReportVersions
    },
    enabled: online && !!subprojectId,
    // historized versions never change — cache them for the whole session
    staleTime: Infinity,
  })
}
