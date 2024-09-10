import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { WidgetTypeNode } from './WidgetType.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const WidgetTypesNode = memo(() => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_widget_types?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_widget_types],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: widgetTypes = [] } = useLiveQuery(
    db.widget_types.liveMany({
      orderBy: { label: 'asc' },
      where,
    }),
  )
  const { results: widgetTypesUnfiltered = [] } = useLiveQuery(
    db.widget_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = widgetTypes.length !== widgetTypesUnfiltered.length

  const widgetTypesNode = useMemo(
    () => ({
      label: `Widget Types (${
        isFiltered
          ? `${widgetTypes.length}/${widgetTypesUnfiltered.length}`
          : widgetTypes.length
      })`,
    }),
    [isFiltered, widgetTypes.length, widgetTypesUnfiltered.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data'], [])
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, 'widget-types'],
    [parentArray],
  )
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ownArray,
        isRoot: true,
      })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({
          pathname: parentUrl,
          search: searchParams.toString(),
        })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }, [
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentUrl,
    searchParams,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={widgetTypesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={widgetTypes.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        widgetTypes.map((widgetType) => (
          <WidgetTypeNode
            key={widgetType.widget_type_id}
            widgetType={widgetType}
          />
        ))}
    </>
  )
})
