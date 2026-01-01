import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'

import {
  places1FilterAtom,
  checks1FilterAtom,
  checks2FilterAtom,
  actions1FilterAtom,
  actions2FilterAtom,
  placeReports1FilterAtom,
  placeReports2FilterAtom,
  filesFilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
}

type NavData = {
  id: string
  label: string | null
  name_singular: string | null
  child_name_plural: string | null
  places_count_unfiltered: number
  places_count_filtered: number
  checks_count_unfiltered: number
  checks_count_filtered: number
  actions_count_unfiltered: number
  actions_count_filtered: number
  place_reports_count_unfiltered: number
  place_reports_count_filtered: number
  occurrences_count: number
  place_users_count: number
  files_count_unfiltered: number
  files_count_filtered: number
}

export const usePlaceNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const [placesFilter] = useAtom(places1FilterAtom)
  const placesFilterString = filterStringFromFilter(placesFilter)
  const placesIsFiltered = !!placesFilterString

  const [checksFilter] = useAtom(
    placeId2 ? checks2FilterAtom : checks1FilterAtom,
  )
  const checksFilterString = filterStringFromFilter(checksFilter)
  const checksIsFiltered = !!checksFilterString

  const [actionsFilter] = useAtom(
    placeId2 ? actions2FilterAtom : actions1FilterAtom,
  )
  const actionsFilterString = filterStringFromFilter(actionsFilter)
  const actionsIsFiltered = !!actionsFilterString

  const [placeReportsFilter] = useAtom(
    placeId2 ? placeReports2FilterAtom : placeReports1FilterAtom,
  )
  const placeReportsFilterString = filterStringFromFilter(placeReportsFilter)
  const placeReportsIsFiltered = !!placeReportsFilterString

  const [filesFilter] = useAtom(filesFilterAtom)
  const filesFilterString = filterStringFromFilter(filesFilter)
  const filesIsFiltered = !!filesFilterString

  const sql = `
      WITH
        names AS (SELECT name_singular FROM place_levels WHERE project_id = '${projectId}' AND level = ${placeId2 ? 2 : 1}),
        child_names as (SELECT name_plural FROM place_levels WHERE project_id = '${projectId}' AND level = 2),
        places_count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        }),
        places_count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id ${
          placeId ? `= '${placeId}'` : `IS NULL`
        } ${placesIsFiltered ? ` AND ${placesFilterString}` : ''}),
        checks_count_unfiltered AS (SELECT count(*) FROM checks WHERE place_id = '${placeId2 ?? placeId}'),
        checks_count_filtered AS (SELECT count(*) FROM checks WHERE place_id = '${placeId2 ?? placeId}' ${checksIsFiltered ? ` AND ${checksFilterString}` : ''}),
        actions_count_unfiltered AS (SELECT count(*) FROM actions WHERE place_id = '${placeId2 ?? placeId}'),
        actions_count_filtered AS (SELECT count(*) FROM actions WHERE place_id = '${placeId2 ?? placeId}' ${actionsIsFiltered ? ` AND ${actionsFilterString}` : ''}),
        place_reports_count_unfiltered AS (SELECT count(*) FROM place_reports WHERE place_id = '${placeId2 ?? placeId}'),
        place_reports_count_filtered AS (SELECT count(*) FROM place_reports WHERE place_id = '${placeId2 ?? placeId}' ${placeReportsIsFiltered ? ` AND ${placeReportsFilterString}` : ''}),
        occurrences_count AS (SELECT count(*) FROM occurrences WHERE place_id = '${placeId2 ?? placeId}'),
        place_users_count AS (SELECT count(*) FROM place_users WHERE place_id = '${placeId2 ?? placeId}'),
        files_count_unfiltered AS (SELECT count(*) FROM files WHERE place_id = '${placeId2 ?? placeId}'),
        files_count_filtered AS (SELECT count(*) FROM files WHERE place_id = '${placeId2 ?? placeId}' ${filesIsFiltered ? ` AND ${filesFilterString}` : ''})
      SELECT
        place_id AS id,
        label,
        names.name_singular AS name_singular,
        child_names.name_plural AS child_name_plural,
        places_count_unfiltered.count AS places_count_unfiltered,
        places_count_filtered.count AS places_count_filtered,
        checks_count_unfiltered.count AS checks_count_unfiltered,
        checks_count_filtered.count AS checks_count_filtered,
        actions_count_unfiltered.count AS actions_count_unfiltered,
        actions_count_filtered.count AS actions_count_filtered,
        place_reports_count_unfiltered.count AS place_reports_count_unfiltered,
        place_reports_count_filtered.count AS place_reports_count_filtered,
        occurrences_count.count AS occurrences_count,
        place_users_count.count AS place_users_count,
        files_count_unfiltered.count AS files_count_unfiltered,
        files_count_filtered.count AS files_count_filtered
      FROM 
        places,
        names,
        child_names,
        places_count_unfiltered,
        places_count_filtered,
        checks_count_unfiltered,
        checks_count_filtered,
        actions_count_unfiltered,
        actions_count_filtered,
        place_reports_count_unfiltered,
        place_reports_count_filtered,
        occurrences_count,
        place_users_count,
        files_count_unfiltered,
        files_count_filtered
      WHERE 
        places.place_id = '${placeId2 ?? placeId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const nameSingular = nav?.name_singular ?? 'Place'
  const childNamePlural = nav?.child_name_plural ?? 'Places'

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    ...(placeId && placeId2 ? ['places', placeId] : []),
    'places',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 2,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    nameSingular,
    navs: [
      { id: 'place', label: nameSingular },
      ...(!placeId2
        ? [
            {
              id: 'places',
              label: buildNavLabel({
                loading,
                isFiltered: placesIsFiltered,
                countFiltered: nav?.places_count_filtered ?? 0,
                countUnfiltered: nav?.places_count_unfiltered ?? 0,
                namePlural: childNamePlural,
              }),
            },
          ]
        : []),
      {
        id: 'checks',
        label: buildNavLabel({
          loading,
          isFiltered: checksIsFiltered,
          countFiltered: nav?.checks_count_filtered ?? 0,
          countUnfiltered: nav?.checks_count_unfiltered ?? 0,
          namePlural: 'Checks',
        }),
      },
      {
        id: 'actions',
        label: buildNavLabel({
          loading,
          isFiltered: actionsIsFiltered,
          countFiltered: nav?.actions_count_filtered ?? 0,
          countUnfiltered: nav?.actions_count_unfiltered ?? 0,
          namePlural: 'Actions',
        }),
      },
      {
        id: 'reports',
        label: buildNavLabel({
          loading,
          isFiltered: placeReportsIsFiltered,
          countFiltered: nav?.place_reports_count_filtered ?? 0,
          countUnfiltered: nav?.place_reports_count_unfiltered ?? 0,
          namePlural: 'Reports',
        }),
      },
      {
        id: 'occurrences',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.occurrences_count ?? 0,
          namePlural: 'Occurrences Assigned',
        }),
      },
      {
        id: 'users',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.place_users_count ?? 0,
          namePlural: 'Users',
        }),
      },
      {
        id: 'files',
        label: buildNavLabel({
          loading,
          isFiltered: filesIsFiltered,
          countFiltered: nav?.files_count_filtered ?? 0,
          countUnfiltered: nav?.files_count_unfiltered ?? 0,
          namePlural: 'Files',
        }),
      },
    ],
  }

  return { navData, loading }
}
