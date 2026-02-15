import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'
import { validateIds } from './validateIds.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
}

type NavData = {
  id: string
  label: string
}

export const usePlaceHistoriesNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  // Validate after hooks to comply with Rules of Hooks
  validateIds({ projectId, subprojectId, placeId })

  const effectivePlaceId = placeId2 ?? placeId

  const res = useLiveQuery(
    `
      SELECT
        place_history_id AS id,
        label
      FROM place_histories 
      WHERE place_id = $1 
      ORDER BY year DESC`,
    [effectivePlaceId],
  )

  const loading = res === undefined

  const navs: NavData[] = res?.rows ?? []
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'histories']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navData = {
    id: 'histories',
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      loading,
      countFiltered: navs.length,
      namePlural: 'Histories',
    }),
    nameSingular: 'Place History',
    navs,
  }

  return { loading, navData }
}
