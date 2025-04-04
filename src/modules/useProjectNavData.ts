import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import isEqual from 'lodash/isEqual'

import {
  subprojectsFilterAtom,
  projectReportsFilterAtom,
  personsFilterAtom,
  wmsLayersFilterAtom,
  vectorLayersFilterAtom,
  listsFilterAtom,
  unitsFilterAtom,
  fieldsFilterAtom,
  treeOpenNodesAtom,
  designingAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const useProjectNavData = ({ projectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [designing] = useAtom(designingAtom)

  const [subprojectsFilter] = useAtom(subprojectsFilterAtom)
  const subprojectsFilterString = filterStringFromFilter(subprojectsFilter)
  const subprojectIsFiltered = !!subprojectsFilterString

  const [projectReportsFilter] = useAtom(projectReportsFilterAtom)
  const projectReportsFilterString =
    filterStringFromFilter(projectReportsFilter)
  const projectReportsIsFiltered = !!projectReportsFilterString

  const [personsFilter] = useAtom(personsFilterAtom)
  const personsFilterString = filterStringFromFilter(personsFilter)
  const personsIsFiltered = !!personsFilterString

  const [wmsLayersFilter] = useAtom(wmsLayersFilterAtom)
  const wmsLayersFilterString = filterStringFromFilter(wmsLayersFilter)
  const wmsLayersIsFiltered = !!wmsLayersFilterString

  const [vectorLayersFilter] = useAtom(vectorLayersFilterAtom)
  const vectorLayersFilterString = filterStringFromFilter(vectorLayersFilter)
  const vectorLayersIsFiltered = !!vectorLayersFilterString

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
      WITH 
        subprojects_count_unfiltered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}'),
        subprojects_count_filtered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}' ${subprojectIsFiltered ? ` AND ${subprojectsFilterString}` : ''} ),
        subprojects_names AS (SELECT subproject_name_singular, subproject_name_plural FROM projects WHERE project_id = '${projectId}'),
        project_reports_count_unfiltered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}'),
        project_reports_count_filtered AS (SELECT count(*) FROM project_reports WHERE project_id = '${projectId}' ${projectReportsIsFiltered ? ` AND ${projectReportsFilterString}` : ''}),
        persons_count_unfiltered AS (SELECT count(*) FROM persons WHERE project_id = '${projectId}'),
        persons_count_filtered AS (SELECT count(*) FROM persons WHERE project_id = '${projectId}' ${personsIsFiltered ? ` AND ${personsFilterString}` : ''}),
        wms_layers_count_unfiltered AS (SELECT count(*) FROM wms_layers WHERE project_id = '${projectId}'),
        wms_layers_count_filtered AS (SELECT count(*) FROM wms_layers WHERE project_id = '${projectId}' ${wmsLayersIsFiltered ? ` AND ${wmsLayersFilterString}` : ''}),
        vector_layers_count_unfiltered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}'),
        vector_layers_count_filtered AS (SELECT count(*) FROM vector_layers WHERE project_id = '${projectId}' ${vectorLayersIsFiltered ? ` AND ${vectorLayersFilterString}` : ''})
        ${
          designing ?
            `, project_users_count_unfiltered AS (SELECT count(*) FROM project_users WHERE project_id = '${projectId}'),
        lists_count_unfiltered AS (SELECT count(*) FROM lists WHERE project_id = '${projectId}'),
        lists_count_filtered AS (SELECT count(*) FROM lists WHERE project_id = '${projectId}' ${listsIsFiltered ? ` AND ${listsFilterString}` : ''}),
        taxonomies_count_unfiltered AS (SELECT count(*) FROM taxonomies WHERE project_id = '${projectId}'),
        units_count_unfiltered AS (SELECT count(*) FROM units WHERE project_id = '${projectId}'),
        units_count_filtered AS (SELECT count(*) FROM units WHERE project_id = '${projectId}' ${unitsIsFiltered ? ` AND ${unitsFilterString}` : ''}),
        project_crs_count_unfiltered AS (SELECT count(*) FROM project_crs WHERE project_id = '${projectId}'),
        place_levels_count_unfiltered AS (SELECT count(*) FROM place_levels WHERE project_id = '${projectId}'),
        fields_count_unfiltered AS (SELECT count(*) FROM fields WHERE project_id = '${projectId}'),
        fields_count_filtered AS (SELECT count(*) FROM fields WHERE project_id = '${projectId}' ${fieldsIsFiltered ? ` AND ${fieldsFilterString}` : ''})`
          : ''
        }
      SELECT
        project_id AS id,
        label,
        subprojects_count_unfiltered.count AS subprojects_count_unfiltered,
        subprojects_count_filtered.count AS subprojects_count_filtered,
        subprojects_names.subproject_name_singular AS subprojects_name_singular,
        subprojects_names.subproject_name_plural AS subprojects_name_plural,
        project_reports_count_unfiltered.count AS project_reports_count_unfiltered,
        project_reports_count_filtered.count AS project_reports_count_filtered,
        persons_count_unfiltered.count AS persons_count_unfiltered,
        persons_count_filtered.count AS persons_count_filtered,
        wms_layers_count_unfiltered.count AS wms_layers_count_unfiltered,
        wms_layers_count_filtered.count AS wms_layers_count_filtered,
        vector_layers_count_unfiltered.count AS vector_layers_count_unfiltered,
        vector_layers_count_filtered.count AS vector_layers_count_filtered
        ${
          designing ?
            `, project_users_count_unfiltered.count AS project_users_count_unfiltered,
        lists_count_unfiltered.count AS lists_count_unfiltered,
        lists_count_filtered.count AS lists_count_filtered,
        taxonomies_count_unfiltered.count AS taxonomies_count_unfiltered,
        units_count_unfiltered.count AS units_count_unfiltered,
        units_count_filtered.count AS units_count_filtered,
        project_crs_count_unfiltered.count AS project_crs_count_unfiltered,
        place_levels_count_unfiltered.count AS place_levels_count_unfiltered,
        fields_count_unfiltered.count AS fields_count_unfiltered,
        fields_count_filtered.count AS fields_count_filtered`
          : ''
        }
      FROM 
        projects, 
        subprojects_count_unfiltered, 
        subprojects_count_filtered, 
        subprojects_names, 
        project_reports_count_unfiltered, 
        project_reports_count_filtered,
        persons_count_unfiltered,
        persons_count_filtered,
        wms_layers_count_unfiltered,
        wms_layers_count_filtered,
        vector_layers_count_unfiltered,
        vector_layers_count_filtered
        ${
          designing ?
            `, project_users_count_unfiltered,
        lists_count_unfiltered,
        lists_count_filtered,
        taxonomies_count_unfiltered,
        units_count_unfiltered,
        units_count_filtered,
        project_crs_count_unfiltered,
        place_levels_count_unfiltered,
        fields_count_unfiltered,
        fields_count_filtered`
          : ''
        }
      WHERE projects.project_id = '${projectId}'`,
  )
  const loading = res === undefined
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects']
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
        { id: 'project', label: 'Project' },
        {
          id: 'subprojects',
          label: buildNavLabel({
            loading,
            isFiltered: subprojectIsFiltered,
            countFiltered: row?.subprojects_count_filtered ?? 0,
            countUnfiltered: row?.subprojects_count_unfiltered ?? 0,
            namePlural: row?.subprojects_name_plural ?? 'Subprojects',
          }),
        },
        {
          id: 'reports',
          label: buildNavLabel({
            loading,
            isFiltered: projectReportsIsFiltered,
            countFiltered: row?.project_reports_count_filtered ?? 0,
            countUnfiltered: row?.project_reports_count_unfiltered ?? 0,
            namePlural: 'Reports',
          }),
        },
        {
          id: 'persons',
          label: buildNavLabel({
            loading,
            isFiltered: personsIsFiltered,
            countFiltered: row?.persons_count_filtered ?? 0,
            countUnfiltered: row?.persons_count_unfiltered ?? 0,
            namePlural: 'Persons',
          }),
        },
        {
          id: 'wms-layers',
          label: buildNavLabel({
            loading,
            isFiltered: wmsLayersIsFiltered,
            countFiltered: row?.wms_layers_count_filtered ?? 0,
            countUnfiltered: row?.wms_layers_count_unfiltered ?? 0,
            namePlural: 'WMS Layers',
          }),
        },
        {
          id: 'vector-layers',
          label: buildNavLabel({
            loading,
            isFiltered: vectorLayersIsFiltered,
            countFiltered: row?.vector_layers_count_filtered ?? 0,
            countUnfiltered: row?.vector_layers_count_unfiltered ?? 0,
            namePlural: 'Vector Layers',
          }),
        },
        ...(designing ?
          [
            {
              id: 'users',
              label: buildNavLabel({
                loading,
                countFiltered: row?.project_users_count_unfiltered ?? 0,
                namePlural: 'Users',
              }),
            },
            {
              id: 'lists',
              label: buildNavLabel({
                loading,
                isFiltered: listsIsFiltered,
                countFiltered: row?.lists_count_filtered ?? 0,
                countUnfiltered: row?.lists_count_unfiltered ?? 0,
                namePlural: 'Lists',
              }),
            },
            {
              id: 'taxonomies',
              label: buildNavLabel({
                loading,
                countFiltered: row?.taxonomies_count_unfiltered ?? 0,
                namePlural: 'Taxonomies',
              }),
            },
            {
              id: 'units',
              label: buildNavLabel({
                loading,
                isFiltered: unitsIsFiltered,
                countFiltered: row?.units_count_filtered ?? 0,
                countUnfiltered: row?.units_count_unfiltered ?? 0,
                namePlural: 'Units',
              }),
            },
            {
              id: 'crs',
              label: buildNavLabel({
                loading,
                countFiltered: row?.project_crs_count_unfiltered ?? 0,
                namePlural: 'CRS',
              }),
            },
            {
              id: 'place-levels',
              label: buildNavLabel({
                loading,
                countFiltered: row?.place_levels_count_unfiltered ?? 0,
                namePlural: 'Place Levels',
              }),
            },
            {
              id: 'fields',
              label: buildNavLabel({
                loading,
                isFiltered: fieldsIsFiltered,
                countFiltered: row?.fields_count_filtered ?? 0,
                countUnfiltered: row?.fields_count_unfiltered ?? 0,
                namePlural: 'Fields',
              }),
            },
          ]
        : []),
      ],
    }
  }, [
    designing,
    fieldsIsFiltered,
    listsIsFiltered,
    loading,
    openNodes,
    personsIsFiltered,
    projectReportsIsFiltered,
    row?.fields_count_filtered,
    row?.fields_count_unfiltered,
    row?.id,
    row?.label,
    row?.lists_count_filtered,
    row?.lists_count_unfiltered,
    row?.persons_count_filtered,
    row?.persons_count_unfiltered,
    row?.place_levels_count_unfiltered,
    row?.project_crs_count_unfiltered,
    row?.project_reports_count_filtered,
    row?.project_reports_count_unfiltered,
    row?.project_users_count_unfiltered,
    row?.subprojects_count_filtered,
    row?.subprojects_count_unfiltered,
    row?.subprojects_name_plural,
    row?.taxonomies_count_unfiltered,
    row?.units_count_filtered,
    row?.units_count_unfiltered,
    row?.vector_layers_count_filtered,
    row?.vector_layers_count_unfiltered,
    row?.wms_layers_count_filtered,
    row?.wms_layers_count_unfiltered,
    subprojectIsFiltered,
    unitsIsFiltered,
    vectorLayersIsFiltered,
    wmsLayersIsFiltered,
  ])

  return { navData, loading }
}
