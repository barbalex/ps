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
import { useNavRollups } from './navRollupsContext.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'
import { getPlaceFallbackNames } from './placeNameFallback.ts'

type Props = {
  projectId: string
  subprojectId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useSubprojectNavData = ({ projectId, subprojectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { formatMessage } = useIntl()
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId] ?? false
  const [placesFilter] = useAtom(places1FilterAtom)
  const [language] = useAtom(languageAtom)

  const placesFilterString = filterStringFromFilter(
    placesFilter as Record<string, unknown> & typeof placesFilter,
    '',
  )
  const placesIsFiltered = !!placesFilterString

  const [subprojectReportsFilter] = useAtom(subprojectReportsFilterAtom)
  const subprojectReportsFilterString = filterStringFromFilter(
    subprojectReportsFilter as Record<string, unknown> &
      typeof subprojectReportsFilter,
    '',
  )
  const subprojectReportsIsFiltered = !!subprojectReportsFilterString

  const [goalsFilter] = useAtom(goalsFilterAtom)
  const goalsFilterString = filterStringFromFilter(
    goalsFilter as Record<string, unknown> & typeof goalsFilter,
    '',
  )
  const goalsIsFiltered = !!goalsFilterString

  const [filesFilter] = useAtom(filesFilterAtom)
  const filesFilterString = filterStringFromFilter(
    filesFilter as Record<string, unknown> & typeof filesFilter,
    '',
  )
  const filesIsFiltered = !!filesFilterString

  // counts come from the shared rollups (see NavDataProvider); the only
  // per-node query left is the subproject's own row
  const rollups = useNavRollups()
  const project = rollups.projectRow(projectId)

  const resOwnRow = useLiveQuery<NavData>(
    `SELECT subproject_id AS id, label
     FROM subprojects
     WHERE subproject_id = $1`,
    [subprojectId],
  )
  const nav: NavData | undefined = resOwnRow?.rows?.[0]

  const places = rollups.subprojectCount(subprojectId, 'places')
  const subprojectReports = rollups.subprojectCount(
    subprojectId,
    'subproject_reports',
  )
  const goals = rollups.subprojectCount(subprojectId, 'goals')
  const observationImports = rollups.subprojectCount(
    subprojectId,
    'observation_imports',
  )
  const observationsToAssess = rollups.subprojectCount(
    subprojectId,
    'observations_to_assess',
  )
  const observationsNotToAssign = rollups.subprojectCount(
    subprojectId,
    'observations_not_to_assign',
  )
  const subprojectTaxa = rollups.subprojectCount(
    subprojectId,
    'subproject_taxa',
  )
  const subprojectRoles = rollups.subprojectCount(
    subprojectId,
    'subproject_roles',
  )
  const files = rollups.subprojectCount(subprojectId, 'files')
  // own charts plus the project's chart templates for all subprojects
  const chartsCount =
    (rollups.subprojectCount(subprojectId, 'charts_own')?.count ?? 0) +
    (rollups.projectCount(projectId, 'subproject_charts')?.count ?? 0)
  const qc = rollups.subprojectQcCounts(subprojectId)
  const exportsCounts = rollups.subprojectExportCounts(subprojectId)

  const tableViews = rollups.tableViews(projectId)

  const projectType = project?.type
  const placeLevel1 = rollups.placeLevel(projectId, 1)
  const placeNamePlural =
    placeLevel1?.[`name_plural_${language}` as const] ?? undefined

  const loading = rollups.loading || resOwnRow === undefined

  // the singular name lives on the project row (like the original query,
  // which selected it from projects with alias 'p'); the rollup already
  // resolved the language fallback in SQL
  const subprojectNameSingular =
    project?.subproject_name_singular_current ??
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
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
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
          countFiltered: places?.filtered ?? 0,
          countUnfiltered: places?.count ?? 0,
          namePlural:
            (placeNamePlural as string | null | undefined) ??
            getPlaceFallbackNames(projectType, 1, formatMessage).plural,
        }),
      },
      ...(designing || (project?.subproject_reports ?? true) ?
        [
          ...(project?.subproject_reports_in_subproject === false ?
            [
              {
                id: 'reports',
                label: buildNavLabel({
                  loading,
                  isFiltered: subprojectReportsIsFiltered,
                  countFiltered: subprojectReports?.filtered ?? 0,
                  countUnfiltered: subprojectReports?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'CiJ0SG',
                    defaultMessage: 'Berichte',
                  }),
                }),
              },
            ]
          : []),
        ]
      : []),
      ...(designing || (project?.goals ?? true) ?
        [
          {
            id: 'goals',
            label: buildNavLabel({
              loading,
              isFiltered: goalsIsFiltered,
              countFiltered: goals?.filtered ?? 0,
              countUnfiltered: goals?.count ?? 0,
              namePlural: formatMessage({
                id: '3srcwg',
                defaultMessage: 'Ziele',
              }),
            }),
          },
        ]
      : []),
      ...(designing || (project?.occurrences ?? true) ?
        [
          {
            id: 'observation-imports',
            label: buildNavLabel({
              loading,
              countFiltered: observationImports?.count ?? 0,
              countUnfiltered: observationImports?.count ?? 0,
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
              countFiltered: observationsToAssess?.count ?? 0,
              countUnfiltered: observationsToAssess?.count ?? 0,
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
              countFiltered: observationsNotToAssign?.count ?? 0,
              countUnfiltered: observationsNotToAssign?.count ?? 0,
              namePlural: formatMessage({
                id: 'slC/ul',
                defaultMessage: 'Beobachtungen nicht zuzuordnen',
              }),
            }),
          },
        ]
      : []),
      ...((
        (designing || (project?.taxa ?? true)) &&
        project?.subproject_taxa_in_subproject === false
      ) ?
        [
          {
            id: 'taxa',
            label: buildNavLabel({
              loading,
              countFiltered: subprojectTaxa?.count ?? 0,
              countUnfiltered: subprojectTaxa?.count ?? 0,
              namePlural: formatMessage({
                id: '7sVbg1',
                defaultMessage: 'Taxa',
              }),
            }),
          },
        ]
      : []),
      {
        id: 'qc-assignments',
        label: buildNavLabel({
          loading,
          countFiltered: qc.assignments,
          countUnfiltered: qc.assignments,
          namePlural: formatMessage({
            id: 'subprojectQcs.title',
            defaultMessage: 'Qualitätskontrollen: wählen',
          }),
        }),
      },
      {
        id: 'qcs-run',
        label: buildNavLabel({
          loading,
          countFiltered: qc.run,
          countUnfiltered: qc.run,
          namePlural: formatMessage({
            id: 'subprojectQcsRun.title',
            defaultMessage: 'Qualitätskontrollen: ausführen',
          }),
        }),
      },
      ...(designing ?
        [
          {
            id: 'export-assignments',
            label: buildNavLabel({
              loading,
              countFiltered: exportsCounts.assignments,
              countUnfiltered: exportsCounts.assignments,
              namePlural: formatMessage({
                id: 'subprojectExports.title',
                defaultMessage: 'Exporte: wählen',
              }),
            }),
          },
          {
            id: 'exports-run',
            label: buildNavLabel({
              loading,
              countFiltered: exportsCounts.run,
              countUnfiltered: exportsCounts.run,
              namePlural: formatMessage({
                id: 'subprojectExportsRun.title',
                defaultMessage: 'Exporte: ausführen',
              }),
            }),
          },
        ]
      : []),
      ...(designing && project?.subproject_roles_in_subproject === false ?
        [
          {
            id: 'users',
            label: buildNavLabel({
              loading,
              countFiltered: subprojectRoles?.count ?? 0,
              countUnfiltered: subprojectRoles?.count ?? 0,
              namePlural: formatMessage({
                id: 'eZ3yEB',
                defaultMessage: 'Benutzer',
              }),
            }),
          },
        ]
      : []),
      ...((
        (designing || (project?.files_active_subprojects ?? true)) &&
        project?.subproject_files_in_subproject === false
      ) ?
        [
          {
            id: 'files',
            label: buildNavLabel({
              loading,
              isFiltered: filesIsFiltered,
              countFiltered: files?.filtered ?? 0,
              countUnfiltered: files?.count ?? 0,
              namePlural: formatMessage({
                id: 'mn58Sh',
                defaultMessage: 'Dateien',
              }),
            }),
          },
        ]
      : []),
      ...(designing || (project?.charts ?? true) ?
        [
          {
            id: 'charts',
            label: buildNavLabel({
              loading,
              countFiltered: chartsCount,
              countUnfiltered: chartsCount,
              namePlural: formatMessage({
                id: 'ZPEO8P',
                defaultMessage: 'Diagramme',
              }),
            }),
          },
        ]
      : []),
      ...tableViews.map((view) => ({
        // multi-segment id: entityChildren turns it into a formLink row
        // navigating to .../subprojects/<id>/table-views/<tableViewId>
        id: `table-views/${view.table_view_id}`,
        label:
          view[`name_singular_${language}` as const] ??
          view.name_singular_de ??
          view.table_view_id,
      })),
    ],
  }

  return { navData, loading }
}
