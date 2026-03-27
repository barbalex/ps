import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import {
  places1FilterAtom,
  subprojectReportsFilterAtom,
  goalsFilterAtom,
  filesFilterAtom,
  treeOpenNodesAtom,
  languageAtom,
  designingAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { subprojectNameSingularExpr } from './subprojectNameCols.ts'
import { getPlaceFallbackNames } from './placeNameFallback.ts'

type Props = {
  projectId: string
  subprojectId: string
}

type NavData = {
  id: string
  label: string | null
  name_singular?: string | null
  places_count_filtered?: number | null
  places_count_unfiltered?: number | null
  place_name_plural?: string | null
  subproject_reports?: boolean | null
  subproject_reports_count_filtered?: number | null
  subproject_reports_count_unfiltered?: number | null
  subproject_histories_count?: number | null
  goals?: boolean | null
  goals_count_filtered?: number | null
  goals_count_unfiltered?: number | null
  occurrences?: boolean | null
  observation_imports_count?: number | null
  observations_to_assess_count?: number | null
  observations_not_to_assign_count?: number | null
  taxa?: boolean | null
  subproject_taxa_count?: number | null
  subproject_users_count?: number | null
  files_count_filtered?: number | null
  files_count_unfiltered?: number | null
  files_active_subprojects?: boolean | null
  subproject_files_in_subproject?: boolean | null
  charts?: boolean | null
  charts_count?: number | null
}

export const useSubprojectNavData = ({ projectId, subprojectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { formatMessage } = useIntl()
  const [designing] = useAtom(designingAtom)
  const [placesFilter] = useAtom(places1FilterAtom)
  const [language] = useAtom(languageAtom)

  const placesFilterString = filterStringFromFilter(placesFilter)
  const placesIsFiltered = !!placesFilterString

  const [subprojectReportsFilter] = useAtom(subprojectReportsFilterAtom)
  const subprojectReportsFilterString = filterStringFromFilter(
    subprojectReportsFilter,
  )
  const subprojectReportsIsFiltered = !!subprojectReportsFilterString

  const [goalsFilter] = useAtom(goalsFilterAtom)
  const goalsFilterString = filterStringFromFilter(goalsFilter)
  const goalsIsFiltered = !!goalsFilterString

  const [filesFilter] = useAtom(filesFilterAtom)
  const filesFilterString = filterStringFromFilter(filesFilter)
  const filesIsFiltered = !!filesFilterString

  const sql = `
      WITH 
        places_count_unfiltered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL),
        places_count_filtered AS (SELECT count(*) FROM places WHERE subproject_id = '${subprojectId}' AND parent_id IS NULL ${placesIsFiltered ? ` AND ${placesFilterString}` : ''} ),
        place_name_plural AS (SELECT name_plural_${language} FROM place_levels WHERE project_id = '${projectId}' AND level = 1),
        subproject_reports_count_unfiltered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}'),
        subproject_reports_count_filtered AS (SELECT count(*) FROM subproject_reports WHERE subproject_id = '${subprojectId}' ${subprojectReportsIsFiltered ? ` AND ${subprojectReportsFilterString}` : ''}),
        subproject_histories_count AS (SELECT count(*) FROM subproject_histories WHERE subproject_id = '${subprojectId}'),
        goals_count_unfiltered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}'),
        goals_count_filtered AS (SELECT count(*) FROM goals WHERE subproject_id = '${subprojectId}' ${goalsIsFiltered ? ` AND ${goalsFilterString}` : ''}),
        observation_imports_count AS (SELECT count(*) FROM observation_imports WHERE subproject_id = '${subprojectId}'),
        observations_to_assess_count AS (SELECT count(*) FROM observations o INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id WHERE oi.subproject_id = '${subprojectId}' AND o.not_to_assign IS NOT TRUE AND o.place_id IS NULL),
        observations_not_to_assign_count AS (SELECT count(*) FROM observations o INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id WHERE oi.subproject_id = '${subprojectId}' AND o.not_to_assign IS TRUE AND o.place_id IS NULL),
        subproject_taxa_count AS (SELECT count(*) FROM subproject_taxa WHERE subproject_id = '${subprojectId}'),
        subproject_users_count AS (SELECT count(*) FROM subproject_users WHERE subproject_id = '${subprojectId}'),
        files_count_unfiltered AS (SELECT count(*) FROM files WHERE subproject_id = '${subprojectId}'),
        files_count_filtered AS (SELECT count(*) FROM files WHERE subproject_id = '${subprojectId}' ${filesIsFiltered ? ` AND ${filesFilterString}` : ''}),
        charts_count AS (SELECT count(*) FROM charts WHERE subproject_id = '${subprojectId}')
      SELECT
        sp.subproject_id AS id,
        sp.label, 
        ${subprojectNameSingularExpr(language, 'p')} AS name_singular,
        p.subproject_reports AS subproject_reports,
        p.goals AS goals,
        p.occurrences AS occurrences,
        p.taxa AS taxa,
        p.charts AS charts,
        p.files_active_subprojects AS files_active_subprojects,
        p.subproject_files_in_subproject AS subproject_files_in_subproject,
        places_count_unfiltered.count AS places_count_unfiltered,
        places_count_filtered.count AS places_count_filtered,
        place_name_plural.name_plural_${language} AS place_name_plural,
        subproject_reports_count_unfiltered.count AS subproject_reports_count_unfiltered,
        subproject_reports_count_filtered.count AS subproject_reports_count_filtered,
        subproject_histories_count.count AS subproject_histories_count,
        goals_count_unfiltered.count AS goals_count_unfiltered,
        goals_count_filtered.count AS goals_count_filtered,
        observation_imports_count.count AS observation_imports_count,
        observations_to_assess_count.count AS observations_to_assess_count,
        observations_not_to_assign_count.count AS observations_not_to_assign_count,
        subproject_taxa_count.count AS subproject_taxa_count,
        subproject_users_count.count AS subproject_users_count,
        files_count_unfiltered.count AS files_count_unfiltered,
        files_count_filtered.count AS files_count_filtered,
        charts_count.count AS charts_count
      FROM 
        subprojects sp
        INNER JOIN projects p ON p.project_id = sp.project_id, 
        places_count_unfiltered, 
        places_count_filtered,
        place_name_plural,
        subproject_reports_count_unfiltered,
        subproject_reports_count_filtered,
        subproject_histories_count,
        goals_count_unfiltered,
        goals_count_filtered,
        observation_imports_count,
        observations_to_assess_count,
        observations_not_to_assign_count,
        subproject_taxa_count,
        subproject_users_count,
        files_count_unfiltered,
        files_count_filtered,
        charts_count
      WHERE sp.subproject_id = '${subprojectId}'`

  const res = useLiveQuery(sql)
  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const projectTypeRes = useLiveQuery(
    `SELECT type FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const projectType = projectTypeRes?.rows?.[0]?.type

  const subprojectNameSingular =
    nav?.name_singular ??
    formatMessage({ id: 'gxCh0c', defaultMessage: 'Teilprojekt' })

  const parentArray = ['data', 'projects', projectId, 'subprojects']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !loading && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

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
    navs: [
      { id: 'subproject', label: subprojectNameSingular },
      {
        id: 'places',
        label: buildNavLabel({
          loading,
          isFiltered: placesIsFiltered,
          countFiltered: nav?.places_count_filtered ?? 0,
          countUnfiltered: nav?.places_count_unfiltered ?? 0,
          namePlural:
            nav?.place_name_plural ??
            getPlaceFallbackNames(projectType, 1, formatMessage).plural,
        }),
      },
      ...(designing || (nav?.subproject_reports ?? true)
        ? [
            {
              id: 'reports',
              label: buildNavLabel({
                loading,
                isFiltered: subprojectReportsIsFiltered,
                countFiltered: nav?.subproject_reports_count_filtered ?? 0,
                countUnfiltered: nav?.subproject_reports_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'CiJ0SG',
                  defaultMessage: 'Berichte',
                }),
              }),
            },
          ]
        : []),
      {
        id: 'histories',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.subproject_histories_count ?? 0,
          namePlural: formatMessage({
            id: 'KkLxJl',
            defaultMessage: 'Geschichte',
          }),
        }),
      },
      ...(designing || (nav?.goals ?? true)
        ? [
            {
              id: 'goals',
              label: buildNavLabel({
                loading,
                isFiltered: goalsIsFiltered,
                countFiltered: nav?.goals_count_filtered ?? 0,
                countUnfiltered: nav?.goals_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: '3srcwg',
                  defaultMessage: 'Ziele',
                }),
              }),
            },
          ]
        : []),
      ...(designing || (nav?.occurrences ?? true)
        ? [
            {
              id: 'observation-imports',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.observation_imports_count ?? 0,
                namePlural: formatMessage({
                  id: 'C7apNr',
                  defaultMessage: 'Beobachtungs-Importe',
                }),
              }),
            },
            {
              id: 'observations-to-assess',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.observations_to_assess_count ?? 0,
                namePlural: formatMessage({
                  id: 'BEylmv',
                  defaultMessage: 'Beobachtungen zu beurteilen',
                }),
              }),
            },
            {
              id: 'observations-not-to-assign',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.observations_not_to_assign_count ?? 0,
                namePlural: formatMessage({
                  id: 'slC/ul',
                  defaultMessage: 'Beobachtungen nicht zuzuordnen',
                }),
              }),
            },
          ]
        : []),
      ...(designing || (nav?.taxa ?? true)
        ? [
            {
              id: 'taxa',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.subproject_taxa_count ?? 0,
                namePlural: formatMessage({
                  id: '7sVbg1',
                  defaultMessage: 'Taxa',
                }),
              }),
            },
          ]
        : []),
      ...(designing
        ? [
            {
              id: 'users',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.subproject_users_count ?? 0,
                namePlural: formatMessage({
                  id: 'eZ3yEB',
                  defaultMessage: 'Benutzer',
                }),
              }),
            },
          ]
        : []),
      ...((designing || (nav?.files_active_subprojects ?? true)) &&
      nav?.subproject_files_in_subproject === false
        ? [
            {
              id: 'files',
              label: buildNavLabel({
                loading,
                isFiltered: filesIsFiltered,
                countFiltered: nav?.files_count_filtered ?? 0,
                countUnfiltered: nav?.files_count_unfiltered ?? 0,
                namePlural: formatMessage({
                  id: 'mn58Sh',
                  defaultMessage: 'Dateien',
                }),
              }),
            },
          ]
        : []),
      ...(designing || (nav?.charts ?? true)
        ? [
            {
              id: 'charts',
              label: buildNavLabel({
                loading,
                countFiltered: nav?.charts_count ?? 0,
                namePlural: formatMessage({
                  id: 'ZPEO8P',
                  defaultMessage: 'Diagramme',
                }),
              }),
            },
          ]
        : []),
    ],
  }

  return { navData, loading }
}
