import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
}

export const useProjectExportAssignmentsNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'export-assignments']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const res = useLiveQuery(
    `SELECT count(*) AS count FROM (
       SELECT ea.export_assignment_id
       FROM export_assignments ea
       JOIN exports e ON e.exports_id = ea.exports_id
       WHERE ea.project_id = $1
         AND ea.subproject_id IS NULL
         AND e.level = 'project'
       UNION ALL
       SELECT pea.project_export_assignment_id
       FROM project_export_assignments pea
       WHERE pea.project_id = $2
         AND pea.subproject_id IS NULL
     ) t`,
    [projectId, projectId],
  )

  const loading = res === undefined
  const count = res?.rows?.[0]?.count ?? 0

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      loading,
      isFiltered: false,
      countFiltered: count,
      countUnfiltered: count,
      namePlural: formatMessage({
        id: 'projectExports.title',
        defaultMessage: 'Exporte: wählen',
      }),
    }),
    nameSingular: formatMessage({
      id: 'exports.nameSingular',
      defaultMessage: 'Export',
    }),
    navs: [],
  }

  return { loading, navData, count }
}
