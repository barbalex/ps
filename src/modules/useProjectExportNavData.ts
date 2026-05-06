import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { languageAtom, treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  projectExportsId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useProjectExportNavData = ({ projectId, projectExportsId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `
      SELECT
        project_exports_id AS id,
        COALESCE(NULLIF(name_${language}, ''), name_de, project_exports_id::text) AS label
      FROM project_exports
      WHERE project_exports_id = $1
    `,
    [projectExportsId],
  )

  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'exports']
  const ownArray = [...parentArray, projectExportsId]
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
      id: 'exports.nameSingular',
      defaultMessage: 'Export',
    }),
  }

  return { loading, navData }
}
