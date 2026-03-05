import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { buildNavLabel } from './buildNavLabel.ts'
import { treeOpenNodesAtom } from '../store.ts'

type Props = {
  projectId: string
  listId: string
}

type NavData = {
  id: string
  label: string | null
  list_values_count_unfiltered: number
}

export const useListNavData = ({ projectId, listId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `
    WITH
      list_values_count AS (SELECT COUNT(*) AS count FROM list_values WHERE list_id = '${listId}')
    SELECT
      list_id AS id,
      label,
      list_values_count.count AS list_values_count_unfiltered
    FROM
      lists, 
      list_values_count
    WHERE
      lists.list_id = '${listId}'`,
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]

  const parentArray = ['data', 'projects', projectId, 'lists']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav?.id]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' }) : (nav?.label ?? nav?.id)

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
    nameSingular: formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' }),
    navs: [
      { id: 'list', label: formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' }) },
      {
        id: 'values',
        label: buildNavLabel({
          loading,
          countFiltered: nav?.list_values_count_unfiltered ?? 0,
          namePlural: formatMessage({ id: 'zQfsm1', defaultMessage: 'Werte' }),
        }),
      },
    ],
  }

  return { loading, navData }
}
