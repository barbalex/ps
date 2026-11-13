import { useAtom, useAtomValue } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import {
  subprojectsFilterAtom,
  projectReportsFilterAtom,
  wmsLayersFilterAtom,
  vectorLayersFilterAtom,
  filesFilterAtom,
  listsFilterAtom,
  unitsFilterAtom,
  fieldsFilterAtom,
  treeOpenNodesSetAtom,
  isDesigningAtom,
} from '../store.ts'
import { useNavRollups } from './navRollupsContext.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

type Props = {
  projectId: string
  forBreadcrumb?: boolean
}

export const useProjectNavData = ({
  projectId,
  forBreadcrumb = false,
}: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const { formatMessage } = useIntl()
  const designing = useAtomValue(isDesigningAtom(projectId))

  const [subprojectsFilter] = useAtom(subprojectsFilterAtom)
  const subprojectsFilterString = filterStringFromFilter(subprojectsFilter)
  const subprojectIsFiltered = !!subprojectsFilterString

  const [projectReportsFilter] = useAtom(projectReportsFilterAtom)
  const projectReportsFilterString =
    filterStringFromFilter(projectReportsFilter)
  const projectReportsIsFiltered = !!projectReportsFilterString

  const [wmsLayersFilter] = useAtom(wmsLayersFilterAtom)
  const wmsLayersFilterString = filterStringFromFilter(wmsLayersFilter)
  const wmsLayersIsFiltered = !!wmsLayersFilterString

  const [vectorLayersFilter] = useAtom(vectorLayersFilterAtom)
  const vectorLayersFilterString = filterStringFromFilter(vectorLayersFilter)
  const vectorLayersIsFiltered = !!vectorLayersFilterString

  const [filesFilter] = useAtom(filesFilterAtom)
  const filesFilterString = filterStringFromFilter(filesFilter)
  const filesIsFiltered = !!filesFilterString

  const [listsFilter] = useAtom(listsFilterAtom)
  const listsFilterString = filterStringFromFilter(listsFilter)
  const listsIsFiltered = !!listsFilterString

  const [unitsFilter] = useAtom(unitsFilterAtom)
  const unitsFilterString = filterStringFromFilter(unitsFilter)
  const unitsIsFiltered = !!unitsFilterString

  const [fieldsFilter] = useAtom(fieldsFilterAtom)
  const fieldsFilterString = filterStringFromFilter(fieldsFilter)
  const fieldsIsFiltered = !!fieldsFilterString

  // counts come from the shared rollups (see NavDataProvider): one query per
  // table for all projects instead of one count battery per open node
  const rollups = useNavRollups()
  const nav = rollups.projectRow(projectId)

  const subprojects = rollups.projectCount(projectId, 'subprojects')
  const projectReports = rollups.projectCount(projectId, 'project_reports')
  const wmsLayers = rollups.projectCount(projectId, 'wms_layers')
  const vectorLayers = rollups.projectCount(projectId, 'vector_layers')
  const files = rollups.projectCount(projectId, 'files')
  const charts = rollups.projectCount(projectId, 'charts')
  const subprojectCharts = rollups.projectCount(projectId, 'subproject_charts')
  const projectUsers = rollups.projectCount(projectId, 'project_users')
  const lists = rollups.projectCount(projectId, 'lists')
  const taxonomies = rollups.projectCount(projectId, 'taxonomies')
  const units = rollups.projectCount(projectId, 'units')
  const projectCrs = rollups.projectCount(projectId, 'project_crs')
  const projectQcs = rollups.projectCount(projectId, 'project_qcs')
  const projectExports = rollups.projectCount(projectId, 'project_exports')
  const placeLevels = rollups.projectCount(projectId, 'place_levels')
  const fields = rollups.projectCount(projectId, 'fields')
  const subprojectReportDesigns = rollups.projectCount(
    projectId,
    'subproject_report_designs',
  )
  const projectReportDesigns = rollups.projectCount(
    projectId,
    'project_report_designs',
  )
  const tableViews = rollups.projectCount(projectId, 'table_views')
  const qc = rollups.projectQcCounts(projectId)
  const exportsCounts = rollups.projectExportCounts(projectId)

  const loading = rollups.loading

  const parentArray = ['data', 'projects']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.project_id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !loading && !nav
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.project_id)

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
    navs:
      forBreadcrumb ?
        []
      : [
          {
            id: 'project',
            label: formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' }),
          },
          ...(designing ?
            [
              {
                id: 'configuration',
                label: formatMessage({
                  id: 'qyfs2A',
                  defaultMessage: 'Projekt-Konfiguration',
                }),
              },
            ]
          : []),
          {
            id: 'subprojects',
            label: buildNavLabel({
              loading,
              isFiltered: subprojectIsFiltered,
              countFiltered: subprojects?.filtered ?? 0,
              countUnfiltered: subprojects?.count ?? 0,
              namePlural:
                nav?.subproject_name_plural_current ??
                formatMessage({ id: 'Jou8/E', defaultMessage: 'Teilprojekte' }),
            }),
          },
          ...(designing || (nav?.charts ?? true) ?
            [
              {
                id: 'charts',
                label: buildNavLabel({
                  loading,
                  countFiltered: charts?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'ZPEO8P',
                    defaultMessage: 'Diagramme',
                  }),
                }),
              },
            ]
          : []),
          // chart templates for all subprojects: design-time configuration
          ...(designing ?
            [
              {
                id: 'subproject-charts',
                label: buildNavLabel({
                  loading,
                  countFiltered: subprojectCharts?.count ?? 0,
                  namePlural: formatMessage(
                    { id: 'bFcCdD', defaultMessage: '{subprojects}-Diagramme' },
                    {
                      subprojects:
                        nav?.subproject_name_plural_current ??
                        formatMessage({
                          id: 'bEaAfF',
                          defaultMessage: 'Teilprojekte',
                        }),
                    },
                  ),
                }),
              },
              {
                id: 'subproject-designs',
                label: buildNavLabel({
                  loading,
                  countFiltered: subprojectReportDesigns?.count ?? 0,
                  namePlural:
                    nav?.subproject_name_singular_current ?
                      `${nav.subproject_name_singular_current}-${formatMessage({ id: 'bCJkLm', defaultMessage: 'Bericht-Designs' })}`
                    : formatMessage({
                        id: '6GiFz4',
                        defaultMessage: 'Teilprojekt-Bericht-Designs',
                      }),
                }),
              },
              {
                id: 'designs',
                label: buildNavLabel({
                  loading,
                  countFiltered: projectReportDesigns?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'rImbPW',
                    defaultMessage: 'Bericht-Designs',
                  }),
                }),
              },
            ]
          : []),
          ...(designing || (nav?.project_reports ?? true) ?
            [
              {
                id: 'reports',
                label: buildNavLabel({
                  loading,
                  isFiltered: projectReportsIsFiltered,
                  countFiltered: projectReports?.filtered ?? 0,
                  countUnfiltered: projectReports?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'CiJ0SG',
                    defaultMessage: 'Berichte',
                  }),
                }),
              },
            ]
          : []),

          ...(designing || (nav?.wms_layers ?? false) ?
            [
              {
                id: 'wms-services',
                label: buildNavLabel({
                  loading,
                  countFiltered:
                    rollups.projectCount(projectId, 'wms_services')?.count ?? 0,
                  namePlural: formatMessage({
                    id: '0pm66C',
                    defaultMessage: 'WMS-Dienste',
                  }),
                }),
              },
              {
                id: 'wms-layers',
                label: buildNavLabel({
                  loading,
                  isFiltered: wmsLayersIsFiltered,
                  countFiltered: wmsLayers?.filtered ?? 0,
                  countUnfiltered: wmsLayers?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'IKLYLz',
                    defaultMessage: 'WMS-Ebenen',
                  }),
                }),
              },
            ]
          : []),
          ...(designing || (nav?.vector_layers ?? false) ?
            [
              {
                id: 'wfs-services',
                label: buildNavLabel({
                  loading,
                  countFiltered:
                    rollups.projectCount(projectId, 'wfs_services')?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'HzltY9',
                    defaultMessage: 'WFS-Dienste',
                  }),
                }),
              },
              {
                id: 'vector-layers',
                label: buildNavLabel({
                  loading,
                  isFiltered: vectorLayersIsFiltered,
                  countFiltered: vectorLayers?.filtered ?? 0,
                  countUnfiltered: vectorLayers?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'nauDh5',
                    defaultMessage: 'Vektor-Ebenen',
                  }),
                }),
              },
            ]
          : []),
          ...((
            (designing || (nav?.files_active_projects ?? false)) &&
            nav?.project_files_in_project === false
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
          ...(designing && nav?.project_users_in_project === false ?
            [
              {
                id: 'users',
                label: buildNavLabel({
                  loading,
                  countFiltered: projectUsers?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'eZ3yEB',
                    defaultMessage: 'Benutzer',
                  }),
                }),
              },
            ]
          : []),
          ...(designing ?
            [
              {
                id: 'lists',
                label: buildNavLabel({
                  loading,
                  isFiltered: listsIsFiltered,
                  countFiltered: lists?.filtered ?? 0,
                  countUnfiltered: lists?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'zhvWvI',
                    defaultMessage: 'Listen',
                  }),
                }),
              },
              {
                id: 'taxonomies',
                label: buildNavLabel({
                  loading,
                  countFiltered: taxonomies?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'noT0gR',
                    defaultMessage: 'Taxonomien',
                  }),
                }),
              },
              {
                id: 'crs',
                label: buildNavLabel({
                  loading,
                  countFiltered: projectCrs?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'OzBS9Z',
                    defaultMessage: 'KBS',
                  }),
                }),
              },
              {
                id: 'place-levels',
                label: buildNavLabel({
                  loading,
                  countFiltered: placeLevels?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'aYuCCc',
                    defaultMessage: 'Ort-Stufen',
                  }),
                }),
              },
            ]
          : []),
          ...(designing ?
            [
              {
                id: 'qcs',
                label: buildNavLabel({
                  loading,
                  countFiltered: projectQcs?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'qcs.namePlural',
                    defaultMessage: 'Qualitätskontrollen',
                  }),
                }),
              },
            ]
          : []),
          ...(designing && nav?.units_in_project === false ?
            [
              {
                id: 'units',
                label: buildNavLabel({
                  loading,
                  isFiltered: unitsIsFiltered,
                  countFiltered: units?.filtered ?? 0,
                  countUnfiltered: units?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'nVkh0Z',
                    defaultMessage: 'Einheiten',
                  }),
                }),
              },
            ]
          : []),
          ...(designing && nav?.fields_in_project === false ?
            [
              {
                id: 'fields',
                label: buildNavLabel({
                  loading,
                  isFiltered: fieldsIsFiltered,
                  countFiltered: fields?.filtered ?? 0,
                  countUnfiltered: fields?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'I+dTZE',
                    defaultMessage: 'Felder',
                  }),
                }),
              },
            ]
          : []),
          ...(designing ?
            [
              {
                id: 'table-views',
                label: buildNavLabel({
                  loading,
                  countFiltered: tableViews?.count ?? 0,
                  namePlural: formatMessage({
                    id: '2kHq3x',
                    defaultMessage: 'Ansichten',
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
              namePlural: formatMessage({
                id: 'subprojectQcsRun.title',
                defaultMessage: 'Qualitätskontrollen: ausführen',
              }),
            }),
          },
          ...(designing ?
            [
              {
                id: 'exports',
                label: buildNavLabel({
                  loading,
                  countFiltered: projectExports?.count ?? 0,
                  namePlural: formatMessage({
                    id: 'exports.namePlural',
                    defaultMessage: 'Exporte',
                  }),
                }),
              },
              {
                id: 'export-assignments',
                label: buildNavLabel({
                  loading,
                  countFiltered: exportsCounts.assignments,
                  namePlural: formatMessage({
                    id: 'projectExports.title',
                    defaultMessage: 'Exporte: wählen',
                  }),
                }),
              },
              {
                id: 'exports-run',
                label: buildNavLabel({
                  loading,
                  countFiltered: exportsCounts.run,
                  namePlural: formatMessage({
                    id: 'projectExportsRun.title',
                    defaultMessage: 'Exporte: ausführen',
                  }),
                }),
              },
            ]
          : []),
        ],
  }

  return { navData, loading }
}
