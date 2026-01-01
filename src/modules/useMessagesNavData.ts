import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'messages']
const ownUrl = `/${ownArray.join('/')}`

type NavData = {
  id: string
  label: string
}[]

export const useMessagesNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    SELECT message_id AS id, TO_CHAR(date, 'YYYY.MM.DD HH24:MI:SS') AS label
    FROM messages 
    ORDER BY date DESC`,
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
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
      namePlural: 'Messages',
      loading,
    }),
    nameSingular: 'Message',
    navs,
  }

  return { loading, navData }
}
