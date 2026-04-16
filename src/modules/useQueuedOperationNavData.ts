import { useAtom, useAtomValue } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'
import dayjs from 'dayjs'

import { operationsQueueAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data', 'queued-operations']
const parentUrl = `/${parentArray.join('/')}`

type Props = {
  queuedOperationId: string
}

export const useQueuedOperationNavData = ({ queuedOperationId }: Props) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const operationsQueue = useAtomValue(operationsQueueAtom)

  const qo = operationsQueue.find((o) => o.id === queuedOperationId)
  const ownArray = [...parentArray, queuedOperationId]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !qo
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : `${dayjs(qo.time).format('YYYY.MM.DD HH:mm:ss')} · ${qo.table} · ${qo.operation}`

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 2,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: formatMessage({
      id: 'qo.nameSingular',
      defaultMessage: 'Ausstehende Operation',
    }),
  }

  return { loading: false, navData }
}
