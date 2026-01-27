import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  taxonomyId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useTaxonomyTaxonomyNavData = ({
  projectId,
  taxonomyId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const sql = `
      SELECT
        taxonomy_id AS id,
        name AS label
      FROM 
        taxonomies
      WHERE 
        taxonomies.taxonomy_id = '${taxonomyId}'`
  const res = useLiveQuery(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'taxonomies', taxonomyId]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'taxonomy']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? 'Not Found' : 'Taxonomy'

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 2,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label,
    notFound,
    navs: [],
  }

  return { navData, loading }
}
