import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { FieldNode } from './Field.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { useFieldsNavData } from '../../modules/useFieldsNavData.ts'

interface Props {
  projectId?: string
}

export const FieldsNode = memo(({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useFieldsNavData({ projectId })

  const resultCountUnfiltered = useLiveQuery(
    `
    SELECT count(*) 
    FROM fields 
    WHERE project_id  ${projectId ? `= '${projectId}'` : 'IS NULL'}`,
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const node = useMemo(
    () => ({
      label: `Fields (${
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
  const parentArray = useMemo(
    () => ['data', ...(projectId ? ['projects', projectId] : [])],
    [projectId],
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
        node={node}
        level={projectId ? 3 : 1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={navData.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        navData.map((field) => (
          <FieldNode
            key={field.field_id}
            field={field}
            projectId={projectId}
          />
        ))}
    </>
  )
})
