import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import {
  treeOpenNodesAtom,
  projectQcsRunLabelFilterAtom,
  projectQcsRunOnlyWithResultsAtom,
  projectQcsRunFilteredCountAtom,
} from '../store.ts'

type Props = {
  projectId: string
}

export const useProjectQcsRunNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [labelFilter] = useAtom(projectQcsRunLabelFilterAtom)
  const [onlyWithResults] = useAtom(projectQcsRunOnlyWithResultsAtom)
  const [filteredCount] = useAtom(projectQcsRunFilteredCountAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'qcs-run']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const res = useLiveQuery(
    `SELECT count(*) AS count
     FROM qc_assignments qa
     JOIN qcs q ON q.qcs_id = qa.qc_id
     WHERE qa.project_id = $1
       AND qa.subproject_id IS NULL
       AND q.level = 'project'`,
    [projectId],
  )

  const loading = res === undefined
  const count = res?.rows?.[0]?.count ?? 0

  const isFiltered =
    (!!labelFilter.trim() || onlyWithResults) && filteredCount !== null
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
        id: 'subprojectQcsRun.title',
        defaultMessage: 'Qualitätskontrollen: ausführen',
      }),
    }),
    nameSingular: formatMessage({
      id: 'qcs.nameSingular',
      defaultMessage: 'Qualitätskontrolle',
    }),
    navs: [],
  }

  return { loading, navData, count }
}
