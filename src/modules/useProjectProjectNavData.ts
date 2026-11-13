import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useProjectProjectNavData = ({ projectId }: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const { formatMessage } = useIntl()

  const sql = `
      SELECT
        project_id AS id,
        name AS label
      FROM 
        projects
      WHERE 
        projects.project_id = '${projectId}'`
  const res = useLiveQuery<NavData>(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'project']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' })

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
    navs: [],
  }

  return { navData, loading }
}
