import { useAtom, useAtomValue } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'
import dayjs from 'dayjs'

import { buildNavLabel } from './buildNavLabel.ts'
import { operationsQueueAtom, treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data']
const parentUrl = `/${parentArray.join('/')}`
const ownArray = [...parentArray, 'queued-operations']
const ownUrl = `/${ownArray.join('/')}`

export const useQueuedOperationsNavData = () => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const operationsQueue = useAtomValue(operationsQueueAtom)

  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const navs = [...operationsQueue].reverse().map((qo) => ({
    id: qo.id,
    label: `${dayjs(qo.time).format('YYYY.MM.DD HH:mm:ss')} · ${qo.table} · ${qo.operation}`,
  }))

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    parentArray,
    ownArray,
    ownUrl,
    urlPath,
    label: buildNavLabel({
      loading: false,
      countFiltered: operationsQueue.length,
      namePlural: formatMessage({
        id: 'qo.namePlural',
        defaultMessage: 'Ausstehende Operationen',
      }),
    }),
    nameSingular: formatMessage({
      id: 'qo.nameSingular',
      defaultMessage: 'Ausstehende Operation',
    }),
    navs,
  }

  return { loading: false, navData }
}
