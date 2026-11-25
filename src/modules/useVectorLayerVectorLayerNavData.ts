import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom } from '../store.ts'

type Props = {
  projectId: string
  vectorLayerId: string
}

type NavData = {
  id: string
}

export const useVectorLayerVectorLayerNavData = ({
  projectId,
  vectorLayerId,
}: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const { formatMessage } = useIntl()

  // only tells whether the layer exists: the node's label is the static
  // "Ebene". vector_layers has no label column — its labels are the
  // localized label_de … label_it, and own layers derive theirs
  const sql = `
      SELECT
        vector_layer_id AS id
      FROM 
        vector_layers
      WHERE 
        vector_layers.vector_layer_id = '${vectorLayerId}'`
  const res = useLiveQuery<NavData>(sql)
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = [
    'data',
    'projects',
    projectId,
    'vector-layers',
    vectorLayerId,
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'vector-layer']
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : formatMessage({ id: 'JY1Jke', defaultMessage: 'Ebene' })

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
