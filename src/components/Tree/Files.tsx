import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { FileNode } from './File.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

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
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    const openNodes = useMemo(
      () => appState?.tree_open_nodes ?? [],
      [appState?.tree_open_nodes],
    )

    const where = useMemo(() => {
      const where = {}
      if (action_id) {
        where.action_id = action_id
      } else if (check_id) {
        where.check_id = check_id
      } else if (place_id2) {
        where.place_id = place_id2
      } else if (place_id) {
        where.place_id = place_id
      } else if (subproject_id) {
        where.subproject_id = subproject_id
      } else if (project_id) {
        where.project_id = project_id
      }
      return where
    }, [action_id, check_id, place_id, place_id2, project_id, subproject_id])

    const { results: files = [] } = useLiveQuery(
      db.files.liveMany({
        where,
        orderBy: { label: 'asc' },
      }),
    )

    const filesNode = useMemo(
      () => ({ label: `Files (${files.length})` }),
      [files.length],
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
        removeChildNodes({
          node: parentArray,
          db,
          appStateId: appState?.app_state_id,
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
      addOpenNodes({
        nodes: [ownArray],
        db,
        appStateId: appState?.app_state_id,
      })
    }, [
      appState?.app_state_id,
      db,
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
