import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { FileNode } from './File.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, filesFilterAtom } from '../../store.ts'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  check_id?: string
  action_id?: string
  level: number
}

export const FilesNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    action_id,
    level,
  }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filter] = useAtom(filesFilterAtom)
    const isFiltered = !!filter

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const hierarchyFilter = useMemo(() => {
      const where = ``
      if (action_id) {
        where = `action_id = '${action_id}'`
      } else if (check_id) {
        where = `check_id = '${check_id}'`
      } else if (place_id2) {
        where = `place_id = '${place_id2}'`
      } else if (place_id) {
        where = `place_id = '${place_id}'`
      } else if (subproject_id) {
        where = `subproject_id = '${subproject_id}'`
      } else if (project_id) {
        where = `project_id = '${project_id}'`
      }
      return where
    }, [action_id, check_id, place_id, place_id2, project_id, subproject_id])

    const resultFiltered = useLiveQuery(
      `SELECT * FROM files WHERE ${hierarchyFilter ? hierarchyFilter : ''}${
        isFiltered ? ` AND (${filter})` : ''
      } order by label asc`,
    )
    const files = resultFiltered?.rows ?? []

    const resultCountUnfiltered = useLiveQuery(
      `SELECT count(*) FROM files WHERE ${
        hierarchyFilter ? hierarchyFilter : ''
      }`,
    )
    const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0

    const filesNode = useMemo(
      () => ({
        label: `Files (${
          isFiltered ? `${files.length}/${countUnfiltered}` : files.length
        })`,
      }),
      [files.length, countUnfiltered, isFiltered],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        ...(project_id ? ['projects', project_id] : []),
        ...(subproject_id ? ['subprojects', subproject_id] : []),
        ...(place_id ? ['places', place_id] : []),
        ...(place_id2 ? ['places', place_id2] : []),
        ...(action_id ? ['actions', action_id] : []),
        ...(check_id ? ['checks', check_id] : []),
      ],
      [action_id, check_id, place_id, place_id2, project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'files'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // TODO: needs to work not only works for urlPath, for all opened paths!
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
          node={filesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={files.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          files.map((file) => (
            <FileNode
              key={file.file_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place_id2={place_id2}
              action_id={action_id}
              check_id={check_id}
              file={file}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
