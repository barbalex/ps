import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { FieldTypeNode } from './FieldType.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const FieldTypesNode = memo(() => {
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
      appState?.filter_field_types?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_field_types],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: fieldTypes = [] } = useLiveQuery(
    db.field_types.liveMany({
      where,
      orderBy: { label: 'asc' },
    }),
  )
  const { results: fieldTypesUnfiltered = [] } = useLiveQuery(
    db.field_types.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = fieldTypes.length !== fieldTypesUnfiltered.length

  const fieldTypesNode = useMemo(
    () => ({
      label: `Field Types (${
        isFiltered
          ? `${fieldTypes.length}/${fieldTypesUnfiltered.length}`
          : fieldTypes.length
      })`,
    }),
    [fieldTypes.length, fieldTypesUnfiltered.length, isFiltered],
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
