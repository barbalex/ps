import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

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

export const usePlaceNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}) => {
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
        places.place_id = '${placeId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined
  const row = res?.rows?.[0]
  const nameSingular = row?.name_singular ?? 'Place'
  const childNamePlural = row?.child_name_plural ?? 'Places'

  const navData = useMemo(() => {
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      ...(placeId ? ['places', placeId] : []),
      'places',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row?.id]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 2,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: row?.label,
      navs: [
        { id: 'place', label: nameSingular },
        ...(!placeId2 ?
          [
            {
              id: 'places',
              label: buildNavLabel({
                loading,
                isFiltered: placesIsFiltered,
                countFiltered: row?.places_count_filtered ?? 0,
                countUnfiltered: row?.places_count_unfiltered ?? 0,
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
            countFiltered: row?.checks_count_filtered ?? 0,
            countUnfiltered: row?.checks_count_unfiltered ?? 0,
            namePlural: 'Checks',
          }),
        },
        {
          id: 'actions',
          label: buildNavLabel({
            loading,
            isFiltered: actionsIsFiltered,
            countFiltered: row?.actions_count_filtered ?? 0,
            countUnfiltered: row?.actions_count_unfiltered ?? 0,
            namePlural: 'Actions',
          }),
        },
        {
          id: 'reports',
          label: buildNavLabel({
            loading,
            isFiltered: placeReportsIsFiltered,
            countFiltered: row?.place_reports_count_filtered ?? 0,
            countUnfiltered: row?.place_reports_count_unfiltered ?? 0,
            namePlural: 'Reports',
          }),
        },
        {
          id: 'occurrences',
          label: buildNavLabel({
            loading,
            countFiltered: row?.occurrences_count ?? 0,
            namePlural: 'Occurrences Assigned',
          }),
        },
        {
          id: 'users',
          label: buildNavLabel({
            loading,
            countFiltered: row?.place_users_count ?? 0,
            namePlural: 'Users',
          }),
        },
        {
          id: 'files',
          label: buildNavLabel({
            loading,
            isFiltered: filesIsFiltered,
            countFiltered: row?.files_count_filtered ?? 0,
            countUnfiltered: row?.files_count_unfiltered ?? 0,
            namePlural: 'Files',
          }),
        },
      ],
    }
  }, [
    projectId,
    subprojectId,
    placeId,
    row?.id,
    row?.label,
    row?.places_count_filtered,
    row?.places_count_unfiltered,
    row?.checks_count_filtered,
    row?.checks_count_unfiltered,
    row?.actions_count_filtered,
    row?.actions_count_unfiltered,
    row?.place_reports_count_filtered,
    row?.place_reports_count_unfiltered,
    row?.occurrences_count,
    row?.place_users_count,
    row?.files_count_filtered,
    row?.files_count_unfiltered,
    openNodes,
    nameSingular,
    placeId2,
    loading,
    placesIsFiltered,
    childNamePlural,
    checksIsFiltered,
    actionsIsFiltered,
    placeReportsIsFiltered,
    filesIsFiltered,
  ])

  return { navData, loading }
}
