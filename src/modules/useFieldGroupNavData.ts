import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  fieldGroupId: string
}

type NavData = {
  field_group_id: string
  name: string | null
  table_name: string | null
}

export const useFieldGroupNavData = ({ projectId, fieldGroupId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData>(
    `
    SELECT
      field_group_id,
      name,
      table_name
    FROM field_groups
    WHERE field_group_id = $1`,
    [fieldGroupId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const parentArray = ['data', 'projects', projectId, 'field-groups']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, fieldGroupId]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.name ?? nav?.field_group_id)

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
      id: 'vN8wL2',
      defaultMessage: 'Feldergruppe',
    }),
  }

  return { loading, navData }
}
