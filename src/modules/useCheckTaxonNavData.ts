import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

export const useCheckTaxonNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  checkId,
  checkTaxonId,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

  const res = useLiveQuery(
    `
      SELECT
        check_taxon_id as id,
        label
      FROM check_taxa 
      WHERE check_taxon_id = $1`,
    [checkTaxonId],
  )

  const loading = res === undefined

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]
    const parentArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      'places',
      placeId,
      ...(placeId2 ? ['places', placeId2] : []),
      'checks',
      checkId,
      'taxa',
    ]
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = [...parentArray, checkTaxonId]
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
      nameSingular: 'Check Taxon',
    }
  }, [
    checkId,
    checkTaxonId,
    location.pathname,
    openNodes,
    placeId,
    placeId2,
    projectId,
    res,
    subprojectId,
  ])

  return { loading, navData }
}
