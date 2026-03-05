import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data', 'widgets-for-fields']
const parentUrl = `/${parentArray.join('/')}`

type Props = {
  widgetForFieldId: string
}

type NavData = {
  id: string
  label: string | null
}

export const useWidgetForFieldNavData = ({ widgetForFieldId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const { formatMessage } = useIntl()

  // needs to work not only works for urlPath, for all opened paths!

  const res = useLiveQuery(
    `
      SELECT
        widget_for_field_id AS id,
        label
      FROM widgets_for_fields
      WHERE widget_for_field_id = $1
    `,
    [widgetForFieldId],
  )

  const loading = res === undefined

  const nav: NavData | undefined = res?.rows?.[0]
  const ownArray = [...parentArray, widgetForFieldId]
  const ownUrl = `/${ownArray.join('/')}`
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const notFound = !!res && !nav
  const label = notFound
    ? formatMessage({ id: 'p+ORxp', defaultMessage: 'Nicht gefunden' })
    : (nav?.label ?? nav?.id)

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label,
    notFound,
    nameSingular: formatMessage({
      id: 'vdqfwK',
      defaultMessage: 'Widget für Feld',
    }),
  }

  return { loading, navData }
}
