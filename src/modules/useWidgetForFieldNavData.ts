import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { treeOpenNodesAtom } from '../store.ts'

const parentArray = ['data', 'widgets-for-fields']
const parentUrl = `/${parentArray.join('/')}`

export const useWidgetForFieldNavData = ({ widgetForFieldId }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()

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

  const navData = useMemo(() => {
    const nav = res?.rows?.[0]
    const ownArray = [...parentArray, widgetForFieldId]
    const ownUrl = `/${ownArray.join('/')}`
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return {
      isInActiveNodeArray,
      isActive,
      isOpen,
      level: 1,
      parentUrl,
      ownArray,
      ownUrl,
      urlPath,
      label: nav?.label ?? nav?.id,
      nameSingular: 'Widget For Field',
    }
  }, [location.pathname, openNodes, res?.rows, widgetForFieldId])

  return { loading, navData }
}
