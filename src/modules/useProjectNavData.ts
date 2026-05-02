import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
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
  treeOpenNodesAtom,
  designingAtom,
  languageAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'
import {
  subprojectNameSingularExpr,
  subprojectNamePluralExpr,
} from './subprojectNameCols.ts'

type Props = {
  projectId: string
  forBreadcrumb?: boolean
}

type NavData = {
  id: string
  label: string | null
  wms_layers?: boolean | null
  vector_layers?: boolean | null
  project_reports?: boolean | null
  subproject_reports?: boolean | null
  goals?: boolean | null
  occurrences?: boolean | null
  taxa?: boolean | null
  charts?: boolean | null
  files_active_projects?: boolean | null
  project_files_in_project?: boolean | null
  project_users_in_project?: boolean | null
  units_in_project?: boolean | null
  fields_in_project?: boolean | null
}

type NavDataNotForBreadcrumb = {
  id: string
  label: string | null
  wms_layers?: boolean | null
  vector_layers?: boolean | null
  project_reports?: boolean | null
  subproject_reports?: boolean | null
  goals?: boolean | null
  occurrences?: boolean | null
  taxa?: boolean | null
  charts?: boolean | null
  files_active_projects?: boolean | null
  project_files_in_project?: boolean | null
  project_users_in_project?: boolean | null
  units_in_project?: boolean | null
  fields_in_project?: boolean | null
  subprojects_count_unfiltered?: number
  subprojects_count_filtered?: number
  subprojects_name_singular?: string | null
  subprojects_name_plural?: string | null
  project_reports_count_unfiltered?: number
  project_reports_count_filtered?: number
  wms_services_count_unfiltered?: number
  wms_layers_count_unfiltered?: number
  wms_layers_count_filtered?: number
  wfs_services_count_unfiltered?: number
  vector_layers_count_unfiltered?: number
  vector_layers_count_filtered?: number
  files_count_unfiltered?: number
  files_count_filtered?: number
}

type NavDataNotForBreadcrumbDesigning = {
  id: string
  label: string | null
  wms_layers?: boolean | null
  vector_layers?: boolean | null
  project_reports?: boolean | null
  subproject_reports?: boolean | null
  goals?: boolean | null
  occurrences?: boolean | null
  taxa?: boolean | null
  charts?: boolean | null
  files_active_projects?: boolean | null
  project_files_in_project?: boolean | null
  project_users_in_project?: boolean | null
  units_in_project?: boolean | null
  fields_in_project?: boolean | null
  subprojects_count_unfiltered?: number
  subprojects_count_filtered?: number
  subprojects_name_singular?: string | null
  subprojects_name_plural?: string | null
  project_reports_count_unfiltered?: number
  project_reports_count_filtered?: number
  wms_services_count_unfiltered?: number
  wms_layers_count_unfiltered?: number
  wms_layers_count_filtered?: number
  wfs_services_count_unfiltered?: number
  vector_layers_count_unfiltered?: number
  vector_layers_count_filtered?: number
  files_count_unfiltered?: number
  files_count_filtered?: number
  project_users_count_unfiltered?: number
  lists_count_unfiltered?: number
  lists_count_filtered?: number
  taxonomies_count_unfiltered?: number
  units_count_unfiltered?: number
  units_count_filtered?: number
  project_crs_count_unfiltered?: number
  project_qcs_count_unfiltered?: number
  place_levels_count_unfiltered?: number
  fields_count_unfiltered?: number
  fields_count_filtered?: number
}

