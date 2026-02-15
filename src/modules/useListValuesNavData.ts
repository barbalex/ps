import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'
import { validateIds } from './validateIds.ts'

type Props = {
  projectId: string
  listId: string
}

export type NavData = {
  id: string
  label: string
}[]

export const useListValuesNavData = ({ projectId, listId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        list_value_id AS id,
        label 
      FROM list_values 
      WHERE list_id = $1 
      ORDER BY label`,
    [listId],
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = ['data', 'projects', projectId, 'lists', listId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'values']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
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
      countFiltered: navs.length,
      namePlural: 'Values',
      loading,
    }),
    nameSingular: 'List Value',
    navs,
  }

  return { loading, navData }
}
