import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import {
  subprojectsFilterAtom,
  projectReportsFilterAtom,
  treeOpenNodesAtom,
} from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const useProjectNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { projectId } = useParams({ strict: false })

  const [subprojectsFilter] = useAtom(subprojectsFilterAtom)
  const subprojectsFilterString = filterStringFromFilter(subprojectsFilter)
  const subprojectIsFiltered = !!subprojectsFilterString

  const res = useLiveQuery(
    `
      WITH 
        subprojects_count_unfiltered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}'),
        subprojects_count_filtered AS (SELECT count(*) FROM subprojects WHERE project_id = '${projectId}' ${subprojectIsFiltered ? ` AND ${subprojectsFilterString}` : ''} ),
        subprojects_names AS (SELECT subproject_name_singular, subproject_name_plural FROM projects WHERE project_id = '${projectId}')
      SELECT
        project_id AS id,
        label,
        subprojects_count_unfiltered.count AS subprojects_count_unfiltered,
        subprojects_count_filtered.count AS subprojects_count_filtered,
        subprojects_names.subproject_name_singular AS subprojects_name_singular,
        subprojects_names.subproject_name_plural AS subprojects_name_plural
      FROM projects, subprojects_count_unfiltered, subprojects_count_filtered, subprojects_names
      WHERE project_id = $1`,
    [projectId],
  )
  const loading = res === undefined
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row.id]
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
      label: row.label,
      // nameSingular: 'Project',
      navs: [
        { label: 'Project', array: [...ownArray, 'project'] },
        {
          label: buildNavLabel({
            loading,
            isFiltered: subprojectIsFiltered,
            countFiltered: row?.subprojects_count_filtered ?? 0,
            countUnfiltered: row?.subprojects_count_unfiltered ?? 0,
            namePlural: row?.subprojects_name_plural ?? 'Subprojects',
          }),
          array: [...ownArray, 'subprojects'],
        },
      ],
    }
  }, [
    loading,
    openNodes,
    row.id,
    row.label,
    row?.subprojects_count_filtered,
    row?.subprojects_count_unfiltered,
    row?.subprojects_name_plural,
    subprojectIsFiltered,
  ])
}
