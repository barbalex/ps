import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { WidgetTypeNode } from './WidgetType.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { useWidgetTypesNavData } from '../../modules/useWidgetTypesNavData.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const WidgetTypesNode = memo(() => {
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const location = useLocation()
  const navigate = useNavigate()

  const { navData, loading, isFiltered } = useWidgetTypesNavData()

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM widget_types`,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count
  const countLoading = resultCountUnfiltered === undefined

  const widgetTypesNode = useMemo(
    () => ({
      label: `Widget Types (${
        isFiltered ?
          `${loading ? '...' : formatNumber(navData.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : loading ? '...'
        : formatNumber(navData.length)
      })`,
    }),
    [isFiltered, loading, navData.length, countLoading, countUnfiltered],
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
        navigate({ to: parentUrl })
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
        childrenCount={navData.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        navData.map((widgetType) => (
          <WidgetTypeNode
            key={widgetType.widget_type_id}
            widgetType={widgetType}
          />
        ))}
    </>
  )
})
