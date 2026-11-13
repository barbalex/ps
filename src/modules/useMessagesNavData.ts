import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesSetAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'messages']
const ownUrl = `/${ownArray.join('/')}`

type NavData = {
  id: string
  label: string
}[]

export const useMessagesNavData = () => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData[number]>(
    `
    SELECT message_id AS id, TO_CHAR(date, 'YYYY.MM.DD HH24:MI:SS') AS label
    FROM messages 
    ORDER BY date DESC`,
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    parentArray,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      countFiltered: navs.length,
      namePlural: formatMessage({
        id: 'vHVPab',
        defaultMessage: 'Mitteilungen',
      }),
      loading,
    }),
    nameSingular: formatMessage({ id: 'OFlXRt', defaultMessage: 'Mitteilung' }),
    navs,
  }

  return { loading, navData }
}
