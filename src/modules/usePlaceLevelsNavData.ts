import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
}

type NavData = {
  id: string
  label: string
}[]

export const usePlaceLevelsNavData = ({ projectId }: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData[number]>(
    `
    SELECT
      place_level_id AS id,
      label 
    FROM place_levels 
    WHERE project_id = $1 
    ORDER BY label`,
    [projectId],
  )

  const loading = res === undefined

  const navs: NavData = res?.rows ?? []
  const parentArray = ['data', 'projects', projectId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'place-levels']
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))
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
      countUnfiltered: navs.length,
      namePlural: formatMessage({
        id: 'aYuCCc',
        defaultMessage: 'Ort-Stufen',
      }),
      loading,
    }),
    nameSingular: formatMessage({ id: 'Lf+2pw', defaultMessage: 'Ort-Stufe' }),
    navs,
  }

  return { loading, navData }
}
