import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { SubprojectNode } from './Subproject.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, subprojectsFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const SubprojectsNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(subprojectsFilterAtom)

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: subprojects = [] } = useLiveQuery(
    db.subprojects.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: subprojectsUnfiltered = [] } = useLiveQuery(
    db.subprojects.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = subprojects.length !== subprojectsUnfiltered.length

  // get projects.subproject_name_plural to name the table
  // can't include projects in subprojects query because there will be no result before subprojects are created
  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const namePlural = project?.subproject_name_plural ?? 'Subprojects'

  const subprojectsNode = useMemo(
    () => ({
      label: `${namePlural} (${
        isFiltered
          ? `${subprojects.length}/${subprojectsUnfiltered.length}`
          : subprojects.length
      })`,
    }),
    [isFiltered, namePlural, subprojects.length, subprojectsUnfiltered.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'subprojects'], [parentArray])
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

  // prevent flash of different name that happens before namePlural is set
  if (!namePlural) return null

  return (
    <>
      <Node
        node={subprojectsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={subprojects.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        subprojects.map((subproject) => (
          <SubprojectNode
            key={subproject.subproject_id}
            project_id={project_id}
            subproject={subproject}
          />
        ))}
    </>
  )
})
