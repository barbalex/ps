import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { formatNumber } from './formatNumber.ts'
import { treeOpenNodesAtom } from '../store.ts'

export const useSubprojectTaxaNavData = ({ projectId, subprojectId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        subproject_taxon_id AS id,
        label 
      FROM subproject_taxa 
      WHERE subproject_id = $1 
      ORDER BY label`,
    [subprojectId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const navs = res?.rows ?? []
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, 'taxa']
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
      toParams: {},
      label: `Taxa (${loading ? '...' : formatNumber(navs.length)})`,
      nameSingular: 'Subproject Taxon',
      navs,
    }
  }, [
    loading,
    location.pathname,
    openNodes,
    projectId,
    res?.rows,
    subprojectId,
  ])

  return { loading, navData }
}
