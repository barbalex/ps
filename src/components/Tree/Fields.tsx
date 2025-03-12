import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveIncrementalQuery,
  useLiveQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { FieldNode } from './Field.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, fieldsFilterAtom } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { formatNumber } from '../../modules/formatNumber.ts'

interface Props {
  project_id?: string
}

export const FieldsNode = memo(({ project_id }: Props) => {
  const [filter] = useAtom(fieldsFilterAtom)
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const resFiltered = useLiveIncrementalQuery(
    `
    SELECT 
      field_id, 
      label 
    FROM fields 
    WHERE 
      project_id ${project_id ? `= '${project_id}'` : 'IS NULL'}
      ${filterString ? ` AND ${filterString}` : ''} 
    ORDER BY 
      table_name, 
      name, 
      level`,
    undefined,
    'field_id',
  )
  const rows = resFiltered?.rows ?? []
  const rowsLoading = resFiltered === undefined

  const resultCountUnfiltered = useLiveQuery(
    `
    SELECT count(*) 
    FROM fields 
    WHERE project_id  ${project_id ? `= '${project_id}'` : 'IS NULL'}`,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const node = useMemo(
    () => ({
      label: `Fields (${
        isFiltered
          ? `${rowsLoading ? '...' : formatNumber(rows.length)}/${
              countLoading ? '...' : formatNumber(countUnfiltered)
            }`
          : rowsLoading
          ? '...'
          : formatNumber(rows.length)
      })`,
    }),
    [isFiltered, rowsLoading, rows.length, countLoading, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', ...(project_id ? ['projects', project_id] : [])],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'fields'], [parentArray])
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
        node={node}
        level={project_id ? 3 : 1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={rows.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        rows.map((field) => (
          <FieldNode
            key={field.field_id}
            field={field}
            project_id={project_id}
          />
        ))}
    </>
  )
})
