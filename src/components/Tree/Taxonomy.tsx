import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { TaxaNode } from './Taxa.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const TaxonomyNode = memo(({ project_id, taxonomy, level = 4 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id, 'taxonomies'],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, taxonomy.taxonomy_id],
    [parentArray, taxonomy.taxonomy_id],
  )
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
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
    parentArray,
    parentUrl,
    searchParams,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={taxonomy}
        id={taxonomy.taxonomy_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={1}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <TaxaNode
          project_id={project_id}
          taxonomy_id={taxonomy.taxonomy_id}
        />
      )}
    </>
  )
})
