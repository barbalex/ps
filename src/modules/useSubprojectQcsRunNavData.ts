import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import {
  treeOpenNodesAtom,
  qcsRunLabelFilterAtom,
  qcsRunOnlyWithResultsAtom,
  qcsRunFilteredCountAtom,
} from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
}

export const useSubprojectQcsRunNavData = ({
  projectId,
  subprojectId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [labelFilter] = useAtom(qcsRunLabelFilterAtom)
  const [onlyWithResults] = useAtom(qcsRunOnlyWithResultsAtom)
  const [filteredCount] = useAtom(qcsRunFilteredCountAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'qcs-run']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const res = useLiveQuery(
    `SELECT count(*) AS count FROM qcs_assignment qa JOIN qcs q ON q.qcs_id = qa.qc_id WHERE qa.subproject_id = $1 AND q.is_subproject_level = true`,
    [subprojectId],
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
        defaultMessage: 'Qualitätskontrollen ausführen',
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
