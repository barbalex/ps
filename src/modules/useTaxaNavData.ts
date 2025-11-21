import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const useTaxaNavData = ({ projectId, taxonomyId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        taxon_id AS id,
        label
      FROM taxa 
      WHERE taxonomy_id = $1 
      ORDER BY label`,
    [taxonomyId],
  )

  const loading = res === undefined

  const navs = res?.rows ?? []
  const parentArray = ['data', 'projects', projectId, 'taxonomies', taxonomyId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'taxa']
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
      loading,
      countFiltered: navs.length,
      namePlural: 'Taxa',
    }),
    nameSingular: 'Taxon',
    navs,
  }

  return { loading, navData }
}
