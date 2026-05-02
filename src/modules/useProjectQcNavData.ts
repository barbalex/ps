import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { languageAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  projectQcId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useProjectQcNavData = ({ projectId, projectQcId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `
      SELECT
        project_qc_id AS id,
        COALESCE(NULLIF(label_${language}, ''), name_de, project_qc_id::text) AS label
      FROM project_qcs
      WHERE project_qc_id = $1
    `,
    [projectQcId],
  )

  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'qcs']
  const ownArray = [...parentArray, projectQcId]
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`
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
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    nameSingular: formatMessage({
      id: 'qcs.nameSingular',
      defaultMessage: 'Qualitätskontrolle',
    }),
  }

  return { loading, navData }
}
