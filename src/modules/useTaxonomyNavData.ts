import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

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
  const row = res?.rows?.[0]

  const navData = useMemo(() => {
    const parentArray = ['data', 'projects', projectId, 'taxonomies']
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, row?.id]
    const ownUrl = `/${ownArray.join('/')}`
    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label: row?.label,
      nameSingular: 'Taxonomy',
      navs: [
        { id: 'taxonomy', label: 'Taxonomy' },
        {
          id: 'taxa',
          label: buildNavLabel({
            loading,
            countFiltered: row?.taxa_count_unfiltered ?? 0,
            namePlural: 'Taxa',
          }),
        },
      ],
    }
  }, [
    loading,
    location.pathname,
    openNodes,
    projectId,
    row?.id,
    row?.label,
    row?.taxa_count_unfiltered,
  ])

  return { loading, navData }
}
