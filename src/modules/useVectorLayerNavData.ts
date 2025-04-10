import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'
import { buildNavLabel } from './buildNavLabel.ts'

export const useVectorLayerNavData = ({ projectId, vectorLayerId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
    WITH
      vector_layer_displays_count_unfiltered AS (SELECT count(*) FROM vector_layer_displays WHERE vector_layer_id = '${vectorLayerId}')
    SELECT
      vector_layer_id AS id,
      label,
      vector_layer_displays_count_unfiltered.count AS vector_layer_displays_count_unfiltered
    FROM
      vector_layers, 
      vector_layer_displays_count_unfiltered
    WHERE
      vector_layers.vector_layer_id = '${vectorLayerId}'`,
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]

    const parentArray = ['data', 'projects', projectId, 'vector-layers']
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

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      parentUrl,
      ownArray,
      urlPath,
      ownUrl,
      label,
      notFound,
      nameSingular: 'Vector Layer',
      navs: [
        { id: 'vector-layer', label: 'Vector Layer' },
        {
          id: 'displays',
          label: buildNavLabel({
            loading,
            countFiltered: nav?.vector_layer_displays_count_unfiltered ?? 0,
            namePlural: 'Display',
          }),
        },
      ],
    }
  }, [projectId, openNodes, location.pathname, res, loading])

  return { loading, navData }
}
