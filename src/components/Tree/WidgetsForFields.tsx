import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { WidgetForFieldNode } from './WidgetForField.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, widgetsForFieldsFilterAtom } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'

export const WidgetsForFieldsNode = memo(() => {
  const [filter] = useAtom(widgetsForFieldsFilterAtom)
  const [openNodes] = useAtom(treeOpenNodesAtom)

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const resultFiltered = useLiveIncrementalQuery(
    `
    SELECT 
      widget_for_field_id,
      label
    FROM widgets_for_fields
    ${isFiltered ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`,
    undefined,
    'widget_for_field_id',
  )
  const widgetsForFields = resultFiltered?.rows ?? []
  const widgetsForFieldsLoading = resultFiltered === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM widgets_for_fields`,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countUnfilteredLoading = resultCountUnfiltered === undefined

  const widgetsForFieldsNode = useMemo(
    () => ({
      label: `Widgets For Fields (${
        isFiltered
          ? `${widgetsForFieldsLoading ? `...` : widgetsForFields.length}/${
              countUnfilteredLoading ? `...` : countUnfiltered
            }`
          : widgetsForFieldsLoading
          ? `...`
          : widgetsForFields.length
      })`,
    }),
    [
      isFiltered,
      widgetsForFieldsLoading,
      widgetsForFields.length,
      countUnfilteredLoading,
      countUnfiltered,
    ],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data'], [])
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, 'widgets-for-fields'],
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
        node={widgetsForFieldsNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={widgetsForFields.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        widgetsForFields.map((widgetForField) => (
          <WidgetForFieldNode
            key={widgetForField.widget_for_field_id}
            widgetForField={widgetForField}
          />
        ))}
    </>
  )
})