export const useProjectNavData = ({
  projectId,
  forBreadcrumb = false,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { formatMessage } = useIntl()
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId] ?? false
  const [language] = useAtom(languageAtom)

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

  const res = useLiveQuery(
    `
      ${
        !forBreadcrumb
          ? `
          WITH 
            subprojects_count_unfiltered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}'),
            subprojects_count_filtered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}' ${subprojectIsFiltered ? ` AND ${subprojectsFilterString}` : ''} ),
            subprojects_names AS (SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular, ${subprojectNamePluralExpr(language)} AS subproject_name_plural FROM projects WHERE project_id = '${projectId}'),
            project_reports_count_unfiltered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}'),
            project_reports_count_filtered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}' ${projectReportsIsFiltered ? ` AND ${projectReportsFilterString}` : ''}),
            wms_services_count_unfiltered AS (SELECT count(*) FROM wms_services WHERE project_id = '${projectId}'),
            wms_layers_count_unfiltered AS (SELECT count(*) FROM wms_layers WHERE project_id = '${projectId}'),
            wms_layers_count_filtered AS (SELECT count(*) FROM wms_layers WHERE project_id = '${projectId}' ${wmsLayersIsFiltered ? ` AND ${wmsLayersFilterString}` : ''}),
            wfs_services_count_unfiltered AS (SELECT count(*) FROM wfs_services WHERE project_id = '${projectId}'),
            vector_layers_count_unfiltered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}'),
            vector_layers_count_filtered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}' ${vectorLayersIsFiltered ? ` AND ${vectorLayersFilterString}` : ''}),
            files_count_unfiltered AS (SELECT count(*) FROM files WHERE project_id = '${projectId}'),
            files_count_filtered AS (SELECT count(*) FROM files WHERE project_id = '${projectId}' ${filesIsFiltered ? ` AND ${filesFilterString}` : ''})
            ${
              designing
                ? `, project_users_count_unfiltered AS (SELECT count(*) FROM project_users WHERE project_id = '${projectId}'),
            lists_count_unfiltered AS (SELECT count(*) FROM lists WHERE project_id = '${projectId}'),
            lists_count_filtered AS (SELECT count(*) FROM lists WHERE project_id = '${projectId}' ${listsIsFiltered ? ` AND ${listsFilterString}` : ''}),
            taxonomies_count_unfiltered AS (SELECT count(*) FROM taxonomies WHERE project_id = '${projectId}'),
            units_count_unfiltered AS (SELECT count(*) FROM units WHERE project_id = '${projectId}'),
            units_count_filtered AS (SELECT count(*) FROM units WHERE project_id = '${projectId}' ${unitsIsFiltered ? ` AND ${unitsFilterString}` : ''}),
            project_crs_count_unfiltered AS (SELECT count(*) FROM project_crs WHERE project_id = '${projectId}'),
            project_qcs_count_unfiltered AS (SELECT count(*) FROM project_qcs WHERE project_id = '${projectId}'),
            place_levels_count_unfiltered AS (SELECT count(*) FROM place_levels WHERE project_id = '${projectId}'),
            fields_count_unfiltered AS (SELECT count(*) FROM fields WHERE project_id = '${projectId}'),
            fields_count_filtered AS (SELECT count(*) FROM fields WHERE project_id = '${projectId}' ${fieldsIsFiltered ? ` AND ${fieldsFilterString}` : ''})`
                : ''
            }`
          : ''
      }
      SELECT
        project_id AS id,
        label,
        wms_layers,
        vector_layers,
        project_reports,
        subproject_reports,
        goals,
        occurrences,
        taxa,
        charts,
        files_active_projects,
        project_users_in_project,
        project_files_in_project,
        units_in_project,
        fields_in_project
        ${
          !forBreadcrumb
            ? `,
            subprojects_count_unfiltered.count AS subprojects_count_unfiltered,
            subprojects_count_filtered.count AS subprojects_count_filtered,
            subprojects_names.subproject_name_singular AS subprojects_name_singular,
            subprojects_names.subproject_name_plural AS subprojects_name_plural,
            project_reports_count_unfiltered.count AS project_reports_count_unfiltered,
            project_reports_count_filtered.count AS project_reports_count_filtered,
            wms_services_count_unfiltered.count AS wms_services_count_unfiltered,
            wms_layers_count_unfiltered.count AS wms_layers_count_unfiltered,
            wms_layers_count_filtered.count AS wms_layers_count_filtered,
            wfs_services_count_unfiltered.count AS wfs_services_count_unfiltered,
            vector_layers_count_unfiltered.count AS vector_layers_count_unfiltered,
            vector_layers_count_filtered.count AS vector_layers_count_filtered,
            files_count_unfiltered.count AS files_count_unfiltered,
            files_count_filtered.count AS files_count_filtered
            ${
              designing
                ? `, project_users_count_unfiltered.count AS project_users_count_unfiltered,
            lists_count_unfiltered.count AS lists_count_unfiltered,
            lists_count_filtered.count AS lists_count_filtered,
            taxonomies_count_unfiltered.count AS taxonomies_count_unfiltered,
            units_count_unfiltered.count AS units_count_unfiltered,
            units_count_filtered.count AS units_count_filtered,
            project_crs_count_unfiltered.count AS project_crs_count_unfiltered,
            project_qcs_count_unfiltered.count AS project_qcs_count_unfiltered,
            place_levels_count_unfiltered.count AS place_levels_count_unfiltered,
            fields_count_unfiltered.count AS fields_count_unfiltered,
            fields_count_filtered.count AS fields_count_filtered`
                : ''
            }`
            : ''
        }
      FROM 
        projects
        ${
          !forBreadcrumb
            ? `, 
            subprojects_count_unfiltered, 
            subprojects_count_filtered, 
            subprojects_names, 
            project_reports_count_unfiltered, 
            project_reports_count_filtered,
            wms_services_count_unfiltered,
            wms_layers_count_unfiltered,
            wms_layers_count_filtered,
            wfs_services_count_unfiltered,
            vector_layers_count_unfiltered,
            vector_layers_count_filtered,
            files_count_unfiltered,
            files_count_filtered
            ${
              designing
                ? `, project_users_count_unfiltered,
            lists_count_unfiltered,
            lists_count_filtered,
            taxonomies_count_unfiltered,
            units_count_unfiltered,
            units_count_filtered,
            project_crs_count_unfiltered,
            project_qcs_count_unfiltered,
            place_levels_count_unfiltered,
            fields_count_unfiltered,
            fields_count_filtered`
                : ''
            }`
            : ''
        }
      WHERE projects.project_id = '${projectId}'`,
  )
  const loading = res === undefined
  const nav:
    | NavData
    | NavDataNotForBreadcrumb
    | NavDataNotForBreadcrumbDesigning = res?.rows?.[0]

  const parentArray = ['data', 'projects']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
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
    navs: forBreadcrumb
      ? []
      : [
          {
            id: 'project',
            label: formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' }),
          },
          ...(designing
            ? [
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
              countFiltered: nav?.subprojects_count_filtered ?? 0,
              countUnfiltered: nav?.subprojects_count_unfiltered ?? 0,
              namePlural:
                nav?.subprojects_name_plural ??
                formatMessage({ id: 'Jou8/E', defaultMessage: 'Teilprojekte' }),
            }),
          },
          ...(designing || (nav?.project_reports ?? true)
            ? [
                {
                  id: 'reports',
                  label: buildNavLabel({
                    loading,
                    isFiltered: projectReportsIsFiltered,
                    countFiltered: nav?.project_reports_count_filtered ?? 0,
                    countUnfiltered: nav?.project_reports_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'CiJ0SG',
                      defaultMessage: 'Berichte',
                    }),
                  }),
                },
              ]
            : []),

          ...(designing || (nav?.wms_layers ?? false)
            ? [
                {
                  id: 'wms-services',
                  label: buildNavLabel({
                    loading,
                    countFiltered: nav?.wms_services_count_unfiltered ?? 0,
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
                    countFiltered: nav?.wms_layers_count_filtered ?? 0,
                    countUnfiltered: nav?.wms_layers_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'IKLYLz',
                      defaultMessage: 'WMS-Ebenen',
                    }),
                  }),
                },
              ]
            : []),
          ...(designing || (nav?.vector_layers ?? false)
            ? [
                {
                  id: 'wfs-services',
                  label: buildNavLabel({
                    loading,
                    countFiltered: nav?.wfs_services_count_unfiltered ?? 0,
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
                    countFiltered: nav?.vector_layers_count_filtered ?? 0,
                    countUnfiltered: nav?.vector_layers_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'nauDh5',
                      defaultMessage: 'Vektor-Ebenen',
                    }),
                  }),
                },
              ]
            : []),
          ...((designing || (nav?.files_active_projects ?? false)) &&
          nav?.project_files_in_project === false
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
          ...(designing && nav?.project_users_in_project === false
            ? [
                {
                  id: 'users',
                  label: buildNavLabel({
                    loading,
                    countFiltered: nav?.project_users_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'eZ3yEB',
                      defaultMessage: 'Benutzer',
                    }),
                  }),
                },
                {
                  id: 'lists',
                  label: buildNavLabel({
                    loading,
                    isFiltered: listsIsFiltered,
                    countFiltered: nav?.lists_count_filtered ?? 0,
                    countUnfiltered: nav?.lists_count_unfiltered ?? 0,
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
                    countFiltered: nav?.taxonomies_count_unfiltered ?? 0,
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
                    countFiltered: nav?.project_crs_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'OzBS9Z',
                      defaultMessage: 'KBS',
                    }),
                  }),
                },
                {
                  id: 'qcs',
                  label: buildNavLabel({
                    loading,
                    countFiltered: nav?.project_qcs_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'projectOwnQcs.namePlural',
                      defaultMessage: 'Projekt-Qualitätskontrollen',
                    }),
                  }),
                },
                {
                  id: 'place-levels',
                  label: buildNavLabel({
                    loading,
                    countFiltered: nav?.place_levels_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'aYuCCc',
                      defaultMessage: 'Ort-Stufen',
                    }),
                  }),
                },
              ]
            : []),
          ...(designing && nav?.units_in_project === false
            ? [
                {
                  id: 'units',
                  label: buildNavLabel({
                    loading,
                    isFiltered: unitsIsFiltered,
                    countFiltered: nav?.units_count_filtered ?? 0,
                    countUnfiltered: nav?.units_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'nVkh0Z',
                      defaultMessage: 'Einheiten',
                    }),
                  }),
                },
              ]
            : []),
          ...(designing && nav?.fields_in_project === false
            ? [
                {
                  id: 'fields',
                  label: buildNavLabel({
                    loading,
                    isFiltered: fieldsIsFiltered,
                    countFiltered: nav?.fields_count_filtered ?? 0,
                    countUnfiltered: nav?.fields_count_unfiltered ?? 0,
                    namePlural: formatMessage({
                      id: 'I+dTZE',
                      defaultMessage: 'Felder',
                    }),
                  }),
                },
              ]
            : []),
        ],
  }

  return { navData, loading }
}
