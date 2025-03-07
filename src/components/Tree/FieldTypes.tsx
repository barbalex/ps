import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { FieldTypeNode } from './FieldType.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { treeOpenNodesAtom, fieldTypesFilterAtom } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'

export const FieldTypesNode = memo(() => {
  const [filter] = useAtom(fieldTypesFilterAtom)

  const [openNodes] = useAtom(treeOpenNodesAtom)

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const resultFiltered = useLiveIncrementalQuery(
    `
    SELECT * 
    FROM field_types
    ${isFiltered ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`,
    undefined,
    'field_type_id',
  )
  const fieldTypes = resultFiltered?.rows ?? []

  const countResultUnfiltered = useLiveQuery(`SELECT count(*) FROM field_types`)
  const countUnfiltered = countResultUnfiltered?.rows?.[0]?.count ?? 0

  const fieldTypesNode = useMemo(
    () => ({
      label: `Field Types (${
        isFiltered
          ? `${fieldTypes.length}/${countUnfiltered}`
          : fieldTypes.length
      })`,
    }),
    [fieldTypes.length, countUnfiltered, isFiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data'], [])
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'field-types'], [parentArray])
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
        node={fieldTypesNode}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={fieldTypes.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        fieldTypes.map((fieldType) => (
          <FieldTypeNode
            key={fieldType.field_type_id}
            fieldType={fieldType}
          />
        ))}
    </>
  )
})
