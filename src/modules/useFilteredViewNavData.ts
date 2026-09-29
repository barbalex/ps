import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom, languageAtom } from '../store.ts'

type Props = {
  projectId: string
  filteredViewId: string
}

type NavData = {
  id: string
  name_plural_de: string | null
  name_plural_en: string | null
  name_plural_fr: string | null
  name_plural_it: string | null
  table_name: string | null
}

export const useFilteredViewNavData = ({
  projectId,
  filteredViewId,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<NavData>(
    `
    SELECT
      filtered_view_id AS id,
      name_plural_de, name_plural_en, name_plural_fr, name_plural_it,
      table_name
    FROM filtered_views
    WHERE filtered_view_id = $1`,
    [filteredViewId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const parentArray = ['data', 'projects', projectId, 'filtered-views']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, filteredViewId]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.[`name_plural_${language}`] ??
      nav?.name_plural_de ??
      nav?.id)

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
    nameSingular: formatMessage({
      id: '5mN8vP',
      defaultMessage: 'Gefilterte Ansicht',
    }),
  }

  return { loading, navData }
}
