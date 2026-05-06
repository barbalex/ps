import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import {
  treeOpenNodesAtom,
  projectExportsRunLabelFilterAtom,
  projectExportsRunFilteredCountAtom,
} from '../store.ts'

type Props = {
  projectId: string
}

export const useProjectExportsRunNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [labelFilter] = useAtom(projectExportsRunLabelFilterAtom)
  const [filteredCount] = useAtom(projectExportsRunFilteredCountAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'exports-run']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const res = useLiveQuery(
    `SELECT count(*) AS count
     FROM export_assignments ea
     JOIN exports e ON e.exports_id = ea.exports_id
     WHERE ea.project_id = $1
       AND ea.subproject_id IS NULL
       AND e.level = 'project'`,
    [projectId],
  )

  const loading = res === undefined
  const count = res?.rows?.[0]?.count ?? 0

  const isFiltered = !!labelFilter.trim() && filteredCount !== null
  const countFiltered = filteredCount !== null ? filteredCount : count

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
      isFiltered,
      countFiltered,
      countUnfiltered: count,
      namePlural: formatMessage({
        id: 'projectExportsRun.title',
        defaultMessage: 'Exporte: ausführen',
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
