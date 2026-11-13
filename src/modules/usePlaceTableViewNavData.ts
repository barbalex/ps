import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesSetAtom, languageAtom } from '../store.ts'

type Props = {
  projectId: string
  subprojectId: string
  placeId: string
  placeId2?: string
  tableViewId: string
}

type ViewData = {
  table_view_id: string
  table_name: string | null
  name_singular_de: string | null
  name_singular_en: string | null
  name_singular_fr: string | null
  name_singular_it: string | null
}

/**
 * Nav data of a single-row table view on a place (restricted form on the
 * place row, e.g. a "Biotop" form on a Teil-Population): a leaf node under
 * the place whose url opens the view's field group form.
 */
export const usePlaceTableViewNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  tableViewId,
}: Props) => {
  const [openNodesSet] = useAtom(treeOpenNodesSetAtom)
  const [language] = useAtom(languageAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  const res = useLiveQuery<ViewData>(
    `SELECT table_view_id, table_name,
        name_singular_de, name_singular_en, name_singular_fr, name_singular_it
     FROM table_views
     WHERE table_view_id = $1`,
    [tableViewId],
  )
  const view = res?.rows?.[0]
  const loading = res === undefined

  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, 'table-views', tableViewId]
  const ownUrl = `/${ownArray.join('/')}`
  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodesSet.has(ownArray.join('/'))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  // a view of another table never belongs under a place
  const notFound = !!res && (!view || view.table_name !== 'places')
  const label =
    notFound ?
      formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (view?.[`name_singular_${language}`] ??
      view?.name_singular_de ??
      view?.table_view_id)

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
      defaultMessage: 'Ansicht',
    }),
  }

  return { loading, navData }
}
