import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { ProjectCrsNode } from './ProjectCrs.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const ProjectCrssNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const res = useLiveIncrementalQuery(
    `
    SELECT
      project_crs_id,
      label 
    FROM project_crs 
    WHERE project_id = $1 
    ORDER BY label`,
    [project_id],
    'project_crs_id',
  )
  const rows = res?.rows ?? []
  const loading = res === undefined

  const node = useMemo(
    () => ({
      label: `CRS (${loading ? '...' : formatNumber(rows.length)})`,
    }),
    [loading, rows.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'project-crs'], [parentArray])
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
    parentUrl,
    searchParams,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={node}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={rows.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        rows.map((cr) => (
          <ProjectCrsNode
            key={cr.project_crs_id}
            project_id={project_id}
            projectCrs={cr}
          />
        ))}
    </>
  )
})
