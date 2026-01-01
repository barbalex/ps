import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  taxonomyId: string
}

type NavData = {
  id: string
  label: string | null
  taxa_count_unfiltered: number
}

export const useTaxonomyNavData = ({ projectId, taxonomyId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    WITH
      taxa_count AS (SELECT COUNT(*) AS count FROM taxa WHERE taxonomy_id = '${taxonomyId}')
    SELECT
      taxonomy_id AS id,
      label,
      taxa_count.count AS taxa_count_unfiltered
    FROM
      taxonomies, 
      taxa_count
    WHERE
      taxonomies.taxonomy_id = '${taxonomyId}'`,
  )

  const loading = res === undefined
  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'taxonomies']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : (nav?.label ?? nav?.id)

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
    nameSingular: 'Taxonomy',
    navs: [
      { id: 'taxonomy', label: 'Taxonomy' },
      {
        id: 'taxa',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.taxa_count_unfiltered ?? 0,
          namePlural: 'Taxa',
        }),
      },
    ],
  }

  return { loading, navData }
}
