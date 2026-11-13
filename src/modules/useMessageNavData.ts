import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom } from '../store.ts'

const parentArray = ['data', 'messages']
const parentUrl = `/${parentArray.join('/')}`

type Props = {
  messageId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useMessageNavData = ({ messageId }: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData>(
    `
    SELECT message_id AS id, TO_CHAR(date, 'YYYY.MM.DD HH24:MI:SS') AS label 
    FROM messages 
    WHERE message_id = $1`,
    [messageId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const ownArray = [...parentArray, messageId]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    nameSingular: formatMessage({ id: 'OFlXRt', defaultMessage: 'Mitteilung' }),
  }

  return { loading, navData }
}
