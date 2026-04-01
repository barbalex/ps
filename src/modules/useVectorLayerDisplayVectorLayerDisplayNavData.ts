import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  vectorLayerId: string
  vectorLayerDisplayId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useVectorLayerDisplayVectorLayerDisplayNavData = ({
  projectId,
  vectorLayerId,
  vectorLayerDisplayId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT vector_layer_display_id AS id, label FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
    [vectorLayerDisplayId],
  )
  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const parentArray = [
    'data',
    'projects',
    projectId,
    'vector-layers',
    vectorLayerId,
    'displays',
    vectorLayerDisplayId,
  ]
  const ownArray = [...parentArray, 'vector-layer-display']
  const ownUrl = `/${ownArray.join('/')}`
  const parentUrl = `/${parentArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : formatMessage({ id: 'fhL4R2', defaultMessage: 'Anzeige' })

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
    navs: [],
  }

  return { navData, loading }
}
