import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
}

export const useSubprojectQcAssignmentsNavData = ({
  projectId,
  subprojectId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
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
  const ownArray = [...parentArray, 'qc-assignments']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))

  const res = useLiveQuery(
    `SELECT count(*) AS count FROM (
       SELECT qa.qc_assignment_id
       FROM qc_assignments qa
       JOIN qcs q ON q.qcs_id = qa.qc_id
       WHERE qa.subproject_id = $1
         AND q.level = 'subproject'
       UNION ALL
       SELECT pqa.project_qc_assignment_id
       FROM project_qc_assignments pqa
       WHERE pqa.subproject_id = $2
     ) t`,
    [subprojectId, subprojectId],
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
        id: 'subprojectQcs.title',
        defaultMessage: 'Qualitätskontrollen: wählen',
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
