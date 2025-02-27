import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { PersonNode } from './Person.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, personsFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const PersonsNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(personsFilterAtom)
  const isFiltered = !!filter

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const resultFiltered = useLiveIncrementalQuery(
    `
      SELECT persons.* 
      FROM persons 
      WHERE project_id = $1${
        isFiltered ? ` AND (${filter})` : ''
      } order by label asc
      `,
    [project_id],
    'person_id',
  )
  const persons = resultFiltered?.rows ?? []

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM persons WHERE project_id = $1`,
    [project_id],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0

  const personsNode = useMemo(
    () => ({
      label: `Persons (${
        isFiltered ? `${persons.length}/${countUnfiltered}` : persons.length
      })`,
    }),
    [isFiltered, persons.length, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'persons'], [parentArray])
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
        node={personsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={persons.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        persons.map((person) => (
          <PersonNode
            key={person.person_id}
            project_id={project_id}
            person={person}
          />
        ))}
    </>
  )
})
