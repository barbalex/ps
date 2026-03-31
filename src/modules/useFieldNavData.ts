import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId?: string
  accountId?: string
  fieldId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useFieldNavData = ({ projectId, accountId, fieldId }: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const whereScope = projectId
    ? `project_id = '${projectId}'`
    : accountId
      ? `project_id IS NULL AND account_id = '${accountId}'`
      : 'project_id IS NULL'
  const fieldsSegment = projectId ? 'fields' : accountId ? 'project-fields' : 'fields'

  const res = useLiveQuery(
    `
      SELECT
        field_id AS id,
        label
      FROM fields
      WHERE 
        ${whereScope}
        AND field_id = $1
    `,
    [fieldId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : accountId ? ['accounts', accountId] : []),
    fieldsSegment,
  ]
  const ownArray = [...parentArray, nav?.id]
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentUrl = `/${parentArray.join('/')}`
  const ownUrl = `/${ownArray.join('/')}`

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
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: formatMessage({ id: '61ELuB', defaultMessage: 'Feld' }),
  }

  return { loading, navData }
}
